import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useApp } from "@/context/AppContext";
import { checkAppUserStatus } from "@/services/api";

const POLL_INTERVAL_MS = 30_000;

/**
 * Invisible component placed inside <AppProvider> that forces a logout
 * whenever the logged-in user's account is blocked server-side.
 *
 * Two triggers are handled:
 *   1. Push notification with title matching "Account Block" (foreground tap).
 *   2. Background polling every 30 s that calls CheckAppUserStatus.
 */
export default function AccountBlockWatchdog() {
  const router = useRouter();
  const { user, logout, userLoaded } = useApp();
  const handledRef = useRef(false);

  const forceLogout = () => {
    if (handledRef.current) return;
    handledRef.current = true;
    logout();
    router.replace("/login");
  };

  // React to "Account Block" push notifications (foreground & tap)
  useEffect(() => {
    handledRef.current = false;

    const receivedSub = Notifications.addNotificationReceivedListener((n) => {
      const title = (n.request.content.title ?? "").toLowerCase();
      if (/account block/.test(title)) {
        forceLogout();
      }
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener((res) => {
      const title = (res.notification.request.content.title ?? "").toLowerCase();
      if (/account block/.test(title)) {
        forceLogout();
      }
    });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, [user?.appUserId]);

  // Background polling fallback
  useEffect(() => {
    if (!userLoaded || !user?.appUserId || user.isGuest) return;

    handledRef.current = false;

    const id = setInterval(async () => {
      const active = await checkAppUserStatus(user.appUserId!);
      if (!active) forceLogout();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(id);
  }, [user?.appUserId, user?.isGuest, userLoaded]);

  return null;
}
