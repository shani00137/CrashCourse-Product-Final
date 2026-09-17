import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { usePreventScreenCapture } from "expo-screen-capture";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider } from "@/context/AppContext";
import AccountBlockWatchdog from "@/components/AccountBlockWatchdog";

export default function RootLayout() {
  const router = useRouter();

  // Block screenshots and screen recording for the whole app. On Android this
  // sets FLAG_SECURE, which blocks the three-finger swipe screenshot gesture,
  // hardware-key combos, and screen recorders, and blanks the recents preview.
  usePreventScreenCapture();

  // Route taps on "Exam Test." notifications to the test screen, mirroring the
  // old Flutter app's behavior of opening the pending test.
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const title = response.notification.request.content.title ?? "";
        if (/exam test/i.test(title)) {
          router.push("/test");
        }
      }
    );
    return () => sub.remove();
  }, [router]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <AccountBlockWatchdog />
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade",
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="exercise" options={{ presentation: "modal", animation: "slide_from_bottom", gestureEnabled: true }} />
          <Stack.Screen name="test" options={{ presentation: "modal", animation: "slide_from_right" }} />
          <Stack.Screen name="ai-agent" options={{ presentation: "modal", animation: "slide_from_right" }} />
        </Stack>
      </AppProvider>
    </GestureHandlerRootView>
  );
}
