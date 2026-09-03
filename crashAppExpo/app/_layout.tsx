import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AppProvider } from "@/context/AppContext";

export default function RootLayout() {
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
