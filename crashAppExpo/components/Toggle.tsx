import React from "react";
import { Switch, StyleSheet } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ value, onValueChange, disabled }: ToggleProps) {
  const { colors } = useTheme();
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: colors.borderStrong, true: colors.primary }}
      thumbColor={colors.white}
      ios_backgroundColor={colors.borderStrong}
      style={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    transform: [{ scale: 0.9 }],
  },
});
