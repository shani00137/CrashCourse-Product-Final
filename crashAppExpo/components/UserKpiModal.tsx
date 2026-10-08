import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { radii, shadows, type ThemePalette } from "@/constants/theme";
import { useTheme, useThemedStyles } from "@/context/ThemeContext";
import { getUserKpi, type UserKpi } from "@/services/api";

interface UserKpiModalProps {
  visible: boolean;
  onClose: () => void;
  appUserId?: number;
  userName?: string;
}

/** 5400 seconds → "1h 30m" / "45m" / "0m" */
function formatMinutes(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds || 0));
  if (total < 60) return "0m";
  const mins = Math.floor(total / 60);
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  return hours > 0 ? `${hours}h ${rest}m` : `${mins}m`;
}

interface Tile {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  sub: string;
  color: string;
}

/**
 * Bottom-sheet with the calculated KPI for the signed-in user:
 * reading time, exercises completed, tests taken and their results.
 */
export function UserKpiModal({ visible, onClose, appUserId, userName }: UserKpiModalProps) {
  const [kpi, setKpi] = useState<UserKpi | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { colors, gradients } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const load = useCallback(async () => {
    if (!appUserId) {
      setError("No user is signed in.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      setKpi(await getUserKpi(appUserId));
    } catch (e) {
      setKpi(null);
      setError(e instanceof Error ? e.message : "Could not load your KPI.");
    } finally {
      setLoading(false);
    }
  }, [appUserId]);

  useEffect(() => {
    if (visible) {
      setKpi(null);
      void load();
    }
  }, [visible, load]);

  const tiles: Tile[] = kpi
    ? [
        {
          key: "reading",
          icon: "time-outline",
          label: "Reading Time",
          value: formatMinutes(kpi.readingSeconds),
          sub: `${kpi.lessonsStarted} lesson${kpi.lessonsStarted === 1 ? "" : "s"} started`,
          color: colors.teal,
        },
        {
          key: "exercises",
          icon: "book-outline",
          label: "Exercises Done",
          value: String(kpi.exercisesCompleted),
          sub: "finished exercises",
          color: colors.green,
        },
        {
          key: "tests",
          icon: "document-text-outline",
          label: "Tests Taken",
          value: String(kpi.testsTaken),
          sub: `${kpi.testsCompleted} completed · ${kpi.testsInProgress} in progress`,
          color: colors.purple,
        },
        {
          key: "passed",
          icon: "trophy-outline",
          label: "Tests Passed",
          value: `${kpi.testsPassed}/${kpi.testsCompleted}`,
          sub: "scored 60% or more",
          color: colors.amber,
        },
        {
          key: "avg",
          icon: "stats-chart-outline",
          label: "Average Score",
          value: `${kpi.avgScore}%`,
          sub: `Best ${kpi.bestScore}%`,
          color: colors.primary,
        },
        {
          key: "overall",
          icon: "checkmark-done-outline",
          label: "Overall Result",
          value: `${kpi.overallScore}%`,
          sub: `${kpi.totalRightAnswers}/${kpi.totalQuestions} answers correct`,
          color: colors.green,
        },
      ]
    : [];

  const lastPassed = (kpi?.overallScore ?? 0) >= 60;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheet}>
          <LinearGradient
            colors={gradients.header2}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerIcon}>
              <Ionicons name="speedometer-outline" size={20} color={colors.white} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>My KPI</Text>
              <Text style={styles.headerSub} numberOfLines={1}>
                {userName ? `${userName} · performance summary` : "Performance summary"}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
              <Ionicons name="close" size={18} color={colors.white} />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {loading && (
              <View style={styles.stateBox}>
                <ActivityIndicator color={colors.primary} size="small" />
                <Text style={styles.stateText}>Calculating your KPI…</Text>
              </View>
            )}

            {!loading && !!error && (
              <View style={styles.errorBox}>
                <Ionicons name="cloud-offline-outline" size={16} color={colors.primary} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {!loading && !error && kpi && (
              <>
                <View style={styles.grid}>
                  {tiles.map((t) => (
                    <View key={t.key} style={styles.tile}>
                      <View style={[styles.tileIcon, { backgroundColor: t.color + "1F" }]}>
                        <Ionicons name={t.icon} size={15} color={t.color} />
                      </View>
                      <Text style={styles.tileValue} numberOfLines={1} adjustsFontSizeToFit>
                        {t.value}
                      </Text>
                      <Text style={styles.tileLabel}>{t.label}</Text>
                      <Text style={styles.tileSub} numberOfLines={2}>
                        {t.sub}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.resultCard}>
                  <View style={styles.resultRow}>
                    <View
                      style={[
                        styles.resultBadge,
                        { backgroundColor: lastPassed ? colors.greenLight : colors.redLight },
                      ]}
                    >
                      <Ionicons
                        name={lastPassed ? "checkmark-circle" : "alert-circle"}
                        size={15}
                        color={lastPassed ? colors.green : colors.primary}
                      />
                      <Text
                        style={[
                          styles.resultBadgeText,
                          { color: lastPassed ? colors.green : colors.primary },
                        ]}
                      >
                        {kpi.lastResult}
                      </Text>
                    </View>
                    {kpi.lastTestDate && (
                      <Text style={styles.resultDate}>
                        {new Date(kpi.lastTestDate).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.resultHint}>
                    {kpi.testsTaken === 0
                      ? "Take a test to see your result here."
                      : `${kpi.testsCompleted} of ${kpi.testsTaken} tests completed · ${kpi.testsPassed} passed.`}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.refreshBtn}
                  onPress={() => void load()}
                  activeOpacity={0.8}
                  disabled={loading}
                >
                  <Ionicons name="refresh" size={14} color={colors.primary} />
                  <Text style={styles.refreshText}>Refresh</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = ({ colors }: ThemePalette) => StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    maxHeight: "86%",
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    overflow: "hidden",
    ...shadows.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "800",
  },
  headerSub: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 16,
    gap: 14,
  },
  stateBox: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  stateText: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: radii.md,
    padding: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: colors.primary,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tile: {
    width: "48%",
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  tileIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  tileValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.foreground,
  },
  tileLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginTop: 2,
  },
  tileSub: {
    fontSize: 11,
    color: colors.mutedForeground,
    marginTop: 4,
  },
  resultCard: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
    ...shadows.sm,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  resultBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radii.round,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  resultBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  resultDate: {
    fontSize: 11,
    color: colors.mutedForeground,
  },
  resultHint: {
    fontSize: 12,
    color: colors.mutedForeground,
    lineHeight: 17,
  },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    alignSelf: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  refreshText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
});
