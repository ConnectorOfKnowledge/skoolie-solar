import { Text, View } from 'react-native';

import { Pill } from '@/components/pill';
import { formatBatteryText, formatSunHours } from '@/lib/format';
import { theme } from '@/lib/theme';
import type { DailyForecast, ForecastSnapshot } from '@/types/forecast';

type ForecastSummaryCardProps = {
  day: DailyForecast;
  snapshot: ForecastSnapshot;
};

export function ForecastSummaryCard({ day, snapshot }: ForecastSummaryCardProps) {
  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: 28,
        padding: 20,
        gap: 16,
      }}
    >
      <View style={{ gap: 8 }}>
        <Text
          selectable
          style={{
            color: theme.colors.muted,
            fontSize: 13,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          {snapshot.locationName}
        </Text>
        <Text
          selectable
          style={{
            color: theme.colors.text,
            fontSize: 42,
            fontWeight: '800',
            fontVariant: ['tabular-nums'],
          }}
        >
          {day.kwh.toFixed(1)} kWh
        </Text>
        <Text
          selectable
          style={{
            color: theme.colors.subtleText,
            fontSize: 16,
          }}
        >
          Expected {day.dayLabel} production
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
        <Pill text={formatSunHours(day.sunHours)} />
        <Pill text={formatBatteryText(day.batteryPercentGain)} />
        <Pill text={`${snapshot.timezoneAbbreviation} time`} />
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ color: theme.colors.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }}>
            Sunrise
          </Text>
          <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700' }}>{day.sunrise}</Text>
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ color: theme.colors.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }}>
            Sunset
          </Text>
          <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700' }}>{day.sunset}</Text>
        </View>
      </View>
    </View>
  );
}
