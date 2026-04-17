import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  const [qc] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={qc}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#0f0f0f" },
          headerTitleStyle: { color: "#e5e5e5" },
          contentStyle: { backgroundColor: "#0f0f0f" },
        }}
      />
    </QueryClientProvider>
  );
}
