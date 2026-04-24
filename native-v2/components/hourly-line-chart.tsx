import { useState } from 'react';
import { LayoutChangeEvent, Text, View } from 'react-native';
import { Defs, LinearGradient, Path, Stop, Svg, Text as SvgText } from 'react-native-svg';

import { theme } from '@/lib/theme';

type DataPoint = { label: string; value: number };

type HourlyLineChartProps = {
  data: DataPoint[];
  title: string;
};

const CHART_H = 150;
const PAD = { top: 12, right: 8, bottom: 28, left: 8 };

function catmullRomPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[Math.max(i - 2, 0)];
    const p1 = pts[i - 1];
    const p2 = pts[i];
    const p3 = pts[Math.min(i + 1, pts.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)} ${cp2x.toFixed(1)} ${cp2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export function HourlyLineChart({ data, title }: HourlyLineChartProps) {
  const [containerWidth, setContainerWidth] = useState(300);

  function onLayout(e: LayoutChangeEvent) {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setContainerWidth(w);
  }

  if (data.length < 2) return null;

  const innerW = containerWidth - PAD.left - PAD.right;
  const innerH = CHART_H - PAD.top - PAD.bottom;
  const max = Math.max(...data.map((d) => d.value), 0.1);
  const baseY = PAD.top + innerH;

  const pts = data.map((d, i) => ({
    x: PAD.left + (i / (data.length - 1)) * innerW,
    y: PAD.top + (1 - d.value / max) * innerH,
  }));

  const linePath = catmullRomPath(pts);
  const fillPath =
    linePath +
    ` L ${pts[pts.length - 1].x.toFixed(1)} ${baseY.toFixed(1)} L ${pts[0].x.toFixed(1)} ${baseY.toFixed(1)} Z`;

  // Show labels at indices 0, 4, 8, 12, 16, 20 (every 4 hours)
  const labelPts = pts.filter((_, i) => i % 4 === 0);
  const labelData = data.filter((_, i) => i % 4 === 0);

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
      <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '700' }}>{title}</Text>
      <View onLayout={onLayout}>
        <Svg width={containerWidth} height={CHART_H}>
          <Defs>
            <LinearGradient id="hourlyGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#38BDF8" stopOpacity={0.4} />
              <Stop offset="100%" stopColor="#38BDF8" stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Path d={fillPath} fill="url(#hourlyGrad)" />
          <Path
            d={linePath}
            fill="none"
            stroke="#38BDF8"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {labelPts.map((pt, i) => (
            <SvgText
              key={i}
              x={pt.x}
              y={CHART_H - 6}
              fontSize={10}
              fill="#64748B"
              textAnchor="middle"
            >
              {labelData[i].label}
            </SvgText>
          ))}
        </Svg>
      </View>
    </View>
  );
}
