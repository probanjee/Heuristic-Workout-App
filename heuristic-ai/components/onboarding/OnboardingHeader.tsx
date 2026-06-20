/**
 * HeuristicAI — Onboarding Header Component
 * Unified header displaying progress indicator, step label, and brutalist headings
 * Source of truth: TASK.md Task 4, UI_UX_BRIEF.md
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ProgressIndicator from './ProgressIndicator';
import { colors, spacing } from '@/constants/theme';

interface OnboardingHeaderProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
}

export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({
  currentStep,
  totalSteps,
  title,
  subtitle,
}) => {
  return (
    <View style={styles.container}>
      {/* 7-Dot Progress Indicator */}
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />

      {/* Step Label */}
      <Text style={styles.stepLabel}>
        STEP {currentStep + 1} OF {totalSteps}
      </Text>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Subtitle */}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[6],
  },
  stepLabel: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 12,
    color: colors.accent.primary,
    letterSpacing: 1,
    marginBottom: spacing[2],
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 32,
    lineHeight: 36,
    color: colors.text.primary,
    letterSpacing: -0.5,
    marginBottom: spacing[2],
  },
  subtitle: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
});

export default OnboardingHeader;
