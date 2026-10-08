import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { type ThemePalette } from "@/constants/theme";
import { useTheme, useThemedStyles } from "@/context/ThemeContext";

interface ProgressBarProps {
  progress: number;
  color?: string;
  bgColor?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export function ProgressBar({
  progress,
  color: colorProp,
  bgColor: bgColorProp,
  height = 8,
  style,
}: ProgressBarProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const color = colorProp ?? colors.primary;
  const bgColor = bgColorProp ?? colors.muted;
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

const makeStyles = ({ colors }: ThemePalette) => StyleSheet.create({
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
