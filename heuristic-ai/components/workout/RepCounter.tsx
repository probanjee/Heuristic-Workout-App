/**
 * HeuristicAI — Rep Counter Component
 * Features large tap target, scale animation, haptic feedback, and target display
 * Source of truth: TASK.md § 5, UI_UX_BRIEF.md
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography } from '@/constants/theme';
import { Minus, Plus } from 'lucide-react-native';

interface RepCounterProps {
  completedReps: number;
  targetReps: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function RepCounter({
  completedReps,
  targetReps,
  onIncrement,
  onDecrement,
}: RepCounterProps) {
  const scale = useSharedValue(1);
  const rippleOpacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    opacity: rippleOpacity.value,
    transform: [{ scale: withSpring(rippleOpacity.value ? 1 : 0.8) }],
  }));

  const handleIncrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Scale spring animation sequence
    scale.value = withSequence(
      withSpring(0.92, { damping: 5, stiffness: 300 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );

    // Flash ripple
    rippleOpacity.value = 0.3;
    rippleOpacity.value = withTiming(0, { duration: 450 });

    onIncrement();
  };

  const handleDecrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDecrement();
  };

  return (
    <View style={styles.container}>
      {/* Target reps label */}
      <Text style={styles.targetLabel} accessibilityLabel={`Target reps is ${targetReps}`}>
        TARGET: {targetReps} REPS
      </Text>

      {/* Large Tap Target */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleIncrement}
        accessibilityLabel={`Completed reps is ${completedReps}. Tap to increment.`}
        accessibilityRole="button"
      >
        <Animated.View style={[styles.tapArea, animatedStyle]}>
          {/* Ripple effect view */}
          <Animated.View style={[styles.ripple, rippleStyle]} />
          
          <Text style={styles.repNumber}>{completedReps}</Text>
          <Text style={styles.tapInstruction}>TAP TO ADD REPS</Text>
        </Animated.View>
      </TouchableOpacity>

      {/* Decrement Correction Control */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleDecrement}
          disabled={completedReps === 0}
          accessibilityLabel="Decrease completed reps"
          accessibilityRole="button"
        >
          <Minus size={20} color={completedReps > 0 ? colors.text.secondary : colors.text.muted} />
        </TouchableOpacity>
        <Text style={styles.controlText}>CORRECT REPS</Text>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleIncrement}
          accessibilityLabel="Increase completed reps"
          accessibilityRole="button"
        >
          <Plus size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: spacing[4],
  },
  targetLabel: {
    fontFamily: 'Syne_700Bold',
    fontSize: 12,
    color: colors.text.muted,
    letterSpacing: 1,
    marginBottom: spacing[3],
  },
  tapArea: {
    width: 180,
    height: 180,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.accent.primary,
    backgroundColor: colors.bg.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  ripple: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: colors.accent.primary,
    borderRadius: 8,
  },
  repNumber: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 80,
    lineHeight: 88,
    color: colors.text.primary,
    zIndex: 1,
  },
  tapInstruction: {
    fontFamily: 'Syne_700Bold',
    fontSize: 10,
    color: colors.accent.primary,
    letterSpacing: 1,
    marginTop: spacing[1],
    zIndex: 1,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    marginTop: spacing[4],
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlText: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 12,
    color: colors.text.muted,
    letterSpacing: 0.5,
  },
});
