import { Text, View } from 'react-native';

import { theme } from '@/lib/theme';

type ChartDatum = {
  label: string;
  value: number;
};

type MiniBarChartProps = {
  color?: string;
  data: ChartDatum[];
  title: string;
};

export function MiniBarChart({ color = theme.colors.accent, data, title }: MiniBarChartProps) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
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
      <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700' }}>{title}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, minHeight: 140 }}>
        {data.map((item) => (
          <View key={item.label} style={{ flex: 1, alignItems: 'center', gap: 8 }}>
            <View
              style={{
                width: '100%',
                minHeight: 4,
                height: `${Math.max((item.value / max) * 100, 4)}%`,
                backgroundColor: color,
                borderRadius: 999,
              }}
            />
            <Text style={{ color: theme.colors.subtleText, fontSize: 11 }}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
