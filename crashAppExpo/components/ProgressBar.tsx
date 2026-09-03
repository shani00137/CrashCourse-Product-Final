import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { colors } from "@/constants/theme";

interface ProgressBarProps {
  progress: number;
  color?: string;
  bgColor?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export function ProgressBar({
  progress,
  color = colors.primary,
  bgColor = colors.muted,
  height = 8,
  style,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));
  return (
    <View style={[styles.track, { height, backgroundColor: bgColor }, style]}>
      <View
        style={[
          styles.fill,
          { width: `${clamped}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: colors.muted,
  },
  fill: {
    height: "100%",
    borderRadius: 999,
  },
});
