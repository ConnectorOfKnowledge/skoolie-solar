import AsyncStorage from '@react-native-async-storage/async-storage';

import { defaultSettings, normalizeSettings } from '@/lib/settings';
import type { AppSettings, SavedLocation } from '@/types/forecast';

export const STORAGE_KEYS = {
  lastLocation: 'skoolie-solar:last-location',
  settings: 'skoolie-solar:settings',
} as const;

async function readJson<T>(key: string) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    await AsyncStorage.removeItem(key);
    return null;
  }
}

export async function loadSettings() {
  const saved = await readJson<Partial<AppSettings>>(STORAGE_KEYS.settings);
  return saved ? normalizeSettings(saved) : defaultSettings;
}

export async function saveSettings(settings: AppSettings) {
  await AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

export async function loadLastLocation() {
  return readJson<SavedLocation>(STORAGE_KEYS.lastLocation);
}

export async function saveLastLocation(location: SavedLocation) {
  await AsyncStorage.setItem(STORAGE_KEYS.lastLocation, JSON.stringify(location));
}
