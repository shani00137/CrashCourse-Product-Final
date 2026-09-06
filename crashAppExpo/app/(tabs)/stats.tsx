import React, { useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, gradients, radii, shadows } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { AreaChart, BarChart } from "@/components/Charts";
import { ProgressBar } from "@/components/ProgressBar";
import { useStudyData } from "@/hooks/useStudyData";

const achievements = [
  { icon: "📚", label: "First Test", sub: "Completed a test", color: "#C41E3A" },
  { icon: "🏆", label: "Top 10%", sub: "Score 90%+ in a test", color: "#166534" },
  { icon: "⏱️", label: "Half Hour", sub: "30+ min of reading", color: "#0891B2" },
  { icon: "💊", label: "Exam Ready", sub: "5+ tests completed", color: "#F59E0B" },
];

function testPct(right: number | undefined, questions: number | undefined): number {
  const total = questions || 1;
  const r = right || 0;
  return Math.round((r / Math.max(total, 1)) * 100);
}

export default function StatsScreen() {
  const router = useRouter();
  const { user } = useApp();
  const study = useStudyData(user?.appUserId);

  useFocusEffect(
    useCallback(() => {
      study.refresh();
    }, [study.refresh])
  );

  const totalMins = study.readingMinutes;

  // Reading per lesson (ascending so the trend reads left→right)
  const readingTrend = study.modules
    .slice()
    .sort((a, b) => a.exerciseStart - b.exerciseStart)
    .slice(-8)
    .map((m) => ({
      day: `Q${m.exerciseStart}`,
      minutes: m.minutes,
    }));

  // Score trend: last 8 completed tests, chronological
  const scoreTrend = study.completedTests
    .slice()
    .sort((a, b) => {
      const da = a.testDate || "";
      const db = b.testDate || "";
      return da < db ? -1 : db < da ? 1 : 0;
    })
    .slice(-8)
    .map((t) => ({
      day: `#${t.testId}`,
      score: testPct(t.rightQuestions, t.questions),
    }));

  const latestTestScores = study.completedTests
    .slice()
    .sort((a, b) => {
      const da = a.testDate || "";
      const db = b.testDate || "";
      return db < da ? -1 : da < db ? 1 : 0;
    })
    .slice(0, 6);

  const avg = study.loading ? "…" : study.avgScore > 0 ? `${study.avgScore}%` : "—";

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={gradients.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerGlow} />
        <View style={styles.titleBlock}>
          <Text style={styles.brandName}>CRASH COURSE</Text>
          <Text style={styles.pageTitle}>My Statistics</Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Ionicons name="time-outline" size={18} color="#6EE7B7" />
            <Text style={styles.summaryValue}>
              {study.loading ? "…" : totalMins >= 60 ? `${(totalMins / 60).toFixed(1)}h` : `${totalMins}m`}
            </Text>
            <Text style={styles.summaryLabel}>Study Time</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="locate" size={18} color="#FCD34D" />
            <Text style={styles.summaryValue}>{avg}</Text>
            <Text style={styles.summaryLabel}>Avg Score</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="book-outline" size={18} color="#93C5FD" />
            <Text style={styles.summaryValue}>{study.loading ? "…" : String(study.testsDone)}</Text>
            <Text style={styles.summaryLabel}>Tests Done</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {study.loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.primary} size="small" />
            <Text style={styles.loadingText}>Loading your stats...</Text>
          </View>
        ) : null}

        {study.error ? (
          <View style={styles.noticeBox}>
            <Ionicons name="cloud-offline-outline" size={16} color={colors.primary} />
            <Text style={styles.noticeText}>
              Could not load tests: {study.error}
            </Text>
          </View>
        ) : null}

        {/* Reading time per lesson */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Reading Time by Lesson</Text>
            <View style={styles.trendBadge}>
              <Ionicons name="time-outline" size={14} color={colors.teal} />
              <Text style={styles.trendText}>{study.moduleCount} lessons</Text>
            </View>
          </View>
          {readingTrend.length >= 2 ? (
            <AreaChart data={readingTrend} color={colors.teal} />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={26} color={colors.mutedForeground} />
              <Text style={styles.emptyTitle}>No reading tracked yet</Text>
              <Text style={styles.emptyText}>
                Open a lesson and your reading time is recorded automatically.
              </Text>
              <TouchableOpacity
                style={styles.goButton}
                onPress={() => router.push("/exercise")}
                activeOpacity={0.9}
              >
                <Text style={styles.goButtonText}>Start Reading</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* MCQ score trend */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Test Score Trend</Text>
            <View style={styles.trendBadge}>
              <Ionicons name="trophy" size={14} color={colors.green} />
              <Text style={styles.trendText}>{study.testsDone} tests</Text>
            </View>
          </View>
          {scoreTrend.length >= 1 ? (
            <BarChart data={scoreTrend} color={colors.green} minDomain={0} />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={26} color={colors.mutedForeground} />
              <Text style={styles.emptyTitle}>No tests completed</Text>
              <Text style={styles.emptyText}>
                Finish a test to see your score trend here.
              </Text>
              <TouchableOpacity
                style={styles.goButton}
                onPress={() => router.push("/test")}
                activeOpacity={0.9}
              >
                <Text style={styles.goButtonText}>Take a Test</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Latest test scores */}
        {latestTestScores.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Latest Test Scores</Text>
            <View style={styles.subjectList}>
              {latestTestScores.map((t) => {
                const right = t.rightQuestions || 0;
                const total = t.questions || 1;
                const p = testPct(right, total);
                const passed = p >= 60;
                return (
                  <View key={t.testId} style={styles.subjectRow}>
                    <Text style={styles.subjectName} numberOfLines={1}>
                      {t.courseName || "Test"} #{t.testId}
                    </Text>
                    <ProgressBar
                      progress={p}
                      color={passed ? colors.green : colors.primary}
                      height={10}
                      style={styles.subjectProgress}
                    />
                    <Text style={styles.subjectScore}>
                      {right}/{total}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsGrid}>
            {achievements.map((a) => {
              const earned =
                (a.label === "First Test" && study.testsDone >= 1) ||
                (a.label === "Top 10%" && study.bestScore >= 90) ||
                (a.label === "Half Hour" && study.readingMinutes >= 30) ||
                (a.label === "Exam Ready" && study.testsDone >= 5);
              return (
                <View
                  key={a.label}
                  style={[
                    styles.achievementCard,
                    { borderColor: colors.border },
                    !earned && styles.achievementLocked,
                  ]}
                >
                  <View
                    style={[
                      styles.achievementIconBox,
                      { backgroundColor: earned ? a.color + "18" : colors.muted },
                    ]}
                  >
                    <Text style={styles.achievementIcon}>{a.icon}</Text>
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementLabel}>{a.label}</Text>
                    <Text style={styles.achievementSub}>
                      {earned ? a.sub : "Locked · keep going"}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 88,
    paddingBottom: 24,
    paddingHorizontal: 24,
    overflow: "hidden",
  },
  headerGlow: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  titleBlock: {
    marginBottom: 16,
  },
  brandName: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  pageTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "800",
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: radii.lg,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  summaryValue: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "800",
    marginTop: 6,
  },
  summaryLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 10,
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingBox: {
    alignItems: "center",
    paddingVertical: 4,
    gap: 8,
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  noticeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: radii.md,
    padding: 12,
    marginBottom: 12,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: colors.primary,
  },
  chartCard: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    ...shadows.sm,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.foreground,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.green,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 18,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.foreground,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 12,
    color: colors.mutedForeground,
    textAlign: "center",
    lineHeight: 17,
  },
  goButton: {
    marginTop: 8,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  goButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "700",
  },
  subjectList: {
    marginTop: 16,
    gap: 12,
  },
  subjectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  subjectName: {
    width: 96,
    fontSize: 13,
    fontWeight: "500",
    color: colors.foreground,
  },
  subjectProgress: {
    flex: 1,
  },
  subjectScore: {
    width: 40,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "700",
    color: colors.foreground,
  },
  section: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.foreground,
    marginBottom: 12,
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  achievementCard: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: 14,
    borderWidth: 1,
    ...shadows.sm,
  },
  achievementLocked: {
    opacity: 0.55,
  },
  achievementIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  achievementIcon: {
    fontSize: 18,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.foreground,
  },
  achievementSub: {
    fontSize: 11,
    color: colors.mutedForeground,
  },
  bottomSpacer: {
    height: 16,
  },
});