// app/index.tsx
import { Redirect } from "expo-router";
import { useAuthStore } from "@/utils/authStore";

export default function Index() {
  const { hasCompletedOnboarding } = useAuthStore();

  // 👇 If they already finished onboarding → Go to app
  if (hasCompletedOnboarding) {
    return <Redirect href="/(tabs)" />;
  }

  // 👇 Otherwise → go to onboarding
  return <Redirect href="/onboarding" />;
}
