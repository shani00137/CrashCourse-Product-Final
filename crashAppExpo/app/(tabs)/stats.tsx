import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, gradients, radii, shadows } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { AreaChart, BarChart } from "@/components/Charts";
import { ProgressBar } from "@/components/ProgressBar";

const weeklyActivity = [
  { day: "Mon", minutes: 42, score: 72 },
  { day: "Tue", minutes: 65, score: 80 },
  { day: "Wed", minutes: 28, score: 68 },
  { day: "Thu", minutes: 88, score: 91 },
  { day: "Fri", minutes: 55, score: 85 },
  { day: "Sat", minutes: 94, score: 88 },
  { day: "Sun", minutes: 38, score: 76 },
];

const areaData = weeklyActivity.map(({ day, minutes }) => ({ day, minutes }));
const barData = weeklyActivity.map(({ day, score }) => ({ day, score }));

const subjectScores = [
  { subject: "Anatomy", score: 87, color: "#C41E3A" },
  { subject: "Pharmacology", score: 72, color: "#166534" },
  { subject: "Pathology", score: 65, color: "#0891B2" },
  { subject: "Physiology", score: 91, color: "#7C3AED" },
  { subject: "Microbiology", score: 58, color: "#059669" },
  { subject: "Biochemistry", score: 78, color: "#B45309" },
];

const achievements = [
  { icon: "🔥", label: "12-Day Streak", sub: "Personal best", color: "#F59E0B" },
  { icon: "🏆", label: "Top 10%", sub: "Global ranking", color: "#C41E3A" },
  { icon: "📚", label: "50 Lessons", sub: "Completed", color: "#166534" },
  { icon: "💊", label: "Pharm Master", sub: "Pharmacology ace", color: "#7C3AED" },
];

export default function StatsScreen() {
  const { testResults } = useApp();
  const totalMins = weeklyActivity.reduce((a, b) => a + b.minutes, 0);
  const avgScore =
    testResults.length > 0
      ? Math.round(testResults.reduce((a, b) => a + (b.score / b.total) * 100, 0) / testResults.length)
      : 81;

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
              {Math.floor(totalMins / 60)}h {totalMins % 60}m
            </Text>
            <Text style={styles.summaryLabel}>Study Time</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="locate" size={18} color="#FCD34D" />
            <Text style={styles.summaryValue}>{avgScore}%</Text>
            <Text style={styles.summaryLabel}>Avg Score</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="book-outline" size={18} color="#93C5FD" />
            <Text style={styles.summaryValue}>{testResults.length + 14}</Text>
            <Text style={styles.summaryLabel}>Tests Done</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Weekly reading time */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Weekly Reading Time</Text>
            <View style={styles.trendBadge}>
              <Ionicons name="trending-up" size={14} color={colors.green} />
              <Text style={styles.trendText}>+12%</Text>
            </View>
          </View>
          <AreaChart data={areaData} color={colors.primary} />
        </View>

        {/* MCQ score trend */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>MCQ Score Trend</Text>
            <View style={styles.trendBadge}>
              <Ionicons name="flash" size={14} color={colors.green} />
              <Text style={styles.trendText}>+6pts avg</Text>
            </View>
          </View>
          <BarChart data={barData} color={colors.green} />
        </View>

        {/* Subject breakdown */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Subject Performance</Text>
          <View style={styles.subjectList}>
            {subjectScores.map((sub) => (
              <View key={sub.subject} style={styles.subjectRow}>
                <Text style={styles.subjectName}>{sub.subject}</Text>
                <ProgressBar
                  progress={sub.score}
                  color={sub.color}
                  height={10}
                  style={styles.subjectProgress}
                />
                <Text style={styles.subjectScore}>{sub.score}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent test results */}
        {testResults.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Recent Tests</Text>
            <View>
              {[...testResults].reverse().slice(0, 5).map((res, i) => {
                const pct = Math.round((res.score / res.total) * 100);
                const passed = pct >= 60;
                return (
                  <View key={i} style={[styles.testRow, i < 4 && styles.testRowBorder]}>
                    <View
                      style={[
                        styles.testIconBox,
                        { backgroundColor: passed ? "#F0FDF4" : "#FFF0F2" },
                      ]}
                    >
                      <Ionicons
                        name={passed ? "checkmark" : "close"}
                        size={14}
                        color={passed ? colors.green : colors.primary}
                        style={styles.testIcon}
                      />
                    </View>
                    <View style={styles.testInfo}>
                      <Text style={styles.testName} numberOfLines={1}>{res.name}</Text>
                      <Text style={styles.testMeta}>{res.score}/{res.total} correct</Text>
                    </View>
                    <Text style={[styles.testScore, { color: passed ? colors.green : colors.primary }]}>
                      {pct}%
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
            {achievements.map((a) => (
              <View
                key={a.label}
                style={[styles.achievementCard, { borderColor: colors.border }]}
              >
                <View style={[styles.achievementIconBox, { backgroundColor: a.color + "18" }]}>
                  <Text style={styles.achievementIcon}>{a.icon}</Text>
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementLabel}>{a.label}</Text>
                  <Text style={styles.achievementSub}>{a.sub}</Text>
                </View>
              </View>
            ))}
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
  testRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  testRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  testIconBox: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  testIcon: {
    fontWeight: "bold",
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.foreground,
  },
  testMeta: {
    fontSize: 11,
    color: colors.mutedForeground,
  },
  testScore: {
    fontSize: 15,
    fontWeight: "700",
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
