/**
 * HeuristicAI — Post-Workout Summary Screen
 * Integrates all summary modules, RPE charts, coach logs, and sharing utilities.
 * Source of truth: TASK.md (M6 Task 7, 13), UI_UX_BRIEF.md § 8, PRD.md § 5.6
 */

import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CheckCircle2, ShieldAlert, ArrowRight, Share2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing } from '@/constants/theme';
import { useWorkoutStore } from '@/store/workout.store';
import { useWorkoutSummary } from '@/hooks/useWorkoutSummary';
import { SummaryHero } from '@/components/summary/SummaryHero';
import { RPEChart } from '@/components/summary/RPEChart';
import { RecoveryRecommendation } from '@/components/summary/RecoveryRecommendation';
import { CoachNotes } from '@/components/summary/CoachNotes';
import { SessionExerciseBreakdown } from '@/components/summary/SessionExerciseBreakdown';
import { ShareSummaryCard } from '@/components/summary/ShareSummaryCard';
import { shareWorkoutSummary } from '@/services/sharing/share-summary';
import { generateRecoveryRecommendation } from '@/services/analytics/recovery';

export default function WorkoutSummary() {
  const router = useRouter();
  const { resetWorkout } = useWorkoutStore();
  
  const { summary, breakdown, session, loading, error } = useWorkoutSummary();
  const shareCardRef = useRef<View>(null);

  const handleFinish = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    resetWorkout();
    router.replace('/workout');
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const result = await shareWorkoutSummary(shareCardRef);
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Sharing Unavailable', result.error || 'Failed to launch share sheet.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
        <Text style={styles.loadingText}>COMPILING COACHING NOTES...</Text>
      </SafeAreaView>
    );
  }

  if (error || !summary || !session) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <ShieldAlert size={48} color={colors.danger} />
        <Text style={styles.errorText}>FAILED TO LOAD SUMMARY</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace('/workout')}
          accessibilityLabel="Return to workout home screen"
        >
          <Text style={styles.backBtnText}>GO HOME</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Calculate session duration in seconds
  const durationSeconds = session.endedAt
    ? Math.max(0, Math.floor((session.endedAt - session.startedAt) / 1000))
    : 0;

  // Query minimum form score logged
  const minFormScore = summary.formSummary && summary.formSummary.length > 0
    ? Math.min(...summary.formSummary.map((f) => f.avgScore))
    : null;

  // Generate recovery recommendation
  const rec = generateRecoveryRecommendation(summary.avgRpe, minFormScore, 5.0); // Default fatigue index 5.0

  const sessionDateStr = new Date(session.startedAt).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Celebration Header */}
        <View style={styles.header}>
          <CheckCircle2 size={44} color={colors.accent.primary} style={{ marginBottom: spacing[2] }} />
          <Text style={styles.title} accessibilityRole="header">
            SESSION COMPLETE
          </Text>
          <Text style={styles.subtitle}>Heuristic calibrations updated in offline storage</Text>
        </View>

        {/* Hero Stats (Moti count-up values inside) */}
        <SummaryHero
          totalVolumeKg={summary.totalVolume}
          durationSeconds={durationSeconds}
          avgRpe={summary.avgRpe}
        />

        {/* Recovery Recommendation */}
        <RecoveryRecommendation
          hours={rec.hours}
          severity={rec.severity}
          message={rec.message}
        />

        {/* RPE Chart */}
        {breakdown.length > 0 && (
          // Use sets completed to populate RPE values
          // Flattening sets across exercises to show session intensity curve
          <RPEChart
            sets={breakdown.flatMap((b, idx) => 
              Array.from({ length: b.setsCount }).map((_, sIdx) => ({
                id: `${b.exerciseSlug}_${idx}_${sIdx}`,
                sessionId: session.id || '',
                exerciseSlug: b.exerciseSlug,
                setNumber: sIdx + 1,
                targetReps: b.bestReps,
                completedReps: b.bestReps,
                targetWeightKg: b.bestWeightKg,
                actualWeightKg: b.bestWeightKg,
                rpe: b.avgRpe,
                rpeEstimated: false,
                formScore: b.avgFormScore,
                restSeconds: 90,
                heuristicAction: null,
                completedAt: Date.now(),
                synced: false,
              }))
            )}
          />
        )}

        {/* Expandable Coach Logs */}
        <CoachNotes topDecisions={summary.topDecisions} />

        {/* Exercise breakdown */}
        <SessionExerciseBreakdown breakdown={breakdown} />

        {/* Share Section */}
        <View style={styles.shareSection}>
          <Text style={styles.shareLabel}>SHARE YOUR PERFORMANCE</Text>
          {/* Card to be captured */}
          <View ref={shareCardRef} collapsable={false}>
            <ShareSummaryCard
              summary={summary}
              durationSeconds={durationSeconds}
              dateStr={sessionDateStr}
            />
          </View>
          
          <TouchableOpacity
            style={styles.shareBtn}
            onPress={handleShare}
            accessibilityLabel="Share your workout summary card image"
            accessibilityRole="button"
          >
            <Share2 size={16} color={colors.accent.primary} strokeWidth={2.5} />
            <Text style={styles.shareBtnText}>SHARE SUMMARY CARD</Text>
          </TouchableOpacity>
        </View>

        {/* Done Button */}
        <TouchableOpacity
          style={styles.finishBtn}
          onPress={handleFinish}
          accessibilityLabel="Finish viewing summary and return to workout tab home"
          accessibilityRole="button"
        >
          <Text style={styles.finishBtnText}>DONE</Text>
          <ArrowRight size={16} color={colors.text.inverse} strokeWidth={2.5} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    gap: spacing[5],
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
  },
  loadingText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 12,
    color: colors.text.secondary,
    letterSpacing: 1,
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
    fontSize: 16,
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
  header: {
    alignItems: 'center',
    marginTop: spacing[2],
  },
  title: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 24,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 4,
    textAlign: 'center',
  },
  shareSection: {
    gap: spacing[3],
    marginTop: spacing[2],
  },
  shareLabel: {
    fontFamily: 'Syne_700Bold',
    fontSize: 11,
    color: colors.text.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    borderWidth: 1.5,
    borderColor: colors.accent.primary,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 255, 135, 0.04)',
    paddingVertical: 14,
  },
  shareBtnText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 13,
    color: colors.accent.primary,
    letterSpacing: 0.5,
  },
  finishBtn: {
    backgroundColor: colors.accent.primary,
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    marginTop: spacing[3],
    marginBottom: spacing[6],
  },
  finishBtnText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 15,
    color: colors.text.inverse,
    letterSpacing: 1,
  },
});
