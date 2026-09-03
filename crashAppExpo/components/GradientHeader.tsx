import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { gradients } from "@/constants/theme";

interface GradientHeaderProps {
  colors?: readonly [string, string, ...string[]];
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export function GradientHeader({
  colors = gradients.header,
  style,
  children,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
}: GradientHeaderProps) {
  return (
    <LinearGradient colors={colors} start={start} end={end} style={[styles.header, style]}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    overflow: "hidden",
  },
});
