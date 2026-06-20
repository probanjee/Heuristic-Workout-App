/**
 * HeuristicAI — Onboarding: Goals Selection (Step 2 of 7)
 * Choose training goal
 * Source of truth: APP_FLOW.md § 2, TASK.md Task 4, UI_UX_BRIEF.md
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { Target, Zap, Clock, Flame, LucideIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useOnboarding } from '@/hooks/useOnboarding';
import { GoalCard } from '@/components/onboarding/GoalCard';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { colors, spacing } from '@/constants/theme';
import type { GoalType } from '@/heuristic-engine/types';

const GOAL_OPTIONS: {
  key: GoalType;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    key: 'strength',
    label: 'Strength',
    description: 'Heavy compound lifts, low reps, longer rest intervals.',
    icon: Target,
  },
  {
    key: 'hypertrophy',
    label: 'Hypertrophy',
    description: 'Moderate weight, 8–12 reps, volume-based progression.',
    icon: Zap,
  },
  {
    key: 'endurance',
    label: 'Endurance',
    description: 'Light weight, high reps, circuits, minimal rest.',
    icon: Clock,
  },
  {
    key: 'fat_loss',
    label: 'Fat Loss',
    description: 'Preserve muscle tissue while optimizing calorie burn.',
    icon: Flame,
  },
];

export default function GoalsScreen() {
  const router = useRouter();
  const { goal, setGoal, currentStep, totalSteps } = useOnboarding();

  const handleSelect = (key: GoalType) => {
    Haptics.selectionAsync();
    setGoal(key);
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(onboarding)/level');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        {/* Onboarding Header */}
        <OnboardingHeader
          currentStep={getCurrentStepIndex()}
          totalSteps={totalSteps}
          title="What is your primary goal?"
          subtitle="The heuristic engine adapts its volume and load rules to match this objective."
        />

        {/* Goal Cards Grid */}
        <View style={styles.list}>
          {GOAL_OPTIONS.map((option, index) => {
            const isSelected = goal === option.key;
            return (
              <Animated.View
                key={option.key}
                entering={FadeInRight.delay(index * 100).duration(500)}
              >
                <GoalCard
                  label={option.label}
                  description={option.description}
                  icon={option.icon}
                  isSelected={isSelected}
                  onPress={() => handleSelect(option.key)}
                />
              </Animated.View>
            );
          })}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.nextButton, !goal && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!goal}
          accessibilityLabel="Continue to training experience"
          accessibilityRole="button"
        >
          <Text style={styles.nextButtonText}>CONTINUE</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Inline helper to resolve the exact step index since useOnboarding relies on pathnames
function getCurrentStepIndex() {
  return 1;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  inner: {
    flex: 1,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[6],
    paddingBottom: spacing[4],
  },
  list: {
    flex: 1,
    marginTop: spacing[2],
  },
  nextButton: {
    backgroundColor: colors.accent.primary,
    borderRadius: 8,
    paddingVertical: spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent.primary,
    marginTop: spacing[4],
  },
  nextButtonDisabled: {
    opacity: 0.4,
  },
  nextButtonText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 15,
    letterSpacing: 0.5,
    color: colors.text.inverse,
  },
});
