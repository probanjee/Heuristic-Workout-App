/**
 * HeuristicAI — Workout UI Developer Preview Screen
 * Renders all Week 5 Workout UI components with real seeded database exercises in a controlled sandbox.
 * Source of truth: TASK.md § 16, UI_UX_BRIEF.md
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Zap, Play, Square, Eye, Edit3, Clock, AlertTriangle } from 'lucide-react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { exercisesCollection } from '@/database';
import type { ExerciseData, HeuristicDecision } from '@/heuristic-engine/types';
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

// Mock Heuristic Decision for preview
const sampleDecision: HeuristicDecision = {
  nextSetWeightKg: 65.0,
  nextSetTargetReps: 6,
  additionalRestSeconds: 30,
  addDropSet: false,
  substituteExercise: null,
  terminateSessionWarning: false,
  recoveryFlagToCreate: null,
  coachNote: 'Target reps hit with low RPE. Increasing weight by 5kg for next set.',
  confidenceScore: 0.85,
  ruleMatched: 'ruleEasySet',
  actionType: 'increase_weight',
};

export default function WorkoutUIPreview() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState(0);

  // Component overlay states
  const [isRPEOpen, setIsRPEOpen] = useState(false);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isRestingPreview, setIsRestingPreview] = useState(false);

  // Local set state for interactive SetCard
  const [completedReps, setCompletedReps] = useState(5);
  const [currentWeight, setCurrentWeight] = useState(60.0);

  useEffect(() => {
    async function loadSeededExercises() {
      try {
        const dbExercises = await exercisesCollection.query().fetch();
        if (dbExercises.length > 0) {
          const mapped = dbExercises.map((e: any) => ({
            slug: e.slug,
            name: e.name,
            musclePrimary: e.musclePrimary,
            muscleSecondary: e.muscleSecondary,
            equipment: e.equipment,
            difficulty: e.difficulty,
            videoUrl: e.videoUrl,
            formChecklist: e.formChecklist,
            audioCues: e.audioCues,
            poseModel: e.poseModel,
          }));
          setExercises(mapped);
        }
      } catch (err) {
        console.error('Failed to load seeded exercises:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSeededExercises();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
        <Text style={styles.loadingText}>Fetching database fixtures...</Text>
      </SafeAreaView>
    );
  }

  const activeExercise = exercises[selectedExerciseIndex] || null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      {/* Dev Header */}
      <View style={styles.devHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityLabel="Back to dev menu"
        >
          <ChevronLeft size={20} color={colors.text.primary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.devTitle}>WORKOUT UI SANDBOX</Text>
          <Text style={styles.devSubtitle}>Milestone M4 Components Preview</Text>
        </View>
        <Zap size={20} color={colors.accent.primary} />
      </View>

      {activeExercise ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
          {/* Section 1: Exercise Swipe tab */}
          <Text style={styles.sectionTitle}>1. EXERCISE SWIPE LIST</Text>
          <ExerciseSwipeList
            exercises={exercises}
            currentExerciseIndex={selectedExerciseIndex}
            onSelectExercise={(idx) => {
              setSelectedExerciseIndex(idx);
              setCompletedReps(5);
            }}
            sets={[]}
            disabled={false}
          />

          {/* Section 2: Header */}
          <Text style={styles.sectionTitle}>2. WORKOUT HEADER</Text>
          <WorkoutHeader
            exerciseName={activeExercise.name}
            currentSetIndex={2}
            totalSets={4}
            musclePrimary={activeExercise.musclePrimary}
            startedAt={Date.now() - 340000} // 5 mins ago
          />

          {/* Section 3: Interactive Set Card */}
          <Text style={styles.sectionTitle}>3. SET CARD (INTERACTIVE)</Text>
          <SetCard
            exerciseName={activeExercise.name}
            muscleGroup={activeExercise.musclePrimary}
            setNumber={2}
            totalSets={4}
            targetWeightKg={currentWeight}
            targetReps={6}
            completedReps={completedReps}
            onRepsChange={setCompletedReps}
            onWeightChange={setCurrentWeight}
            onComplete={() => setIsRPEOpen(true)}
            onLongPressWeight={() => setIsOverrideOpen(true)}
          />

          {/* Section 4: SVG Rest Timer preview */}
          <Text style={styles.sectionTitle}>4. REST TIMER (SVG & REANIMATED)</Text>
          <View style={styles.restTimerWrapper}>
            <RestTimer
              totalSeconds={15}
              nextWeightKg={65.0}
              nextReps={6}
              onComplete={() => setIsRestingPreview(false)}
            />
          </View>

          {/* Section 5: Heuristic banner */}
          <Text style={styles.sectionTitle}>5. HEURISTIC SUGGESTION BANNER</Text>
          <HeuristicBanner
            decision={sampleDecision}
            previousWeightKg={60.0}
            onAccept={() => alert('Suggestion Accepted')}
            onOverride={() => setIsOverrideOpen(true)}
          />

          {/* Section 6: Trigger control overlays */}
          <Text style={styles.sectionTitle}>6. MODALS & OVERLAYS INTERACTION</Text>
          <View style={styles.controlsGrid}>
            <TouchableOpacity style={styles.controlBtn} onPress={() => setIsRPEOpen(true)}>
              <Eye size={16} color={colors.accent.primary} />
              <Text style={styles.controlBtnText}>OPEN RPE SLIDER</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlBtn} onPress={() => setIsOverrideOpen(true)}>
              <Edit3 size={16} color={colors.accent.primary} />
              <Text style={styles.controlBtnText}>OPEN OVERRIDE</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlBtn} onPress={() => setIsDemoOpen(true)}>
              <Play size={16} color={colors.accent.primary} />
              <Text style={styles.controlBtnText}>OPEN MINI DEMO</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlBtn} onPress={() => setIsEndModalOpen(true)}>
              <Square size={16} color={colors.danger} />
              <Text style={[styles.controlBtnText, { color: colors.danger }]}>OPEN END MODAL</Text>
            </TouchableOpacity>
          </View>

          {/* Section 7: Session progress bar footer preview */}
          <Text style={styles.sectionTitle}>7. SESSION PROGRESS FOOTER</Text>
          <SessionProgress formattedTime="12:45" />
          <View style={{ height: spacing[8] }} />
        </ScrollView>
      ) : (
        <View style={styles.noDataContainer}>
          <AlertTriangle size={32} color={colors.warning} />
          <Text style={styles.noDataText}>No seeded exercises in WatermelonDB. Run seed first.</Text>
        </View>
      )}

      {/* RPE Overlay slider */}
      {activeExercise && (
        <RPESlider
          isOpen={isRPEOpen}
          exerciseName={activeExercise.name}
          setNumber={2}
          weightKg={currentWeight}
          reps={completedReps}
          onSubmit={(rpe, est) => {
            setIsRPEOpen(false);
            alert(`Logged RPE: ${rpe} (estimated: ${est ? 'yes' : 'no'})`);
          }}
        />
      )}

      {/* Manual Override Targets sheet */}
      <OverrideSheet
        isOpen={isOverrideOpen}
        onClose={() => setIsOverrideOpen(false)}
        currentWeightKg={currentWeight}
        currentReps={6}
      />

      {/* End Session Confirmation modal */}
      <SessionEndModal
        isOpen={isEndModalOpen}
        onClose={() => setIsEndModalOpen(false)}
        onConfirm={() => {
          setIsEndModalOpen(false);
          alert('Session ended successfully');
        }}
      />

      {/* Mini video demo overlay */}
      <MiniDemoOverlay
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        exercise={activeExercise}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
  },
  loadingText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 14,
    color: colors.text.secondary,
  },
  devHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.secondary,
    gap: spacing[3],
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devTitle: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 16,
    color: colors.text.primary,
  },
  devSubtitle: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 11,
    color: colors.text.muted,
  },
  scrollBody: {
    paddingVertical: spacing[4],
    gap: spacing[4],
  },
  sectionTitle: {
    fontFamily: 'Syne_700Bold',
    fontSize: 11,
    color: colors.text.muted,
    paddingHorizontal: spacing[4],
    marginTop: spacing[2],
    letterSpacing: 1,
  },
  restTimerWrapper: {
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    marginHorizontal: spacing[4],
    overflow: 'hidden',
  },
  controlsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
  },
  controlBtn: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.secondary,
    paddingVertical: spacing[3],
  },
  controlBtnText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 11,
    color: colors.text.primary,
    letterSpacing: 0.5,
  },
  noDataContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
    gap: spacing[3],
  },
  noDataText: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
