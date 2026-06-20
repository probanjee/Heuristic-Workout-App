/**
 * HeuristicAI â€” Set Counter Component
 * Displays current/target reps with large DM Mono numerals
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography } from '@/constants/theme';

interface SetCounterProps {
  completedReps: number;
  targetReps: number;
  onIncrement: () => void;
  onDecrement: () => void;
  weightKg: number;
  setNumber: number;
  totalSets: number;
}

export function SetCounter({
  completedReps,
  targetReps,
  onIncrement,
  onDecrement,
  weightKg,
  setNumber,
  totalSets,
}: SetCounterProps) {
  return (
    <View style={styles.container}>
      {/* Set indicator */}
      <Text style={styles.setLabel}>
        SET {setNumber} / {totalSets}
      </Text>

      {/* Weight display */}
      <Text style={styles.weightDisplay}>{weightKg.toFixed(1)} KG</Text>

      {/* Rep counter */}
      <View style={styles.repRow}>
        <TouchableOpacity
          style={styles.adjustButton}
          onPress={() => {
            Haptics.selectionAsync();
            onDecrement();
          }}
          accessibilityLabel="Decrease rep count"
        >
          <Text style={styles.adjustButtonText}>âˆ’</Text>
        </TouchableOpacity>

        <View style={styles.repDisplay}>
          <Text style={styles.repCount}>{completedReps}</Text>
          <Text style={styles.repTarget}>/{targetReps}</Text>
        </View>

        <TouchableOpacity
          style={styles.adjustButton}
          onPress={() => {
            Haptics.selectionAsync();
            onIncrement();
          }}
          accessibilityLabel="Increase rep count"
        >
          <Text style={styles.adjustButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Status indicator */}
      {completedReps < targetReps && (
        <Text style={styles.missedLabel}>
          {targetReps - completedReps} rep{targetReps - completedReps !== 1 ? 's' : ''} short
        </Text>
      )}
      {completedReps >= targetReps && (
        <Text style={styles.completedLabel}>Target hit âœ“</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: spacing[4] },
  setLabel: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 12,
    letterSpacing: 1,
    color: colors.text.muted,
    marginBottom: spacing[2],
  },
  weightDisplay: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 20,
    color: colors.accent.primary,
    marginBottom: spacing[6],
  },
  repRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[6],
  },
  adjustButton: {
    width: 56,
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustButtonText: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 28,
    color: colors.text.secondary,
  },
  repDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  repCount: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 80,
    lineHeight: 88,
    color: colors.text.primary,
  },
  repTarget: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 32,
    color: colors.text.muted,
    marginLeft: 4,
  },
  missedLabel: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 13,
    color: colors.danger,
    marginTop: spacing[3],
  },
  completedLabel: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 13,
    color: colors.accent.primary,
    marginTop: spacing[3],
  },
});

