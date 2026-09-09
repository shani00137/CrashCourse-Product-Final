import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { updateAppUserToken } from "@/services/api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

let tokenListenerSubscribed = false;

function subscribeToDeviceTokenChanges(appUserId: number): void {
  if (tokenListenerSubscribed) return;
  tokenListenerSubscribed = true;
  Notifications.addPushTokenListener((devicePushToken) => {
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
  if (Platform.OS !== "android") return;
  try {
    await Notifications.setNotificationChannelAsync("high_importance_channel", {
      name: "High Importance Notifications",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
    });
  } catch {
    // Best-effort: delivery falls back to the default channel.
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();
    let granted = current.granted;
    if (!granted) {
      const requested = await Notifications.requestPermissionsAsync();
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
 */
export async function registerDeviceNotifications(appUserId: number | undefined): Promise<void> {
  if (!appUserId) return;
  await ensureNotificationsChannel();
  const granted = await requestNotificationPermissions();
  if (!granted || Platform.OS !== "android") return;
  try {
    const devicePushToken = await Notifications.getDevicePushTokenAsync();
    if (typeof devicePushToken.data === "string" && devicePushToken.data.length > 0) {
      await updateAppUserToken(appUserId, devicePushToken.data);
    }
  } catch {
    // Token may be unavailable until Firebase config is present; the listener
    // below submits it as soon as one is issued.
  }
  subscribeToDeviceTokenChanges(appUserId);
}