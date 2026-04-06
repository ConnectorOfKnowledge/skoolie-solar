import { Text, View } from 'react-native';

import { clampPercent } from '@/lib/solar';
import { theme } from '@/lib/theme';

type SunVisualizerProps = {
  azimuth: number;
  elevation: number;
  heading?: number | null;
};

export function SunVisualizer({ azimuth, elevation, heading }: SunVisualizerProps) {
  const x = clampPercent((azimuth / 360) * 100);
  const y = clampPercent(100 - ((elevation + 10) / 100) * 100);
  const headingX = heading == null ? null : clampPercent((heading / 360) * 100);

  return (
    <View
      style={{
        backgroundColor: theme.colors.panel,
        borderRadius: 26,
        padding: 18,
        gap: 14,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700' }}>Sky View</Text>
      <View
        style={{
          height: 240,
          borderRadius: 22,
          backgroundColor: '#081224',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 34,
            height: 2,
            backgroundColor: 'rgba(125, 211, 252, 0.2)',
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: `${x}%`,
            top: `${y}%`,
            width: 24,
            height: 24,
            marginLeft: -12,
            marginTop: -12,
            borderRadius: 999,
            backgroundColor: '#FBBF24',
          }}
        />
        {headingX != null ? (
          <View
            style={{
              position: 'absolute',
              left: `${headingX}%`,
              bottom: 18,
              width: 4,
              height: 46,
              marginLeft: -2,
              borderRadius: 999,
              backgroundColor: theme.colors.accent,
            }}
          />
        ) : null}
        <View
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          {['E', 'S', 'W'].map((label) => (
            <Text key={label} style={{ color: theme.colors.subtleText, fontSize: 12, fontWeight: '700' }}>
              {label}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}
