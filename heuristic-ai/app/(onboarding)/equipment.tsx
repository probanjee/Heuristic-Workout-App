/**
 * HeuristicAI — Onboarding: Equipment Selection (Step 4 of 7)
 * Choose available training equipment
 * Source of truth: APP_FLOW.md § 2, TASK.md Task 6, UI_UX_BRIEF.md
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInRight } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useOnboarding } from '@/hooks/useOnboarding';
import { EquipmentChip } from '@/components/onboarding/EquipmentChip';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { colors, spacing } from '@/constants/theme';
import type { EquipmentType } from '@/heuristic-engine/types';

const EQUIPMENT_OPTIONS: {
  key: EquipmentType;
  label: string;
  emoji: string;
}[] = [
  { key: 'bodyweight', label: 'Bodyweight only', emoji: '🏃' },
  { key: 'dumbbells', label: 'Dumbbells', emoji: '🏋️' },
  { key: 'barbell', label: 'Barbell & rack', emoji: '🏗️' },
  { key: 'cable', label: 'Cable machine', emoji: '⚙️' },
  { key: 'bands', label: 'Resistance bands', emoji: '🔁' },
  { key: 'full_gym', label: 'Full gym access', emoji: '🏟️' },
];

export default function EquipmentScreen() {
  const router = useRouter();
  const { equipment, toggleEquipment, setEquipment, totalSteps } = useOnboarding();

  const handleSelectAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEquipment(EQUIPMENT_OPTIONS.map((o) => o.key));
  };

  const handleClearAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEquipment([]);
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(onboarding)/injuries');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        {/* Onboarding Header */}
        <OnboardingHeader
          currentStep={getCurrentStepIndex()}
          totalSteps={totalSteps}
          title="What do you have access to?"
          subtitle="HeuristicAI filters out exercises requiring equipment you do not have."
        />

        {/* Bulk select actions */}
        <View style={styles.bulkRow}>
          <TouchableOpacity
            onPress={handleSelectAll}
            accessibilityLabel="Select all equipment options"
            accessibilityRole="button"
          >
            <Text style={styles.bulkText}>SELECT ALL</Text>
          </TouchableOpacity>
          <Text style={styles.bulkDivider}>|</Text>
          <TouchableOpacity
            onPress={handleClearAll}
            accessibilityLabel="Clear all equipment selections"
            accessibilityRole="button"
          >
            <Text style={styles.bulkText}>CLEAR ALL</Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable Chip Options */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {EQUIPMENT_OPTIONS.map((option, index) => {
            const isSelected = equipment.includes(option.key);
            return (
              <Animated.View
                key={option.key}
                entering={FadeInRight.delay(index * 60).duration(400)}
              >
                <EquipmentChip
                  label={option.label}
                  emoji={option.emoji}
                  isSelected={isSelected}
                  onPress={() => {
                    Haptics.selectionAsync();
                    toggleEquipment(option.key);
                  }}
                />
              </Animated.View>
            );
          })}
        </ScrollView>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.nextButton, equipment.length === 0 && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={equipment.length === 0}
          accessibilityLabel="Continue to injuries screen"
          accessibilityRole="button"
        >
          <Text style={styles.nextButtonText}>CONTINUE</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function getCurrentStepIndex() {
  return 3;
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
  bulkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  bulkText: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 11,
    color: colors.accent.primary,
    letterSpacing: 0.5,
  },
  bulkDivider: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 11,
    color: colors.border.default,
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
