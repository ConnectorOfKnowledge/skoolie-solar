import * as Location from 'expo-location';
import Slider from '@react-native-community/slider';
import { Stack } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { SunVisualizer } from '@/components/sun-visualizer';
import { getAlignmentDelta, getSolarCoordinates, getSolarTimes } from '@/lib/solar';
import { loadLastLocation, loadSettings, saveLastLocation } from '@/lib/storage';
import { theme } from '@/lib/theme';
import { geocodeLocation, reverseGeocodeLocation } from '@/lib/weather';
import type { AppSettings, SavedLocation } from '@/types/forecast';

function normalizeDegrees(value: number) {
  return (value + 360) % 360;
}

function formatClock(date: Date) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function buildDate(baseDate: Date, hourValue: number) {
  const next = new Date(baseDate);
  const hours = Math.floor(hourValue);
  const minutes = Math.round((hourValue - hours) * 60);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

export default function SunFinderScreen() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [location, setLocation] = useState<SavedLocation | null>(null);
  const [selectedDayOffset, setSelectedDayOffset] = useState(0);
  const [selectedHour, setSelectedHour] = useState(12);
  const [liveMode, setLiveMode] = useState(false);
  const [status, setStatus] = useState('Loading Sun Finder...');
  const [heading, setHeading] = useState<number | null>(null);
  const [pitch, setPitch] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      const [storedSettings, storedLocation] = await Promise.all([loadSettings(), loadLastLocation()]);
      if (!mounted) return;

      setSettings(storedSettings);
      setLocation(storedLocation);
      setStatus(storedLocation ? 'Using your saved forecast location.' : 'Use GPS or save a manual location from Forecast.');
    }

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!liveMode) return;
    let isMounted = true;
    let magnetometerSub: { remove: () => void } | null = null;
    let accelerometerSub: { remove: () => void } | null = null;

    async function startSensors() {
      const sensors = await import('expo-sensors');
      if (!isMounted) return;

      sensors.Magnetometer.setUpdateInterval(300);
      sensors.Accelerometer.setUpdateInterval(300);

      magnetometerSub = sensors.Magnetometer.addListener((event) => {
        const angle = (Math.atan2(event.y, event.x) * 180) / Math.PI;
        setHeading(normalizeDegrees(angle));
      });

      accelerometerSub = sensors.Accelerometer.addListener((event) => {
        const angle = (Math.atan2(event.y, Math.sqrt(event.x * event.x + event.z * event.z)) * 180) / Math.PI;
        setPitch(angle);
      });
    }

    void startSensors();

    return () => {
      isMounted = false;
      magnetometerSub?.remove();
      accelerometerSub?.remove();
    };
  }, [liveMode]);

  async function useGpsLocation() {
    setStatus('Requesting GPS for Sun Finder...');
    const permission = await Location.requestForegroundPermissionsAsync();

    if (!permission.granted) {
      setStatus('Location permission was denied.');
      return;
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const nextLocation = await reverseGeocodeLocation(position.coords.latitude, position.coords.longitude);
    await saveLastLocation(nextLocation);
    setLocation(nextLocation);
    setStatus(`Using ${nextLocation.name}`);
  }

  async function useManualLocation() {
    if (!settings?.manualLocation.trim()) {
      setStatus('Add a manual location in Forecast first.');
      return;
    }

    setStatus('Looking up your saved manual location...');
    const nextLocation = await geocodeLocation(settings.manualLocation.trim());
    await saveLastLocation(nextLocation);
    setLocation(nextLocation);
    setStatus(`Using ${nextLocation.name}`);
  }

  const selectedDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + selectedDayOffset);
    return date;
  }, [selectedDayOffset]);

  const displayDate = useMemo(() => {
    if (liveMode) return new Date();
    return buildDate(selectedDate, selectedHour);
  }, [liveMode, selectedDate, selectedHour]);

  const solar = useMemo(() => {
    if (!location) return null;
    return getSolarCoordinates(displayDate, location);
  }, [displayDate, location]);

  const solarTimes = useMemo(() => {
    if (!location) return null;
    return getSolarTimes(selectedDate, location);
  }, [location, selectedDate]);

  const headingDelta = solar && heading != null ? getAlignmentDelta(solar.azimuth, heading) : null;
  const pitchDelta = solar && pitch != null ? solar.elevation - pitch : null;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 20, gap: 18 }}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <Stack.Screen options={{ title: 'Sun Finder' }} />

      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 28,
          padding: 20,
          gap: 12,
        }}
      >
        <Text style={{ color: theme.colors.muted, fontSize: 13, fontWeight: '700', textTransform: 'uppercase' }}>
          Android Feature Track
        </Text>
        <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: '800', lineHeight: 34 }}>
          Point your phone and see where the sun should be.
        </Text>
        <Text style={{ color: theme.colors.subtleText, fontSize: 15, lineHeight: 22 }}>{status}</Text>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <PrimaryButton
            onPress={() => {
              void useGpsLocation();
            }}
            style={{ flex: 1 }}
            text="Use GPS"
          />
          <PrimaryButton
            disabled={!settings?.manualLocation.trim()}
            onPress={() => {
              void useManualLocation();
            }}
            style={{ flex: 1 }}
            text="Use Manual"
          />
        </View>
      </View>

      <View
        style={{
          backgroundColor: theme.colors.panel,
          borderRadius: 24,
          padding: 18,
          gap: 14,
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}
      >
        <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700' }}>Mode</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <PrimaryButton
            onPress={() => setLiveMode(false)}
            style={{ flex: 1, opacity: liveMode ? 0.65 : 1 }}
            text="Plan by Time"
          />
          <PrimaryButton
            onPress={() => setLiveMode(true)}
            style={{ flex: 1, opacity: liveMode ? 1 : 0.8 }}
            text="Live Phone Mode"
          />
        </View>
      </View>

      {!liveMode ? (
        <View
          style={{
            backgroundColor: theme.colors.panel,
            borderRadius: 24,
            padding: 18,
            gap: 14,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700' }}>Plan the sky</Text>
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
              const chipDate = new Date();
              chipDate.setDate(chipDate.getDate() + offset);
              const active = selectedDayOffset === offset;

              return (
                <Pressable
                  key={offset}
                  onPress={() => setSelectedDayOffset(offset)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 999,
                    backgroundColor: active ? theme.colors.accent : '#081224',
                  }}
                >
                  <Text
                    style={{
                      color: active ? '#082F49' : theme.colors.subtleText,
                      fontSize: 13,
                      fontWeight: '800',
                    }}
                  >
                    {offset === 0 ? 'Today' : chipDate.toLocaleDateString('en-US', { weekday: 'short' })}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={{ color: theme.colors.subtleText, fontSize: 15 }}>
            {displayDate.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
            })}{' '}
            at {formatClock(displayDate)}
          </Text>
          <Slider
            maximumTrackTintColor="#1E293B"
            maximumValue={23.75}
            minimumTrackTintColor={theme.colors.accent}
            minimumValue={0}
            onValueChange={setSelectedHour}
            step={0.25}
            thumbTintColor="#FBBF24"
            value={selectedHour}
          />
        </View>
      ) : (
        <View
          style={{
            backgroundColor: theme.colors.panel,
            borderRadius: 24,
            padding: 18,
            gap: 8,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700' }}>Live sensor mode</Text>
          <Text style={{ color: theme.colors.subtleText, fontSize: 15, lineHeight: 22 }}>
            This mode uses the phone sensors to estimate your heading and tilt. It is designed as a practical field guide, not a calibrated surveying instrument.
          </Text>
        </View>
      )}

      {solar && location ? (
        <>
          <SunVisualizer azimuth={solar.azimuth} elevation={solar.elevation} heading={heading} />

          <View
            style={{
              backgroundColor: theme.colors.panel,
              borderRadius: 24,
              padding: 18,
              gap: 12,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700' }}>Sun data</Text>
            <Text style={{ color: theme.colors.subtleText, fontSize: 15 }}>Location: {location.name}</Text>
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '700' }}>
              Azimuth {solar.azimuth.toFixed(0)}° · Elevation {solar.elevation.toFixed(0)}°
            </Text>
            <Text style={{ color: theme.colors.subtleText, fontSize: 14 }}>
              Sunrise {solarTimes ? formatClock(solarTimes.sunrise) : '--'} · Sunset {solarTimes ? formatClock(solarTimes.sunset) : '--'}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: theme.colors.panel,
              borderRadius: 24,
              padding: 18,
              gap: 12,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700' }}>Alignment helper</Text>
            <Text style={{ color: theme.colors.subtleText, fontSize: 15 }}>
              Heading {heading == null ? '--' : `${heading.toFixed(0)}°`} · Tilt {pitch == null ? '--' : `${pitch.toFixed(0)}°`}
            </Text>
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '700' }}>
              {headingDelta == null
                ? 'Turn on live mode to compare your phone direction to the sun.'
                : `${headingDelta > 0 ? 'Turn right' : 'Turn left'} ${Math.abs(headingDelta).toFixed(0)}° to match azimuth.`}
            </Text>
            <Text style={{ color: theme.colors.subtleText, fontSize: 14 }}>
              {pitchDelta == null
                ? 'Tilt guidance will appear when live mode is on.'
                : `${pitchDelta > 0 ? 'Lift' : 'Lower'} the phone by about ${Math.abs(pitchDelta).toFixed(0)}° to match elevation.`}
            </Text>
          </View>
        </>
      ) : (
        <View
          style={{
            backgroundColor: theme.colors.panel,
            borderRadius: 24,
            padding: 18,
            gap: 10,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700' }}>Sun Finder needs a location</Text>
          <Text style={{ color: theme.colors.subtleText, fontSize: 15, lineHeight: 22 }}>
            Use GPS here, or save a manual city from the Forecast screen and come back.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
