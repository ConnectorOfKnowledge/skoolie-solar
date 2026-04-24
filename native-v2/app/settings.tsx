import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';

import { SettingsPanel } from '@/components/settings-panel';
import { calculateBatteryCapacity, defaultSettings } from '@/lib/settings';
import { loadSettings, saveSettings } from '@/lib/storage';
import { theme } from '@/lib/theme';
import type { AppSettings } from '@/types/forecast';

export default function SettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    void loadSettings().then(setSettings);
  }, []);

  function updateSettings(patch: Partial<AppSettings>) {
    setSettings((current) => {
      const next = { ...current, ...patch };
      if (patch.batteryCount != null || patch.batteryVolts != null || patch.batteryAmpHours != null) {
        next.batteryCapacityKwh = calculateBatteryCapacity(
          next.batteryCount,
          next.batteryVolts,
          next.batteryAmpHours,
        );
      }
      return next;
    });
  }

  async function handleSave() {
    await saveSettings(settings);
    router.back();
  }

  return (
    <ScrollView
      contentContainerStyle={{ padding: 20, gap: 18 }}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <Stack.Screen options={{ title: 'Settings' }} />
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
        onSave={() => void handleSave()}
        settings={settings}
      />
    </ScrollView>
  );
}
