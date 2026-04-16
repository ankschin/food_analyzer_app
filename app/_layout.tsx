import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import "../global.css";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#0c0a09" },
          headerTintColor: "#a8a29e",
          headerTitleStyle: { fontWeight: "700", color: "#fafaf9" },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: "#0c0a09" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "NutriScan 🍽️" }} />
        <Stack.Screen name="result" options={{ title: "Nutrition Analysis" }} />
        <Stack.Screen name="history" options={{ title: "Session History" }} />
      </Stack>
    </QueryClientProvider>
  );
}
