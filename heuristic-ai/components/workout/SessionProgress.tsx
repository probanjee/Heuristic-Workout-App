/**
 * HeuristicAI — Session Progress Footer Component
 * Displays real-time session stats: volume, sets, fatigue index, and time at the bottom of the screen
 * Source of truth: TASK.md § 11, UI_UX_BRIEF.md
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { useWorkoutStore } from '@/store/workout.store';
import { calculateTotalVolume, calculateAverageRPE } from '@/services/workout-summary';
import { getFatigueLevel } from '@/heuristic-engine/fatigue';

interface SessionProgressProps {
  formattedTime: string;
}

export function SessionProgress({ formattedTime }: SessionProgressProps) {
  const { sets, sessionFatigueIndex } = useWorkoutStore();

  const totalVolume = calculateTotalVolume(sets);
  const avgRpe = calculateAverageRPE(sets);
  const completedSets = sets.length;
  const fatigueLevel = getFatigueLevel(sessionFatigueIndex);

  // Fatigue status color
  let fatigueColor: string = colors.accent.primary;
  if (fatigueLevel === 'high') {
    fatigueColor = colors.danger;
  } else if (fatigueLevel === 'moderate') {
    fatigueColor = colors.warning;
  }

  return (
    <View style={styles.container}>
      {/* Volume column */}
      <View style={styles.statCol}>
        <Text style={styles.statLabel}>VOLUME</Text>
        <Text style={styles.statValue} accessibilityLabel={`Total volume is ${totalVolume} kilograms`}>
          {totalVolume.toFixed(0)}
          <Text style={styles.statUnit}>KG</Text>
        </Text>
      </View>

      {/* Sets column */}
      <View style={styles.statCol}>
        <Text style={styles.statLabel}>SETS LOGGED</Text>
        <Text style={styles.statValue} accessibilityLabel={`${completedSets} sets completed`}>
          {completedSets}
        </Text>
      </View>

      {/* Fatigue index column */}
      <View style={styles.statCol}>
        <Text style={styles.statLabel}>FATIGUE</Text>
        <Text
          style={[styles.statValue, { color: fatigueColor }]}
          accessibilityLabel={`Fatigue level is ${fatigueLevel}`}
        >
          {fatigueLevel.toUpperCase()}
          {sessionFatigueIndex > 0 && (
            <Text style={styles.fatigueNumber}> ({sessionFatigueIndex.toFixed(1)})</Text>
          )}
        </Text>
      </View>

      {/* Session Time column */}
      <View style={styles.statCol}>
        <Text style={styles.statLabel}>DURATION</Text>
        <Text style={styles.statValue} accessibilityLabel={`Session duration is ${formattedTime}`}>
          {formattedTime}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 72,
    backgroundColor: colors.bg.secondary,
    borderTopWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontFamily: 'Syne_700Bold',
    fontSize: 9,
    color: colors.text.muted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 16,
    color: colors.text.primary,
  },
  statUnit: {
    fontFamily: 'Syne_700Bold',
    fontSize: 10,
    color: colors.text.secondary,
  },
  fatigueNumber: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 11,
    color: colors.text.secondary,
  },
});
