import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, gradients, radii, shadows } from "@/constants/theme";
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

export default function CoursesScreen() {
  const router = useRouter();
  const { user } = useApp();

  const [course, setCourse] = useState<ApplicantCourse | null>(null);
  const [userDetail, setUserDetail] = useState<UserDetailInfo | null>(null);
  const [exercises, setExercises] = useState<ExerciseInfo[]>([]);
  const [readingTimes, setReadingTimes] = useState<ReadingTimeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [pdfSheet, setPdfSheet] = useState(false);
  const [pdfBooks, setPdfBooks] = useState<CourseMaterialInfo[]>([]);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");

  const loadCourses = useCallback(async () => {
    try {
      const [courseResult, exerciseResult, detail, readingResult] =
        await Promise.all([
          user?.appUserId
            ? getApplicantCourses(user.appUserId)
            : Promise.resolve([]),
          getAllExercises(),
          user?.appUserId
            ? getUserDetailById(user.appUserId)
            : Promise.resolve(null),
          user?.appUserId
            ? getAllReadingTime(user.appUserId)
            : Promise.resolve([]),
        ]);
      setCourse(courseResult[0] ?? null);
      setUserDetail(detail);
      setExercises(exerciseResult);
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

  const handleRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    loadCourses();
  };

  const courseId = userDetail?.courseId || course?.courseId;
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
        courseName: userDetail?.courseName || course?.courseName || "Medical Exercise",
        start: String(exercise.startFrom ?? 0),
        end: String(exercise.endFrom ?? 0),
      },
    });
  };

  const openPdfPicker = async () => {
    const cid = courseId ?? 0;
    if (!cid) {
      Alert.alert("No course", "Register a course first to see its PDF books.");
      return;
    }
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
    const url = coursePdfUrl(item.courseUrl);
    if (!url) return;
    setPdfSheet(false);
    router.push({
      pathname: "/pdf-preview",
      params: {
        url,
        fileName: item.fileName || item.courseUrl || "Course PDF",
        courseName: userDetail?.courseName || course?.courseName || "",
      },
    });
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
          {userDetail?.courseName || course?.courseName || "My Courses"}
        </Text>
        <Text style={styles.pageSubtitle}>
          {(userDetail?.courseName || course?.courseName)
            ? `${userDetail?.courseName || course?.courseName} · exercises`
            : "Your enrolled medical course"}
        </Text>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.centerText}>Loading your course...</Text>
        </View>
      ) : error && !course && exercises.length === 0 ? (
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
          {courseId && courseId > 0 || course ? (
            <>
              {/* Course spotlight card */}
              <View style={styles.courseCard}>
                <View style={styles.courseIconBox}>
                  <Ionicons name="book" size={24} color={colors.primary} />
                </View>
                <View style={styles.courseInfo}>
                  <Text style={styles.courseCardTitle}>
                    {userDetail?.courseName || course?.courseName || "My Course"}
                  </Text>
                  {course?.courseCode ? (
                    <Text style={styles.courseCode}>{course.courseCode}</Text>
                  ) : null}
                  <Text style={styles.courseMeta}>
                    {course && course.questions > 0
                      ? `${course.questions} available questions`
                      : courseId && courseId > 0
                        ? "Questions available"
                        : "No course registered"}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.pdfButton}
                  onPress={openPdfPicker}
                  activeOpacity={0.85}
                >
                  <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                  <Text style={styles.pdfButtonText}>PDF</Text>
                </TouchableOpacity>
              </View>

              {/* Exercises heading */}
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Exercises</Text>
                <Text style={styles.sectionCount}>{exercises.length}</Text>
              </View>

              {isTrial && exercises.length > 0 && (
                <View style={styles.trialBanner}>
                  <Ionicons name="sparkles-outline" size={14} color="#B45309" />
                  <Text style={styles.trialBannerText}>
                    5-day trial — the first {TRIAL_EXERCISE_LIMIT} of{" "}
                    {exercises.length} exercises are unlocked.
                  </Text>
                </View>
              )}

              {exercises.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Ionicons name="fitness-outline" size={30} color={colors.mutedForeground} />
                  <Text style={styles.emptyText}>No exercises available yet</Text>
                </View>
              ) : (
                exercises.map((exercise, index) => {
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
            </>
          ) : (
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
                  {userDetail?.courseName || course?.courseName || "Medical course"}
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

const styles = StyleSheet.create({
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
  courseCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
    ...shadows.sm,
  },
  courseIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#FFF0F2",
    alignItems: "center",
    justifyContent: "center",
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
  pdfButton: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "#FFF0F2",
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
    backgroundColor: "#E2E8F0",
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
    backgroundColor: "#F7FAFC",
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
    backgroundColor: "#F7FAFC",
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
    backgroundColor: "#FFF0F2",
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
    backgroundColor: "#FFF0F2",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  trialBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF7E6",
    borderColor: "#FCD34D",
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
    color: "#92400E",
  },
  exerciseCardLocked: {
    opacity: 0.6,
    borderColor: "#E5E7EB",
  },
  exerciseIconBoxLocked: {
    backgroundColor: "#F3F4F6",
  },
  lockedBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F3F4F6",
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
    backgroundColor: "#FFF0F2",
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
    backgroundColor: "#F3F4F6",
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