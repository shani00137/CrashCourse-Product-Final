import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, gradients, shadows, radii } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { ProgressBar } from "@/components/ProgressBar";

const logoSource = require("@/assets/logo/logo.jpg");

const featuredCourses = [
  { id: 1, title: "Anatomy", subtitle: "Human Body Systems", color: colors.primary, bg: "#FFF0F2", icon: "🫀", progress: 72, lessons: 32 },
  { id: 2, title: "Pharmacology", subtitle: "Drugs & Therapeutics", color: colors.green, bg: "#F0F9F0", icon: "💊", progress: 45, lessons: 28 },
  { id: 3, title: "Pathology", subtitle: "Disease Mechanisms", color: colors.teal, bg: "#ECFEFF", icon: "🔬", progress: 30, lessons: 24 },
];

const quickStats = [
  { label: "Streak", value: "12", unit: "days", icon: "flame", color: "#F59E0B", bg: "#FFFBEB" },
  { label: "Score", value: "87", unit: "%", icon: "star", color: colors.primary, bg: "#FFF0F2" },
  { label: "Rank", value: "#24", unit: "global", icon: "trophy", color: colors.green, bg: "#F0F9F0" },
  { label: "Hours", value: "48", unit: "total", icon: "time", color: colors.teal, bg: "#ECFEFF" },
];

const statIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  flame: "flame",
  star: "star",
  trophy: "trophy",
  time: "time-outline",
};

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useApp();

  const firstName = user?.name?.split(" ")[0] || "Student";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

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

        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={styles.logoContainer}>
              <Image source={logoSource} style={styles.logo} contentFit="contain" />
            </View>
            <View>
              <Text style={styles.brandName}>CRASH COURSE</Text>
              <Text style={styles.welcomeText}>{greeting}, {firstName} 👋</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.bellButton} activeOpacity={0.8}>
            <Ionicons name="notifications-outline" size={18} color={colors.white} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* Weekly goal */}
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalLabel}>Weekly Study Goal</Text>
            <Text style={styles.goalValue}>68%</Text>
          </View>
          <ProgressBar
            progress={68}
            color="#FACC15"
            bgColor="rgba(255,255,255,0.2)"
            height={8}
          />
          <Text style={styles.goalHint}>17 of 25 lessons completed this week</Text>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {/* Stats row */}
        <View style={styles.statsRow}>
          {quickStats.map((stat) => {
            const Icon = statIcons[stat.icon] || "star";
            return (
              <View key={stat.label} style={[styles.statCard, { backgroundColor: stat.bg }]}>
                <View style={[styles.statIconBox, { backgroundColor: stat.color + "20" }]}>
                  <Ionicons name={Icon} size={15} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statUnit}>{stat.unit}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            );
          })}
        </View>

        {/* Smart AI Assistant card */}
        <TouchableOpacity
          style={styles.aiCard}
          onPress={() => router.push("/ai-agent")}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={gradients.darkRedGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiCardInner}
          >
            <View style={styles.aiGlowRed} />
            <View style={styles.aiGlowGreen} />

            <View style={styles.aiMain}>
              <View style={styles.aiIconBox}>
                <MaterialCommunityIcons name="brain" size={28} color="#FDE047" />
              </View>
              <View style={styles.aiTextBlock}>
                <View style={styles.aiTitleRow}>
                  <Text style={styles.aiTitle}>Smart AI Assistant</Text>
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>NEW</Text>
                  </View>
                </View>
                <Text style={styles.aiSubtitle}>
                  Ask any medical question — anatomy, pharmacology, clinical topics
                </Text>
              </View>
              <View style={styles.aiSparkleBox}>
                <Ionicons name="sparkles" size={16} color="#FDE047" />
              </View>
            </View>

            <View style={styles.aiPrompts}>
              {["Beta-blockers?", "Cardiac cycle", "Anaphylaxis Tx"].map((q) => (
                <View key={q} style={styles.aiPromptChip}>
                  <Text style={styles.aiPromptText}>{q}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Continue Learning */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Continue Learning</Text>
            <TouchableOpacity
              style={styles.seeAllLink}
              onPress={() => router.push("/(tabs)/courses")}
            >
              <Text style={styles.seeAllText}>See all</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {featuredCourses.map((course) => (
            <TouchableOpacity
              key={course.id}
              style={styles.courseCard}
              onPress={() => router.push({ pathname: "/exercise", params: { courseId: String(course.id) } })}
              activeOpacity={0.9}
            >
              <View style={[styles.courseIconBox, { backgroundColor: course.bg }]}>
                <Text style={styles.courseIcon}>{course.icon}</Text>
              </View>
              <View style={styles.courseInfo}>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <Text style={styles.courseSubtitle}>
                  {course.subtitle} · {course.lessons} lessons
                </Text>
                <ProgressBar
                  progress={course.progress}
                  color={course.color}
                  height={6}
                  style={styles.courseProgress}
                />
              </View>
              <Text style={[styles.coursePct, { color: course.color }]}>
                {course.progress}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push("/test")}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={gradients.redGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.quickActionInner}
              >
                <View style={styles.quickActionIconBox}>
                  <Ionicons name="book" size={20} color={colors.white} />
                </View>
                <Text style={styles.quickActionTitle}>Take a Test</Text>
                <Text style={styles.quickActionSubtitle}>Timed MCQ practice</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push("/(tabs)/stats")}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={gradients.greenGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.quickActionInner}
              >
                <View style={styles.quickActionIconBox}>
                  <Ionicons name="trophy" size={20} color={colors.white} />
                </View>
                <Text style={styles.quickActionTitle}>My Stats</Text>
                <Text style={styles.quickActionSubtitle}>Progress & scores</Text>
              </LinearGradient>
            </TouchableOpacity>
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
    top: -50,
    right: -50,
    width: 176,
    height: 176,
    borderRadius: 88,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: colors.white,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    ...shadows.md,
  },
  logo: {
    width: 40,
    height: 40,
  },
  brandName: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  welcomeText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  notifDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FBE64D",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  goalCard: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  goalLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontWeight: "500",
  },
  goalValue: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "700",
  },
  goalHint: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 11,
    marginTop: 6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 10,
    alignItems: "center",
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.foreground,
    lineHeight: 17,
  },
  statUnit: {
    fontSize: 9,
    color: colors.mutedForeground,
  },
  statLabel: {
    fontSize: 9,
    color: "rgba(26,31,26,0.55)",
    marginTop: 1,
  },
  aiCard: {
    borderRadius: radii.lg,
    overflow: "hidden",
    marginTop: 20,
  },
  aiCardInner: {
    padding: 16,
    overflow: "hidden",
  },
  aiGlowRed: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "rgba(196,30,58,0.5)",
    opacity: 0.3,
  },
  aiGlowGreen: {
    position: "absolute",
    bottom: -15,
    left: "40%",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(22,101,52,0.6)",
    opacity: 0.2,
  },
  aiMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  aiIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  aiTextBlock: {
    flex: 1,
  },
  aiTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  aiTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  newBadge: {
    backgroundColor: "rgba(234,179,8,0.12)",
    borderWidth: 1,
    borderColor: "rgba(234,179,8,0.3)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  newBadgeText: {
    color: "#FDE047",
    fontSize: 10,
    fontWeight: "600",
  },
  aiSubtitle: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    lineHeight: 17,
  },
  aiSparkleBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  aiPrompts: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    flexWrap: "wrap",
  },
  aiPromptChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  aiPromptText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.foreground,
  },
  seeAllLink: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.primary,
  },
  courseCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    ...shadows.sm,
  },
  courseIconBox: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  courseIcon: {
    fontSize: 20,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.foreground,
  },
  courseSubtitle: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  courseProgress: {
    marginTop: 6,
  },
  coursePct: {
    fontSize: 15,
    fontWeight: "700",
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  quickActionInner: {
    padding: 16,
  },
  quickActionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  quickActionTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  quickActionSubtitle: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    marginTop: 2,
  },
  bottomSpacer: {
    height: 16,
  },
});
