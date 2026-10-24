import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStripe, initStripe } from "@stripe/stripe-react-native";
import { radii, shadows, type ThemePalette } from "@/constants/theme";
import { useTheme, useThemedStyles } from "@/context/ThemeContext";
import { useApp } from "@/context/AppContext";
import {
  createStripePaymentIntent,
  confirmStripePayment,
  getStripePlan,
  requestProUpgrade,
  type StripePlanInfo,
} from "@/services/api";
import {
  formatStripeAmount,
  GOOGLE_PAY_ENABLED,
  STRIPE_MERCHANT_COUNTRY,
  STRIPE_PUBLISHABLE_KEY,
} from "@/constants/payments";

type StatusKind = "info" | "error" | "success" | "pending";
type Status = { kind: StatusKind; text: string } | null;

const BENEFITS = [
  "Unlimited access to every course and exercise",
  "Full-length mock tests with instant results",
  "AI question explanations and study help",
  "No ads, priority support and progress analytics",
];

const UNAVAILABLE_MESSAGE =
  "Card payments aren't available in this build yet. Install the latest version of the app, or request a manual upgrade below.";

/** Google Pay is Android-only and needs a dev/production build. */
const USE_GOOGLE_PAY = GOOGLE_PAY_ENABLED && Platform.OS === "android";

/**
 * Pro paywall. Checkout runs through Stripe's native PaymentSheet, which
 * offers card and (on Android dev/production builds) Google Pay. The amount is
 * always priced by the backend from the course object.
 */
