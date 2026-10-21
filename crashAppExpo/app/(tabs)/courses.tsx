import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { radii, shadows, type ThemePalette } from "@/constants/theme";
import { useTheme, useThemedStyles } from "@/context/ThemeContext";
import { useApp } from "@/context/AppContext";
import {
  getApplicantCourses,
  getAllExercises,
  getAllReadingTime,
  getUserDetailById,
  getCourseMaterials,
  coursePdfUrl,
  ApplicantCourse,
  ExerciseInfo,
  ReadingTimeRow,
  UserDetailInfo,
  CourseMaterialInfo,
} from "@/services/api";
import {
  readingPct,
  formatReadingTime,
} from "@/constants/readingTime";

/**
 * Courses tab: everything the user has bought, in one list.
 *
 * Most people own a single course, some own two — so the tab lists every
 * purchased course as a card and opens the selected one's exercises directly
 * underneath it. A course bought while the tab was in the background is
 * recognised on the refetch (the focus effect below) and opens itself, so a
 * fresh purchase shows up without the user hunting for it.
 */
export default function CoursesScreen() {
  const { colors, gradients } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { user } = useApp();

  /** Every course the applicant is enrolled in, oldest purchase first. */
  const [courses, setCourses] = useState<ApplicantCourse[]>([]);
  /** The course whose exercises are open — one open at a time. */
  const [selectedId, setSelectedId] = useState(0);
  const [userDetail, setUserDetail] = useState<UserDetailInfo | null>(null);
  /** Exercises tagged with the course they belong to, to avoid a stale list. */
  const [exercises, setExercises] = useState<{
    courseId: number;
    list: ExerciseInfo[];
  }>({ courseId: 0, list: [] });
  const [exercisesLoading, setExercisesLoading] = useState(true);
  const [exerciseError, setExerciseError] = useState("");
  const [readingTimes, setReadingTimes] = useState<ReadingTimeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [pdfSheet, setPdfSheet] = useState(false);
  const [pdfCourse, setPdfCourse] = useState<ApplicantCourse | null>(null);
  const [pdfBooks, setPdfBooks] = useState<CourseMaterialInfo[]>([]);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  /** Bumped by pull-to-refresh so the open course's exercises reload too. */
  const [exerciseRefresh, setExerciseRefresh] = useState(0);
  /**
   * Course ids seen on the previous fetch. Anything missing from this set is a
   * course bought while the tab was away, and it is the one that opens.
   */
  const knownIdsRef = useRef<Set<number> | null>(null);

  const loadCourses = useCallback(async () => {
    try {
      const [purchased, detail, readingResult] = await Promise.all([
        user?.appUserId
          ? getApplicantCourses(user.appUserId)
          : Promise.resolve([]),
        user?.appUserId
          ? getUserDetailById(user.appUserId)
          : Promise.resolve(null),
        user?.appUserId
          ? getAllReadingTime(user.appUserId)
          : Promise.resolve([]),
      ]);

      const known = knownIdsRef.current;
      const justBought =
        known === null
          ? []
          : purchased.filter((c) => !known.has(c.courseId));
      knownIdsRef.current = new Set(purchased.map((c) => c.courseId));

      setSelectedId((prev) => {
        // A course bought since the last fetch opens itself.
        if (justBought.length > 0) return justBought[0].courseId;
        // Otherwise keep what was open, then the registered course, then the
        // first purchase.
        if (prev > 0 && purchased.some((c) => c.courseId === prev)) return prev;
        if (
          detail?.courseId &&
          purchased.some((c) => c.courseId === detail.courseId)
        )
          return detail.courseId;
        return purchased[0]?.courseId ?? 0;
      });
      setCourses(purchased);
      setUserDetail(detail);
      setReadingTimes(readingResult);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load courses.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.appUserId]);

  useEffect(() => {
    setLoading(true);
    loadCourses();
  }, [loadCourses]);

  // Refetch whenever the tab regains focus (e.g. after buying a course from the
  // "More Courses" screen) so the new course shows up without a manual reload.
  // The very first focus is skipped — the effect above already loaded once.
  const didFocusRef = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (!didFocusRef.current) {
        didFocusRef.current = true;
        return;
      }
      loadCourses();
    }, [loadCourses])
  );

  // Exercises always follow the selected course: tapping another course card
  // swaps the list underneath it.
  useEffect(() => {
    if (selectedId <= 0) {
      setExercises({ courseId: 0, list: [] });
      setExercisesLoading(false);
      setExerciseError("");
      return;
    }
    let cancelled = false;
    setExercisesLoading(true);
    setExerciseError("");
    getAllExercises(selectedId)
      .then((list) => {
        if (!cancelled) setExercises({ courseId: selectedId, list });
      })
      .catch((e) => {
        if (!cancelled)
          setExerciseError(
            e instanceof Error ? e.message : "Unable to load exercises."
          );
      })
      .finally(() => {
        if (!cancelled) setExercisesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId, exerciseRefresh]);

  const handleRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    loadCourses();
    setExerciseRefresh((n) => n + 1);
  };

  const selectedCourse = useMemo(
    () => courses.find((c) => c.courseId === selectedId) ?? null,
    [courses, selectedId]
  );
  const courseId = selectedId;
  const isTrial = !!user?.isTrial;
  const TRIAL_EXERCISE_LIMIT = 2;

  const openLockedExercise = () => {
    Alert.alert(
      "Locked in the trial",
      `Your 5-day trial includes the first ${TRIAL_EXERCISE_LIMIT} exercises. Upgrade to unlock all exercises.`
    );
  };

  // Row lookup: courseId_start_end → totalSeconds
  const readingMap = useMemo(() => {
    const map: Record<string, number> = {};
    readingTimes.forEach((r) => {
      map[`${r.courseId}_${r.exerciseStart}_${r.exerciseEnd}`] = r.totalSeconds;
    });
    return map;
  }, [readingTimes]);

  const openExercise = (exercise: ExerciseInfo) => {
    router.push({
      pathname: "/exercise",
      params: {
        courseId: String(courseId ?? 0),
        courseName: selectedCourse?.courseName || "Medical Exercise",
        start: String(exercise.startFrom ?? 0),
        end: String(exercise.endFrom ?? 0),
      },
    });
  };

  const openPdfPicker = async (course: ApplicantCourse) => {
    if (isTrial) {
      Alert.alert(
        "PDF locked",
        "PDF books are disabled on the 5-day trial. Request the Pro upgrade from Settings to view them."
      );
      return;
    }
    const cid = course.courseId;
    if (!cid) {
      Alert.alert("No course", "Register a course first to see its PDF books.");
      return;
    }
    setPdfCourse(course);
    setPdfSheet(true);
    setPdfLoading(true);
    setPdfError("");
    try {
      const items = await getCourseMaterials(cid);
      const files = items.filter(
        (m) => !!coursePdfUrl(m.courseUrl) && /\.pdf$/i.test(m.courseUrl ?? "")
      );
      setPdfBooks(files);
      if (files.length === 0) setPdfError("No PDF books found for this course.");
    } catch (e) {
      setPdfError(e instanceof Error ? e.message : "Couldn't load the PDF list.");
    } finally {
      setPdfLoading(false);
    }
  };

  const openPdf = (item: CourseMaterialInfo) => {
    if (isTrial) {
      Alert.alert(
        "PDF locked",
        "PDF books are disabled on the 5-day trial. Request the Pro upgrade from Settings to view them."
      );
      setPdfSheet(false);
      return;
    }
    const url = coursePdfUrl(item.courseUrl);
    if (!url) return;
    setPdfSheet(false);
    router.push({
      pathname: "/pdf-preview",
      params: {
        url,
        fileName: item.fileName || item.courseUrl || "Course PDF",
        courseName: pdfCourse?.courseName || "",
      },
    });
  };

  /** The exercise list of the course that is open right now, if it is loaded. */
  const openList =
    exercises.courseId === selectedId && selectedId > 0 ? exercises.list : null;
  const exercisesBusy = exercisesLoading || openList === null;

  /**
   * Rendered straight under the selected course's card: heading, the trial
   * banner and that course's exercises.
   */
  const renderExercises = () => (
    <View style={styles.exercisesBlock}>
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Exercises</Text>
        <Text style={styles.sectionCount}>
          {exercisesBusy ? "…" : openList?.length ?? 0}
        </Text>
      </View>

      {isTrial && !exercisesBusy && (openList?.length ?? 0) > 0 && (
        <View style={styles.trialBanner}>
          <Ionicons name="sparkles-outline" size={14} color={colors.brown} />
          <Text style={styles.trialBannerText}>
            5-day trial — the first {TRIAL_EXERCISE_LIMIT} of{" "}
            {openList?.length} exercises are unlocked.
          </Text>
        </View>
      )}

      {exercisesBusy ? (
        <View style={styles.emptyBox}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.emptyText}>Loading exercises…</Text>
        </View>
      ) : exerciseError ? (
        <View style={styles.emptyBox}>
          <Ionicons
            name="cloud-offline-outline"
            size={30}
            color={colors.mutedForeground}
          />
          <Text style={styles.emptyText}>{exerciseError}</Text>
        </View>
      ) : (openList?.length ?? 0) === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons
            name="fitness-outline"
            size={30}
            color={colors.mutedForeground}
          />
          <Text style={styles.emptyText}>No exercises available yet</Text>
        </View>
      ) : (
        openList!.map((exercise, index) => {
          const rtSecs =
            readingMap[
              `${courseId ?? 0}_${exercise.startFrom ?? 0}_${exercise.endFrom ?? 0}`
            ] ?? 0;
          const locked = isTrial && index >= TRIAL_EXERCISE_LIMIT;
          return (
            <TouchableOpacity
              key={exercise.exerciseRecordId}
              style={[
                styles.exerciseCard,
                locked && styles.exerciseCardLocked,
              ]}
              activeOpacity={0.85}
              onPress={() =>
                locked ? openLockedExercise() : openExercise(exercise)
              }
            >
              <View
                style={[
                  styles.exerciseIconBox,
                  locked && styles.exerciseIconBoxLocked,
                ]}
              >
                <Ionicons
                  name={locked ? "lock-closed" : "pencil"}
                  size={20}
                  color={locked ? colors.mutedForeground : colors.primary}
                />
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseTitle}>
                  {exercise.exercise || "Untitled Exercise"}
                </Text>
                <Text style={styles.exerciseRange}>
                  {exercise.startFrom || 0} – {exercise.endFrom || 0}{" "}
                  question range
                </Text>
                {locked ? (
                  <View style={styles.lockedBadge}>
                    <Text style={styles.lockedBadgeText}>
                      Locked · upgrade to unlock
                    </Text>
                  </View>
                ) : (
                  user?.appUserId && (
                    <View style={styles.readingRow}>
                      <View style={styles.readingTrack}>
                        <View
                          style={[
                            styles.readingFill,
                            { width: `${readingPct(rtSecs)}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.readingLabel}>
                        {formatReadingTime(rtSecs)}
                      </Text>
                    </View>
                  )
                )}
              </View>
              <Ionicons
                name={locked ? "lock-closed" : "chevron-forward"}
                size={18}
                color={locked ? colors.mutedForeground : colors.mutedForeground}
              />
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );

  const renderCourseCard = (c: ApplicantCourse) => {
    const active = c.courseId === selectedId;
    return (
      <View key={c.courseId}>
        <Pressable
          style={[styles.courseCard, active && styles.courseCardSelected]}
          onPress={() => setSelectedId(c.courseId)}
          accessibilityRole="button"
          accessibilityState={{ selected: active }}
          accessibilityLabel={`Open ${c.courseName || "course"} exercises`}
        >
          <View
            style={[
              styles.courseIconBox,
              active && styles.courseIconBoxSelected,
            ]}
          >
            <Ionicons
              name="book"
              size={22}
              color={active ? colors.white : colors.primary}
            />
          </View>
          <View style={styles.courseInfo}>
            <Text style={styles.courseCardTitle}>
              {c.courseName || "My Course"}
            </Text>
            {c.courseCode ? <Text style={styles.courseCode}>{c.courseCode}</Text> : null}
            <Text style={styles.courseMeta}>
              {active
                ? exercisesBusy
                  ? "Opening exercises…"
                  : `${openList?.length ?? 0} exercise${
                      (openList?.length ?? 0) === 1 ? "" : "s"
                    }`
                : c.questions > 0
                  ? `${c.questions} available questions`
                  : "Open to see exercises"}
            </Text>
          </View>
          {active && (
            <Ionicons
              name="checkmark-circle"
              size={22}
              color={colors.primary}
            />
          )}
          <TouchableOpacity
            style={[styles.pdfButton, isTrial && styles.pdfButtonLocked]}
            onPress={() => openPdfPicker(c)}
            activeOpacity={0.85}
          >
            <Ionicons
              name={isTrial ? "lock-closed" : "document-text-outline"}
              size={20}
              color={isTrial ? colors.mutedForeground : colors.primary}
            />
            <Text
              style={[styles.pdfButtonText, isTrial && styles.pdfButtonTextLocked]}
            >
              PDF
            </Text>
          </TouchableOpacity>
        </Pressable>
        {/* The selected course's exercises open right below its card. */}
        {active && renderExercises()}
      </View>
    );
  };

  return (
    <View style={styles.flex}>
      {/* Header */}
      <LinearGradient
        colors={gradients.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerGlow} />
        <Text style={styles.brandName}>CRASH COURSE</Text>
        <Text style={styles.pageTitle}>
          {selectedCourse?.courseName || "My Courses"}
        </Text>
        <Text style={styles.pageSubtitle}>
          {courses.length > 1
            ? `${courses.length} purchased courses · select one to open its exercises`
            : selectedCourse
              ? `${selectedCourse.courseName} · exercises`
              : "Your enrolled medical course"}
        </Text>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.centerText}>Loading your course...</Text>
        </View>
      ) : error && courses.length === 0 ? (
        <View style={styles.center}>
          <Ionicons
            name="cloud-offline-outline"
            size={40}
            color={colors.mutedForeground}
          />
          <Text style={styles.errorTitle}>Couldn't load your course</Text>
          <Text style={styles.centerText}>{error}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          alwaysBounceVertical
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {/* Buy more courses — opens the full public course list. */}
          <TouchableOpacity
            style={styles.moreCard}
            activeOpacity={0.9}
            onPress={() => router.push("/home")}
          >
            <LinearGradient
              colors={gradients.header}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.moreCardGradient}
            >
              <View style={styles.moreIconBox}>
                <Ionicons name="add-circle-outline" size={24} color={colors.white} />
              </View>
              <View style={styles.moreTextBlock}>
                <Text style={styles.moreTitle}>More Courses</Text>
                <Text style={styles.moreSubtitle}>
                  Browse all programs and unlock another course.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.white} />
            </LinearGradient>
          </TouchableOpacity>

          {courses.length === 0 ? (
            <View style={styles.center}>
              <Ionicons
                name="school-outline"
                size={40}
                color={colors.mutedForeground}
              />
              <Text style={styles.errorTitle}>No course registered</Text>
              <Text style={styles.centerText}>
                {user?.appUserId
                  ? "Your profile doesn't have a course yet."
                  : "Sign in to see your enrolled courses."}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>My Courses</Text>
                <Text style={styles.sectionCount}>{courses.length}</Text>
              </View>

              {courses.map(renderCourseCard)}
            </>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}

      {/* PDF books sheet */}
      <Modal
        visible={pdfSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setPdfSheet(false)}
      >
        <Pressable style={styles.sheetBackdrop} onPress={() => setPdfSheet(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>PDF Books</Text>
                <Text style={styles.sheetSubtitle}>
                  {pdfCourse?.courseName || selectedCourse?.courseName || "Medical course"}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.sheetClose}
                onPress={() => setPdfSheet(false)}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            {pdfLoading ? (
              <View style={styles.sheetCenter}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.sheetCenterText}>Loading PDFs…</Text>
              </View>
            ) : pdfError ? (
              <View style={styles.sheetCenter}>
                <Ionicons name="cloud-offline-outline" size={32} color={colors.mutedForeground} />
                <Text style={styles.sheetCenterText}>{pdfError}</Text>
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
                {pdfBooks.map((item) => (
                  <TouchableOpacity
                    key={item.courseMaterialId}
                    style={styles.pdfRow}
                    onPress={() => openPdf(item)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.pdfRowIcon}>
                      <Ionicons name="document-text" size={18} color={colors.primary} />
                    </View>
                    <Text style={styles.pdfRowName} numberOfLines={2}>
                      {item.fileName || "PDF file"}
                    </Text>
                    <Ionicons name="open-outline" size={16} color={colors.mutedForeground} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const makeStyles = ({ colors }: ThemePalette) => StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 88,
    paddingBottom: 28,
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
  brandName: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  pageTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "800",
    marginTop: 4,
  },
  pageSubtitle: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    marginTop: 4,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  centerText: {
    color: colors.mutedForeground,
    fontSize: 14,
    textAlign: "center",
  },
  errorTitle: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: "700",
  },
  listContent: {
    padding: 20,
    paddingBottom: 24,
  },
  moreCard: {
    borderRadius: radii.lg,
    overflow: "hidden",
    marginBottom: 20,
    ...shadows.md,
  },
  moreCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  moreIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    alignItems: "center",
    justifyContent: "center",
  },
  moreTextBlock: {
    flex: 1,
  },
  moreTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "800",
  },
  moreSubtitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    marginTop: 2,
  },
  courseCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
    ...shadows.sm,
  },
  courseCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.redLight,
  },
  courseIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.redLight,
    alignItems: "center",
    justifyContent: "center",
  },
  courseIconBoxSelected: {
    backgroundColor: colors.primary,
  },
  courseInfo: {
    flex: 1,
  },
  courseCardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.foreground,
  },
  courseCode: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  courseMeta: {
    fontSize: 13,
    color: colors.primary,
    marginTop: 4,
    fontWeight: "600",
  },
  exercisesBlock: {
    marginBottom: 12,
    marginTop: 4,
  },
  pdfButton: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: colors.redLight,
    borderWidth: 1,
    borderColor: "rgba(196,30,58,0.18)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pdfButtonText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 0.4,
  },
  pdfButtonLocked: {
    backgroundColor: colors.muted,
    borderColor: colors.border,
  },
  pdfButtonTextLocked: {
    color: colors.mutedForeground,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.slateBg,
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.foreground,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  sheetClose: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.subtleBg,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetCenter: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    gap: 10,
  },
  sheetCenterText: {
    fontSize: 13,
    color: colors.mutedForeground,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  pdfRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.subtleBg,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pdfRowIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.redLight,
    alignItems: "center",
    justifyContent: "center",
  },
  pdfRowName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: colors.foreground,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.foreground,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
    backgroundColor: colors.redLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  trialBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.warningSoftBg,
    borderColor: colors.amberBorder,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  trialBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: colors.warningText,
  },
  exerciseCardLocked: {
    opacity: 0.6,
    borderColor: colors.border,
  },
  exerciseIconBoxLocked: {
    backgroundColor: colors.muted,
  },
  lockedBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.muted,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 8,
  },
  lockedBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.mutedForeground,
  },
  exerciseCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    ...shadows.sm,
  },
  exerciseIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.redLight,
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.foreground,
  },
  exerciseRange: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 3,
  },
  readingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  readingTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.muted,
    overflow: "hidden",
  },
  readingFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  readingLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.mutedForeground,
  },
  emptyBox: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    color: colors.mutedForeground,
    fontSize: 14,
  },
  bottomSpacer: {
    height: 16,
  },
});
