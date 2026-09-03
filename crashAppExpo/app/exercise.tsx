import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, gradients, radii, shadows } from "@/constants/theme";
import { medicalQuestions, allCourses } from "@/constants/data";
import { useApp } from "@/context/AppContext";
import { ProgressBar } from "@/components/ProgressBar";
import { ScoreRing } from "@/components/ScoreRing";
import { takeExercise } from "@/services/api";

const optionLabels = ["A", "B", "C", "D"];

interface ExerciseQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export default function ExerciseScreen() {
  const { courseId, courseName, start, end } = useLocalSearchParams<{
    courseId: string;
    courseName?: string;
    start?: string;
    end?: string;
  }>();
  const course = allCourses.find((c) => c.id === Number(courseId)) || null;
  const { addTestResult } = useApp();

  const [questions, setQuestions] = useState<ExerciseQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const cId = Number(courseId);
      const startN = Number(start || 0);
      const endN = Number(end || 0);
      if (cId > 0 && startN > 0 && endN > 0) {
        try {
          const rows = await takeExercise(startN, endN, cId);
          if (mounted) {
            setQuestions(
              rows.map((r) => ({
                question: r.questionContent,
                options: r.options,
                correct: r.rightOption > 0 ? r.rightOption - 1 : 0,
                explanation:
                  "Check the course material and references for this topic to confirm the correct answer.",
              }))
            );
            setLoadError("");
          }
        } catch (e) {
          if (mounted) {
            setLoadError(
              e instanceof Error ? e.message : "Unable to load questions."
            );
            setQuestions([]);
          }
        } finally {
          if (mounted) setLoading(false);
        }
      } else {
        if (mounted) {
          setQuestions(medicalQuestions);
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [courseId, start, end]);

  const totalQ = questions.length;
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);

  const q = questions[current];
  const headerColor = course?.color || colors.primary;
  const headerCourseName = courseName || course?.title || "Medical Exercise";
  const progress = totalQ > 0 ? ((current + (checked ? 1 : 0)) / totalQ) * 100 : 0;

