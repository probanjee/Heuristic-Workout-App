/**
 * HeuristicAI — ProgressEmptyState Component
 * Displays empty state details with a CTA to launch a training session.
 * Source of truth: TASK.md (M6 Task 22), UI_UX_BRIEF.md § 8
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Play, TrendingUp } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';

interface ProgressEmptyStateProps {
  onStartWorkout: () => void;
  message?: string;
}

export function ProgressEmptyState({
  onStartWorkout,
  message = 'No training records found in this range. Complete a session to generate analytics.',
}: ProgressEmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <TrendingUp size={32} color={colors.accent.primary} />
      </View>
      <Text style={styles.title}>NO TRAINING DATA</Text>
      <Text style={styles.message}>{message}</Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={onStartWorkout}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Start your first workout session"
      >
        <Play size={14} color={colors.text.inverse} strokeWidth={2.5} />
        <Text style={styles.btnText}>START FIRST WORKOUT</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    padding: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: spacing[4],
  },
  iconWrapper: {
    width: 64,
    height: 64,
    backgroundColor: colors.bg.primary,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  title: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 16,
    color: colors.text.primary,
    letterSpacing: 0.5,
    marginBottom: spacing[2],
  },
  message: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing[4],
    marginBottom: spacing[5],
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    backgroundColor: colors.accent.primary,
    borderRadius: 8,
    paddingHorizontal: spacing[5],
    paddingVertical: 12,
    alignSelf: 'center',
  },
  btnText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 12,
    color: colors.text.inverse,
    letterSpacing: 0.5,
  },
});
