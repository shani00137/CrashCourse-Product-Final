import React, { useState } from "react";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { colors, gradients, radii, shadows } from "@/constants/theme";
import { useApp } from "@/context/AppContext";

const logoSource = require("@/assets/logo/logo.jpg");

export default function LoginScreen() {
  const { setUser } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setUser({ name: username, isGuest: false });
    router.replace("/(tabs)/dashboard");
  };

  const handleGuest = () => {
    setUser({ name: "Guest Student", isGuest: true });
    router.replace("/(tabs)/dashboard");
  };

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
        {/* Hero header */}
        <LinearGradient
          colors={["#C41E3A", "#8B0000", "#166534"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroTopGlow} />
          <View style={styles.heroBottomGlow} />

          <View style={styles.brandRow}>
            <View style={styles.brandLogo}>
              <Image source={logoSource} style={styles.brandLogoImg} contentFit="contain" />
            </View>
            <View>
              <Text style={styles.brandTitle}>Crash Course</Text>
              <Text style={styles.brandSubtitle}>Health Care Professionals</Text>
            </View>
          </View>

          <View style={styles.heroTextBlock}>
            <Text style={styles.heroTitle}>Welcome Back 👋</Text>
            <Text style={styles.heroSubtitle}>Sign in to continue your medical journey</Text>
          </View>
        </LinearGradient>

        {/* Form card */}
        <View style={[styles.formCard, { marginTop: -24 }]}>
          <Text style={styles.formTitle}>Sign In</Text>

          {/* Username */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Username</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color={colors.mutedForeground} />
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                placeholderTextColor={colors.mutedForeground}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.mutedForeground} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={colors.mutedForeground}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.forgotRow}>
            <TouchableOpacity>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Login button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Guest button */}
          <TouchableOpacity
            style={styles.guestButton}
            onPress={handleGuest}
            activeOpacity={0.85}
          >
            <Ionicons name="person-circle-outline" size={20} color={colors.green} />
            <Text style={styles.guestButtonText}>Continue as Guest</Text>
          </TouchableOpacity>

          <Text style={styles.signupText}>
            New to Crash Course?{" "}
            <Text
              style={styles.signupLink}
              onPress={() => router.push("/register")}
            >
              Create Account
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
    paddingBottom: 32,
  },
  hero: {
    paddingTop: 96,
    paddingBottom: 64,
    paddingHorizontal: 24,
    overflow: "hidden",
  },
  heroTopGlow: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  heroBottomGlow: {
    position: "absolute",
    bottom: -30,
    left: -30,
    width: 144,
    height: 144,
    borderRadius: 72,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  brandLogo: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.white,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    ...shadows.md,
  },
  brandLogoImg: {
    width: 56,
    height: 56,
  },
  brandTitle: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 31,
  },
  brandSubtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginTop: 4,
  },
  heroTextBlock: {
    marginTop: 20,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "700",
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 14,
    marginTop: 4,
  },
  formCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.foreground,
    marginBottom: 24,
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
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.foreground,
    paddingVertical: 0,
  },
  forgotRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.primary,
  },
  errorBox: {
    backgroundColor: "#FFF0F2",
    borderWidth: 1,
    borderColor: "#FECDD3",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.primary,
    fontSize: 13,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.md,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  guestButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingVertical: 16,
  },
  guestButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.green,
  },
  signupText: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 13,
    color: colors.mutedForeground,
  },
  signupLink: {
    color: colors.primary,
    fontWeight: "600",
  },
});
