import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Path,
  Circle,
  Rect,
  Line,
} from "react-native-svg";
import { colors, radii } from "@/constants/theme";

interface AreaChartProps {
  data: { day: string; minutes: number }[];
  height?: number;
  color?: string;
}

const CHART_PAD = 8;
const CHART_TOP = 16;
const CHART_BOTTOM = 24;

export function AreaChart({ data, height = 140, color = colors.primary }: AreaChartProps) {
  const width = 100; // normalized width
  const maxY = Math.max(...data.map((d) => d.minutes));
  const chartHeight = height - CHART_TOP - CHART_BOTTOM;
  const stepX = (width - CHART_PAD * 2) / (data.length - 1);

  const points = data.map((d, i) => ({
    x: CHART_PAD + i * stepX,
    y: CHART_TOP + (1 - d.minutes / maxY) * chartHeight,
    day: d.day,
    value: d.minutes,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");

  const areaPath = `${linePath} L${points[points.length - 1].x},${
    CHART_TOP + chartHeight
  } L${points[0].x},${CHART_TOP + chartHeight} Z`;

  const gradId = `areaGrad-${color.slice(1)}`;

  return (
    <View style={{ height }}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="5%" stopColor={color} stopOpacity={0.25} />
            <Stop offset="95%" stopColor={color} stopOpacity={0.02} />
          </LinearGradient>
        </Defs>
        <Path d={areaPath} fill={`url(#${gradId})`} />
        <Path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        {points.map((p) => (
          <Circle key={p.day} cx={p.x} cy={p.y} r={3} fill={color} />
        ))}
      </Svg>
    </View>
  );
}

interface BarChartProps {
  data: { day: string; score: number }[];
  height?: number;
  color?: string;
  minDomain?: number;
}

export function BarChart({ data, height = 130, color = colors.green, minDomain = 55 }: BarChartProps) {
  const width = 100;
  const maxY = 100;
  const chartHeight = height - CHART_TOP - CHART_BOTTOM;
  const barWidth = (width - CHART_PAD * 2) / data.length * 0.6;
  const slotWidth = (width - CHART_PAD * 2) / data.length;

  return (
    <View style={{ height }}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {data.map((d, i) => {
          const x = CHART_PAD + i * slotWidth + slotWidth / 2 - barWidth / 2;
          const barHeight = ((d.score - minDomain) / (maxY - minDomain)) * chartHeight;
          const y = CHART_TOP + (chartHeight - barHeight);
          return (
            <Rect
              key={d.day}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={6}
              fill={color}
            />
          );
        })}
      </Svg>
      <View style={styles.labels}>
        {data.map((d) => (
          <Text key={d.day} style={styles.labelText}>
            {d.day}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: CHART_PAD * 2,
    marginTop: 4,
  },
  labelText: {
    fontSize: 11,
    color: colors.mutedForeground,
  },
});
