import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import { colors, radii, shadows } from "@/constants/theme";

interface InputProps extends TextInputProps {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
  rightElement?: React.ReactNode;
}

export function Input({
  label,
  icon,
  error,
  style,
  inputStyle,
  rightElement,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.wrapper,
          focused && styles.focused,
          error && styles.errorWrapper,
        ]}
      >
        {icon}
        <TextInput
          style={[styles.input, inputStyle]}
          placeholderTextColor={colors.mutedForeground}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {rightElement}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.mutedForeground,
  },
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...shadows.sm,
  },
  focused: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  errorWrapper: {
    borderColor: colors.red,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.foreground,
    paddingVertical: 0,
  },
  errorText: {
    fontSize: 12,
    color: colors.red,
  },
});
