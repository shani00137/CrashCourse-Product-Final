import React from "react";
import { Switch, StyleSheet } from "react-native";
import { colors } from "@/constants/theme";

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ value, onValueChange, disabled }: ToggleProps) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: "#D1D5DB", true: colors.primary }}
      thumbColor={colors.white}
      ios_backgroundColor="#D1D5DB"
      style={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    transform: [{ scale: 0.9 }],
  },
});
