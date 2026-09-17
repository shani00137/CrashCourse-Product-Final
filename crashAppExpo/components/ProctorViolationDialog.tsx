import React from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, shadows } from "@/constants/theme";

interface ProctorViolationDialogProps {
  visible: boolean;
  onAcknowledge: () => void;
}

export default function ProctorViolationDialog({
  visible,
  onAcknowledge,
}: ProctorViolationDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onAcknowledge}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.iconBox}>
              <Ionicons name="phone-portrait-outline" size={22} color={colors.white} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>Mobile Phone Detected</Text>
              <Text style={styles.subtitle}>Session terminated</Text>
            </View>
          </LinearGradient>

          <View style={styles.body}>
            <Text style={styles.disclaimer}>
              As per your exam agreement, you are not permitted to take pictures
              of the questions using your mobile phone. This action is a
              violation of the exam policy.
            </Text>

            <View style={styles.noteRow}>
              <Ionicons
                name="shield-checkmark-outline"
                size={14}
                color={colors.mutedForeground}
              />
              <Text style={styles.note}>
                Your session has been ended. Please contact support if you
                believe this was a mistake.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.okButton}
              onPress={onAcknowledge}
              activeOpacity={0.9}
            >
              <Text style={styles.okText}>I Understand</Text>
            </TouchableOpacity>
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
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  subtitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    marginTop: 2,
  },
  body: {
    padding: 18,
  },
  disclaimer: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.foreground,
  },
  noteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 14,
    backgroundColor: colors.muted,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  note: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: colors.mutedForeground,
  },
  okButton: {
    marginTop: 18,
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingVertical: 14,
    alignItems: "center",
    ...shadows.md,
  },
  okText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
});