import * as Location from 'expo-location';
import { Link, Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { ForecastDayList } from '@/components/forecast-day-list';
import { ForecastSummaryCard } from '@/components/forecast-summary-card';
import { HourlyLineChart } from '@/components/hourly-line-chart';
import { MiniBarChart } from '@/components/mini-bar-chart';
import { PrimaryButton } from '@/components/primary-button';
import { formatRelativeUpdate } from '@/lib/format';
import { calculateBatteryCapacity, defaultSettings } from '@/lib/settings';
import { loadLastLocation, loadSettings, saveLastLocation, saveSettings } from '@/lib/storage';
import { theme } from '@/lib/theme';
import { fetchForecast, geocodeLocation, reverseGeocodeLocation } from '@/lib/weather';
import type { AppSettings, ForecastSnapshot, SavedLocation } from '@/types/forecast';

export default function ForecastScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [forecast, setForecast] = useState<ForecastSnapshot | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [savedLocation, setSavedLocation] = useState<SavedLocation | null>(null);
  const [status, setStatus] = useState('Loading...');
  const [loading, setLoading] = useState(false);
  const hasAutoLoaded = useRef(false);
  const bootstrapped = useRef(false);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const [storedSettings, storedLocation] = await Promise.all([loadSettings(), loadLastLocation()]);
        setSettings(storedSettings);
        setSavedLocation(storedLocation);

        if (!bootstrapped.current) {
          bootstrapped.current = true;
          setStatus(storedLocation ? 'Ready. Tap Update to refresh.' : 'Add a location or use GPS to begin.');

          if ((storedLocation || storedSettings.manualLocation.trim()) && !hasAutoLoaded.current) {
            hasAutoLoaded.current = true;
            void runRefresh(storedSettings, storedLocation, true);
          }
        }
      }
      void load();
    }, []),
  );

  async function getActiveLocation(
    currentSettings: AppSettings,
    currentSaved: SavedLocation | null,
    useSaved = false,
  ) {
    if (currentSettings.manualLocation.trim()) {
      setStatus('Looking up city...');
      return geocodeLocation(currentSettings.manualLocation.trim());
    }

    if (useSaved && currentSaved) return currentSaved;

    setStatus('Requesting GPS...');
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) throw new Error('Location permission denied.');

    setStatus('Getting position...');
    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return reverseGeocodeLocation(position.coords.latitude, position.coords.longitude);
  }

  async function runRefresh(
    currentSettings: AppSettings,
    currentSaved: SavedLocation | null,
    useSaved = false,
  ) {
    setLoading(true);
    try {
      const location = await getActiveLocation(currentSettings, currentSaved, useSaved);
      const snapshot = await fetchForecast(location, currentSettings);
      await Promise.all([saveLastLocation(location), saveSettings(currentSettings)]);
      setSavedLocation(location);
      setForecast(snapshot);
      setSelectedDayIndex(0);
      setStatus(formatRelativeUpdate(snapshot.updatedAt));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to load forecast.');
    } finally {
      setLoading(false);
    }
  }

  function handleRefresh(useSaved = false) {
    void runRefresh(settings, savedLocation, useSaved);
  }

  const selectedDay = forecast?.daily[selectedDayIndex] ?? null;

  const hourlyData =
    forecast?.hourlyByDay[selectedDayIndex].map((point) => ({
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
      contentContainerStyle={{ padding: 16, gap: 14 }}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <Stack.Screen
        options={{
          title: 'Skoolie Solar',
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/settings')}
              style={{ padding: 8 }}
              hitSlop={8}
            >
              <Text style={{ color: theme.colors.muted, fontSize: 22 }}>⚙</Text>
            </Pressable>
          ),
        }}
      />

      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 24,
          padding: 16,
          gap: 12,
        }}
      >
        <PrimaryButton
          loading={loading}
          onPress={() => handleRefresh(false)}
          text="Update Forecast"
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Pressable onPress={() => handleRefresh(false)}>
            <Text style={{ color: theme.colors.muted, fontSize: 13, fontWeight: '600' }}>GPS Location</Text>
          </Pressable>
          {savedLocation ? (
            <Pressable onPress={() => handleRefresh(true)}>
              <Text style={{ color: theme.colors.subtleText, fontSize: 13 }}>Use Saved</Text>
            </Pressable>
          ) : null}
          <Text style={{ color: theme.colors.subtleText, fontSize: 13 }}>{status}</Text>
        </View>
      </View>

      {forecast && selectedDay ? (
        <>
          <ForecastSummaryCard day={selectedDay} snapshot={forecast} />
          <HourlyLineChart
            data={hourlyData}
            title={`${selectedDay.dayLabel} hourly`}
          />
          <ForecastDayList
            days={forecast.daily}
            onSelect={setSelectedDayIndex}
            selectedIndex={selectedDayIndex}
            temperatureUnit={settings.temperatureUnit}
          />
          <MiniBarChart color="#F97316" data={trendData} title="7-day trend" />
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
          <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '700' }}>
            Ready for your first forecast
          </Text>
          <Text style={{ color: theme.colors.subtleText, fontSize: 15, lineHeight: 22 }}>
            Tap Update Forecast to use GPS, or add a city in Settings first.
          </Text>
          <Link href="/sun-finder" asChild>
            <Pressable
              style={{
                alignItems: 'center',
                paddingVertical: 14,
                borderRadius: 16,
                backgroundColor: theme.colors.panel,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '700' }}>Open Sun Finder</Text>
            </Pressable>
          </Link>
        </View>
      )}
    </ScrollView>
  );
}
