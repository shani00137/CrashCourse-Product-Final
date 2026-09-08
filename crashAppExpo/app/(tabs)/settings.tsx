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
  Modal,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, gradients, radii, shadows } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { changePlan, isTrialByDates } from "@/services/api";
import { Avatar } from "@/components/Avatar";
import { Toggle } from "@/components/Toggle";
import { Separator } from "@/components/Separator";
import { Button } from "@/components/Button";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addYearsISO(n: number) {
  const d = new Date();
  d.setFullYear(d.getFullYear() + n);
  return d.toISOString().slice(0, 10);
}

function parseDate(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

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
  const { user, logout, updateUser } = useApp();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [username, setUsername] = useState(user?.username || "");
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    "Push Notifications": true,
    "Email Notifications": false,
    "Dark Mode": false,
    "Two-Factor Auth": false,
  });
  const [saved, setSaved] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [planFrom, setPlanFrom] = useState(todayISO());
  const [planTo, setPlanTo] = useState(addYearsISO(1));
  const [planSaving, setPlanSaving] = useState(false);
  const [planMessage, setPlanMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const previewTrial = isTrialByDates(
    parseDate(planFrom) ? planFrom : undefined,
    planTo
  );

  const handleChangePlan = async () => {
    if (!user?.appUserId) {
      setPlanMessage({ ok: false, text: "You must be logged in to change your plan." });
      return;
    }
    const fromDate = parseDate(planFrom) ? planFrom : undefined;
    const toDate = parseDate(planTo);
    if (!toDate) {
      setPlanMessage({ ok: false, text: "Use a valid To date in YYYY-MM-DD format." });
      return;
    }
    setPlanSaving(true);
    setPlanMessage(null);
    try {
      const res = await changePlan({
        appUserId: user.appUserId,
        fromDate,
        toDate: planTo,
      });
      if (res.succeeded) {
        const nextTrial = isTrialByDates(fromDate, res.expiryDate || toDate.toISOString());
        updateUser({
          isTrial: nextTrial,
          planExpiry: res.expiryDate ? res.expiryDate.slice(0, 10) : planTo,
        });
        setPlanMessage({ ok: true, text: "Plan updated." });
        setPlanModalOpen(false);
      } else {
        setPlanMessage({
          ok: false,
          text: res.message || "Failed to update the plan.",
        });
      }
    } catch (e) {
      setPlanMessage({
        ok: false,
        text: e instanceof Error ? e.message : "Failed to update the plan.",
      });
    } finally {
      setPlanSaving(false);
    }
  };

  const handleSave = () => {
    setEditMode(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const profileFields = [
    { icon: "person-outline", label: "Full Name", value: name, setter: setName },
    { icon: "at-outline", label: "Username", value: username, setter: setUsername },
    { icon: "mail-outline", label: "Email", value: email, setter: setEmail },
    { icon: "call-outline", label: "Phone", value: phone, setter: setPhone },
    { icon: "location-outline", label: "Address", value: address, setter: setAddress },
  ];

  const handleLogout = () => {
    logout();
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
                {user?.isGuest
                  ? "Guest"
                  : user?.isTrial
                    ? "Trial · 5 days"
                    : "Premium Student"}
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

          {/* Plan management */}
          {user && !user.isGuest ? (
            <View style={styles.sectionCard}>
              <View style={styles.planHeader}>
                <Text style={styles.sectionTitle}>Your Plan</Text>
                <View
                  style={[
                    styles.planBadge,
                    user.isTrial ? styles.planBadgeTrial : styles.planBadgePro,
                  ]}
                >
                  <Ionicons
                    name={user.isTrial ? "time-outline" : "diamond-outline"}
                    size={12}
                    color={colors.white}
                  />
                  <Text style={styles.planBadgeText}>
                    {user.isTrial ? "Trial" : "Pro"}
                  </Text>
                </View>
              </View>
              <Text style={styles.planSubtitle}>
                {user.isTrial
                  ? "You're on the 5-day free trial. Set a Pro date range for unrestricted access."
                  : `Premium plan active${
                      user.planExpiry ? ` until ${user.planExpiry}` : ""
                    }.`}
              </Text>
              <TouchableOpacity
                style={styles.planButton}
                onPress={() => {
                  setPlanFrom(todayISO());
                  setPlanTo(addYearsISO(1));
                  setPlanMessage(null);
                  setPlanModalOpen(true);
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="swap-horizontal" size={16} color={colors.white} />
                <Text style={styles.planButtonText}>Change Plan Dates</Text>
              </TouchableOpacity>
              {planMessage ? (
                <View
                  style={[
                    styles.planMessage,
                    planMessage.ok ? styles.planMessageOk : styles.planMessageErr,
                  ]}
                >
                  <Text
                    style={[
                      styles.planMessageText,
                      planMessage.ok
                        ? styles.planMessageTextOk
                        : styles.planMessageTextErr,
                    ]}
                  >
                    {planMessage.text}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

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

      {/* Change plan modal */}
      <Modal
        visible={planModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPlanModalOpen(false)}
      >
        <View style={styles.planModalOverlay}>
          <View style={styles.planModalCard}>
            <View style={styles.planModalHeader}>
              <View style={styles.planModalHeaderText}>
                <Text style={styles.planModalTitle}>Change Plan</Text>
                <Text style={styles.planModalSubtitle}>
                  Set the active period for this account.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.planModalClose}
                onPress={() => setPlanModalOpen(false)}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={18} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <Text style={styles.planFieldLabel}>Active From (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.planDateInput}
              value={planFrom}
              onChangeText={setPlanFrom}
              placeholder="e.g. 2026-09-08"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
            />

            <Text style={[styles.planFieldLabel, styles.planFieldLabelSpacing]}>
              Active Until (YYYY-MM-DD)
            </Text>
            <TextInput
              style={styles.planDateInput}
              value={planTo}
              onChangeText={setPlanTo}
              placeholder="e.g. 2027-09-08"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
            />

            <View style={styles.planPreviewBox}>
              <Ionicons
                name={previewTrial ? "time-outline" : "diamond-outline"}
                size={16}
                color={previewTrial ? colors.amber : colors.green}
              />
              <Text style={styles.planPreviewText}>
                Resulting plan:{" "}
                <Text
                  style={{
                    fontWeight: "700",
                    color: previewTrial ? colors.amber : colors.green,
                  }}
                >
                  {previewTrial ? "Trial (5 days)" : "Pro"}
                </Text>
              </Text>
            </View>

            <View style={styles.planModalActions}>
              <TouchableOpacity
                style={[styles.planModalBtn, styles.planModalBtnGhost]}
                onPress={() => setPlanModalOpen(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.planModalBtnGhostText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.planModalBtn, styles.planModalBtnPrimary]}
                onPress={handleChangePlan}
                disabled={planSaving}
                activeOpacity={0.85}
              >
                {planSaving ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.planModalBtnPrimaryText}>Apply Plan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  planBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  planBadgeTrial: {
    backgroundColor: colors.amber,
  },
  planBadgePro: {
    backgroundColor: colors.green,
  },
  planBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "700",
  },
  planSubtitle: {
    fontSize: 13,
    color: colors.mutedForeground,
    marginBottom: 14,
  },
  planButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingVertical: 14,
    ...shadows.sm,
  },
  planButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
  planMessage: {
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  planMessageOk: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  planMessageErr: {
    backgroundColor: "#FFF0F2",
    borderColor: "#FECDD3",
  },
  planMessageText: {
    fontSize: 12,
    fontWeight: "500",
  },
  planMessageTextOk: {
    color: "#166534",
  },
  planMessageTextErr: {
    color: colors.primary,
  },
  planModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  planModalCard: {
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: 20,
    ...shadows.md,
  },
  planModalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  planModalHeaderText: {
    flex: 1,
    paddingRight: 12,
  },
  planModalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.foreground,
  },
  planModalSubtitle: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 4,
  },
  planModalClose: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  planFieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.mutedForeground,
    marginBottom: 8,
  },
  planFieldLabelSpacing: {
    marginTop: 16,
  },
  planDateInput: {
    height: 48,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.foreground,
    ...shadows.sm,
  },
  planPreviewBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  planPreviewText: {
    flex: 1,
    fontSize: 13,
    color: colors.foreground,
  },
  planModalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  planModalBtn: {
    flex: 1,
    height: 46,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  planModalBtnGhost: {
    backgroundColor: colors.muted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  planModalBtnPrimary: {
    backgroundColor: colors.primary,
  },
  planModalBtnGhostText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.foreground,
  },
  planModalBtnPrimaryText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.white,
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
