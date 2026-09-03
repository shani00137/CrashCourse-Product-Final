import React from "react";
import { View, Text, StyleSheet, ViewStyle, StyleProp } from "react-native";

interface BadgeProps {
  label: string;
  color?: string;
  bg?: string;
  style?: StyleProp<ViewStyle>;
}

export function Badge({ label, color = "#C41E3A", bg = "#FFF0F2", style }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  text: {
    fontSize: 10,
    fontWeight: "600",
  },
});
