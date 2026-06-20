/**
 * HeuristicAI — Workout Header Component
 * Shows exercise metadata, set progress, elapsed timer, and offline status
 * Source of truth: TASK.md § 3
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { WifiOff, Clock } from 'lucide-react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { useWorkoutTimer } from '@/hooks/useWorkoutTimer';

interface WorkoutHeaderProps {
  exerciseName: string;
  currentSetIndex: number;
  totalSets: number;
  musclePrimary: string;
  startedAt: number; // Unix ms
}

export function WorkoutHeader({
  exerciseName,
  currentSetIndex,
  totalSets,
  musclePrimary,
  startedAt,
}: WorkoutHeaderProps) {
  const [isOffline, setIsOffline] = useState(false);

  // Monitor connection state
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(state.isConnected === false);
    });
    return () => unsubscribe();
  }, []);

  // Compute initial elapsed seconds based on startedAt
  const initialSeconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
  const { formattedTime } = useWorkoutTimer(initialSeconds);

  return (
    <View style={styles.container}>
      {/* Top Metadata Row */}
      <View style={styles.topRow}>
        <View style={styles.badgeContainer}>
          <Text style={styles.setCountText}>
            SET {currentSetIndex}/{totalSets}
          </Text>
          <View style={styles.muscleBadge}>
            <Text style={styles.muscleText}>{musclePrimary.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.rightStats}>
          {isOffline && (
            <View style={styles.offlineBadge} accessibilityLabel="App is offline">
              <WifiOff size={12} color={colors.danger} />
              <Text style={styles.offlineText}>OFFLINE</Text>
            </View>
          )}
          <View style={styles.timerContainer}>
            <Clock size={12} color={colors.text.muted} />
            <Text style={styles.timerText} accessibilityLabel={`Elapsed time ${formattedTime}`}>
              {formattedTime}
            </Text>
          </View>
        </View>
      </View>

      {/* Main Exercise Title */}
      <Text
        style={styles.exerciseTitle}
        accessibilityLabel={`Current exercise: ${exerciseName}`}
        accessibilityRole="header"
      >
        {exerciseName.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.bg.primary,
    borderBottomWidth: 1,
    borderColor: colors.border.default,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  setCountText: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 12,
    color: colors.accent.primary,
    letterSpacing: 0.5,
  },
  muscleBadge: {
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: 4,
  },
  muscleText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 9,
    color: colors.text.secondary,
    letterSpacing: 0.5,
  },
  rightStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 59, 59, 0.08)',
    borderWidth: 1,
    borderColor: colors.border.danger,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: 4,
  },
  offlineText: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 9,
    color: colors.danger,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 13,
    color: colors.text.primary,
  },
  exerciseTitle: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 22,
    lineHeight: 26,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
});
