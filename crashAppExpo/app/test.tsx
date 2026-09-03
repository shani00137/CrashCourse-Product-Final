import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, gradients, radii, shadows } from "@/constants/theme";
import { availableTests, testQuestionBank } from "@/constants/testData";
import { useApp } from "@/context/AppContext";
import { ScoreRing } from "@/components/ScoreRing";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";

const optionLabels = ["A", "B", "C", "D"];

type TestPhase = "select" | "running" | "result";

export default function TestScreen() {
  const { addTestResult } = useApp();
  const [phase, setPhase] = useState<TestPhase>("select");
  const [selectedTest, setSelectedTest] = useState<(typeof availableTests)[0] | null>(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);

  const questions = testQuestionBank.slice(0, selectedTest?.questions || 5);

  useEffect(() => {
    if (phase !== "running" || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  const finishedRef = useRef(false);

  const finishTest = (finalAnswers: number[]) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const s = finalAnswers.filter((a, i) => a === questions[i]?.correct).length;
    setScore(s);
    setPhase("result");
  };

  useEffect(() => {
    if (timeLeft === 0 && phase === "running") finishTest(answers);
  }, [timeLeft]);

  const startTest = (test: (typeof availableTests)[0]) => {
    finishedRef.current = false;
    setSelectedTest(test);
    setPhase("running");
    setTimeLeft(test.time * 60);
    setCurrent(0);
    setSelected(null);
    setChecked(false);
    setAnswers([]);
    setScore(0);
  };

  const handleNext = () => {
    const newAnswers = [...answers, selected ?? -1];
    setAnswers(newAnswers);
    if (current + 1 >= questions.length) {
      finishTest(newAnswers);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setChecked(false);
    }
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const isUrgent = timeLeft > 0 && timeLeft < 60;

  // ── SELECT PHASE ─────────────────────────────────────────────────────────────
  if (phase === "select") {
    return (
      <View style={styles.flex}>
        <LinearGradient
          colors={gradients.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={styles.selectHeader}
        >
          <View style={styles.headerGlow} />
          <View style={styles.selectHeaderTopRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={18} color={colors.white} />
            </TouchableOpacity>
            <View>
              <Text style={styles.brandName}>CRASH COURSE</Text>
              <Text style={styles.pageTitle}>Take a Test</Text>
            </View>
          </View>
          <Text style={styles.selectHeaderSubtext}>
            Choose a timed MCQ test to challenge yourself
          </Text>
        </LinearGradient>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.selectList}
          showsVerticalScrollIndicator={false}
        >
          {availableTests.map((test) => {
            const difficultyColors =
              test.difficulty === "Easy"
                ? { bg: "#F0F9F0", color: colors.green }
                : test.difficulty === "Medium"
                  ? { bg: "#FFFBEB", color: colors.brown }
                  : { bg: "#FFF0F2", color: colors.primary };

            return (
              <TouchableOpacity
                key={test.id}
                style={styles.testCard}
                onPress={() => startTest(test)}
                activeOpacity={0.9}
              >
                <View style={styles.testCardMain}>
                  <View style={[styles.testIconBox, { backgroundColor: test.bg }]}>
                    <Text style={styles.testIcon}>{test.icon}</Text>
                  </View>
                  <View style={styles.testInfo}>
                    <View style={styles.testTitleRow}>
                      <Text style={styles.testTitle}>{test.title}</Text>
                      <View
                        style={[
                          styles.diffBadge,
                          { backgroundColor: difficultyColors.bg },
                        ]}
                      >
                        <Text style={[styles.diffText, { color: difficultyColors.color }]}>
                          {test.difficulty}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.testSubject}>{test.subject}</Text>
                    <View style={styles.testMetaRow}>
                      <View style={styles.testMetaItem}>
                        <Ionicons name="book-outline" size={12} color={colors.mutedForeground} />
                        <Text style={styles.testMetaText}>{test.questions} questions</Text>
                      </View>
                      <View style={styles.testMetaItem}>
                        <Ionicons name="time-outline" size={12} color={colors.mutedForeground} />
                        <Text style={styles.testMetaText}>{test.time} min</Text>
                      </View>
                    </View>
                  </View>
                  <View style={[styles.testChevronBox, { backgroundColor: test.bg }]}>
                    <Ionicons name="chevron-forward" size={16} color={test.color} />
                  </View>
                </View>
                <View style={styles.testProgressTrack} />
                <Text style={styles.testNotAttempted}>Not attempted yet</Text>
              </TouchableOpacity>
            );
          })}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    );
  }

  // ── RESULT PHASE ─────────────────────────────────────────────────────────────
  if (phase === "result") {
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 60;
    return (
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.resultContent}
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
            size={48}
            color={passed ? "#16A34A" : colors.primary}
          />
        </View>

        <Text style={styles.resultTitle}>
          {passed ? "Test Passed!" : "Keep Studying!"}
        </Text>
        <Text style={styles.resultSubtitle}>{selectedTest?.title}</Text>

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
              {questions.length - score}
            </Text>
            <Text style={styles.resultStatLabel}>Wrong</Text>
          </View>
          <View style={styles.resultStatCard}>
            <Text style={[styles.resultStatValue, { color: colors.foreground }]}>
              {questions.length}
            </Text>
            <Text style={styles.resultStatLabel}>Total</Text>
          </View>
        </View>

        <View style={styles.resultActions}>
          <TouchableOpacity
            style={styles.dashboardButton}
            onPress={() => {
              addTestResult({ name: selectedTest?.title || "Test", score, total: questions.length });
              router.replace("/(tabs)/dashboard");
            }}
            activeOpacity={0.9}
          >
            <Text style={styles.dashboardButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => selectedTest && startTest(selectedTest)}
            activeOpacity={0.9}
          >
            <Text style={styles.retryButtonText}>Retry Test</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // ── RUNNING PHASE ────────────────────────────────────────────────────────────
  const q = questions[current];
  const progress = (current / questions.length) * 100;

  return (
    <View style={styles.flex}>
      {/* Header */}
      <LinearGradient
        colors={
          selectedTest?.color === "#C41E3A"
            ? gradients.header2
            : [selectedTest?.color || colors.primary, (selectedTest?.color || colors.primary) + "CC"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.runningHeader}
      >
        <View style={styles.runningHeaderTopRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setPhase("select")}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={18} color={colors.white} />
          </TouchableOpacity>

          <View
            style={[
              styles.timerBox,
              isUrgent && styles.timerBoxUrgent,
            ]}
          >
            <Ionicons
              name={isUrgent ? "alert-circle" : "time-outline"}
              size={14}
              color={isUrgent ? "#FCA5A5" : "rgba(255,255,255,0.8)"}
            />
            <Text style={styles.timerText}>
              {mins}:{secs.toString().padStart(2, "0")}
            </Text>
          </View>

          <View style={styles.questionCounter}>
            <Ionicons name="locate" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.questionCounterText}>
              {current + 1}/{questions.length}
            </Text>
          </View>
        </View>

        <ProgressBar
          progress={progress}
          color={colors.white}
          bgColor="rgba(255,255,255,0.2)"
          height={8}
        />
        <Text style={styles.runningTestTitle}>{selectedTest?.title}</Text>
      </LinearGradient>

      {/* Question body */}
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.questionContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.testQuestionCard}>
          <Text style={styles.testQuestionMeta}>
            Question {current + 1} of {questions.length}
          </Text>
          <Text style={styles.testQuestionText}>{q.question}</Text>
        </View>

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
                style={[styles.optionRow, { backgroundColor: s.bg, borderColor: s.border }]}
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
            onPress={() => selected !== null && setChecked(true)}
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
              {current + 1 >= questions.length ? "Finish Test" : "Next Question"}
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
  selectHeader: {
    paddingTop: 72,
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
  selectHeaderTopRow: {
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
  selectHeaderSubtext: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    marginLeft: 48,
  },
  selectList: {
    padding: 20,
  },
  testCard: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    ...shadows.sm,
  },
  testCardMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  testIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  testIcon: {
    fontSize: 24,
  },
  testInfo: {
    flex: 1,
  },
  testTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  testTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.foreground,
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  diffText: {
    fontSize: 10,
    fontWeight: "600",
  },
  testSubject: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  testMetaRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },
  testMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  testMetaText: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  testChevronBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  testProgressTrack: {
    marginTop: 12,
    height: 4,
    backgroundColor: colors.muted,
    borderRadius: 2,
  },
  testNotAttempted: {
    marginTop: 4,
    fontSize: 11,
    color: colors.mutedForeground,
  },
  bottomSpacer: {
    height: 16,
  },
  resultContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.background,
  },
  resultIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
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
    marginBottom: 20,
  },
  resultStatsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 20,
  },
  resultStatCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  resultStatValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  resultStatLabel: {
    fontSize: 11,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  resultActions: {
    width: "100%",
    gap: 12,
    marginTop: 24,
  },
  dashboardButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radii.lg,
    alignItems: "center",
    ...shadows.md,
  },
  dashboardButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  retryButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    borderRadius: radii.lg,
    alignItems: "center",
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.foreground,
  },
  runningHeader: {
    paddingTop: 72,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  runningHeaderTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  timerBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  timerBoxUrgent: {
    backgroundColor: "rgba(239,68,68,0.3)",
    borderColor: "rgba(239,68,68,0.5)",
  },
  timerText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
  questionCounter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  questionCounterText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
  },
  runningTestTitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    marginTop: 6,
  },
  questionContent: {
    padding: 20,
    paddingBottom: 100,
  },
  testQuestionCard: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  testQuestionMeta: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.mutedForeground,
    marginBottom: 8,
  },
  testQuestionText: {
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
});