  const handleCheck = () => {
    if (selected === null) return;
    setChecked(true);
    if (selected === q.correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    if (current + 1 >= totalQ) {
      const finalScore = newAnswers.filter((a, i) => a === questions[i].correct).length;
      setFinished(true);
      setScore(finalScore);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setChecked(false);
    }
  };

  const handleComplete = () => {
    addTestResult({ name: headerCourseName, score, total: totalQ });
    router.replace("/(tabs)/dashboard");
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.flexCenter}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading questions...</Text>
      </View>
    );
  }

  // ── Load error ──────────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <View style={styles.flexCenter}>
        <Ionicons name="alert-circle-outline" size={44} color={colors.primary} />
        <Text style={styles.errorTitle}>Couldn't load questions</Text>
        <Text style={styles.loadingText}>{loadError}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
          activeOpacity={0.9}
        >
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Results ──────────────────────────────────────────────────────────────────
  if (finished) {
    const pct = Math.round((score / totalQ) * 100);
    const passed = pct >= 70;
    return (
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.resultsContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.resultIconCircle,
            { backgroundColor: passed ? "#F0FDF4" : "#FFF0F2" },
          ]}
        >
          <Ionicons
            name={passed ? "checkmark-circle" : "close-circle"}
            size={52}
            color={passed ? "#16A34A" : colors.primary}
          />
        </View>

        <Text style={styles.resultTitle}>
          {passed ? "Excellent Work!" : "Keep Studying!"}
        </Text>
        <Text style={styles.resultSubtitle}>
          {headerCourseName} · {score} of {totalQ} correct
        </Text>

        <ScoreRing
          pct={pct}
          color={passed ? colors.green : colors.primary}
        />

        <View style={styles.resultStatsRow}>
          <View style={styles.resultStatCard}>
            <Text style={[styles.resultStatValue, { color: "#16A34A" }]}>{score}</Text>
            <Text style={styles.resultStatLabel}>Correct</Text>
          </View>
          <View style={styles.resultStatCard}>
            <Text style={[styles.resultStatValue, { color: colors.primary }]}>
              {totalQ - score}
            </Text>
            <Text style={styles.resultStatLabel}>Incorrect</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleComplete}
          activeOpacity={0.9}
        >
          <Text style={styles.primaryButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ── Question ─────────────────────────────────────────────────────────────────
  return (
    <View style={styles.flex}>
      {/* Header */}
      <LinearGradient
        colors={[headerColor, headerColor + "CC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={18} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleBlock}>
            <Text style={styles.headerCourseTitle}>{headerCourseName}</Text>
            <Text style={styles.headerQuestionCount}>
              Question {current + 1} of {totalQ}
            </Text>
          </View>
          <View style={styles.practiceBadge}>
            <Ionicons name="time-outline" size={13} color="rgba(255,255,255,0.8)" />
            <Text style={styles.practiceText}>Practice</Text>
          </View>
        </View>
        <ProgressBar
          progress={progress}
          color={colors.white}
          bgColor="rgba(255,255,255,0.2)"
          height={8}
        />
      </LinearGradient>

      {/* Question body */}
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.questionContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Question card */}
        <View style={styles.questionCard}>
          <View style={styles.questionLabelRow}>
            <Ionicons name="locate" size={14} color={headerColor} />
            <Text style={[styles.questionLabel, { color: headerColor }]}>
              Question {current + 1}
            </Text>
          </View>
          <Text style={styles.questionText}>{q.question}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {q.options.map((opt, idx) => {
            let state: "default" | "selected" | "correct" | "wrong" = "default";
            if (checked) {
              if (idx === q.correct) state = "correct";
              else if (idx === selected) state = "wrong";
            } else if (idx === selected) {
              state = "selected";
            }

            const s = {
              default: { bg: colors.card, border: colors.border, text: colors.foreground, badge: "#6B7280", badgeBg: "#F3F4F6" },
              selected: { bg: "#FFF0F2", border: colors.primary, text: colors.foreground, badge: colors.primary, badgeBg: "#FFE4E8" },
              correct: { bg: "#F0FDF4", border: "#22C55E", text: "#166534", badge: colors.green, badgeBg: "#DCFCE7" },
              wrong: { bg: "#FFF0F2", border: "#F87171", text: "#B91C1C", badge: "#DC2626", badgeBg: "#FEE2E2" },
            }[state];

            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.optionRow,
                  { backgroundColor: s.bg, borderColor: s.border },
                ]}
                onPress={() => !checked && setSelected(idx)}
                activeOpacity={checked ? 1 : 0.9}
              >
                <View style={[styles.optionBadge, { backgroundColor: s.badgeBg }]}>
                  <Text style={[styles.optionBadgeText, { color: s.badge }]}>
                    {state === "correct" ? "✓" : state === "wrong" ? "✗" : optionLabels[idx]}
                  </Text>
                </View>
                <Text style={[styles.optionText, { color: s.text }]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explanation */}
        {checked && (
          <View
            style={[
              styles.explanationBox,
              {
                backgroundColor: selected === q.correct ? "#F0FDF4" : "#FFF7ED",
                borderColor: selected === q.correct ? "#BBF7D0" : "#FED7AA",
              },
            ]}
          >
            <Text
              style={[
                styles.explanationTitle,
                { color: selected === q.correct ? colors.green : colors.brown },
              ]}
            >
              {selected === q.correct ? "✓ Correct!" : "✗ Incorrect — Explanation"}
            </Text>
            <Text
              style={[
                styles.explanationText,
                { color: selected === q.correct ? colors.green : "#92400E" },
              ]}
            >
              {q.explanation}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        {!checked ? (
          <TouchableOpacity
            style={[
              styles.ctaButton,
              {
                backgroundColor: selected !== null ? colors.primary : "#D1D5DB",
                ...(selected !== null ? shadows.md : {}),
              },
            ]}
            onPress={handleCheck}
            disabled={selected === null}
            activeOpacity={0.9}
          >
            <Text style={styles.ctaButtonText}>Check Answer</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.ctaButton, styles.nextButton]}
            onPress={handleNext}
            activeOpacity={0.9}
          >
            <Text style={styles.ctaButtonText}>
              {current + 1 >= totalQ ? "See Results" : "Next Question"}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.white} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flexCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: 32,
    gap: 12,
  },
  loadingText: {
    color: colors.mutedForeground,
    fontSize: 14,
    textAlign: "center",
  },
  errorTitle: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: "700",
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginTop: 8,
    ...shadows.md,
  },
  retryText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  header: {
    paddingTop: 72,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleBlock: {
    flex: 1,
  },
  headerCourseTitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
  },
  headerQuestionCount: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 2,
  },
  practiceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  practiceText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
  questionContent: {
    padding: 20,
    paddingBottom: 100,
  },
  questionCard: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  questionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  questionLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 25,
    color: colors.foreground,
  },
  optionsContainer: {
    gap: 12,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderRadius: radii.lg,
    padding: 16,
    borderWidth: 2,
  },
  optionBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionBadgeText: {
    fontWeight: "700",
    fontSize: 13,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  explanationBox: {
    marginTop: 16,
    borderRadius: radii.lg,
    padding: 16,
    borderWidth: 1,
  },
  explanationTitle: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 13,
    lineHeight: 20,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 18,
    borderRadius: radii.lg,
  },
  nextButton: {
    backgroundColor: colors.green,
  },
  ctaButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  resultsContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.background,
  },
  resultIconCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.foreground,
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginBottom: 24,
  },
  resultStatsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 24,
    marginBottom: 24,
  },
  resultStatCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  resultStatValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  resultStatLabel: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  primaryButton: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    alignItems: "center",
    ...shadows.md,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
