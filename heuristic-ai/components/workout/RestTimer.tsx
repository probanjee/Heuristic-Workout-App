/**
 * HeuristicAI — Rest Timer Component
 * Displays circular SVG countdown timer with next-set preview, skip/add controls, and dynamic colors
 * Source of truth: TASK.md § 6, UI_UX_BRIEF.md § 6.2
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography } from '@/constants/theme';
import { useWorkoutStore } from '@/store/workout.store';
import { Play, Plus } from 'lucide-react-native';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface RestTimerProps {
  totalSeconds: number;
  onComplete?: () => void;
  nextWeightKg?: number;
  nextReps?: number;
}

export function RestTimer({ totalSeconds, onComplete, nextWeightKg, nextReps }: RestTimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [currentTotal, setCurrentTotal] = useState(totalSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { skipRest } = useWorkoutStore();

  const progress = useSharedValue(1); // 1 = full, 0 = done

  // SVG parameters
  const size = 200;
  const strokeWidth = 6;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  // Track progress and trigger interval ticking
  useEffect(() => {
    // Start timing animation
    progress.value = remaining / currentTotal;
    progress.value = withTiming(0, {
      duration: remaining * 1000,
      easing: Easing.linear,
    });

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onComplete?.();
          return 0;
        }

        // Light haptic warning triggers at 20s and 10s left
        if (prev === 21 || prev === 11) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else if (prev <= 6) {
          // Soft ticks for the final 5 seconds
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentTotal]); // restart if total rest time is extended

  // Animated properties for SVG Circle
  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - progress.value);
    
    // Interpolate colors based on progress ratio:
    // Green (1.0 -> 0.22) -> Amber (0.22 -> 0.11) -> Red (0.11 -> 0.0)
    // representing full duration down to last 20s and last 10s of a default 90s timer
    const strokeColor = interpolateColor(
      progress.value,
      [0, 0.11, 0.22, 1],
      [colors.danger, colors.danger, colors.warning, colors.accent.primary]
    );

    return {
      strokeDashoffset,
      stroke: strokeColor,
    };
  });

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (intervalRef.current) clearInterval(intervalRef.current);
    skipRest();
  };

  const handleAdd30s = () => {
    Haptics.selectionAsync();
    const newRemaining = remaining + 30;
    const newTotal = currentTotal + 30;
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRemaining(newRemaining);
    setCurrentTotal(newTotal);

    // Re-interpolate animation
    progress.value = newRemaining / newTotal;
  };

  // Determine current text color based on urgency
  let timerTextColor: string = colors.text.primary;
  if (remaining <= 10) {
    timerTextColor = colors.danger;
  } else if (remaining <= 20) {
    timerTextColor = colors.warning;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>REST TIMER</Text>

      {/* SVG Ring Container */}
      <View style={styles.timerRingWrapper}>
        <Svg width={size} height={size} style={styles.svg}>
          {/* Background circle track */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.border.default}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active animated circle progress */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            fill="transparent"
            strokeLinecap="square"
            animatedProps={animatedProps}
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        {/* Absolute Centered Countdown Text */}
        <View style={styles.countdownCenter}>
          <Text style={[styles.timer, { color: timerTextColor }]}>{timeStr}</Text>
        </View>
      </View>

      {/* Next set preview */}
      {nextWeightKg !== undefined && nextReps !== undefined && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewLabel}>NEXT SET PREVIEW</Text>
          <Text style={styles.previewValue}>
            {nextWeightKg.toFixed(1)} KG × {nextReps} REPS
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          accessibilityLabel="Skip rest timer and start next set"
          accessibilityRole="button"
        >
          <Play size={16} color={colors.text.inverse} strokeWidth={2.5} />
          <Text style={styles.skipButtonText}>SKIP REST</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAdd30s}
          accessibilityLabel="Add 30 seconds to rest"
          accessibilityRole="button"
        >
          <Plus size={16} color={colors.text.secondary} strokeWidth={2} />
          <Text style={styles.addButtonText}>+30S</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing[4],
    backgroundColor: colors.bg.primary,
  },
  label: {
    fontFamily: 'Syne_700Bold',
    fontSize: 12,
    color: colors.text.muted,
    letterSpacing: 2,
    marginBottom: spacing[4],
  },
  timerRingWrapper: {
    position: 'relative',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  svg: {
    position: 'absolute',
  },
  countdownCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 44,
    textAlign: 'center',
  },
  previewContainer: {
    alignItems: 'center',
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    marginBottom: spacing[6],
    width: '90%',
  },
  previewLabel: {
    fontFamily: 'Syne_700Bold',
    fontSize: 9,
    color: colors.text.muted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  previewValue: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 16,
    color: colors.accent.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[3],
    width: '90%',
  },
  skipButton: {
    flex: 2,
    backgroundColor: colors.accent.primary,
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  skipButtonText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 14,
    letterSpacing: 0.5,
    color: colors.text.inverse,
  },
  addButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.secondary,
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
  },
  addButtonText: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 13,
    color: colors.text.secondary,
  },
});
