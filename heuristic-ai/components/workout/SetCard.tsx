/**
 * HeuristicAI — Set Card Component
 * Core workout component. Shows weight, reps, progress, and swipe-to-complete CTA
 * Source of truth: TASK.md § 4, UI_UX_BRIEF.md § 6.1
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { ChevronRight, Plus, Minus } from 'lucide-react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { RepCounter } from './RepCounter';

interface SetCardProps {
  exerciseName: string;
  muscleGroup: string;
  setNumber: number;
  totalSets: number;
  targetWeightKg: number;
  targetReps: number;
  completedReps: number;
  onRepsChange: (reps: number) => void;
  onWeightChange: (weight: number) => void;
  onComplete: () => void;
  onLongPressWeight: () => void;
}

const SWIPE_WIDTH = Dimensions.get('window').width - 64; // horizontal screen margins
const BUTTON_WIDTH = 60;
const SWIPE_THRESHOLD = SWIPE_WIDTH - BUTTON_WIDTH - 20;

export function SetCard({
  exerciseName,
  muscleGroup,
  setNumber,
  totalSets,
  targetWeightKg,
  targetReps,
  completedReps,
  onRepsChange,
  onWeightChange,
  onComplete,
  onLongPressWeight,
}: SetCardProps) {
  const [weight, setWeight] = useState(targetWeightKg);
  const swipeX = useSharedValue(0);

  // Sync weight state when targetWeightKg changes from store
  useEffect(() => {
    setWeight(targetWeightKg);
  }, [targetWeightKg]);

  const handleWeightChange = (delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const nextWeight = Math.max(0, weight + delta);
    // Round strictly to nearest 0.5kg
    const rounded = Math.round(nextWeight * 2) / 2;
    setWeight(rounded);
    onWeightChange(rounded);
  };

  // Pure worklet callback for Pan gesture events
  const onGestureEvent = (event: any) => {
    'worklet';
    swipeX.value = Math.max(0, Math.min(SWIPE_WIDTH - BUTTON_WIDTH, event.nativeEvent.translationX));
  };

  // Trigger completion check when swipe ends
  const onHandlerStateChange = (event: any) => {
    'worklet';
    if (event.nativeEvent.state === 5) { // END state
      if (swipeX.value >= SWIPE_THRESHOLD) {
        swipeX.value = withTiming(SWIPE_WIDTH - BUTTON_WIDTH, { duration: 150 });
        runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);
        runOnJS(onComplete)();
      } else {
        swipeX.value = withSpring(0, { damping: 12 });
      }
    }
  };

  const animatedSliderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: swipeX.value }],
  }));

  const animatedTrackStyle = useAnimatedStyle(() => {
    const opacity = 0.15 + (swipeX.value / SWIPE_THRESHOLD) * 0.35;
    return {
      backgroundColor: `rgba(0, 255, 135, ${opacity})`,
    };
  });

  const repsProgressRatio = Math.min(1, completedReps / targetReps);
  const isTargetMet = completedReps >= targetReps;

  return (
    <View style={styles.card}>
      {/* Exercise info header */}
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.exerciseName}>{exerciseName.toUpperCase()}</Text>
          <Text style={styles.muscleGroup}>{muscleGroup.toUpperCase()}</Text>
        </View>
        <Text style={styles.setNumber}>
          SET {setNumber} OF {totalSets}
        </Text>
      </View>

      {/* Weight Adjuster and Display */}
      <View style={styles.weightSection}>
        <View style={styles.steppersColumn}>
          <TouchableOpacity
            style={styles.weightBtn}
            onPress={() => handleWeightChange(2.5)}
            accessibilityLabel="Add 2.5 kilograms"
          >
            <Plus size={14} color={colors.accent.primary} />
            <Text style={styles.weightBtnText}>2.5</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.weightBtn}
            onPress={() => handleWeightChange(0.5)}
            accessibilityLabel="Add 0.5 kilograms"
          >
            <Plus size={14} color={colors.accent.primary} />
            <Text style={styles.weightBtnText}>0.5</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onLongPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onLongPressWeight();
          }}
          activeOpacity={0.8}
          style={styles.weightDisplayWrapper}
          accessibilityLabel={`Target weight is ${weight.toFixed(1)} kilograms. Long press to override.`}
        >
          <Text style={styles.weightText}>{weight.toFixed(1)}</Text>
          <Text style={styles.weightUnit}>KG</Text>
        </TouchableOpacity>

        <View style={styles.steppersColumn}>
          <TouchableOpacity
            style={styles.weightBtn}
            onPress={() => handleWeightChange(-0.5)}
            disabled={weight <= 0.5}
            accessibilityLabel="Subtract 0.5 kilograms"
          >
            <Minus size={14} color={colors.text.secondary} />
            <Text style={styles.weightBtnText}>0.5</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.weightBtn}
            onPress={() => handleWeightChange(-2.5)}
            disabled={weight <= 2.5}
            accessibilityLabel="Subtract 2.5 kilograms"
          >
            <Minus size={14} color={colors.text.secondary} />
            <Text style={styles.weightBtnText}>2.5</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Rep Counter Target Widget */}
      <RepCounter
        completedReps={completedReps}
        targetReps={targetReps}
        onIncrement={() => onRepsChange(completedReps + 1)}
        onDecrement={() => onRepsChange(Math.max(0, completedReps - 1))}
      />

      {/* Rep Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${repsProgressRatio * 100}%`,
                backgroundColor: isTargetMet ? colors.accent.primary : colors.warning,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: isTargetMet ? colors.accent.primary : colors.warning }]}>
          {completedReps}/{targetReps} reps
        </Text>
      </View>

      {/* Swipe to Complete Slider */}
      <View style={styles.swipeContainer}>
        <Animated.View style={[styles.swipeTrack, animatedTrackStyle]}>
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.View style={[styles.swipeHandle, animatedSliderStyle]}>
              <ChevronRight size={24} color={colors.text.inverse} strokeWidth={2.5} />
            </Animated.View>
          </PanGestureHandler>
          <View style={styles.swipeTextWrapper} pointerEvents="none">
            <Text style={styles.swipeText}>SWIPE RIGHT TO COMPLETE SET</Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    padding: spacing[4],
    marginHorizontal: spacing[4],
    marginVertical: spacing[2],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderColor: colors.border.subtle,
    paddingBottom: spacing[3],
    marginBottom: spacing[4],
  },
  exerciseName: {
    fontFamily: 'Syne_700Bold',
    fontSize: 16,
    color: colors.text.primary,
  },
  muscleGroup: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  setNumber: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 12,
    color: colors.accent.primary,
  },
  weightSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  steppersColumn: {
    gap: spacing[2],
  },
  weightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 6,
    backgroundColor: colors.bg.primary,
    paddingHorizontal: spacing[2],
    paddingVertical: 6,
    minWidth: 52,
  },
  weightBtnText: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 11,
    color: colors.text.secondary,
  },
  weightDisplayWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  weightText: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 56,
    lineHeight: 60,
    color: colors.text.primary,
    textAlign: 'center',
  },
  weightUnit: {
    fontFamily: 'Syne_700Bold',
    fontSize: 12,
    color: colors.text.muted,
    letterSpacing: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[6],
    width: '100%',
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border.default,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 12,
    minWidth: 70,
    textAlign: 'right',
  },
  swipeContainer: {
    height: 52,
    width: '100%',
    position: 'relative',
  },
  swipeTrack: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  swipeHandle: {
    width: BUTTON_WIDTH,
    height: 50,
    borderRadius: 7,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  swipeTextWrapper: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  swipeText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 10,
    color: colors.text.secondary,
    letterSpacing: 1,
  },
});
