/**
 * HeuristicAI — SessionExerciseBreakdown Component
 * Displays exercise-by-exercise stats including volume, set counts, and peak weights.
 * Source of truth: TASK.md (M6 Task 11), UI_UX_BRIEF.md § 8
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@/constants/theme';
import type { ExerciseBreakdown } from '@/services/analytics/summary';

interface SessionExerciseBreakdownProps {
  breakdown: ExerciseBreakdown[];
}

export function SessionExerciseBreakdown({ breakdown }: SessionExerciseBreakdownProps) {
  if (!breakdown || breakdown.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>EXERCISE PERFORMANCE BREAKDOWN</Text>
      
      <View style={styles.list}>
        {breakdown.map((item, idx) => {
          let formScoreColor: string = colors.accent.primary;
          if (item.avgFormScore !== null) {
            if (item.avgFormScore < 70) {
              formScoreColor = colors.danger;
            } else if (item.avgFormScore < 90) {
              formScoreColor = colors.warning;
            }
          }

          return (
            <View
              key={idx}
              style={styles.item}
              accessibilityLabel={`${item.exerciseName}. ${item.setsCount} sets, total volume ${item.totalVolume} kg. Best set was ${item.bestWeightKg} kg for ${item.bestReps} reps.`}
            >
              <View style={styles.row}>
                <Text style={styles.name}>{item.exerciseName.toUpperCase()}</Text>
                {item.avgFormScore !== null && (
                  <View style={[styles.formBadge, { borderColor: formScoreColor }]}>
                    <Text style={[styles.formText, { color: formScoreColor }]}>
                      {item.avgFormScore}% FORM
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.statsRow}>
                <View>
                  <Text style={styles.label}>VOLUME & SETS</Text>
                  <Text style={styles.value}>
                    {item.setsCount} {item.setsCount === 1 ? 'SET' : 'SETS'} • {item.totalVolume.toFixed(0)} kg
                  </Text>
                </View>
                <View style={styles.alignRight}>
                  <Text style={styles.label}>BEST EFFORT</Text>
                  <Text style={styles.value}>
                    {item.bestWeightKg.toFixed(1)} kg × {item.bestReps}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontFamily: 'Syne_700Bold',
    fontSize: 11,
    color: colors.text.muted,
    letterSpacing: 1,
    marginBottom: spacing[3],
    textTransform: 'uppercase',
  },
  list: {
    gap: spacing[3],
  },
  item: {
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    padding: spacing[4],
    gap: spacing[3],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontFamily: 'Syne_700Bold',
    fontSize: 14,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing[2],
  },
  formBadge: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    backgroundColor: colors.bg.primary,
  },
  formText: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: colors.border.subtle,
    paddingTop: 10,
  },
  label: {
    fontFamily: 'Syne_700Bold',
    fontSize: 8,
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  value: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 12,
    color: colors.text.secondary,
  },
  alignRight: {
    alignItems: 'flex-end',
  },
});
