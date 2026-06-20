/**
 * HeuristicAI — Onboarding: Injuries Selection (Step 5 of 7)
 * Choose injury restrictions to adjust exercise recommendation rules
 * Source of truth: APP_FLOW.md § 2, TASK.md Task 7, UI_UX_BRIEF.md
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { ShieldAlert } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useOnboarding } from '@/hooks/useOnboarding';
import { InjuryChip } from '@/components/onboarding/InjuryChip';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { colors, spacing } from '@/constants/theme';
import type { InjuryFlag } from '@/heuristic-engine/types';

const INJURY_OPTIONS: {
  key: InjuryFlag;
  label: string;
  description: string;
}[] = [
  { key: 'knees', label: 'Knees', description: 'Avoids deep squats, heavy lunges' },
  { key: 'lower_back', label: 'Lower Back', description: 'Avoids heavy spinal loading (deadlifts, rows)' },
  { key: 'shoulders', label: 'Shoulders', description: 'Avoids locking out overhead presses, high-angle dips' },
  { key: 'wrists', label: 'Wrists', description: 'Modifies pushup and press grips to reduce extension' },
  { key: 'hips', label: 'Hips', description: 'Avoids extreme hip flexion or loaded abduction' },
];

export default function InjuriesScreen() {
  const router = useRouter();
  const { injuryFlags, toggleInjury, setInjuryFlags, totalSteps } = useOnboarding();

  const isNoneSelected = injuryFlags.length === 0;

  const handleSelectNone = () => {
    Haptics.selectionAsync();
    // Clearing all flags represents selecting "None"
    setInjuryFlags([]);
  };

  const handleToggleInjury = (key: InjuryFlag) => {
    Haptics.selectionAsync();
    toggleInjury(key);
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(onboarding)/baseline');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        {/* Onboarding Header */}
        <OnboardingHeader
          currentStep={getCurrentStepIndex()}
          totalSteps={totalSteps}
          title="Any areas to avoid or be careful with?"
          subtitle="HeuristicAI restricts exercises that may aggravate these joints."
        />

        {/* Scrollable Chip Options */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {/* None Option */}
          <Animated.View entering={FadeInRight.delay(0).duration(400)}>
            <InjuryChip
              label="No injuries or flags"
              description="Full range of motion and loaded compound exercises enabled."
              isSelected={isNoneSelected}
              onPress={handleSelectNone}
              icon={ShieldAlert}
            />
          </Animated.View>

          {/* Injury Options */}
          {INJURY_OPTIONS.map((option, index) => {
            const isSelected = injuryFlags.includes(option.key);
            return (
              <Animated.View
                key={option.key}
                entering={FadeInRight.delay((index + 1) * 60).duration(400)}
              >
                <InjuryChip
                  label={option.label}
                  description={option.description}
                  isSelected={isSelected}
                  onPress={() => handleToggleInjury(option.key)}
                />
              </Animated.View>
            );
          })}
        </ScrollView>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          accessibilityLabel="Continue to baseline test screen"
          accessibilityRole="button"
        >
          <Text style={styles.nextButtonText}>CONTINUE</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function getCurrentStepIndex() {
  return 4;
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
  scroll: {
    flex: 1,
  },
  list: {
    paddingBottom: spacing[4],
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
  nextButtonText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 15,
    letterSpacing: 0.5,
    color: colors.text.inverse,
  },
});
