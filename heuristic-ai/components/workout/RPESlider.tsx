/**
 * HeuristicAI — RPE Slider Overlay Component
 * Full-screen Brutalist overlay for rating perceived exertion (1-10) with 15s auto-submit
 * Source of truth: TASK.md § 7, UI_UX_BRIEF.md § 6.3
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  SlideInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography } from '@/constants/theme';

interface RPESliderProps {
  isOpen: boolean;
  exerciseName: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  onSubmit: (rpe: number, estimated: boolean) => void;
}

const RPE_COLORS: Record<number, string> = {
  1: '#3B8AFF',
  2: '#3B8AFF',
  3: '#00FF87',
  4: '#00FF87',
  5: '#00FF87',
  6: '#FFB830',
  7: '#FFB830',
  8: '#FF8800',
  9: '#FF3B3B',
  10: '#FF3B3B',
};

const RPE_LABELS: Record<number, string> = {
  1: 'Rest / Active Recovery',
  2: 'Warmup / Very Light',
  3: 'Easy (Could do 5+ more reps)',
  4: 'Light (Could do 4 more reps)',
  5: 'Moderate (Could do 3 more reps)',
  6: 'Somewhat Hard (Could do 2 more reps)',
  7: 'Hard (Could do 1 more rep)',
  8: 'Very Hard (Could do 0.5 more reps)',
  9: 'Max Effort (Failure imminent)',
  10: 'Absolute Max (Absolute failure)',
};

const AUTO_DISMISS_MS = 15000;

export function RPESlider({
  isOpen,
  exerciseName,
  setNumber,
  weightKg,
  reps,
  onSubmit,
}: RPESliderProps) {
  const [timeLeft, setTimeLeft] = useState(AUTO_DISMISS_MS);
  const progressWidth = useSharedValue(1); // 1 = full, 0 = empty
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(AUTO_DISMISS_MS);
      progressWidth.value = 1;
      
      // Smooth progress bar animation
      progressWidth.value = withTiming(0, { duration: AUTO_DISMISS_MS });

      // Tick timer every 1000ms
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1000) {
            clearInterval(timerRef.current!);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onSubmit(6, true); // Auto-submit RPE 6 as estimated
            return 0;
          }
          return prev - 1000;
        });
      }, 1000); // We only tick the remaining seconds display every 1s for performance
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (rpe: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (timerRef.current) clearInterval(timerRef.current);
    onSubmit(rpe, false);
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (timerRef.current) clearInterval(timerRef.current);
    onSubmit(6, true); // Default RPE 6 (estimated)
  };

  const secondsLeft = Math.ceil(timeLeft / 1000);

  // Animated styles for bottom countdown progress bar
  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  return (
    <Modal visible={isOpen} transparent animationType="none" statusBarTranslucent>
      <View style={styles.overlay}>
        <Animated.View entering={SlideInDown.springify().damping(18)} style={styles.sheet}>
          {/* Header info */}
          <View style={styles.header}>
            <Text style={styles.title}>HOW WAS THAT SET?</Text>
            <Text style={styles.subtitle}>
              Set {setNumber} • {exerciseName} • {weightKg.toFixed(1)}kg × {reps} reps
            </Text>
          </View>

          {/* Grid of 1-10 numbers */}
          <View style={styles.grid}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
              const rpeColor = RPE_COLORS[num];
              return (
                <TouchableOpacity
                  key={num}
                  style={[styles.rpeButton, { borderColor: colors.border.default }]}
                  onPress={() => handleSelect(num)}
                  accessibilityLabel={`RPE ${num}: ${RPE_LABELS[num]}`}
                  accessibilityRole="button"
                >
                  <Text style={[styles.rpeNumber, { color: rpeColor }]}>{num}</Text>
                  <Text style={styles.rpeSubtext} numberOfLines={1}>
                    {num === 1 ? 'EASY' : num === 5 ? 'MOD' : num === 10 ? 'MAX' : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Description of active selection / labels */}
          <View style={styles.footerNote}>
            <Text style={styles.scaleHint}>
              1 = Rest, 5 = Moderate, 10 = Maximum Exertion
            </Text>
          </View>

          {/* Skip CTA */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              accessibilityLabel="Skip rating this set, defaults to RPE 6"
              accessibilityRole="button"
            >
              <Text style={styles.skipButtonText}>SKIP (USE RPE 6)</Text>
            </TouchableOpacity>
            <Text style={styles.timerCountdownText}>Auto-submits in {secondsLeft}s</Text>
          </View>

          {/* Countdown Progress Bar */}
          <View style={styles.progressContainer}>
            <Animated.View style={[styles.progressBar, progressBarStyle]} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.bg.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bg.secondary,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingTop: spacing[6],
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  title: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 22,
    color: colors.text.primary,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    justifyContent: 'center',
    marginBottom: spacing[6],
  },
  rpeButton: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[1],
  },
  rpeNumber: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 22,
  },
  rpeSubtext: {
    fontFamily: 'Syne_700Bold',
    fontSize: 8,
    color: colors.text.muted,
    marginTop: 2,
  },
  footerNote: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  scaleHint: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 12,
    color: colors.text.muted,
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
    paddingHorizontal: spacing[2],
  },
  skipButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  skipButtonText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 11,
    color: colors.text.secondary,
    letterSpacing: 0.5,
  },
  timerCountdownText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 12,
    color: colors.text.muted,
  },
  progressContainer: {
    width: '100%',
    height: 4,
    backgroundColor: colors.border.default,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.accent.primary,
  },
});
