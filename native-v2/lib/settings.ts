import type { AppSettings } from '@/types/forecast';

export const defaultSettings: AppSettings = {
  batteryAmpHours: 300,
  batteryCapacityKwh: 14.4,
  batteryCount: 4,
  batteryVolts: 12,
  efficiencyLossPercent: 15,
  manualLocation: '',
  solarArrayKw: 3.3,
  temperatureUnit: 'fahrenheit',
};

export function calculateBatteryCapacity(
  batteryCount: number,
  batteryVolts: number,
  batteryAmpHours: number,
) {
  const total = (batteryCount * batteryVolts * batteryAmpHours) / 1000;
  return Number.isFinite(total) ? total : 0;
}

export function normalizeSettings(partial?: Partial<AppSettings> | null): AppSettings {
  const merged = {
    ...defaultSettings,
    ...partial,
  };

  if (!partial) return merged;

  if (
    partial.batteryCapacityKwh == null &&
    (partial.batteryCount != null || partial.batteryVolts != null || partial.batteryAmpHours != null)
  ) {
    merged.batteryCapacityKwh = calculateBatteryCapacity(
      merged.batteryCount,
      merged.batteryVolts,
      merged.batteryAmpHours,
    );
  }

  return merged;
}
