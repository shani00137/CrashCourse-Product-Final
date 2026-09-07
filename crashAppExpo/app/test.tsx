import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, gradients, radii, shadows } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import {
  getUserTests,
  generateTest,
  conductTestByUser,
  userTestUpdate,
  saveTest,
  type UserTestInfo,
  type TestQuestion,
} from "@/services/api";
import { ScoreRing } from "@/components/ScoreRing";
import { ProgressBar } from "@/components/ProgressBar";

const optionLabels = ["A", "B", "C", "D"];
const TEST_QUESTION_COUNT = 10;
const TEST_DURATION_MINUTES = 15;
const MAX_TEST_QUESTIONS = 50;
const TRIAL_TEST_LIMIT = 2;

type TestPhase = "select" | "running" | "result";
type CreateMode = "random" | "ai";
type DifficultyLevel = "Easy" | "Medium" | "Hard";

const DIFFICULTY_LEVELS: DifficultyLevel[] = ["Easy", "Medium", "Hard"];

export default function TestScreen() {
  const { user, addTestResult } = useApp();
  const [phase, setPhase] = useState<TestPhase>("select");
  const [tests, setTests] = useState<UserTestInfo[]>([]);
  const [testsLoaded, setTestsLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [opening, setOpening] = useState(false);
  const [createDialog, setCreateDialog] = useState(false);
  const [questionCount, setQuestionCount] = useState("20");
  const [createMode, setCreateMode] = useState<CreateMode | null>(null);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("Medium");
  const [loadError, setLoadError] = useState("");
  const [activeTest, setActiveTest] = useState<UserTestInfo | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);

  const appUserId = user?.appUserId ?? 0;
  const applicantId = user?.applicantId ?? 0;
  const courseId = user?.courseId ?? 0;
  const isTrial = !!user?.isTrial;

  const loadTests = useCallback(async () => {
    if (!appUserId) return;
    try {
      const rows = await getUserTests(appUserId);
      setTests(rows);
      setLoadError("");
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : String(e));
    } finally {
      setTestsLoaded(true);
    }
  }, [appUserId]);

  useEffect(() => {
    loadTests();
  }, [loadTests]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTests();
    setRefreshing(false);
  }, [loadTests]);

  useEffect(() => {
    if (phase !== "running" || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  const computeScore = (answered: number[], qs: TestQuestion[]) =>
    answered.filter((a, i) => a > 0 && a === qs[i]?.rightOption).length;

  const finishedRef = useRef(false);

  const finishTest = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const final = [...answers];
    const s = computeScore(final, questions);
    setScore(s);
    setPhase("result");
    if (activeTest) {
      const answeredCount = final.filter((a) => a > 0).length;
      const pct = questions.length > 0 ? Math.round((s / questions.length) * 100) : 0;
      const remark = pct >= 60 ? "Good job!" : "Keep practicing.";
      setTests((prev) =>
        prev.map((t) =>
          t.testId === activeTest.testId
            ? {
                ...t,
                isCompleted: true,
                rightQuestions: s,
                percentage: pct,
                answeredQuestions: answeredCount,
                remarks: remark,
              }
            : t
        )
      );
      addTestResult({
        name: `${activeTest.courseName} \u2022 Test #${activeTest.testId}`,
        score: s,
        total: questions.length,
      });
      saveTest(activeTest.testId).catch(() => {});
      loadTests();
    }
  }, [answers, questions, activeTest, addTestResult, loadTests]);

  useEffect(() => {
    if (timeLeft === 0 && phase === "running") finishTest();
  }, [timeLeft, phase, finishTest]);

  const openTest = useCallback(
    async (test: UserTestInfo, isCompleted: boolean) => {
      try {
        setOpening(true);
        const res = await conductTestByUser(test.testId);
        const qs = res.questions;
        if (!qs.length) {
          Alert.alert("No questions", "This test has no questions yet.");
          setOpening(false);
          return;
        }
        finishedRef.current = isCompleted;
        setActiveTest(test);
        setQuestions(qs);
        const initialAnswers = qs.map((q) =>
          q.isSelected > 0 && q.isSelected <= 4 ? q.isSelected : 0
        );
        setAnswers(initialAnswers);
        setCurrent(0);
        setSelected(initialAnswers[0] || 0);
        if (isCompleted) {
          setScore(computeScore(initialAnswers, qs));
          setPhase("result");
        } else {
          setScore(0);
          setTimeLeft((res.durationMinutes || test.duration || TEST_DURATION_MINUTES) * 60);
          setPhase("running");
        }
        setOpening(false);
      } catch (e) {
        setOpening(false);
        Alert.alert("Error", e instanceof Error ? e.message : String(e));
      }
    },
    []
  );

  const handleCreate = useCallback(async () => {
    if (!courseId) {
      Alert.alert("Missing details", "Log in with a registered course to create a test.");
      return;
    }
    if (isTrial && tests.length >= TRIAL_TEST_LIMIT) {
      Alert.alert(
        "Trial limit reached",
        "Your 5-day trial includes 2 tests. Upgrade to create unlimited tests."
      );
      return;
    }
    setQuestionCount("20");
    setCreateMode(null);
    setDifficulty("Medium");
    setCreateDialog(true);
  }, [courseId, isTrial, tests.length]);

  const handleGenerate = useCallback(async () => {
    const parsed = parseInt(questionCount, 10);
    const count = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), MAX_TEST_QUESTIONS) : 20;
    if (!courseId) {
      Alert.alert("Missing details", "Log in with a registered course to create a test.");
      return;
    }
    if (isTrial && tests.length >= TRIAL_TEST_LIMIT) {
      Alert.alert(
        "Trial limit reached",
        "Your 5-day trial includes 2 tests. Upgrade to create unlimited tests."
      );
      return;
    }
    if (!createMode) {
      Alert.alert("Choose a mode", "Pick Question Bank or AI Generated below.");
      return;
    }
    setCreating(true);
    try {
      const res = await generateTest({
        appUserId,
        courseId,
        questions: count,
        duration: count,
        mode: createMode,
        difficulty: createMode === "ai" ? difficulty : "",
      });
      if (!res.succeeded || !res.testId) {
        Alert.alert("Could not create test", res.message || "Unexpected response from server.");
        return;
      }
      setCreateDialog(false);
      const created: UserTestInfo = {
        testId: res.testId,
        courseId,
        courseName: user?.courseName || "Test",
        isCompleted: false,
        testDate: new Date().toISOString(),
        questions: res.questions || count,
        duration: res.durationMinutes || count,
        rightQuestions: 0,
        remarks: "",
        percentage: 0,
        answeredQuestions: 0,
        testStartTime: null,
      };
      await loadTests();
      await openTest(created, false);
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : String(e));
    } finally {
      setCreating(false);
    }
  }, [questionCount, createMode, difficulty, courseId, appUserId, user, isTrial, tests.length, loadTests, openTest]);

  const pickOption = useCallback(
    (idx: number) => {
      if (phase !== "running") return;
      const next = idx + 1;
      const q = questions[current];
      if (!q) return;
      setSelected(next);
      const nextAnswers = [...answers];
      nextAnswers[current] = next;
      setAnswers(nextAnswers);
      setQuestions((prev) =>
        prev.map((item) =>
          item.questionId === q.questionId ? { ...item, isSelected: next } : item
        )
      );
      const optionText = [q.option1, q.option2, q.option3, q.option4][idx] || "";
      userTestUpdate({ testId: q.testId, questionId: q.questionId, isSelected: next, answer: optionText }).catch(
        () => {}
      );
    },
    [phase, questions, current, answers]
  );

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      finishTest();
    } else {
      setCurrent((c) => c + 1);
      setSelected(answers[current + 1] || 0);
    }
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const isUrgent = timeLeft > 0 && timeLeft < 60;

  const formatDate = (value: string | null) => {
    if (!value) return "";
    try {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return value;
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return value;
    }
  };

  // ── SELECT PHASE ─────────────────────────────────────────────────────────────
  if (phase === "select") {
    const canCreate = Boolean(applicantId && courseId);
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
            Track your tests and start a fresh timed exam
          </Text>
        </LinearGradient>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.selectList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >

          {!testsLoaded && !loadError ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={styles.loadingText}>Loading your tests...</Text>
            </View>
          ) : null}

          {testsLoaded && loadError ? (
            <View style={styles.emptyBox}>
              <Ionicons name="cloud-offline-outline" size={32} color={colors.mutedForeground} />
              <Text style={styles.emptyTitle}>Could not load tests</Text>
              <Text style={styles.emptyText}>{loadError}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadTests} activeOpacity={0.9}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {!canCreate && testsLoaded && !loadError ? (
            <View style={styles.emptyBox}>
              <Ionicons name="person-circle-outline" size={32} color={colors.mutedForeground} />
              <Text style={styles.emptyTitle}>
                {user?.isGuest ? "Guest mode" : "No registered course"}
              </Text>
              <Text style={styles.emptyText}>
                Log in with a registered course to create and take timed tests.
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => router.replace("/login")}
                activeOpacity={0.9}
              >
                <Text style={styles.retryButtonText}>Go to Login</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {tests.map((test) => {
            const total = test.questions || TEST_QUESTION_COUNT;
            const answered = Math.min(test.answeredQuestions, total);
            const progress = test.isCompleted ? 100 : total > 0 ? (answered / total) * 100 : 0;
            const progressLabel = test.isCompleted
              ? `Completed \u2022 ${test.rightQuestions}/${total} correct (${test.percentage}%)`
              : answered > 0
                ? `${Math.round(progress)}% answered \u2022 ${answered}/${total} \u2022 tap to continue`
                : "Not started \u2022 tap to begin";
            return (
              <TouchableOpacity
                key={test.testId}
                style={styles.testCard}
                onPress={() => openTest(test, test.isCompleted)}
                activeOpacity={0.9}
              >
                <View style={styles.testCardMain}>
                  <View
                    style={[
                      styles.testIconBox,
                      { backgroundColor: test.isCompleted ? "#F0F9F0" : "#FFF7ED" },
                    ]}
                  >
                    <Text style={styles.testIcon}>
                      {test.isCompleted ? "\u2705" : "\u23F3"}
                    </Text>
                  </View>
                  <View style={styles.testInfo}>
                    <View style={styles.testTitleRow}>
                      <Text style={styles.testTitle} numberOfLines={1}>
                        {test.courseName || `Test #${test.testId}`}
                      </Text>
                    </View>
                    <Text style={styles.testSubject}>Test #{test.testId}</Text>
                    <View style={styles.testMetaRow}>
                      <View style={styles.testMetaItem}>
                        <Ionicons name="book-outline" size={12} color={colors.mutedForeground} />
                        <Text style={styles.testMetaText}>{total} questions</Text>
                      </View>
                      <View style={styles.testMetaItem}>
                        <Ionicons name="time-outline" size={12} color={colors.mutedForeground} />
                        <Text style={styles.testMetaText}>{test.duration || TEST_DURATION_MINUTES} min</Text>
                      </View>
                      <View style={styles.testMetaItem}>
                        <Ionicons name="calendar-outline" size={12} color={colors.mutedForeground} />
                        <Text style={styles.testMetaText}>{formatDate(test.testDate)}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.progressWrap}>
                  <ProgressBar
                    progress={progress / 100}
                    color={test.isCompleted ? colors.green : colors.brown}
                    bgColor={colors.muted}
                    height={8}
                  />
                  <Text style={styles.progressLabel}>{progressLabel}</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {opening && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingCard}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={styles.loadingOverlayText}>Loading test...</Text>
            </View>
          </View>
        )}

        {canCreate && (
          <TouchableOpacity
            style={[styles.fab, creating && styles.fabDisabled]}
            onPress={handleCreate}
            disabled={creating}
            activeOpacity={0.85}
          >
            {creating ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Ionicons name="add" size={22} color={colors.white} />
            )}
            <Text style={styles.fabText}>New Test</Text>
          </TouchableOpacity>
        )}

        <Modal
          visible={createDialog}
          transparent
          animationType="fade"
          onRequestClose={() => !creating && setCreateDialog(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.dialogCard}>
              <View style={styles.dialogHeader}>
                <View style={styles.dialogIconBox}>
                  <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.dialogHeaderText}>
                  <Text style={styles.dialogTitle}>Create a New Test</Text>
                  <Text style={styles.dialogSubtitle}>
                    Questions from {user?.courseName || "your course"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => !creating && setCreateDialog(false)}
                  hitSlop={8}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={20} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>

              <Text style={styles.dialogLabel}>Number of questions</Text>
              <TextInput
                style={styles.dialogInput}
                value={questionCount}
                onChangeText={setQuestionCount}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="e.g. 20"
                placeholderTextColor={colors.mutedForeground}
              />
              <Text style={styles.dialogHint}>
                Between 1 and {MAX_TEST_QUESTIONS}. AI generation takes a few seconds.
              </Text>
              {isTrial && (
                <Text style={styles.dialogHint}>
                  Trial: {tests.length} of {TRIAL_TEST_LIMIT} tests used.
                </Text>
              )}

              <Text style={styles.dialogLabel}>Generate with</Text>
              <View style={styles.modeRow}>
                <TouchableOpacity
                  style={[
                    styles.modeCard,
                    createMode === "random" && styles.modeCardActive,
                  ]}
                  onPress={() => setCreateMode("random")}
                  disabled={creating}
                  activeOpacity={0.85}
                >
                  <View
                    style={[
                      styles.modeIconBox,
                      createMode === "random" && styles.modeIconBoxActive,
                    ]}
                  >
                    <Ionicons
                      name="albums-outline"
                      size={22}
                      color={createMode === "random" ? colors.white : colors.brown}
                    />
                  </View>
                  <Text style={styles.modeTitle}>Question Bank</Text>
                  <Text style={styles.modeDesc}>Random questions from your course's bank</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modeCard,
                    createMode === "ai" && styles.modeCardActive,
                  ]}
                  onPress={() => setCreateMode("ai")}
                  disabled={creating}
                  activeOpacity={0.85}
                >
                  <View
                    style={[
                      styles.modeIconBox,
                      createMode === "ai" && styles.modeIconBoxActive,
                    ]}
                  >
                    <Ionicons
                      name="sparkles-outline"
                      size={22}
                      color={createMode === "ai" ? colors.white : colors.purple}
                    />
                  </View>
                  <Text style={styles.modeTitle}>AI Generated</Text>
                  <Text style={styles.modeDesc}>AI writes fresh questions at your level</Text>
                </TouchableOpacity>
              </View>

              {createMode === "ai" && (
                <View style={styles.difficultyBox}>
                  <Text style={styles.dialogLabel}>Difficulty level</Text>
                  <View style={styles.difficultyRow}>
                    {DIFFICULTY_LEVELS.map((level) => {
                      const selected = difficulty === level;
                      return (
                        <TouchableOpacity
                          key={level}
                          style={[
                            styles.difficultyChip,
                            selected && styles.difficultyChipActive,
                          ]}
                          onPress={() => setDifficulty(level)}
                          disabled={creating}
                          activeOpacity={0.85}
                        >
                          <Text
                            style={[
                              styles.difficultyChipText,
                              selected && styles.difficultyChipTextActive,
                            ]}
                          >
                            {level}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              <View style={styles.dialogActions}>
                <TouchableOpacity
                  style={styles.dialogCancel}
                  onPress={() => setCreateDialog(false)}
                  disabled={creating}
                  activeOpacity={0.85}
                >
                  <Text style={styles.dialogCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.dialogGenerate,
                    (!createMode || creating) && styles.dialogGenerateDisabled,
                  ]}
                  onPress={handleGenerate}
                  disabled={!createMode || creating}
                  activeOpacity={0.85}
                >
                  {creating ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <Ionicons name="play" size={15} color={colors.white} />
                  )}
                  <Text style={styles.dialogGenerateText}>
                    {creating ? "Generating..." : "Generate"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // ── RESULT PHASE ─────────────────────────────────────────────────────────────
  if (phase === "result") {
    const totalQ = questions.length || activeTest?.questions || 1;
    const pct = Math.round((score / totalQ) * 100);
    const passed = pct >= 60;
    const remark = activeTest?.remarks || (passed ? "Good job!" : "Keep practicing.");
    return (
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.resultScroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.resultSummary}>
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
          <Text style={styles.resultSubtitle}>
            {activeTest
              ? `${activeTest.courseName || "Test"} #${activeTest.testId}`
              : "Test"}
          </Text>

          <ScoreRing pct={pct} color={passed ? colors.green : colors.primary} />

          <View style={styles.resultStatsRow}>
            <View style={styles.resultStatCard}>
              <Text style={[styles.resultStatValue, { color: "#16A34A" }]}>{score}</Text>
              <Text style={styles.resultStatLabel}>Correct</Text>
            </View>
            <View style={styles.resultStatCard}>
              <Text style={[styles.resultStatValue, { color: colors.primary }]}>
                {totalQ - score}
              </Text>
              <Text style={styles.resultStatLabel}>Wrong</Text>
            </View>
            <View style={styles.resultStatCard}>
              <Text style={[styles.resultStatValue, { color: colors.foreground }]}>{totalQ}</Text>
              <Text style={styles.resultStatLabel}>Total</Text>
            </View>
          </View>
        </View>

        <View style={styles.reviewHeader}>
          <Text style={styles.reviewTitle}>Answer Review</Text>
          <Text style={styles.reviewSubtitle}>
            {"\u2705"} correct answer {"\u274C"} your selection
          </Text>
        </View>

        {questions.map((question, qi) => {
          const correctIdx = question.rightOption - 1;
          const pickedIdx = question.isSelected - 1;
          const isCorrect = pickedIdx === correctIdx;
          const unattempted = pickedIdx < 0;
          const opts = [question.option1, question.option2, question.option3, question.option4];
          return (
            <View key={question.questionId} style={styles.reviewCard}>
              <View style={styles.reviewCardTop}>
                <Text style={styles.reviewQuestionMeta}>
                  Question {qi + 1} of {questions.length}
                </Text>
                <View
                  style={[
                    styles.reviewStatusBadge,
                    {
                      backgroundColor: unattempted
                        ? "#F3F4F6"
                        : isCorrect
                          ? "#F0FDF4"
                          : "#FFF0F2",
                    },
                  ]}
                >
                  <Ionicons
                    name={unattempted ? "remove-circle" : isCorrect ? "checkmark-circle" : "close-circle"}
                    size={13}
                    color={unattempted ? "#6B7280" : isCorrect ? "#16A34A" : colors.primary}
                  />
                  <Text
                    style={[
                      styles.reviewStatusText,
                      { color: unattempted ? "#6B7280" : isCorrect ? "#16A34A" : colors.primary },
                    ]}
                  >
                    {unattempted ? "Not answered" : isCorrect ? "Correct" : "Wrong"}
                  </Text>
                </View>
              </View>

              <Text style={styles.reviewQuestionText}>{question.questionContent}</Text>

              <View style={styles.optionsContainer}>
                {opts.map((opt, oi) => {
                  const isCorrectOption = oi === correctIdx;
                  const isPicked = oi === pickedIdx;
                  let bg = colors.card;
                  let border = colors.border;
                  let badgeBg = "#F3F4F6";
                  let badgeColor = "#6B7280";
                  let badge = optionLabels[oi];
                  if (isCorrectOption) {
                    bg = "#F0FDF4";
                    border = "#22C55E";
                    badgeBg = "#DCFCE7";
                    badgeColor = colors.green;
                    badge = "\u2713";
                  } else if (isPicked) {
                    bg = "#FFF0F2";
                    border = "#F87171";
                    badgeBg = "#FEE2E2";
                    badgeColor = "#DC2626";
                    badge = "\u2717";
                  }
                  return (
                    <View
                      key={oi}
                      style={[styles.optionRow, { backgroundColor: bg, borderColor: border }]}
                    >
                      <View style={[styles.optionBadge, { backgroundColor: badgeBg }]}>
                        <Text style={[styles.optionBadgeText, { color: badgeColor }]}>
                          {badge}
                        </Text>
                      </View>
                      <Text style={[styles.optionText, { color: colors.foreground }]}>
                        {opt}
                      </Text>
                      {isPicked && (
                        <Text style={styles.pickedTag}>Your answer</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

        <View style={styles.resultRemark}>
          <Ionicons name="bulb-outline" size={15} color={colors.brown} />
          <Text style={styles.resultRemarkText}>{remark}</Text>
        </View>

        <View style={styles.resultActions}>
          <TouchableOpacity
            style={styles.dashboardButton}
            onPress={() => router.replace("/(tabs)/dashboard")}
            activeOpacity={0.9}
          >
            <Text style={styles.dashboardButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => setPhase("select")}
            activeOpacity={0.9}
          >
            <Text style={styles.retryButtonText}>View All Tests</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomSpacer} />
      </ScrollView>
    );
  }

  // ── RUNNING PHASE ────────────────────────────────────────────────────────────
  const q = questions[current];
  const opts = [q?.option1, q?.option2, q?.option3, q?.option4] as string[];
  const progress = questions.length > 0 ? (current / questions.length) * 100 : 0;

  if (!q) {
    return (
      <View style={[styles.flex, styles.loadingBox]}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Preparing test...</Text>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <LinearGradient
        colors={gradients.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.runningHeader}
      >
        <View style={styles.runningHeaderTopRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              Alert.alert(
                "Leave test?",
                "Your answered questions are saved. You can resume anytime.",
                [
                  { text: "Keep Testing", style: "cancel" },
                  { text: "Leave", onPress: () => setPhase("select") },
                ]
              );
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={18} color={colors.white} />
          </TouchableOpacity>

          <View style={[styles.timerBox, isUrgent && styles.timerBoxUrgent]}>
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
        <Text style={styles.runningTestTitle}>
          {activeTest ? `${activeTest.courseName || "Test"} #${activeTest.testId}` : "Test"}
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.questionContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.testQuestionCard}>
          <Text style={styles.testQuestionMeta}>
            Question {current + 1} of {questions.length}
          </Text>
          <Text style={styles.testQuestionText}>{q.questionContent}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {opts.map((opt, idx) => {
            const isSelected = selected === idx + 1;
            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.optionRow,
                  isSelected
                    ? { backgroundColor: "#FFF0F2", borderColor: colors.primary }
                    : { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => pickOption(idx)}
                activeOpacity={0.9}
              >
                <View
                  style={[
                    styles.optionBadge,
                    { backgroundColor: isSelected ? "#FFE4E8" : "#F3F4F6" },
                  ]}
                >
                  <Text
                    style={[
                      styles.optionBadgeText,
                      { color: isSelected ? colors.primary : "#6B7280" },
                    ]}
                  >
                    {optionLabels[idx]}
                  </Text>
                </View>
                <Text
                  style={[styles.optionText, { color: colors.foreground }]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.ctaButton, styles.nextButton]}
          onPress={handleNext}
          activeOpacity={0.9}
        >
          <Text style={styles.ctaButtonText}>
            {current + 1 >= questions.length ? "Submit Test" : "Next Question"}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.white} />
        </TouchableOpacity>
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
    paddingBottom: 110,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    height: 54,
    borderRadius: 27,
    ...shadows.md,
  },
  fabDisabled: {
    opacity: 0.7,
  },
  fabText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(10,10,10,0.55)",
    paddingHorizontal: 20,
  },
  dialogCard: {
    width: "100%",
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: 20,
    ...shadows.lg,
  },
  dialogHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    gap: 10,
  },
  dialogIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  dialogHeaderText: {
    flex: 1,
  },
  dialogTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.foreground,
  },
  dialogSubtitle: {
    fontSize: 11,
    color: colors.mutedForeground,
    marginTop: 1,
  },
  dialogLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.mutedForeground,
    marginBottom: 8,
  },
  dialogInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.muted,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: "700",
    color: colors.foreground,
    marginTop: 6,
  },
  dialogHint: {
    fontSize: 11,
    color: colors.mutedForeground,
    marginTop: 6,
    lineHeight: 16,
  },
  modeRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  modeCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
    backgroundColor: colors.card,
    gap: 6,
  },
  modeCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  modeIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.muted,
  },
  modeIconBoxActive: {
    backgroundColor: colors.primary,
  },
  modeTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.foreground,
  },
  modeDesc: {
    fontSize: 10,
    lineHeight: 14,
    color: colors.mutedForeground,
    textAlign: "center",
  },
  difficultyBox: {
    marginTop: 16,
  },
  difficultyRow: {
    flexDirection: "row",
    gap: 8,
  },
  difficultyChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.md,
    alignItems: "center",
    backgroundColor: colors.muted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  difficultyChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  difficultyChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.mutedForeground,
  },
  difficultyChipTextActive: {
    color: colors.white,
  },
  dialogActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  dialogCancel: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: radii.md,
    backgroundColor: colors.muted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dialogCancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.foreground,
  },
  dialogGenerate: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
  },
  dialogGenerateDisabled: {
    opacity: 0.6,
  },
  dialogGenerateText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.white,
  },
  loadingBox: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  loadingText: {
    color: colors.mutedForeground,
    fontSize: 13,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.65)",
    zIndex: 20,
  },
  loadingCard: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 28,
    paddingVertical: 22,
    alignItems: "center",
    gap: 10,
    ...shadows.md,
  },
  loadingOverlayText: {
    color: colors.foreground,
    fontSize: 13,
    fontWeight: "600",
  },
  emptyBox: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 28,
    gap: 8,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.foreground,
  },
  emptyText: {
    fontSize: 13,
    color: colors.mutedForeground,
    textAlign: "center",
    lineHeight: 19,
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
    marginBottom: 2,
  },
  testTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.foreground,
  },
  testSubject: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  testMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
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
  progressWrap: {
    marginTop: 12,
    gap: 6,
  },
  progressLabel: {
    fontSize: 11,
    color: colors.mutedForeground,
  },
  bottomSpacer: {
    height: 16,
  },
  resultScroll: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 24,
    backgroundColor: colors.background,
  },
  resultSummary: {
    alignItems: "center",
    paddingTop: 24,
  },
  reviewHeader: {
    marginTop: 24,
    marginBottom: 12,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.foreground,
  },
  reviewSubtitle: {
    fontSize: 11,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  reviewCard: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    ...shadows.sm,
  },
  reviewCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  reviewQuestionMeta: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.mutedForeground,
  },
  reviewStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  reviewStatusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  reviewQuestionText: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 23,
    color: colors.foreground,
    marginBottom: 12,
  },
  pickedTag: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.mutedForeground,
  },
  resultRemark: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FED7AA",
    borderRadius: radii.lg,
    padding: 14,
    marginTop: 4,
  },
  resultRemarkText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: "#92400E",
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