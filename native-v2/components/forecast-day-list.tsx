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

export function ForecastDayList({
  days,
  onSelect,
  selectedIndex,
  temperatureUnit,
}: ForecastDayListProps) {
  return (
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
      <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700' }}>16-Day Forecast</Text>
      {days.map((day) => {
        const isSelected = selectedIndex === day.index;

        return (
          <Pressable
            key={day.date}
            onPress={() => onSelect(day.index)}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 18,
              backgroundColor: isSelected ? '#11213F' : '#081224',
              borderWidth: 1,
              borderColor: isSelected ? theme.colors.accent : 'transparent',
              gap: 6,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '700' }}>
                  {day.dayLabel} · {day.shortDate}
                </Text>
                <Text style={{ color: theme.colors.subtleText, fontSize: 13 }}>{day.icon}</Text>
              </View>
              <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '800' }}>
                {day.kwh.toFixed(1)} kWh
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
              <Text style={{ color: theme.colors.subtleText, fontSize: 13 }}>
                {formatTemperatureRange(day.minTemp, day.maxTemp, temperatureUnit)}
              </Text>
              <Text style={{ color: theme.colors.subtleText, fontSize: 13 }}>
                {day.sunHours == null ? 'Sun --' : `${day.sunHours.toFixed(1)} sun hrs`}
              </Text>
              <Text style={{ color: theme.colors.subtleText, fontSize: 13 }}>
                {day.batteryPercentGain == null ? 'Battery --' : `+${day.batteryPercentGain}% battery`}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
