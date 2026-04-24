import { Text, View } from 'react-native';

import { formatBatteryText, formatSunHours } from '@/lib/format';
import { theme } from '@/lib/theme';
import type { DailyForecast, ForecastSnapshot } from '@/types/forecast';

type ForecastSummaryCardProps = {
  day: DailyForecast;
  snapshot: ForecastSnapshot;
};

export function ForecastSummaryCard({ day, snapshot }: ForecastSummaryCardProps) {
  const sunText = formatSunHours(day.sunHours);
  const batText = formatBatteryText(day.batteryPercentGain);

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: 28,
        padding: 20,
        gap: 14,
      }}
    >
      <Text
        style={{
          color: theme.colors.muted,
          fontSize: 12,
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}
      >
        {snapshot.locationName}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View style={{ gap: 2 }}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 52,
              fontWeight: '800',
              lineHeight: 56,
              fontVariant: ['tabular-nums'],
            }}
          >
            {day.kwh.toFixed(1)}
          </Text>
          <Text style={{ color: theme.colors.subtleText, fontSize: 14 }}>kWh Expected {day.dayLabel}</Text>
        </View>

        <View style={{ gap: 8, alignItems: 'flex-end' }}>
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: 'rgba(234, 179, 8, 0.15)',
            }}
          >
            <Text style={{ color: '#EAB308', fontSize: 13, fontWeight: '700' }}>{sunText}</Text>
          </View>
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
            }}
          >
            <Text style={{ color: '#22C55E', fontSize: 13, fontWeight: '700' }}>{batText}</Text>
          </View>
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: 4,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        }}
      >
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ color: theme.colors.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>
            Sunrise
          </Text>
          <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700', textDecorationLine: 'none' }}>
            {day.sunrise}
          </Text>
        </View>
        <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
          <Text style={{ color: theme.colors.subtleText, fontSize: 13, fontWeight: '600' }}>
            {snapshot.timezoneAbbreviation}
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ color: theme.colors.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>
            Sunset
          </Text>
          <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700', textDecorationLine: 'none' }}>
            {day.sunset}
          </Text>
        </View>
      </View>
    </View>
  );
}
