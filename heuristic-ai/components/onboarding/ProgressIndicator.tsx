/**
 * HeuristicAI — Onboarding Progress Indicator
 * Displays 7 horizontal bars with animated transitions
 * Source of truth: TASK.md Task 10, UI_UX_BRIEF.md
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { colors, spacing } from '@/constants/theme';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps?: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps = 7,
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isActive = index === currentStep;
        const isPast = index < currentStep;

        return (
          <Dot key={index} isActive={isActive} isPast={isPast} />
        );
      })}
    </View>
  );
};

interface DotProps {
  isActive: boolean;
  isPast: boolean;
}

const Dot: React.FC<DotProps> = ({ isActive, isPast }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(isActive ? 32 : 12, {
        damping: 15,
        stiffness: 150,
      }),
      backgroundColor: isActive
        ? colors.accent.primary
        : isPast
        ? colors.text.secondary
        : colors.border.default,
    };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginVertical: spacing[4],
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
});

export default ProgressIndicator;
