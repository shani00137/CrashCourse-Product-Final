import React, { useCallback, useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
  AppState,
  BackHandler,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, radii, shadows } from "@/constants/theme";
import {
  checkForUpdates,
  UpdateCheckResult,
} from "@/services/updateCheck";

const SNOOZE_KEY = "update_prompt_snoozed_until";
// "Not now" lets the user keep working, but the prompt comes back after this
// window and on the next cold launch — the update stays front and center.
// Forced updates (forceUpdate) skip the snooze entirely.
const SNOOZE_MS = 6 * 60 * 60 * 1000;

export default function UpdatePrompt() {
  const [checking, setChecking] = useState(true);
  const [visible, setVisible] = useState(false);
  const [info, setInfo] = useState<UpdateCheckResult | null>(null);
  const [opening, setOpening] = useState(false);

  const runCheck = useCallback(async () => {
    try {
      setChecking(true);
      const result = await checkForUpdates();
      setInfo(result);
      if (result.updateAvailable) {
        if (result.forceUpdate) {
          // Forced updates ignore any previous "Not now".
          try {
            await AsyncStorage.removeItem(SNOOZE_KEY);
          } catch {}
          setVisible(true);
        } else {
          const snoozed = Number(
            (await AsyncStorage.getItem(SNOOZE_KEY)) || 0
          );
          if (Date.now() >= snoozed) setVisible(true);
        }
      }
    } catch {
      // Best effort only — never block the app on the update check.
    } finally {
      setChecking(false);
    }
  }, []);

  // Check after the app first loads…
  useEffect(() => {
    setChecking(true);
    runCheck();
  }, [runCheck]);

  // …and every time it returns to the foreground, so someone who just
  // updated (or just installed the new build) is not nagged anymore.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") runCheck();
    });
    return () => sub.remove();
  }, [runCheck]);

  // Strong prompt: the Android hardware back button must not dismiss it.
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, [visible]);

  const openStore = async () => {
    if (!info?.storeUrl) return;
    setOpening(true);
    try {
      const opened = await Linking.openURL(info.storeUrl);
      if (!opened && info.storeWebUrl) {
        await Linking.openURL(info.storeWebUrl);
      }
    } catch {
      try {
        if (info.storeWebUrl) await Linking.openURL(info.storeWebUrl);
      } catch {}
    } finally {
      setOpening(false);
    }
  };

  const notNow = async () => {
    setVisible(false);
    try {
      await AsyncStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
    } catch {}
  };

  if (checking || !visible || !info) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={() => {
        // Intentionally nothing: hardware back cannot dismiss the prompt.
      }}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroIcon}>
              <Ionicons name="cloud-download" size={40} color={colors.white} />
            </View>
            <Text style={styles.heroTitle}>Update Available</Text>
            <Text style={styles.heroSubtitle}>
              A newer version of Crash Course is ready.
            </Text>
          </LinearGradient>

          <View style={styles.body}>
            <View style={styles.versionsRow}>
              <View style={styles.versionChip}>
                <Text style={styles.versionChipLabel}>You have</Text>
                <Text style={styles.versionChipValue}>
                  v{info.currentVersion}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={18} color={colors.mutedForeground} />
              <View
                style={[styles.versionChip, styles.versionChipLatest]}
              >
                <Text style={[styles.versionChipLabel, { color: colors.white }]}>
                  Latest
                </Text>
                <Text style={[styles.versionChipValue, { color: colors.white }]}>
                  v{info.latestVersion}
                </Text>
              </View>
            </View>

            <Text style={styles.bodyTitle}>Please update to the latest version</Text>
            <Text style={styles.bodyText}>
              {info.message ??
                "New questions, fixes and features are included in this update. The current version on your device is outdated, so update now to keep everything working smoothly."}
            </Text>

            <TouchableOpacity
              style={[styles.updateButton, opening && styles.buttonBusy]}
              onPress={openStore}
              disabled={opening}
              activeOpacity={0.9}
            >
              <Ionicons name="download" size={20} color={colors.white} />
              <Text style={styles.updateButtonText}>
                {opening ? "Opening Play Store…" : "Update Now"}
              </Text>
            </TouchableOpacity>

            {info.forceUpdate ? (
              <Text style={styles.forceHint}>
                This update is required — your current version is no longer
                supported.
              </Text>
            ) : (
              <TouchableOpacity
                style={styles.notNowButton}
                onPress={notNow}
                activeOpacity={0.7}
              >
                <Text style={styles.notNowText}>Not now</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(13,13,13,0.72)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    overflow: "hidden",
    ...shadows.lg,
  },
  hero: {
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 24,
  },
  heroIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.white,
  },
  heroSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  body: {
    padding: 24,
    alignItems: "center",
  },
  versionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },
  versionChip: {
    backgroundColor: colors.muted,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: "center",
  },
  versionChipLatest: {
    backgroundColor: colors.green,
  },
  versionChipLabel: {
    fontSize: 11,
    color: colors.mutedForeground,
    fontWeight: "600",
  },
  versionChipValue: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.foreground,
    marginTop: 2,
  },
  bodyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.foreground,
    textAlign: "center",
  },
  bodyText: {
    fontSize: 13,
    color: colors.mutedForeground,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 22,
  },
  updateButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radii.lg,
    ...shadows.md,
  },
  buttonBusy: {
    opacity: 0.7,
  },
  updateButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  notNowButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 6,
  },
  notNowText: {
    color: colors.mutedForeground,
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  forceHint: {
    marginTop: 14,
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
    textAlign: "center",
  },
});