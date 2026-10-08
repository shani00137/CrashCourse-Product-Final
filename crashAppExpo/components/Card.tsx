import React from "react";
import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { shadows, radii, type ThemePalette } from "@/constants/theme";
import { useThemedStyles } from "@/context/ThemeContext";

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  shadow?: boolean;
  border?: boolean;
}

export function Card({ children, style, onPress, shadow = true, border = true }: CardProps) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View
      style={[
        styles.card,
        shadow && styles.shadow,
        border && styles.border,
        style,
      ]}
    >
      {children}
    </View>
  );
}

interface CardHeaderProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export function CardHeader({ title, subtitle, action, style, children }: CardHeaderProps) {
  const styles = useThemedStyles(makeStyles);
  if (children) return <View style={[styles.header, style]}>{children}</View>;
  return (
    <View style={[styles.header, style]}>
      <View style={styles.headerText}>
        {title && <Text style={styles.title}>{title}</Text>}
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {action}
    </View>
  );
}

export function CardContent({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const styles = useThemedStyles(makeStyles);
  return <View style={[styles.content, style]}>{children}</View>;
}

export function CardFooter({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const styles = useThemedStyles(makeStyles);
  return <View style={[styles.footer, style]}>{children}</View>;
}

const makeStyles = ({ colors }: ThemePalette) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: 16,
  },
  shadow: {
    ...shadows.sm,
  },
  border: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.foreground,
  },
  subtitle: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  content: {
    padding: 0,
  },
  footer: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
  },
});
