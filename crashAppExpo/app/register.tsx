import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, gradients, radii, shadows } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { registerApplicantWithAppUser, getActiveCourses, CourseInfo } from "@/services/api";

export default function RegisterScreen() {
  const { setUser } = useApp();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [otherMobile, setOtherMobile] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [courseId, setCourseId] = useState<number | null>(null);
  const [courseName, setCourseName] = useState("");

  const [courses, setCourses] = useState<CourseInfo[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState("");
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [courseSearch, setCourseSearch] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getActiveCourses();
        if (mounted) {
          setCourses(data);
          setCoursesError("");
        }
      } catch (e) {
        if (mounted) {
          setCoursesError(
            e instanceof Error ? e.message : "Unable to load courses."
          );
        }
      } finally {
        if (mounted) setCoursesLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

const filteredCourses = courses.filter((c) => {
    const q = courseSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      (c.courseName ?? "").toLowerCase().includes(q) ||
      (c.courseCode ?? "").toLowerCase().includes(q)
    );
  });

  const validate = (): string | null => {
    if (!firstName.trim() || !lastName.trim()) return "Please enter your full name";
    if (!mobile.trim() || mobile.trim().replace(/\D/g, "").length < 10)
      return "Please enter a valid mobile number";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Please enter a valid email address";
    if (!address.trim()) return "Please enter your address";
    if (!userName.trim() || userName.trim().length < 4)
      return "Username must be at least 4 characters";
    if (!password.trim() || password.trim().length < 6)
      return "Password must be at least 6 characters";
    if (password !== confirmPassword) return "Passwords do not match";
    if (courseId == null) return "Please select a course";
    return null;
  };

  const handleRegister = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { applicantId, appUserId } = await registerApplicantWithAppUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        mobile: mobile.trim(),
        otherMobile: otherMobile.trim(),
        address: address.trim(),
        email: email.trim(),
        userName: userName.trim(),
        password,
        courseId: courseId as number,
        courseName,
        countryId: 0,
        applyForCountry: 0,
      });
      setUser({
        name: `${firstName.trim()} ${lastName.trim()}`,
        isGuest: false,
        applicantId,
        appUserId,
        courseId: courseId as number,
      });
      router.replace("/(tabs)/dashboard");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const selectCourse = (id: number, name: string) => {
    setCourseId(id);
    setCourseName(name);
    setCourseModalOpen(false);
    setCourseSearch("");
  };

  const field = (
    label: string,
    value: string,
    onChangeText: (t: string) => void,
    placeholder: string,
    opts: Partial<{
      icon: keyof typeof Ionicons.glyphMap;
      keyboard: "default" | "email-address" | "phone-pad";
      secure: boolean;
      multiline: boolean;
    }> = {}
  ) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputWrapper, opts.multiline && styles.inputWrapperArea]}>
        {opts.icon && (
          <Ionicons name={opts.icon} size={18} color={colors.mutedForeground} />
        )}
        <TextInput
          style={[styles.input, opts.multiline && styles.inputArea]}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          value={value}
          onChangeText={onChangeText}
          keyboardType={opts.keyboard || "default"}
          secureTextEntry={opts.secure}
          multiline={opts.multiline}
          autoCapitalize={opts.secure ? "none" : "sentences"}
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={18} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Create Account</Text>
          <Text style={styles.pageSubtitle}>
            Join as a trial user — 5 days free access
          </Text>
        </LinearGradient>

        {/* Form */}
        <View style={styles.formCard}>
          <Text style={styles.formSectionTitle}>Personal Information</Text>
          <View style={styles.row}>
            <View style={styles.rowHalf}>
              {field("First Name", firstName, setFirstName, "John", { icon: "person-outline" })}
            </View>
            <View style={styles.rowHalf}>
              {field("Last Name", lastName, setLastName, "Doe", { icon: "person-outline" })}
            </View>
          </View>

          {field("Mobile Number", mobile, setMobile, "e.g. +1 234 567 8901", {
            icon: "call-outline",
            keyboard: "phone-pad",
          })}
          {field("Other Mobile (optional)", otherMobile, setOtherMobile, "e.g. +1 555 000 1111", {
            icon: "call-outline",
            keyboard: "phone-pad",
          })}
          {field("Email Address", email, setEmail, "you@example.com", {
            icon: "mail-outline",
            keyboard: "email-address",
          })}
          {field("Address", address, setAddress, "Street, City, Country", {
            icon: "location-outline",
            multiline: true,
          })}

          <Text style={[styles.formSectionTitle, styles.sectionSpacing]}>
            Login Credentials
          </Text>
          {field("Username", userName, setUserName, "Choose a username", {
            icon: "person-circle-outline",
          })}
          {field("Password", password, setPassword, "At least 6 characters", {
            icon: "lock-closed-outline",
            secure: true,
          })}
          {field("Confirm Password", confirmPassword, setConfirmPassword, "Re-enter password", {
            icon: "lock-closed-outline",
            secure: true,
          })}

          <Text style={[styles.formSectionTitle, styles.sectionSpacing]}>
            Select Course
          </Text>

          {/* Course searchable dropdown */}
          <TouchableOpacity
            style={[
              styles.inputWrapper,
              courseId != null && styles.courseFieldSelected,
            ]}
            onPress={() => setCourseModalOpen(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="book-outline" size={18} color={colors.mutedForeground} />
            {coursesLoading ? (
              <ActivityIndicator color={colors.mutedForeground} style={styles.courseFieldSpinner} />
            ) : (
              <Text
                style={[
                  styles.courseFieldText,
                  courseId == null && styles.courseFieldPlaceholder,
                ]}
              >
                {courseName
                  ? courseName
                  : coursesError
                  ? "Unable to load courses"
                  : "Choose a course"}
              </Text>
            )}
            <Ionicons name="chevron-down" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>

          {coursesError && !coursesLoading ? (
            <View style={styles.courseErrorBox}>
              <Ionicons name="cloud-offline-outline" size={15} color="#B91C1C" />
              <Text style={styles.courseErrorText}>{coursesError}</Text>
            </View>
          ) : null}

          {/* Course picker modal */}
          <Modal
            visible={courseModalOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setCourseModalOpen(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Choose a Course</Text>
                  <TouchableOpacity
                    style={styles.modalClose}
                    onPress={() => setCourseModalOpen(false)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="close" size={18} color={colors.foreground} />
                  </TouchableOpacity>
                </View>

                <View style={styles.searchWrapper}>
                  <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search courses..."
                    placeholderTextColor={colors.mutedForeground}
                    value={courseSearch}
                    onChangeText={setCourseSearch}
                    autoCapitalize="none"
                  />
                </View>

                <FlatList
                  data={filteredCourses}
                  keyExtractor={(item) => String(item.courseId)}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.modalList}
                  ListEmptyComponent={
                    <View style={styles.modalEmpty}>
                      <Text style={styles.modalEmptyText}>
                        {coursesLoading
                          ? "Loading courses..."
                          : "No courses match your search"}
                      </Text>
                    </View>
                  }
                  renderItem={({ item }) => {
                    const selected = courseId === item.courseId;
                    return (
                      <TouchableOpacity
                        style={[styles.modalRow, selected && styles.modalRowSelected]}
                        onPress={() =>
                          selectCourse(item.courseId, item.courseName ?? "")
                        }
                        activeOpacity={0.85}
                      >
                        <View style={styles.modalRowTextBlock}>
                          <Text
                            style={[
                              styles.modalRowName,
                              selected && styles.modalRowNameSelected,
                            ]}
                          >
                            {item.courseName ?? "Untitled"}
                          </Text>
                          {item.courseCode ? (
                            <Text style={styles.modalRowCode}>{item.courseCode}</Text>
                          ) : null}
                        </View>
                        {selected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color={colors.primary}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            </View>
          </Modal>

          {/* Trial note */}
          <View style={styles.trialBox}>
            <Ionicons name="gift-outline" size={18} color={colors.green} />
            <View style={styles.trialTextBlock}>
              <Text style={styles.trialTitle}>5-Day Free Trial</Text>
              <Text style={styles.trialSubtitle}>
                Your account will be active for 5 days starting today.
              </Text>
            </View>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>Create My Account</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.loginLink}>
            Already have an account?{" "}
            <Text style={styles.loginLinkText} onPress={() => router.back()}>
              Sign In
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 72,
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
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  pageTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "800",
  },
  pageSubtitle: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    marginTop: 4,
  },
  formCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -14,
    paddingHorizontal: 22,
    paddingTop: 28,
  },
  formSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.foreground,
    marginBottom: 16,
  },
  sectionSpacing: {
    marginTop: 24,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  rowHalf: {
    flex: 1,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(26,31,26,0.7)",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...shadows.sm,
  },
  inputWrapperArea: {
    alignItems: "flex-start",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.foreground,
    paddingVertical: 0,
  },
  inputArea: {
    minHeight: 44,
    textAlignVertical: "top",
  },
  courseFieldSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  courseFieldSpinner: {
    flex: 1,
    alignItems: "flex-start",
  },
  courseFieldText: {
    flex: 1,
    fontSize: 15,
    color: colors.foreground,
  },
  courseFieldPlaceholder: {
    color: colors.mutedForeground,
  },
  courseErrorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF0F2",
    borderWidth: 1,
    borderColor: "#FECDD3",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
  },
  courseErrorText: {
    flex: 1,
    color: "#B91C1C",
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: 20,
    maxHeight: "70%",
    ...shadows.md,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.foreground,
  },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.foreground,
    paddingVertical: 0,
  },
  modalList: {
    paddingBottom: 8,
  },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 12,
    marginBottom: 6,
  },
  modalRowSelected: {
    backgroundColor: colors.primaryLight,
  },
  modalRowTextBlock: {
    flex: 1,
  },
  modalRowName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.foreground,
  },
  modalRowNameSelected: {
    color: colors.primary,
  },
  modalRowCode: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  modalEmpty: {
    alignItems: "center",
    paddingVertical: 28,
  },
  modalEmptyText: {
    fontSize: 13,
    color: colors.mutedForeground,
  },
  trialBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F0F9F0",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: radii.lg,
    padding: 14,
    marginTop: 20,
  },
  trialTextBlock: {
    flex: 1,
  },
  trialTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.green,
  },
  trialSubtitle: {
    fontSize: 12,
    color: "#166534",
    marginTop: 2,
  },
  errorBox: {
    backgroundColor: "#FFF0F2",
    borderWidth: 1,
    borderColor: "#FECDD3",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
  },
  errorText: {
    color: colors.primary,
    fontSize: 13,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    ...shadows.md,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  loginLink: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 13,
    color: colors.mutedForeground,
  },
  loginLinkText: {
    color: colors.primary,
    fontWeight: "600",
  },
});