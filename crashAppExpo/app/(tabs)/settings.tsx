import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, gradients, radii, shadows } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { Avatar } from "@/components/Avatar";
import { Toggle } from "@/components/Toggle";
import { Separator } from "@/components/Separator";
import { Button } from "@/components/Button";

const settingGroups = [
  {
    title: "Notifications",
    items: [
      { icon: "notifications-outline", label: "Push Notifications", type: "toggle", value: true },
      { icon: "mail-outline", label: "Email Notifications", type: "toggle", value: false },
    ],
  },
  {
    title: "Appearance",
    items: [
      { icon: "moon-outline", label: "Dark Mode", type: "toggle", value: false },
      { icon: "globe-outline", label: "Language", type: "nav", value: "English" },
    ],
  },
  {
    title: "Security",
    items: [
      { icon: "shield-checkmark-outline", label: "Change Password", type: "nav", value: "" },
      { icon: "shield-half-outline", label: "Two-Factor Auth", type: "toggle", value: false },
    ],
  },
];

export default function SettingsScreen() {
  const { user, setUser } = useApp();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState("student@quizmaster.com");
  const [phone, setPhone] = useState("+1 234 567 8901");
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    "Push Notifications": true,
    "Email Notifications": false,
    "Dark Mode": false,
    "Two-Factor Auth": false,
  });
  const [saved, setSaved] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const handleSave = () => {
    setEditMode(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const profileFields = [
    { icon: "person-outline", label: "Full Name", value: name, setter: setName },
    { icon: "mail-outline", label: "Email", value: email, setter: setEmail },
    { icon: "call-outline", label: "Phone", value: phone, setter: setPhone },
  ];

  const handleLogout = () => {
    setUser(null);
    router.replace("/login");
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <LinearGradient
          colors={gradients.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerGlow} />
          <View style={styles.titleRow}>
            <Text style={styles.pageTitle}>Profile & Settings</Text>
          </View>

          <View style={styles.avatarBlock}>
            <View>
              <Avatar name={name} size={80} />
              <TouchableOpacity style={styles.cameraButton} activeOpacity={0.8}>
                <Ionicons name="camera" size={12} color={colors.white} />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>{name}</Text>
            <View style={styles.userTypeBadge}>
              <Text style={styles.userTypeText}>
                {user?.isGuest ? "Guest" : "Premium Student"}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Personal Info */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Personal Info</Text>
              <TouchableOpacity
                onPress={() => (editMode ? handleSave() : setEditMode(true))}
                activeOpacity={0.8}
                style={[styles.editButton, editMode && styles.editButtonActive]}
              >
                <Text style={[styles.editButtonText, editMode && { color: colors.white }]}>
                  {editMode ? "Save" : "Edit"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.profileFields}>
              {profileFields.map(({ icon, label, value, setter }) => (
                <View key={label} style={styles.profileRow}>
                  <View style={styles.profileIconBox}>
                    <Ionicons name={icon as any} size={16} color={colors.primary} />
                  </View>
                  <View style={styles.profileTextBlock}>
                    <Text style={styles.profileLabel}>{label}</Text>
                    {editMode ? (
                      <TextInput
                        value={value}
                        onChangeText={setter}
                        style={styles.profileInput}
                      />
                    ) : (
                      <Text style={styles.profileValue} numberOfLines={1}>{value}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>

            {saved && (
              <View style={styles.savedBox}>
                <Text style={styles.savedText}>✓ Profile saved successfully</Text>
              </View>
            )}
          </View>

          {/* Settings groups */}
          {settingGroups.map((group) => (
            <View key={group.title} style={[styles.sectionCard, styles.groupCard]}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              {group.items.map((item, idx) => (
                <View key={item.label}>
                  <View style={styles.settingRow}>
                    <View style={styles.settingIconBox}>
                      <Ionicons name={item.icon as any} size={16} color={colors.primary} />
                    </View>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                    {item.type === "toggle" ? (
                      <Toggle
                        value={toggles[item.label]}
                        onValueChange={(v) =>
                          setToggles((t) => ({ ...t, [item.label]: v }))
                        }
                      />
                    ) : (
                      <View style={styles.settingNavValue}>
                        <Text style={styles.settingValue}>{item.value}</Text>
                        <Ionicons name="chevron-forward" size={14} color={colors.mutedForeground} />
                      </View>
                    )}
                  </View>
                  {idx < group.items.length - 1 && <Separator style={styles.settingSeparator} />}
                </View>
              ))}
            </View>
          ))}

          {/* Logout */}
          <Button
            variant="destructive"
            size="lg"
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            <Ionicons name="log-out-outline" size={18} color="#EF4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </Button>

          <Text style={styles.footerText}>
            QuizMaster v1.0.0 · Terms · Privacy
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
  },
  header: {
    paddingTop: 88,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: "center",
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
  titleRow: {
    width: "100%",
    marginBottom: 24,
  },
  pageTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "800",
  },
  avatarBlock: {
    alignItems: "center",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.amber,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
  },
  userTypeBadge: {
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  userTypeText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    ...shadows.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.foreground,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
  },
  editButtonActive: {
    backgroundColor: colors.primary,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  profileFields: {
    gap: 12,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  profileTextBlock: {
    flex: 1,
  },
  profileLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.mutedForeground,
  },
  profileValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.foreground,
  },
  profileInput: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.foreground,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(196,30,58,0.3)",
    paddingBottom: 2,
    paddingVertical: 0,
  },
  savedBox: {
    marginTop: 12,
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    alignItems: "center",
  },
  savedText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#166534",
  },
  groupCard: {
    padding: 0,
    overflow: "hidden",
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.mutedForeground,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 8,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  settingIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: colors.foreground,
  },
  settingNavValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  settingValue: {
    fontSize: 13,
    color: colors.mutedForeground,
  },
  settingSeparator: {
    marginHorizontal: 18,
  },
  logoutButton: {
    marginTop: 4,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#EF4444",
  },
  footerText: {
    textAlign: "center",
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 16,
    marginBottom: 32,
  },
});
