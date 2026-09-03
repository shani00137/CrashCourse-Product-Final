import React from "react";
import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { colors, radii } from "@/constants/theme";

interface AvatarProps {
  name: string;
  size?: number;
  image?: string | null;
  ringColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function Avatar({ name, size = 80, image, ringColor = "rgba(255,255,255,0.3)", style }: AvatarProps) {
  const initial = name?.charAt(0).toUpperCase() || "U";
  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2, borderWidth: size * 0.05, borderColor: ringColor },
        style,
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.4 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: colors.white,
    fontWeight: "700",
  },
});
