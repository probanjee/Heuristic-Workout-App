/**
 * HeuristicAI — SummaryHero Component
 * Renders high-impact overall training metrics with Brutalist aesthetic and Moti animations.
 * Source of truth: TASK.md (M6 Task 8), UI_UX_BRIEF.md § 8
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { colors, spacing } from '@/constants/theme';

interface SummaryHeroProps {
  totalVolumeKg: number;
  durationSeconds: number;
  avgRpe: number;
}

export function SummaryHero({ totalVolumeKg, durationSeconds, avgRpe }: SummaryHeroProps) {
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  const durationStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      <MotiView
        from={{ opacity: 0, translateY: -15 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 400 }}
      >
        <Text style={styles.greatWork} accessibilityRole="header">
          GREAT WORK
        </Text>
      </MotiView>

      <View style={styles.grid}>
        {/* Total Volume */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.card}
          accessibilityLabel={`Total volume logged: ${totalVolumeKg.toFixed(0)} kilograms`}
        >
          <Text style={styles.label}>VOLUME LOGGED</Text>
          <Text style={styles.value}>
            {totalVolumeKg.toFixed(0)}
            <Text style={styles.unit}>kg</Text>
          </Text>
        </MotiView>

        {/* Avg RPE */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 200 }}
          style={styles.card}
          accessibilityLabel={`Average Rate of Perceived Exertion: ${avgRpe.toFixed(1)}`}
        >
          <Text style={styles.label}>AVERAGE RPE</Text>
          <Text style={styles.value}>{avgRpe.toFixed(1)}</Text>
        </MotiView>

        {/* Duration */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 300 }}
          style={styles.card}
          accessibilityLabel={`Workout duration: ${durationStr}`}
        >
          <Text style={styles.label}>DURATION</Text>
          <Text style={styles.value}>{durationStr}</Text>
        </MotiView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  greatWork: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 32,
    color: colors.accent.primary,
    letterSpacing: -1,
    marginBottom: spacing[5],
  },
  grid: {
    flexDirection: 'row',
    gap: spacing[2],
    width: '100%',
  },
  card: {
    flex: 1,
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'Syne_700Bold',
    fontSize: 9,
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  value: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 22,
    color: colors.text.primary,
    textAlign: 'center',
  },
  unit: {
    fontFamily: 'Syne_700Bold',
    fontSize: 12,
    color: colors.text.secondary,
  },
});
