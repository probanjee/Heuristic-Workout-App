/**
 * HeuristicAI — Onboarding: Training Level (Step 3 of 7)
 * Choose experience level
 * Source of truth: APP_FLOW.md § 2, TASK.md Task 5, UI_UX_BRIEF.md
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInRight } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useOnboarding } from '@/hooks/useOnboarding';
import { LevelCard } from '@/components/onboarding/LevelCard';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { colors, spacing } from '@/constants/theme';
import type { TrainingLevel } from '@/heuristic-engine/types';

const LEVEL_OPTIONS: {
  key: TrainingLevel;
  label: string;
  description: string;
  detail: string;
}[] = [
  {
    key: 'beginner',
    label: 'Beginner',
    description: 'Less than 6 months of consistent training.',
    detail: 'Focus on base capacity, linear load, and form guidelines.',
  },
  {
    key: 'intermediate',
    label: 'Intermediate',
    description: '6 months to 2 years of consistent training.',
    detail: 'Balanced progression with standard fatigue adjustments.',
  },
  {
    key: 'advanced',
    label: 'Advanced',
    description: 'More than 2 years of consistent training.',
    detail: 'Aggressive progression, tighter fatigue margins, complex scaling.',
  },
];

export default function LevelScreen() {
  const router = useRouter();
  const { trainingLevel, setTrainingLevel, currentStep, totalSteps } = useOnboarding();

  const handleSelect = (key: TrainingLevel) => {
    Haptics.selectionAsync();
    setTrainingLevel(key);
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(onboarding)/equipment');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        {/* Onboarding Header */}
        <OnboardingHeader
          currentStep={getCurrentStepIndex()}
          totalSteps={totalSteps}
          title="What is your training level?"
          subtitle="This dictates your progression rate and the sensitivity thresholds of the coach."
        />

        {/* Level Options */}
        <View style={styles.list}>
          {LEVEL_OPTIONS.map((option, index) => {
            const isSelected = trainingLevel === option.key;
            return (
              <Animated.View
                key={option.key}
                entering={FadeInRight.delay(index * 100).duration(500)}
              >
                <LevelCard
                  label={option.label}
                  description={option.description}
                  detail={option.detail}
                  isSelected={isSelected}
                  onPress={() => handleSelect(option.key)}
                />
              </Animated.View>
            );
          })}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.nextButton, !trainingLevel && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!trainingLevel}
          accessibilityLabel="Continue to equipment list"
          accessibilityRole="button"
        >
          <Text style={styles.nextButtonText}>CONTINUE</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function getCurrentStepIndex() {
  return 2;
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
