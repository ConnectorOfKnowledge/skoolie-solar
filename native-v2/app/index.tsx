import * as Location from 'expo-location';
import { Link, Stack } from 'expo-router';
import { startTransition, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { ForecastDayList } from '@/components/forecast-day-list';
import { ForecastSummaryCard } from '@/components/forecast-summary-card';
import { MiniBarChart } from '@/components/mini-bar-chart';
import { PrimaryButton } from '@/components/primary-button';
import { SettingsPanel } from '@/components/settings-panel';
import { formatRelativeUpdate } from '@/lib/format';
import { calculateBatteryCapacity, defaultSettings } from '@/lib/settings';
import { loadLastLocation, loadSettings, saveLastLocation, saveSettings } from '@/lib/storage';
import { theme } from '@/lib/theme';
import { fetchForecast, geocodeLocation, reverseGeocodeLocation } from '@/lib/weather';
import type { AppSettings, ForecastSnapshot, SavedLocation } from '@/types/forecast';

export default function ForecastScreen() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [forecast, setForecast] = useState<ForecastSnapshot | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [savedLocation, setSavedLocation] = useState<SavedLocation | null>(null);
  const [status, setStatus] = useState('Loading your native v2 workspace...');
  const [loading, setLoading] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);
  const hasAutoLoaded = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      const [storedSettings, storedLocation] = await Promise.all([loadSettings(), loadLastLocation()]);
      if (!mounted) return;

      setSettings(storedSettings);
      setSavedLocation(storedLocation);
      setStatus(storedLocation ? 'Ready to refresh your saved forecast.' : 'Add a location or use GPS to begin.');
      setBootstrapped(true);
    }

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!bootstrapped || hasAutoLoaded.current) return;
    if (!savedLocation && !settings.manualLocation.trim()) return;

    hasAutoLoaded.current = true;
    void handleRefresh(true);
  }, [bootstrapped, savedLocation, settings.manualLocation]);

  function updateSettings(patch: Partial<AppSettings>) {
    setSettings((current) => {
      const next = {
        ...current,
        ...patch,
      };

      if (
        patch.batteryCount != null ||
        patch.batteryVolts != null ||
        patch.batteryAmpHours != null
      ) {
        next.batteryCapacityKwh = calculateBatteryCapacity(
          next.batteryCount,
          next.batteryVolts,
          next.batteryAmpHours,
        );
      }

      return next;
    });
  }

  async function getActiveLocation(useSavedLocation = false) {
    if (settings.manualLocation.trim()) {
      setStatus('Looking up your city...');
      return geocodeLocation(settings.manualLocation.trim());
    }

    if (useSavedLocation && savedLocation) {
      return savedLocation;
    }

    setStatus('Requesting GPS permission...');
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Location permission was denied.');
    }

    setStatus('Getting current position...');
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return reverseGeocodeLocation(position.coords.latitude, position.coords.longitude);
  }

  async function handleRefresh(useSavedLocation = false) {
    setLoading(true);

    try {
      const location = await getActiveLocation(useSavedLocation);
      const snapshot = await fetchForecast(location, settings);

      await Promise.all([saveLastLocation(location), saveSettings(settings)]);

      startTransition(() => {
        setSavedLocation(location);
        setForecast(snapshot);
        setSelectedDayIndex(0);
      });

      setStatus(formatRelativeUpdate(snapshot.updatedAt));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to refresh forecast.';
      setStatus(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSettings() {
    await saveSettings(settings);
    setStatus('Settings saved locally.');
    setSetupOpen(false);
  }

  const selectedDay = forecast?.daily[selectedDayIndex] ?? null;
  const hourlyData =
    forecast?.hourlyByDay[selectedDayIndex]
      .filter((_, index) => index % 4 === 0)
      .map((point) => ({
        label: point.hourLabel.slice(0, 5),
        value: Number(point.energyKw.toFixed(2)),
      })) ?? [];

  const trendData =
    forecast?.daily.slice(0, 7).map((day) => ({
      label: day.dayLabel.slice(0, 3),
      value: day.kwh,
    })) ?? [];

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        padding: 20,
        gap: 18,
      }}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <Stack.Screen options={{ title: 'Forecast' }} />

      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 28,
          padding: 20,
          gap: 14,
        }}
      >
        <Text
          selectable
          style={{
            color: theme.colors.muted,
            fontSize: 13,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 1.1,
          }}
        >
          Skoolie Solar v2
        </Text>
        <Text
          selectable
          style={{
            color: theme.colors.text,
            fontSize: 28,
            fontWeight: '800',
            lineHeight: 34,
          }}
        >
          Forecast planning, native storage, and the foundation for sensor-driven sun tracking.
        </Text>
        <Text selectable style={{ color: theme.colors.subtleText, fontSize: 15, lineHeight: 22 }}>
          {status}
        </Text>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <PrimaryButton
            loading={loading}
            onPress={() => {
              void handleRefresh(false);
            }}
            style={{ flex: 1 }}
            text="Use GPS & Refresh"
          />
          <PrimaryButton
            disabled={!savedLocation && !settings.manualLocation.trim()}
            onPress={() => {
              void handleRefresh(true);
            }}
            style={{ flex: 1 }}
            text="Refresh Saved"
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <PrimaryButton
            onPress={() => setSetupOpen((current) => !current)}
            style={{ flex: 1 }}
            text={setupOpen ? 'Hide Setup' : 'Open Setup'}
          />
          <Link href="/sun-finder" asChild>
            <Pressable
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 16,
                borderRadius: 18,
                backgroundColor: theme.colors.panel,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '800' }}>Open Sun Finder</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      {setupOpen ? (
        <SettingsPanel
          onChange={updateSettings}
          onRecalculateBattery={() =>
            updateSettings({
              batteryCapacityKwh: calculateBatteryCapacity(
                settings.batteryCount,
                settings.batteryVolts,
                settings.batteryAmpHours,
              ),
            })
          }
          onSave={() => {
            void handleSaveSettings();
          }}
          settings={settings}
        />
      ) : null}

      {forecast && selectedDay ? (
        <>
          <ForecastSummaryCard day={selectedDay} snapshot={forecast} />
          <MiniBarChart data={hourlyData} title={`${selectedDay.dayLabel} hourly production`} />
          <ForecastDayList
            days={forecast.daily}
            onSelect={setSelectedDayIndex}
            selectedIndex={selectedDayIndex}
            temperatureUnit={settings.temperatureUnit}
          />
          <MiniBarChart color="#F97316" data={trendData} title="7-day production trend" />
        </>
      ) : (
        <View
          style={{
            backgroundColor: theme.colors.panel,
            borderRadius: 24,
            padding: 20,
            gap: 10,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '700' }}>Ready for your first native forecast</Text>
          <Text style={{ color: theme.colors.subtleText, fontSize: 15, lineHeight: 22 }}>
            Use GPS for your current campsite, or enter a city in setup if you want to scout solar conditions before you arrive.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
