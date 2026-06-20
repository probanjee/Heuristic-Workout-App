/**
 * HeuristicAI — Onboarding Skip Button
 * Ghost Brutalist button for optional onboarding steps
 * Source of truth: TASK.md Task 4, UI_UX_BRIEF.md
 */

import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing } from '@/constants/theme';

interface SkipButtonProps {
  label?: string;
  onPress: () => void;
  accessibilityLabel?: string;
}

export const SkipButton: React.FC<SkipButtonProps> = ({
  label = 'SKIP FOR NOW',
  onPress,
  accessibilityLabel,
}) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
    >
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'IBMPlexSans_500Medium',
    fontSize: 14,
    color: colors.text.secondary,
    letterSpacing: 0.5,
  },
});

export default SkipButton;
