import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { type ThemePalette } from "@/constants/theme";
import { useThemedStyles } from "@/context/ThemeContext";

type Orientation = "horizontal" | "vertical";

interface SeparatorProps {
  orientation?: Orientation;
  style?: StyleProp<ViewStyle>;
}

export function Separator({ orientation = "horizontal", style }: SeparatorProps) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View
      style={[
        orientation === "horizontal"
          ? styles.horizontal
          : styles.vertical,
        style,
      ]}
    />
  );
}

const makeStyles = ({ colors }: ThemePalette) => StyleSheet.create({
    horizontal: {
      height: 1,
      width: "100%",
      backgroundColor: colors.border,
    },
    vertical: {
      width: 1,
      height: "100%",
      backgroundColor: colors.border,
    },
  });
