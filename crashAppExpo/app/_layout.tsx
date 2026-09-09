import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";
import { AppProvider } from "@/context/AppContext";

export default function RootLayout() {
  const router = useRouter();

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
    <AppProvider>
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
        <Stack.Screen name="exercise" options={{ presentation: "modal", animation: "slide_from_right" }} />
        <Stack.Screen name="test" options={{ presentation: "modal", animation: "slide_from_right" }} />
        <Stack.Screen name="ai-agent" options={{ presentation: "modal", animation: "slide_from_right" }} />
      </Stack>
    </AppProvider>
  );
}
