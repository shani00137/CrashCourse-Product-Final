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
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, gradients, radii, shadows } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import {
  getApplicantCourses,
  getAllExercises,
  getUserDetailById,
  ApplicantCourse,
  ExerciseInfo,
  UserDetailInfo,
} from "@/services/api";

export default function CoursesScreen() {
  const router = useRouter();
  const { user } = useApp();

  const [course, setCourse] = useState<ApplicantCourse | null>(null);
  const [userDetail, setUserDetail] = useState<UserDetailInfo | null>(null);
  const [exercises, setExercises] = useState<ExerciseInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [courseResult, exerciseResult, detail] = await Promise.all([
          user?.appUserId ? getApplicantCourses(user.appUserId) : Promise.resolve([]),
          getAllExercises(),
          user?.appUserId ? getUserDetailById(user.appUserId) : Promise.resolve(null),
        ]);
        if (mounted) {
          setCourse(courseResult[0] ?? null);
          setUserDetail(detail);
          setExercises(exerciseResult);
          setError("");
        }
      } catch (e) {
        if (mounted) {
          setError(
            e instanceof Error ? e.message : "Unable to load courses."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user?.appUserId]);

  const courseId = userDetail?.courseId || course?.courseId;

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
      ) : error ? (
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
              </View>

              {/* Exercises heading */}
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Exercises</Text>
                <Text style={styles.sectionCount}>{exercises.length}</Text>
              </View>

              {exercises.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Ionicons name="fitness-outline" size={30} color={colors.mutedForeground} />
                  <Text style={styles.emptyText}>No exercises available yet</Text>
                </View>
              ) : (
                exercises.map((exercise) => (
                  <TouchableOpacity
                    key={exercise.exerciseRecordId}
                    style={styles.exerciseCard}
                    activeOpacity={0.85}
                    onPress={() => openExercise(exercise)}
                  >
                    <View style={styles.exerciseIconBox}>
                      <Ionicons name="pencil" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.exerciseInfo}>
                      <Text style={styles.exerciseTitle}>
                        {exercise.exercise || "Untitled Exercise"}
                      </Text>
                      <Text style={styles.exerciseRange}>
                        {exercise.startFrom || 0} – {exercise.endFrom || 0} question range
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={colors.mutedForeground}
                    />
                  </TouchableOpacity>
                ))
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