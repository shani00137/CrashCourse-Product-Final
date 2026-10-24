import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { radii, shadows, type ThemePalette } from "@/constants/theme";
import { useTheme, useThemedStyles } from "@/context/ThemeContext";
import { useApp } from "@/context/AppContext";
import { getActiveCourses, courseImageUrl, type CourseInfo } from "@/services/api";

const logoSource = require("@/assets/logo/logo.jpg");

/** Formats a sale rate as "$12,500" (or "Free" when unset). */
function formatPrice(value?: number): string {
  const amount = Number(value) || 0;
  if (amount <= 0) return "Free";
  const hasDecimals = Math.round(amount * 100) % 100 !== 0;
  const [whole, decimal] = amount.toFixed(hasDecimals ? 2 : 0).split(".");
  const withSeparators = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `$${withSeparators}${decimal ? `.${decimal}` : ""}`;
}

/**
 * Public landing / course-store screen shown before sign-in. It lists every
 * course the backend marks as available on mobile (GetActiveCoursePublic
 * already filters IsActive && IsForMobile), each with a thumbnail and price,
 * and routes the user into registration with the chosen course pre-selected.
 */
export default function HomeScreen() {
  const { colors, gradients } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { user } = useApp();

  const [courses, setCourses] = useState<CourseInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await getActiveCourses();
      // Defensive: the endpoint already filters, but keep only courses that are
      // explicitly enabled for mobile.
      setCourses(data.filter((c) => c.isForMobile !== false));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load courses.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    load();
  };

  const loggedIn = !!user && !user.isGuest;

  const openAccount = () => {
    if (loggedIn) router.push("/(tabs)/dashboard");
    else router.push("/login");
  };

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/courses");
  };

  // Guests choose a course and continue to registration. A logged-in user is
  // buying an extra course, so they go straight to the Stripe payment. The
  // course's sale rate is passed along for display; the backend re-reads it
  // from the course object when creating the payment.
  const enroll = (course: CourseInfo) => {
    if (loggedIn) {
      router.push({
        pathname: "/upgrade",
        params: {
          courseId: String(course.courseId),
          courseName: course.courseName ?? "",
          coursePrice: String(course.saleRate ?? 0),
        },
      });
      return;
    }
    router.push({ pathname: "/register", params: { courseId: String(course.courseId) } });
  };

  const showEmpty = !loading && !error && courses.length === 0;

  return (
    <View style={styles.flex}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
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
        {/* Hero */}
        <LinearGradient
          colors={gradients.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + 14 }]}
        >
          <View style={styles.heroGlowA} />
          <View style={styles.heroGlowB} />

          <View style={styles.topRow}>
            {loggedIn ? (
              <TouchableOpacity
                style={styles.backBtn}
                onPress={goBack}
                activeOpacity={0.85}
              >
                <Ionicons name="arrow-back" size={16} color={colors.white} />
              </TouchableOpacity>
            ) : null}
            <View style={styles.brand}>
              <View style={styles.brandLogo}>
                <Image
                  source={logoSource}
                  style={styles.brandLogoImg}
                  contentFit="contain"
                />
              </View>
              <View style={styles.brandText}>
                <Text style={styles.brandTitle}>Crash Course</Text>
                <Text style={styles.brandSub}>Health Care Professionals</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.loginBtn}
              onPress={openAccount}
              activeOpacity={0.85}
            >
              <Ionicons
                name={loggedIn ? "grid-outline" : "log-in-outline"}
                size={15}
                color={colors.white}
              />
              <Text style={styles.loginBtnText}>
                {loggedIn ? "Dashboard" : "Login"}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.heroTitle}>Choose Your Course</Text>
          <Text style={styles.heroSubtitle}>
            Enroll in a program, study smarter and excel in your medical career.
          </Text>

          <View style={styles.heroBadges}>
            <View style={styles.heroBadge}>
              <Ionicons name="shield-checkmark-outline" size={14} color={colors.white} />
              <Text style={styles.heroBadgeText}>Verified Content</Text>
            </View>
            <View style={styles.heroBadge}>
              <Ionicons name="phone-portrait-outline" size={14} color={colors.white} />
              <Text style={styles.heroBadgeText}>Learn on Mobile</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Course list */}
        <View style={styles.body}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Courses</Text>
            {!loading && !error && courses.length > 0 && (
              <Text style={styles.sectionCount}>
                {courses.length} {courses.length === 1 ? "course" : "courses"}
              </Text>
            )}
          </View>

          {loading && (
            <View style={styles.stateCard}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.stateText}>Loading courses…</Text>
            </View>
          )}

          {!loading && !!error && (
            <View style={styles.stateCard}>
              <Ionicons
                name="cloud-offline-outline"
                size={30}
                color={colors.dangerBright}
              />
              <Text style={styles.errorTitle}>{error}</Text>
              <Text style={styles.stateText}>
                Pull down to try again.
              </Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={onRefresh}
                activeOpacity={0.85}
              >
                <Ionicons name="refresh" size={15} color={colors.white} />
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {showEmpty && (
            <View style={styles.stateCard}>
              <Ionicons
                name="albums-outline"
                size={30}
                color={colors.mutedForeground}
              />
              <Text style={styles.errorTitle}>No courses available</Text>
              <Text style={styles.stateText}>
                Check back soon — new programs are added regularly.
              </Text>
            </View>
          )}

          {!loading &&
            !error &&
            courses.map((course) => {
              const image = courseImageUrl(course.coursePhotoUrl);
              return (
                <TouchableOpacity
                  key={course.courseId}
                  style={styles.card}
                  activeOpacity={0.9}
                  onPress={() => enroll(course)}
                >
                  <View style={styles.thumbWrap}>
                    {image ? (
                      <Image
                        source={{ uri: image }}
                        style={styles.thumb}
                        contentFit="cover"
                        transition={200}
                      />
                    ) : (
                      <View style={styles.thumbFallback}>
                        <Ionicons
                          name="school-outline"
                          size={26}
                          color={colors.primary}
                        />
                      </View>
                    )}
                  </View>

                  <View style={styles.cardBody}>
                    {!!course.courseCode && (
                      <View style={styles.codeChip}>
                        <Text style={styles.codeChipText}>{course.courseCode}</Text>
                      </View>
                    )}
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {course.courseName || "Untitled Course"}
                    </Text>

                    <View style={styles.cardFooter}>
                      <View>
                        <Text style={styles.priceLabel}>Price</Text>
                        <Text style={styles.priceValue}>
                          {formatPrice(course.saleRate)}
                        </Text>
                      </View>

                      <View style={styles.enrollBtn}>
                        <Text style={styles.enrollText}>
                          {loggedIn ? "Buy Now" : "Enroll"}
                        </Text>
                        <Ionicons
                          name="arrow-forward"
                          size={13}
                          color={colors.white}
                        />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

          {!loading && !error && courses.length > 0 && (
            <Text style={styles.footerNote}>
              {loggedIn
                ? "Tap a course to continue to payment."
                : "Tap a course to continue to registration."}
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = ({ colors }: ThemePalette) =>
  StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    hero: {
      paddingHorizontal: 20,
      paddingBottom: 30,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
      overflow: "hidden",
    },
    heroGlowA: {
      position: "absolute",
      top: -70,
      right: -50,
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: "rgba(255,255,255,0.06)",
    },
    heroGlowB: {
      position: "absolute",
      bottom: -60,
      left: -40,
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: "rgba(255,255,255,0.05)",
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    brand: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flex: 1,
    },
    backBtn: {
      width: 34,
      height: 34,
      borderRadius: 11,
      backgroundColor: "rgba(255,255,255,0.16)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.28)",
      alignItems: "center",
      justifyContent: "center",
    },
    brandLogo: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.card,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
    },
    brandLogoImg: {
      width: 36,
      height: 36,
    },
    brandText: {
      flex: 1,
    },
    brandTitle: {
      color: colors.white,
      fontSize: 15,
      fontWeight: "800",
    },
    brandSub: {
      color: "rgba(255,255,255,0.6)",
      fontSize: 9,
      letterSpacing: 0.6,
      textTransform: "uppercase",
      marginTop: 1,
    },
    loginBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: radii.round,
      backgroundColor: "rgba(255,255,255,0.16)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.28)",
    },
    loginBtnText: {
      color: colors.white,
      fontSize: 13,
      fontWeight: "700",
    },
    heroTitle: {
      color: colors.white,
      fontSize: 26,
      fontWeight: "900",
      marginTop: 22,
      lineHeight: 31,
    },
    heroSubtitle: {
      color: "rgba(255,255,255,0.72)",
      fontSize: 13,
      lineHeight: 19,
      marginTop: 6,
    },
    heroBadges: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 16,
    },
    heroBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 11,
      paddingVertical: 6,
      borderRadius: radii.round,
      backgroundColor: "rgba(255,255,255,0.12)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.18)",
    },
    heroBadgeText: {
      color: "rgba(255,255,255,0.9)",
      fontSize: 11,
      fontWeight: "600",
    },
    body: {
      paddingHorizontal: 20,
      marginTop: 22,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: "800",
      color: colors.foreground,
    },
    sectionCount: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    stateCard: {
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 40,
      paddingHorizontal: 24,
      backgroundColor: colors.card,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.sm,
    },
    stateText: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: "center",
    },
    errorTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.foreground,
      textAlign: "center",
    },
    retryBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 6,
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: radii.md,
      backgroundColor: colors.primary,
      ...shadows.sm,
    },
    retryText: {
      color: colors.white,
      fontSize: 13,
      fontWeight: "700",
    },
    card: {
      flexDirection: "row",
      gap: 14,
      padding: 12,
      backgroundColor: colors.card,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
      ...shadows.sm,
    },
    thumbWrap: {
      width: 92,
      height: 92,
      borderRadius: radii.md,
      overflow: "hidden",
      backgroundColor: colors.primaryLight,
    },
    thumb: {
      width: "100%",
      height: "100%",
    },
    thumbFallback: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    cardBody: {
      flex: 1,
      justifyContent: "space-between",
    },
    codeChip: {
      alignSelf: "flex-start",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: radii.sm,
      backgroundColor: colors.primaryLight,
      borderWidth: 1,
      borderColor: colors.primaryBorder,
      marginBottom: 6,
    },
    codeChipText: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 0.5,
      color: colors.primary,
      textTransform: "uppercase",
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.foreground,
      lineHeight: 20,
      flex: 1,
    },
    cardFooter: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      marginTop: 10,
    },
    priceLabel: {
      fontSize: 10,
      fontWeight: "600",
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    priceValue: {
      fontSize: 15,
      fontWeight: "800",
      color: colors.green,
      marginTop: 1,
    },
    enrollBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: radii.md,
      backgroundColor: colors.primary,
      ...shadows.sm,
    },
    enrollText: {
      color: colors.white,
      fontSize: 13,
      fontWeight: "700",
    },
    footerNote: {
      textAlign: "center",
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 6,
      marginBottom: 8,
    },
  });
