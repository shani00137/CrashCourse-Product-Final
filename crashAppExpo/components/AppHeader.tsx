import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, gradients, shadows } from "@/constants/theme";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  customGradient?: readonly [string, string, ...string[]];
  rightElement?: React.ReactNode;
  children?: React.ReactNode;
}

export function AppHeader({
  title,
  subtitle,
  showBack = true,
  customGradient = gradients.header,
  rightElement,
  children,
}: AppHeaderProps) {
  const router = useRouter();

  return (
    <LinearGradient
      colors={customGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={styles.container}
    >
      <View style={styles.glow} />
      <View style={styles.topRow}>
        {showBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={18} color={colors.white} />
          </TouchableOpacity>
        )}
        <View style={styles.titleBlock}>
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
          <Text style={styles.title}>{title}</Text>
        </View>
        {rightElement}
      </View>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 88,
    paddingBottom: 24,
    paddingHorizontal: 24,
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: {
    flex: 1,
  },
  subtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  title: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "800",
  },
});
