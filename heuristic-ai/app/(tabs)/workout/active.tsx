/**
 * HeuristicAI — Active Workout Screen
 * Manages the live training loop, combining headers, cards, rest timers, and heuristic overlays
 * Source of truth: TASK.md § 2, APP_FLOW.md § 3
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Info, AlertCircle, Play, Video } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography } from '@/constants/theme';
import { useWorkoutStore } from '@/store/workout.store';
import { WorkoutHeader } from '@/components/workout/WorkoutHeader';
import { SetCard } from '@/components/workout/SetCard';
import { RestTimer } from '@/components/workout/RestTimer';
import { RPESlider } from '@/components/workout/RPESlider';
import { HeuristicBanner } from '@/components/workout/HeuristicBanner';
import { OverrideSheet } from '@/components/workout/OverrideSheet';
import { ExerciseSwipeList } from '@/components/workout/ExerciseSwipeList';
import { SessionProgress } from '@/components/workout/SessionProgress';
import { SessionEndModal } from '@/components/workout/SessionEndModal';
import { MiniDemoOverlay } from '@/components/workout/MiniDemoOverlay';
import { useWorkoutTimer } from '@/hooks/useWorkoutTimer';

export default function ActiveWorkout() {
  const router = useRouter();
  const {
    currentSession,
    currentExercise,
    exerciseQueue,
    currentExerciseIndex,
    sets,
    heuristicDecision,
    isResting,
    isRPEOpen,
    phase,
    logSet,
    submitRPE,
    acceptDecision,
    endSession,
    abandonSession,
  } = useWorkoutStore();

  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [completedReps, setCompletedReps] = useState(6);

  // Synchronized elapsed workout timer
  const startTime = currentSession?.startedAt || Date.now();
  const initialSeconds = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
  const { formattedTime } = useWorkoutTimer(initialSeconds);

  // Sync completed reps state to target reps when active set starts
  useEffect(() => {
    if (currentExercise && sets) {
      const exerciseSets = sets.filter((s) => s.exerciseSlug === currentExercise.slug);
      const nextSetNumber = exerciseSets.length + 1;
      
      const targetReps = nextSetNumber === 1
        ? 6
        : heuristicDecision?.nextSetTargetReps ?? 6;
      setCompletedReps(targetReps);
    }
  }, [currentExercise, sets, heuristicDecision]);

  if (!currentSession || !currentExercise) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <AlertCircle size={48} color={colors.danger} />
        <Text style={styles.errorText}>NO ACTIVE SESSION FOUND</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace('/workout')}
          accessibilityLabel="Return to workout home screen"
        >
          <Text style={styles.backBtnText}>GO BACK</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Calculate current set details
  const exerciseSets = sets.filter((s) => s.exerciseSlug === currentExercise.slug);
  const currentSetNumber = exerciseSets.length + 1;
  const totalSets = 4; // default target sets per exercise

  const targetWeightKg = currentSetNumber === 1
    ? 60 // starting baseline weight
    : heuristicDecision?.nextSetWeightKg ?? 60;

  const targetReps = currentSetNumber === 1
    ? 6
    : heuristicDecision?.nextSetTargetReps ?? 6;

  // Handle logging a completed set
  const handleLogSet = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await logSet(completedReps, targetWeightKg, null);
    } catch (err) {
      console.error('[ActiveWorkout] Error logging set:', err);
    }
  };

  // Handle submitting RPE
  const handleRPESubmit = async (rpe: number, estimated: boolean) => {
    try {
      await submitRPE(rpe, estimated);
    } catch (err) {
      console.error('[ActiveWorkout] Error submitting RPE:', err);
    }
  };

  // Handle confirming end session
  const handleConfirmEndSession = async () => {
    try {
      setIsEndModalOpen(false);
      await endSession();
      // Navigate to summary screen
      router.replace('/workout/summary');
    } catch (err) {
      console.error('[ActiveWorkout] Error ending session:', err);
    }
  };

  // Determine upcoming set values for the rest timer preview
  const nextWeight = heuristicDecision?.nextSetWeightKg ?? targetWeightKg;
  const nextReps = heuristicDecision?.nextSetTargetReps ?? targetReps;
  const restDuration = heuristicDecision?.additionalRestSeconds 
    ? 90 + heuristicDecision.additionalRestSeconds 
    : 90;

  const selectExercise = (index: number) => {
    useWorkoutStore.setState({
      currentExerciseIndex: index,
      currentExercise: exerciseQueue[index],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Workout Header */}
      <WorkoutHeader
        exerciseName={currentExercise.name}
        currentSetIndex={currentSetNumber}
        totalSets={totalSets}
        musclePrimary={currentExercise.musclePrimary}
        startedAt={startTime}
      />

      {/* Horizontal Exercise tab selector */}
      <ExerciseSwipeList
        exercises={exerciseQueue}
        currentExerciseIndex={currentExerciseIndex}
        onSelectExercise={selectExercise}
        sets={sets}
        disabled={isRPEOpen || isResting || phase === 'heuristic_review'}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollBody}
        showsVerticalScrollIndicator={false}
      >
        {/* Active phase layout controller */}
        {isResting ? (
          <View style={styles.restingContainer}>
            {phase === 'heuristic_review' && heuristicDecision ? (
              <HeuristicBanner
                decision={heuristicDecision}
                previousWeightKg={targetWeightKg}
                onAccept={acceptDecision}
                onOverride={() => setIsOverrideOpen(true)}
              />
            ) : (
              <RestTimer
                totalSeconds={restDuration}
                nextWeightKg={nextWeight}
                nextReps={nextReps}
                onComplete={() => useWorkoutStore.setState({ isResting: false, phase: 'pre_set' })}
              />
            )}
          </View>
        ) : (
          <View style={styles.activeContainer}>
            {/* Camera Overlay Placeholder */}
            <View style={styles.cameraPlaceholder}>
              <Video size={20} color={colors.text.muted} />
              <Text style={styles.cameraPlaceholderText}>
                CAMERA MODULE DEACTIVATED (PHASE 2 WORKFLOW)
              </Text>
            </View>

            {/* Set Card */}
            <SetCard
              exerciseName={currentExercise.name}
              muscleGroup={currentExercise.musclePrimary}
              setNumber={currentSetNumber}
              totalSets={totalSets}
              targetWeightKg={targetWeightKg}
              targetReps={targetReps}
              completedReps={completedReps}
              onRepsChange={setCompletedReps}
              onWeightChange={(w) => useWorkoutStore.setState({
                heuristicDecision: heuristicDecision ? { ...heuristicDecision, nextSetWeightKg: w } : null
              })}
              onComplete={handleLogSet}
              onLongPressWeight={() => setIsOverrideOpen(true)}
            />

            {/* Complete set button alternative for accessibility */}
            <TouchableOpacity
              style={styles.logSetBtn}
              onPress={handleLogSet}
              accessibilityLabel="Complete this set and log RPE"
              accessibilityRole="button"
            >
              <Text style={styles.logSetBtnText}>LOG SET {currentSetNumber}</Text>
            </TouchableOpacity>

            {/* Swipe up overlay hint */}
            <TouchableOpacity
              style={styles.demoLink}
              onPress={() => setIsDemoOpen(true)}
              accessibilityLabel="View exercise execution demonstration"
            >
              <Info size={14} color={colors.accent.primary} />
              <Text style={styles.demoLinkText}>VIEW FORM DEMO CLIP</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* End workout CTA */}
      <View style={styles.endContainer}>
        <TouchableOpacity
          style={styles.finishBtn}
          onPress={() => setIsEndModalOpen(true)}
          accessibilityLabel="End today's session"
          accessibilityRole="button"
        >
          <Text style={styles.finishBtnText}>END WORKOUT</Text>
        </TouchableOpacity>
      </View>

      {/* Session Progress Footer Dashboard */}
      <SessionProgress formattedTime={formattedTime} />

      {/* RPE Input Slider Overlay */}
      <RPESlider
        isOpen={isRPEOpen}
        exerciseName={currentExercise.name}
        setNumber={sets.length > 0 ? sets[sets.length - 1].setNumber : 1}
        weightKg={sets.length > 0 ? sets[sets.length - 1].actualWeightKg : targetWeightKg}
        reps={sets.length > 0 ? sets[sets.length - 1].completedReps : completedReps}
        onSubmit={handleRPESubmit}
      />

      {/* Manual Override Targets sheet */}
      <OverrideSheet
        isOpen={isOverrideOpen}
        onClose={() => setIsOverrideOpen(false)}
        currentWeightKg={targetWeightKg}
        currentReps={targetReps}
      />

      {/* Session End modal */}
      <SessionEndModal
        isOpen={isEndModalOpen}
        onClose={() => setIsEndModalOpen(false)}
        onConfirm={handleConfirmEndSession}
      />

      {/* Looping Demo player overlay */}
      <MiniDemoOverlay
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        exercise={currentExercise}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  scrollBody: {
    paddingVertical: spacing[2],
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[4],
  },
  errorText: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 18,
    color: colors.danger,
    letterSpacing: 0.5,
  },
  backBtn: {
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
  },
  backBtnText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 13,
    color: colors.text.secondary,
  },
  restingContainer: {
    paddingVertical: spacing[4],
  },
  activeContainer: {
    flex: 1,
    gap: spacing[4],
  },
  cameraPlaceholder: {
    height: 60,
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border.default,
    borderRadius: 8,
    marginHorizontal: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    padding: spacing[2],
  },
  cameraPlaceholderText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
    color: colors.text.muted,
    textAlign: 'center',
  },
  logSetBtn: {
    backgroundColor: colors.accent.dim,
    borderWidth: 1,
    borderColor: colors.border.accent,
    borderRadius: 8,
    marginHorizontal: spacing[4],
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logSetBtnText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 13,
    color: colors.accent.primary,
    letterSpacing: 1,
  },
  demoLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing[2],
  },
  demoLinkText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 11,
    color: colors.accent.primary,
    letterSpacing: 0.5,
  },
  endContainer: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
  },
  finishBtn: {
    borderWidth: 1,
    borderColor: colors.border.danger,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 59, 59, 0.04)',
    paddingVertical: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishBtnText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 13,
    color: colors.danger,
    letterSpacing: 0.5,
  },
});
