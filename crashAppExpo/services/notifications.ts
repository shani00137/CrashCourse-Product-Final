import { Platform } from "react-native";
import { isRunningInExpoGo } from "expo";
import type {
  Notification,
  NotificationResponse,
  Subscription,
} from "expo-notifications";
import { updateAppUserToken } from "@/services/api";

/**
 * Push notifications are not available in Expo Go on Android (SDK 53+). Worse,
 * merely importing `expo-notifications` runs module-level code
 * (`DevicePushTokenAutoRegistration`) that throws on Android in Expo Go, which
 * crashes the whole app at startup. So we load it lazily and only in a
 * development/standalone build, and expose no-op stand-ins everywhere else.
 */
export const pushNotificationsSupported = !isRunningInExpoGo();

type NotificationsModule = typeof import("expo-notifications");

let cached: NotificationsModule | null | undefined;

function getNotifications(): NotificationsModule | null {
  if (!pushNotificationsSupported) return null;
  if (cached === undefined) {
    try {
      // Lazy `require` keeps `expo-notifications` out of the Expo Go module
      // graph entirely; it is only evaluated in a real build.
      cached = require("expo-notifications") as NotificationsModule;
    } catch {
      cached = null;
    }
  }
  return cached;
}

const NOOP_SUBSCRIPTION: Subscription = { remove: () => {} };

// Configure foreground presentation once, in builds that support it.
const notifications = getNotifications();
if (notifications) {
  notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/** Safe wrapper: no-op in Expo Go, where `expo-notifications` is unavailable. */
export function addNotificationReceivedListener(
  listener: (notification: Notification) => void
): Subscription {
  const N = getNotifications();
  if (!N) return NOOP_SUBSCRIPTION;
  return N.addNotificationReceivedListener(listener);
}

/** Safe wrapper: no-op in Expo Go, where `expo-notifications` is unavailable. */
export function addNotificationResponseReceivedListener(
  listener: (response: NotificationResponse) => void
): Subscription {
  const N = getNotifications();
  if (!N) return NOOP_SUBSCRIPTION;
  return N.addNotificationResponseReceivedListener(listener);
}

let tokenListenerSubscribed = false;

function subscribeToDeviceTokenChanges(appUserId: number): void {
  const N = getNotifications();
  if (!N || tokenListenerSubscribed) return;
  tokenListenerSubscribed = true;
  N.addPushTokenListener((devicePushToken) => {
    if (Platform.OS !== "android") return;
    if (typeof devicePushToken.data === "string" && devicePushToken.data.length > 0) {
      void updateAppUserToken(appUserId, devicePushToken.data);
    }
  });
}

/**
 * Creates the same high-priority channel the old Flutter app used so exam /
 * account notifications behave identically on Android.
 */
export async function ensureNotificationsChannel(): Promise<void> {
  const N = getNotifications();
  if (!N || Platform.OS !== "android") return;
  try {
    await N.setNotificationChannelAsync("high_importance_channel", {
      name: "High Importance Notifications",
      importance: N.AndroidImportance.HIGH,
    });
  } catch {
    // Best-effort: delivery falls back to the default channel.
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const N = getNotifications();
  if (!N) return false;
  try {
    const current = await N.getPermissionsAsync();
    let granted = current.granted;
    if (!granted) {
      const requested = await N.requestPermissionsAsync();
      granted = requested.granted;
    }
    return granted;
  } catch {
    return false;
  }
}

/**
 * Registers the user's FCM token with the backend so it can push exam-ready,
 * account-blocked and chat notifications. Android-only: the backend sends via
 * the legacy FCM endpoint, so iOS APNs tokens must not be submitted.
 *
 * Does nothing in Expo Go, where remote push is unsupported.
 */
export async function registerDeviceNotifications(appUserId: number | undefined): Promise<void> {
  if (!appUserId || !pushNotificationsSupported) return;
  await ensureNotificationsChannel();
  const granted = await requestNotificationPermissions();
  if (!granted || Platform.OS !== "android") return;
  try {
    const N = getNotifications();
    if (!N) return;
    const devicePushToken = await N.getDevicePushTokenAsync();
    if (typeof devicePushToken.data === "string" && devicePushToken.data.length > 0) {
      await updateAppUserToken(appUserId, devicePushToken.data);
    }
  } catch {
    // Token may be unavailable until Firebase config is present; the listener
    // below submits it as soon as one is issued.
  }
  subscribeToDeviceTokenChanges(appUserId);
}
