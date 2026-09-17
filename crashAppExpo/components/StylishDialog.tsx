import React from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, shadows } from "@/constants/theme";

export interface StylishDialogAction {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "ghost" | "danger";
}

export interface StylishDialogProps {
  visible: boolean;
  title: string;
  message: string;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  tone?: "primary" | "danger" | "success";
  actions: StylishDialogAction[];
  onRequestClose?: () => void;
}

const toneGradient: Record<
  NonNullable<StylishDialogProps["tone"]>,
  readonly [string, string]
> = {
  primary: [colors.primary, colors.primaryDark],
  danger: ["#F43F5E", "#9F1239"],
  success: [colors.green, "#166534"],
};

export default function StylishDialog({
  visible,
  title,
  message,
  icon = "information-circle",
  tone = "primary",
  actions,
  onRequestClose,
}: StylishDialogProps) {
  const single = actions.length <= 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <LinearGradient
            colors={toneGradient[tone]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.iconBox}>
              <Ionicons name={icon} size={22} color={colors.white} />
            </View>
            <Text style={styles.title}>{title}</Text>
          </LinearGradient>

          <View style={styles.body}>
            <Text style={styles.message}>{message}</Text>
            <View style={styles.actionRow}>
              {actions.map((a, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.actionBtn,
                    single && styles.actionBtnSingle,
                    a.variant === "ghost"
                      ? styles.actionBtnGhost
                      : a.variant === "danger"
                        ? styles.actionBtnDanger
                        : styles.actionBtnPrimary,
                  ]}
                  onPress={a.onPress}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.actionText,
                      a.variant === "ghost"
                        ? styles.actionTextGhost
                        : styles.actionTextFilled,
                    ]}
                  >
                    {a.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "rgba(15,23,42,0.55)",
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    overflow: "hidden",
    ...shadows.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  body: {
    padding: 18,
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.foreground,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.lg,
  },
  actionBtnSingle: {
    flex: 1,
  },
  actionBtnPrimary: {
    backgroundColor: colors.primary,
    ...shadows.md,
  },
  actionBtnDanger: {
    backgroundColor: "#DC2626",
    ...shadows.md,
  },
  actionBtnGhost: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: {
    fontSize: 15,
    fontWeight: "700",
  },
  actionTextFilled: {
    color: colors.white,
  },
  actionTextGhost: {
    color: colors.mutedForeground,
  },
});