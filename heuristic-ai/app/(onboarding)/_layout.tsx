/**
 * HeuristicAI — Onboarding Layout
 * Stack navigation for the complete 7-step onboarding flow
 * Source of truth: APP_FLOW.md § 2, TASK.md Task 5
 */

import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0A0A0A' },
        animation: 'slide_from_right',
        animationDuration: 250,
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="goals" />
      <Stack.Screen name="level" />
      <Stack.Screen name="equipment" />
      <Stack.Screen name="injuries" />
      <Stack.Screen name="baseline" />
      <Stack.Screen name="account" />
    </Stack>
  );
}
