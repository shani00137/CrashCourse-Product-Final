import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  PressableProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native";
import { colors } from "@/constants/theme";

type Variant = "primary" | "green" | "outline" | "ghost" | "destructive" | "secondary";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends Omit<PressableProps, "style"> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  label?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  label,
  style,
  labelStyle,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variantStyle = variants[variant];
  const sizeStyle = sizes[size];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        variantStyle.container,
        sizeStyle,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.spinnerColor} size="small" />
      ) : children ? (
        children
      ) : (
        <Text style={[styles.label, variantStyle.text, sizeStyle.text, labelStyle]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    flexDirection: "row",
    gap: 8,
  },
  label: {
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});

const sizes = {
  sm: { paddingVertical: 8, paddingHorizontal: 14, text: { fontSize: 13 } as TextStyle },
  md: { paddingVertical: 14, paddingHorizontal: 20, text: { fontSize: 15 } as TextStyle },
  lg: { paddingVertical: 18, paddingHorizontal: 24, text: { fontSize: 16 } as TextStyle },
};

const variants: Record<
  Variant,
  { container: ViewStyle; text: TextStyle; spinnerColor: string }
> = {
  primary: {
    container: { backgroundColor: colors.primary },
    text: { color: colors.white },
    spinnerColor: colors.white,
  },
  green: {
    container: { backgroundColor: colors.green },
    text: { color: colors.white },
    spinnerColor: colors.white,
  },
  outline: {
    container: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    text: { color: colors.foreground },
    spinnerColor: colors.primary,
  },
  ghost: {
    container: { backgroundColor: "transparent" },
    text: { color: colors.primary },
    spinnerColor: colors.primary,
  },
  destructive: {
    container: {
      backgroundColor: "#FFF0F0",
      borderWidth: 1,
      borderColor: "#FECACA",
    },
    text: { color: colors.red },
    spinnerColor: colors.red,
  },
  secondary: {
    container: {
      backgroundColor: colors.muted,
    },
    text: { color: colors.green },
    spinnerColor: colors.green,
  },
};