export default function UpgradeScreen() {
  const { colors, gradients } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { user, updateUser } = useApp();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  // When the user buys a course from the course store we arrive with
  // ?courseId=…&courseName=…&coursePrice=…; the purchase also enrolls them in
  // it. coursePrice is the course object's sale rate, passed for display only —
  // the backend re-reads the real price when it creates the PaymentIntent.
  const params = useLocalSearchParams<{
    courseId?: string;
    courseName?: string;
    coursePrice?: string;
  }>();
  const selectedCourseId = Number(params.courseId) || 0;
  const selectedCourseName = (params.courseName ?? "").trim();
  const selectedCourseRate = Number(params.coursePrice) || 0;

  const [plan, setPlan] = useState<StripePlanInfo | null>(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  // Optional AI Assistant add-on ($10 static) the user can add at checkout.
  const [addAI, setAddAI] = useState(false);

  // The publishable key the SDK was initialized with; the backend can override
  // the env fallback at runtime via GET /Stripe/Plan.
  const publishableKey = plan?.publishableKey || STRIPE_PUBLISHABLE_KEY;

  const signedIn = !!user && !user.isGuest;
  const configured = !!publishableKey && (!plan || plan.configured);
  const aiAvailable = !!plan?.aiAssistantAvailable;
  const currency = plan?.currency ?? "USD";

  useEffect(() => {
    let mounted = true;

    (async () => {
      const info = await getStripePlan();
      if (!mounted) return;
      setPlan(info);
      setPlanLoading(false);

      // If the backend owns the publishable key (and it differs from the env
      // fallback), re-initialize the native SDK with it so checkout works even
      // when the env value is unset.
      console.log("[stripe] publishable key:", info.publishableKey);
      if (info.publishableKey && info.publishableKey !== STRIPE_PUBLISHABLE_KEY) {
        try {
          await initStripe({
            publishableKey: info.publishableKey,
            merchantIdentifier: "merchant.com.crashcourse.app",
            urlScheme: "crashcourse",
          });
        } catch (e) {
          if (__DEV__) console.warn("[stripe] re-init with server key failed:", e);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const confirm = async (paymentIntentId: string) => {
    setStatus({ kind: "info", text: "Confirming your payment…" });
    try {
      const res = await confirmStripePayment({
        appUserId: user?.appUserId ?? 0,
        paymentIntentId: paymentIntentId || undefined,
        courseId: selectedCourseId || undefined,
        includeAIAssistant: addAI || undefined,
      });

      if (res.verified) {
        updateUser({
          isTrial: false,
          planExpiry: res.expiryDate,
          ...(res.isAIAllowed || addAI ? { isAIAllowed: true } : {}),
        });
        setBusy(false);
        setStatus({
          kind: "success",
          text:
            (selectedCourseId > 0
              ? "Course unlocked!"
              : "Welcome to Pro!") +
            (addAI ? " AI Assistant enabled." : " Enjoy full access."),
        });
        setTimeout(() => router.replace("/(tabs)/dashboard"), 1000);
      } else if (res.pending) {
        setBusy(false);
        setStatus({
          kind: "pending",
          text:
            res.message ||
            "Payment received. Your access will be activated after confirmation.",
        });
      } else {
        setBusy(false);
        setStatus({
          kind: "error",
          text: res.message || "We couldn't confirm this payment. Please try again.",
        });
      }
    } catch (e) {
      setBusy(false);
      setStatus({
        kind: "error",
        text:
          e instanceof Error
            ? e.message
            : "Confirmation failed. Please try again in a moment.",
      });
    }
  };

  const handleSubscribe = async () => {
    if (busy || !user?.appUserId) return;
    setStatus({ kind: "info", text: "Preparing secure checkout…" });
    setBusy(true);

    try {
      const res = await createStripePaymentIntent({
        appUserId: user.appUserId,
        courseId: selectedCourseId || undefined,
        includeAIAssistant: addAI || undefined,
      });

      if (!res.succeeded || !res.clientSecret) {
        setBusy(false);
        setStatus({
          kind: res.configured ? "error" : "pending",
          text: res.message || "Couldn't start the payment. Please try again.",
        });
        return;
      }

      // Initialize the native PaymentSheet with the intent's client secret.
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: "Crash Course",
        paymentIntentClientSecret: res.clientSecret,
        googlePay: USE_GOOGLE_PAY
          ? { merchantCountryCode: STRIPE_MERCHANT_COUNTRY, testEnv: __DEV__ }
          : undefined,
        allowsDelayedPaymentMethods: false,
        returnURL: "crashcourse://stripe-redirect",
      });

      if (initError) {
        setBusy(false);
        setStatus({
          kind: "error",
          text: initError.message || "Couldn't open the checkout. Please try again.",
        });
        return;
      }

      setStatus({ kind: "info", text: "Opening secure checkout…" });
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        setBusy(false);
        // A user dismissing the sheet isn't an error worth shouting about.
        if (presentError.code === "Canceled") {
          setStatus(null);
        } else {
          setStatus({
            kind: "error",
            text: presentError.message || "The payment didn't go through. Please try again.",
          });
        }
        return;
      }

      // PaymentSheet completed — verify server-side before granting access.
      await confirm(res.paymentIntentId ?? "");
    } catch (e) {
      setBusy(false);
      setStatus({
        kind: "error",
        text:
          e instanceof Error
            ? e.message
            : "Couldn't open the checkout. Please try again.",
      });
    }
  };

  const handleManualRequest = async () => {
    if (busy || !user?.appUserId) return;
    setBusy(true);
    setStatus({ kind: "info", text: "Sending your upgrade request…" });
    try {
      const res = await requestProUpgrade(user.appUserId);
      setStatus({
        kind: res.succeeded ? "pending" : "error",
        text:
          res.message ||
          (res.succeeded
            ? "Request sent. Your Pro access will be activated after approval."
            : "Couldn't send the request. Please try again."),
      });
    } catch (e) {
      setStatus({
        kind: "error",
        text: e instanceof Error ? e.message : "Couldn't send the request.",
      });
    } finally {
      setBusy(false);
    }
  };

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/home");
  };

  // Course purchases show the course object's sale rate; the Pro plan shows the
  // price the backend reports. Both are rendered as minor units by
  // formatStripeAmount, so the rate is converted here.
  const baseAmountCents =
    selectedCourseId > 0 && selectedCourseRate > 0
      ? Math.round(selectedCourseRate * 100)
      : plan?.amountCents ?? 0;

  const aiAmountCents = plan?.aiAssistantAmountCents ?? 0;
  const aiPriceLabel = formatStripeAmount(aiAmountCents, currency);
  const aiEnabled = addAI && aiAvailable && aiAmountCents > 0;

  const totalAmountCents = baseAmountCents + (aiEnabled ? aiAmountCents : 0);

  const basePriceLabel =
    baseAmountCents > 0 ? formatStripeAmount(baseAmountCents, currency) : "—";
  const priceLabel =
    totalAmountCents > 0 ? formatStripeAmount(totalAmountCents, currency) : "—";

  const buttonLabel =
    selectedCourseId > 0
      ? `Buy course — ${priceLabel}`
      : `Subscribe to Pro — ${priceLabel}`;

  return (
    <View style={styles.flex}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <LinearGradient
          colors={gradients.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroGlow} />

          <TouchableOpacity
            style={styles.backButton}
            onPress={goBack}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={18} color={colors.white} />
          </TouchableOpacity>

          <View style={styles.heroBadge}>
            <Ionicons name="diamond" size={14} color={colors.white} />
            <Text style={styles.heroBadgeText}>PRO</Text>
          </View>

          <Text style={styles.heroTitle}>
            {selectedCourseId > 0 ? "Unlock this course" : "Unlock everything"}
          </Text>
          <Text style={styles.heroSubtitle}>
            {selectedCourseId > 0
              ? `Pay once for full access to ${
                  selectedCourseName || "this course"
                } and every other course, test and study tool.`
              : "Subscribe to Pro and get unlimited access to every course, test and study tool."}
          </Text>

          {selectedCourseId > 0 ? (
            <View style={styles.courseChip}>
              <Ionicons name="book-outline" size={13} color={colors.white} />
              <Text style={styles.courseChipText} numberOfLines={1}>
                {selectedCourseName || "Selected course"}
              </Text>
            </View>
          ) : null}
        </LinearGradient>

        <View style={styles.content}>
          {!signedIn ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Sign in to upgrade</Text>
              <Text style={styles.cardText}>
                Create an account or sign in first, then subscribe to Pro.
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.replace("/login")}
                activeOpacity={0.9}
              >
                <Ionicons name="log-in-outline" size={18} color={colors.white} />
                <Text style={styles.primaryButtonText}>Go to Login</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Benefits */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>What you get</Text>
            {BENEFITS.map((b) => (
              <View key={b} style={styles.benefitRow}>
                <View style={styles.benefitIcon}>
                  <Ionicons name="checkmark" size={13} color={colors.white} />
                </View>
                <Text style={styles.benefitText}>{b}</Text>
              </View>
            ))}
          </View>

          {/* Plan */}
          <Text style={styles.sectionTitle}>
            {selectedCourseId > 0 ? "Your purchase" : "Your plan"}
          </Text>

          {planLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>Loading pricing…</Text>
            </View>
          ) : configured ? (
            <View style={[styles.planCard, styles.planCardSelected]}>
              <View style={[styles.planRadio, styles.planRadioSelected]}>
                <Ionicons name="checkmark" size={13} color={colors.white} />
              </View>
              <View style={styles.planTextBlock}>
                <Text style={styles.planTitle}>
                  {selectedCourseId > 0
                    ? selectedCourseName || "Course access"
                    : "Pro · Monthly"}
                </Text>
                <Text style={styles.planPeriod}>
                  {plan?.months === 1 ? "1 month" : `${plan?.months ?? 1} months`} of
                  full access
                </Text>
              </View>
              <Text style={styles.planPrice}>{basePriceLabel}</Text>
            </View>
          ) : (
            <View style={styles.errorBox}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={colors.redDeepText}
              />
              <Text style={styles.errorText}>{UNAVAILABLE_MESSAGE}</Text>
            </View>
          )}

          {/* Optional AI Assistant add-on */}
          {signedIn && configured && !planLoading && aiAvailable ? (
            <TouchableOpacity
              style={[styles.aiCard, addAI && styles.aiCardSelected]}
              onPress={() => setAddAI((v) => !v)}
              activeOpacity={0.9}
            >
              <View style={[styles.aiCheck, addAI && styles.aiCheckSelected]}>
                {addAI ? (
                  <Ionicons name="checkmark" size={14} color={colors.white} />
                ) : null}
              </View>
              <View style={styles.aiTextBlock}>
                <Text style={styles.aiTitle}>Smart AI Assistant</Text>
                <Text style={styles.aiSubtitle}>
                  {`Add AI explanations and study help for just $${plan?.aiAssistantUsd ?? 10}.`}
                </Text>
              </View>
              <Text style={styles.aiPrice}>{aiPriceLabel}</Text>
            </TouchableOpacity>
          ) : null}

          {/* Order summary when the add-on is selected */}
          {signedIn && configured && !planLoading && aiEnabled ? (
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  {selectedCourseId > 0 ? "Course" : "Pro plan"}
                </Text>
                <Text style={styles.summaryValue}>{basePriceLabel}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>AI Assistant</Text>
                <Text style={styles.summaryValue}>{aiPriceLabel}</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                <Text style={styles.summaryTotalLabel}>Total</Text>
                <Text style={styles.summaryTotalValue}>{priceLabel}</Text>
              </View>
            </View>
          ) : null}

          {/* Status */}
          {status ? (
            <View
              style={[
                styles.statusBox,
                status.kind === "error"
                  ? styles.statusError
                  : status.kind === "success"
                  ? styles.statusSuccess
                  : status.kind === "pending"
                  ? styles.statusPending
                  : styles.statusInfo,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  status.kind === "error"
                    ? styles.statusTextError
                    : status.kind === "success"
                    ? styles.statusTextSuccess
                    : status.kind === "pending"
                    ? styles.statusTextPending
                    : styles.statusTextInfo,
                ]}
              >
                {status.text}
              </Text>
            </View>
          ) : null}

          {/* CTA */}
          {signedIn && configured && !planLoading ? (
            <TouchableOpacity
              style={[styles.primaryButton, busy && styles.buttonDisabled]}
              onPress={handleSubscribe}
              activeOpacity={0.9}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Ionicons
                    name={USE_GOOGLE_PAY ? "logo-google" : "card-outline"}
                    size={18}
                    color={colors.white}
                  />
                  <Text style={styles.primaryButtonText}>{buttonLabel}</Text>
                </>
              )}
            </TouchableOpacity>
          ) : null}

          {USE_GOOGLE_PAY && signedIn && configured ? (
            <View style={styles.gpayNote}>
              <Ionicons name="logo-google" size={14} color={colors.textSecondary} />
              <Text style={styles.gpayNoteText}>
                Pay with Google Pay or card at checkout.
              </Text>
            </View>
          ) : null}

          {/* Fallback when card payments aren't configured yet, or the native
              module is missing: let the user request a manual upgrade instead
              of hitting a dead end. */}
          {signedIn && !planLoading && !configured ? (
            <TouchableOpacity
              style={[styles.primaryButton, busy && styles.buttonDisabled]}
              onPress={handleManualRequest}
              activeOpacity={0.9}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Ionicons name="send-outline" size={18} color={colors.white} />
                  <Text style={styles.primaryButtonText}>Request Manual Upgrade</Text>
                </>
              )}
            </TouchableOpacity>
          ) : null}

          <Text style={styles.legal}>
            One-time payment. Secure checkout is handled by Stripe; your card
            details never touch this app.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = ({ colors }: ThemePalette) =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    scrollContent: { paddingBottom: 40 },
    hero: {
      paddingTop: 96,
      paddingBottom: 40,
      paddingHorizontal: 24,
      overflow: "hidden",
    },
    heroGlow: {
      position: "absolute",
      top: -60,
      right: -60,
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: "rgba(255,255,255,0.08)",
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: radii.round,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.15)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.25)",
      marginBottom: 18,
    },
    heroBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      alignSelf: "flex-start",
      backgroundColor: "rgba(255,255,255,0.18)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.3)",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: radii.round,
      marginBottom: 14,
    },
    heroBadgeText: {
      color: colors.white,
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 1.5,
    },
    heroTitle: {
      color: colors.white,
      fontSize: 28,
      fontWeight: "800",
      marginBottom: 8,
    },
    heroSubtitle: {
      color: "rgba(255,255,255,0.9)",
      fontSize: 14,
      lineHeight: 21,
    },
    courseChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      alignSelf: "flex-start",
      maxWidth: "100%",
      backgroundColor: "rgba(255,255,255,0.18)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.3)",
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: radii.round,
      marginTop: 14,
    },
    courseChipText: {
      color: colors.white,
      fontSize: 12,
      fontWeight: "700",
      flexShrink: 1,
    },
    content: { padding: 20, gap: 16 },
    card: {
      backgroundColor: colors.card,
      borderRadius: radii.lg,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.sm,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.foreground,
      marginBottom: 12,
    },
    cardText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 14,
    },
    benefitRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 12,
    },
    benefitIcon: {
      width: 20,
      height: 20,
      borderRadius: radii.round,
      backgroundColor: colors.greenSolid,
      alignItems: "center",
      justifyContent: "center",
    },
    benefitText: {
      flex: 1,
      fontSize: 14,
      color: colors.foreground,
      lineHeight: 20,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.foreground,
      marginTop: 4,
    },
    planCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: colors.card,
      borderRadius: radii.md,
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderWidth: 2,
      borderColor: colors.border,
    },
    planCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight,
    },
    planRadio: {
      width: 22,
      height: 22,
      borderRadius: radii.round,
      borderWidth: 2,
      borderColor: colors.borderStrong,
      alignItems: "center",
      justifyContent: "center",
    },
    planRadioSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    planTextBlock: { flex: 1 },
    planTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.foreground,
    },
    planPeriod: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    planPrice: {
      fontSize: 17,
      fontWeight: "800",
      color: colors.primary,
    },
    aiCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: colors.card,
      borderRadius: radii.md,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderWidth: 2,
      borderColor: colors.border,
    },
    aiCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight,
    },
    aiCheck: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.borderStrong,
      alignItems: "center",
      justifyContent: "center",
    },
    aiCheckSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    aiTextBlock: { flex: 1 },
    aiTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.foreground,
    },
    aiSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
      lineHeight: 17,
    },
    aiPrice: {
      fontSize: 15,
      fontWeight: "800",
      color: colors.primary,
    },
    summaryBox: {
      backgroundColor: colors.card,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
    },
    summaryRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    summaryLabel: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    summaryValue: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.foreground,
    },
    summaryTotalRow: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 8,
      marginTop: 2,
    },
    summaryTotalLabel: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.foreground,
    },
    summaryTotalValue: {
      fontSize: 15,
      fontWeight: "800",
      color: colors.primary,
    },
    loadingBox: {
      alignItems: "center",
      gap: 10,
      paddingVertical: 28,
    },
    loadingText: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    errorBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.redLight,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.dangerBorderSoft,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    errorText: {
      flex: 1,
      fontSize: 13,
      color: colors.redDeepText,
    },
    statusBox: {
      borderRadius: radii.md,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    statusInfo: {
      backgroundColor: colors.subtleBg,
      borderColor: colors.border,
    },
    statusSuccess: {
      backgroundColor: colors.successBg,
      borderColor: colors.successBorder,
    },
    statusPending: {
      backgroundColor: colors.warningBg,
      borderColor: colors.warningBorder,
    },
    statusError: {
      backgroundColor: colors.redLight,
      borderColor: colors.dangerBorderSoft,
    },
    statusText: { fontSize: 13, lineHeight: 19 },
    statusTextInfo: { color: colors.textMuted },
    statusTextSuccess: { color: colors.green },
    statusTextPending: { color: colors.warningText },
    statusTextError: { color: colors.redDeepText },
    primaryButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.primary,
      borderRadius: radii.md,
      paddingVertical: 15,
      ...shadows.sm,
    },
    buttonDisabled: { opacity: 0.55 },
    primaryButtonText: {
      color: colors.white,
      fontSize: 15,
      fontWeight: "700",
    },
    gpayNote: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    gpayNoteText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    legal: {
      fontSize: 11,
      lineHeight: 16,
      color: colors.mutedForeground,
      textAlign: "center",
      marginTop: 6,
    },
  });
