import { Pressable, Text, View } from 'react-native';

import { formatTemperatureRange } from '@/lib/format';
import { theme } from '@/lib/theme';
import type { DailyForecast, TemperatureUnit } from '@/types/forecast';

type ForecastDayListProps = {
  days: DailyForecast[];
  onSelect: (index: number) => void;
  selectedIndex: number;
  temperatureUnit: TemperatureUnit;
};

const COL = {
  day: { flex: 2 },
  temp: { flex: 1.4 },
  kwh: { width: 52 },
  sun: { width: 40 },
  bat: { width: 44 },
};

function HeaderCell({ label, style }: { label: string; style?: object }) {
  return (
    <Text
      style={[
        {
          color: theme.colors.muted,
          fontSize: 10,
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          textAlign: 'right',
        },
        style,
      ]}
    >
      {label}
    </Text>
  );
}

export function ForecastDayList({ days, onSelect, selectedIndex, temperatureUnit }: ForecastDayListProps) {
  return (
    <View
      style={{
        backgroundColor: theme.colors.panel,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
          gap: 4,
        }}
      >
        <Text style={{ ...COL.day, color: theme.colors.text, fontSize: 14, fontWeight: '700' }}>
          16-Day Forecast
        </Text>
        <HeaderCell label="Temp" style={COL.temp} />
        <HeaderCell label="kWh" style={COL.kwh} />
        <HeaderCell label="Sun" style={COL.sun} />
        <HeaderCell label="Bat" style={COL.bat} />
      </View>

      {days.map((day) => {
        const isSelected = selectedIndex === day.index;

        return (
          <Pressable
            key={day.date}
            onPress={() => onSelect(day.index)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 14,
              paddingVertical: 9,
              backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
              borderLeftWidth: 3,
              borderLeftColor: isSelected ? theme.colors.muted : 'transparent',
              gap: 4,
            }}
          >
            <View style={{ ...COL.day, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 14 }}>{day.icon}</Text>
              <View>
                <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: isSelected ? '700' : '500' }}>
                  {day.dayLabel}
                </Text>
                <Text style={{ color: theme.colors.subtleText, fontSize: 11 }}>{day.shortDate}</Text>
              </View>
            </View>
            <Text style={{ ...COL.temp, color: theme.colors.subtleText, fontSize: 12, textAlign: 'right' }}>
              {formatTemperatureRange(day.minTemp, day.maxTemp, temperatureUnit)}
            </Text>
            <Text
              style={{
                ...COL.kwh,
                color: isSelected ? theme.colors.muted : theme.colors.text,
                fontSize: 13,
                fontWeight: '700',
                textAlign: 'right',
                fontVariant: ['tabular-nums'],
              }}
            >
              {day.kwh.toFixed(1)}
            </Text>
            <Text style={{ ...COL.sun, color: theme.colors.subtleText, fontSize: 12, textAlign: 'right' }}>
              {day.sunHours == null ? '--' : `${day.sunHours.toFixed(1)}`}
            </Text>
            <Text style={{ ...COL.bat, color: theme.colors.subtleText, fontSize: 12, textAlign: 'right' }}>
              {day.batteryPercentGain == null ? '--' : `+${day.batteryPercentGain}%`}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
