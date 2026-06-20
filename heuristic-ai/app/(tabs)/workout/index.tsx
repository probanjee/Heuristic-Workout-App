/**
 * HeuristicAI — Workout Tab Home Screen
 * Displays suggested workouts, recovery flags, recent session history, and quick-start actions
 * Source of truth: TASK.md § 1, UI_UX_BRIEF.md
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Play, Clock, Zap, AlertTriangle, ChevronRight, Activity, Database } from 'lucide-react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { useWorkoutStore } from '@/store/workout.store';
import { useUserStore } from '@/store/user.store';
import { exercisesCollection, sessionsCollection, recoveryFlagsCollection } from '@/database';
import { Q } from '@nozbe/watermelondb';
import type { ExerciseData } from '@/heuristic-engine/types';

// Helper to map DB Exercise model to ExerciseData
function mapExerciseModelToData(e: any): ExerciseData {
  return {
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
  };
}

export default function WorkoutHome() {
  const router = useRouter();
  const startSession = useWorkoutStore((s) => s.startSession);
  const user = useUserStore((s) => s.user);
  const guestMode = useUserStore((s) => s.guestMode);

  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [activeFlags, setActiveFlags] = useState<any[]>([]);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        // 1. Fetch exercises for suggested list
        const dbExercises = await exercisesCollection.query().fetch();
        const mapped = dbExercises.map(mapExerciseModelToData);
        // Take up to 4 compound/primary exercises as suggested
        setExercises(mapped.slice(0, 4));

        // 2. Fetch completed sessions
        const dbSessions = await sessionsCollection
          .query(
            Q.where('status', 'completed'),
            Q.sortBy('started_at', Q.desc),
            Q.take(5)
          )
          .fetch();
        setRecentSessions(dbSessions);

        // 3. Fetch active recovery flags
        const nowMs = Date.now();
        const dbFlags = await recoveryFlagsCollection
          .query(Q.where('active_until', Q.gt(nowMs)))
          .fetch();
        setActiveFlags(dbFlags);
      } catch (err) {
        console.error('[WorkoutHome] Error loading database data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  const handleStartWorkout = async () => {
    if (exercises.length === 0) return;
    const userId = user?.id || user?.firebaseUid || 'guest-user';
    try {
      await startSession(exercises, userId);
      // Navigate to active workout
      router.push('/workout/active');
    } catch (err) {
      console.error('Failed to start workout session:', err);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
        <Text style={styles.loadingText}>Calibrating Heuristics...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing[4] }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>WORKOUT</Text>
            <Text style={styles.subtitle}>
              {guestMode ? 'GUEST COACHING MODE' : 'HEURISTIC COACH ACTIVE'}
            </Text>
          </View>
          <View style={styles.engineBadge}>
            <Zap size={14} color={colors.accent.primary} />
            <Text style={styles.engineBadgeText}>DYNAMIC</Text>
          </View>
        </View>

        {/* Recovery Flags Warning Banner */}
        {activeFlags.length > 0 && (
          <View style={styles.flagBanner}>
            <View style={styles.flagHeader}>
              <AlertTriangle size={16} color={colors.warning} />
              <Text style={styles.flagTitle}>ACTIVE RECOVERY FLAGS</Text>
            </View>
            {activeFlags.map((flag) => {
              const hoursRemaining = Math.max(
                0,
                Math.round((flag.activeUntil - Date.now()) / 3600000)
              );
              return (
                <View key={flag.id} style={styles.flagItem}>
                  <Text style={styles.flagText}>
                    • Volume reduction for {flag.exerciseId || 'Full Body'} ({flag.flagType}) due to: "{flag.reason}".
                  </Text>
                  <Text style={styles.flagTime}>{hoursRemaining}h remaining</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Suggested Workout Card */}
        <View style={styles.suggestedCard}>
          <Text style={styles.suggestedLabel}>TODAY'S SUGGESTED SESSION</Text>
          <Text style={styles.suggestedTitle}>
            {exercises.length > 0 ? `${exercises[0].musclePrimary.toUpperCase()} compound split` : 'CUSTOM BUILD'}
          </Text>

          {/* Exercise items preview */}
          <View style={styles.suggestedExercisesList}>
            {exercises.map((item, idx) => (
              <View key={item.slug} style={styles.exercisePreviewItem}>
                <Text style={styles.exerciseIdxText}>{idx + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.exerciseNameText}>{item.name.toUpperCase()}</Text>
                  <Text style={styles.exerciseMuscleText}>{item.musclePrimary.toUpperCase()} • {item.difficulty.toUpperCase()}</Text>
                </View>
                <ChevronRight size={16} color={colors.text.muted} />
              </View>
            ))}
          </View>

          {/* Start Workout CTA */}
          <TouchableOpacity
            style={styles.startBtn}
            onPress={handleStartWorkout}
            disabled={exercises.length === 0}
            accessibilityLabel="Start today's suggested workout"
            accessibilityRole="button"
          >
            <Play size={18} color={colors.text.inverse} strokeWidth={2.5} />
            <Text style={styles.startBtnText}>START WORKOUT</Text>
          </TouchableOpacity>
        </View>

        {/* Custom split CTA */}
        <TouchableOpacity
          style={styles.customBtn}
          onPress={() => router.push('/library')}
          accessibilityLabel="Build a custom workout from the exercise library"
          accessibilityRole="button"
        >
          <Activity size={16} color={colors.accent.primary} />
          <Text style={styles.customBtnText}>BUILD CUSTOM ROUTINE</Text>
        </TouchableOpacity>

        {/* History / Recent Sessions List */}
        <View style={styles.historySection}>
          <Text style={styles.sectionHeader}>RECENT SESSIONS</Text>

          {recentSessions.length === 0 ? (
            <View style={styles.emptyHistoryCard}>
              <Database size={24} color={colors.text.muted} style={{ marginBottom: spacing[2] }} />
              <Text style={styles.emptyHistoryText}>
                No sessions completed yet. Complete your first session to calibrate your profile.
              </Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {recentSessions.map((session) => {
                const dateStr = new Date(session.startedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                return (
                  <View key={session.id} style={styles.historyItem}>
                    <View style={styles.historyMain}>
                      <Clock size={14} color={colors.text.muted} />
                      <Text style={styles.historyDate}>{dateStr}</Text>
                    </View>
                    <View style={styles.historyStats}>
                      <Text style={styles.historyVolume}>
                        {(session.totalVolumeKg || 0).toFixed(0)} kg
                      </Text>
                      <View style={styles.rpeBadge}>
                        <Text style={styles.rpeBadgeText}>
                          RPE {(session.avgRpe || 6).toFixed(1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  title: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 32,
    color: colors.text.primary,
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 10,
    color: colors.text.secondary,
    letterSpacing: 1,
    marginTop: 2,
  },
  engineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accent.dim,
    borderWidth: 1,
    borderColor: colors.border.accent,
    paddingHorizontal: spacing[3],
    paddingVertical: 6,
    borderRadius: 8,
  },
  engineBadgeText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 10,
    color: colors.accent.primary,
    letterSpacing: 0.5,
  },
  flagBanner: {
    backgroundColor: 'rgba(255, 184, 48, 0.08)',
    borderWidth: 1,
    borderColor: colors.border.warning,
    borderRadius: 8,
    padding: spacing[4],
    marginBottom: spacing[5],
  },
  flagHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  flagTitle: {
    fontFamily: 'Syne_700Bold',
    fontSize: 11,
    color: colors.warning,
    letterSpacing: 1,
  },
  flagItem: {
    marginTop: spacing[2],
    gap: 2,
  },
  flagText: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  flagTime: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
    color: colors.warning,
    marginLeft: spacing[3],
  },
  suggestedCard: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  suggestedLabel: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
    color: colors.accent.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  suggestedTitle: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 22,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  suggestedExercisesList: {
    gap: spacing[2],
    marginBottom: spacing[5],
  },
  exercisePreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.bg.primary,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: 6,
    padding: spacing[3],
  },
  exerciseIdxText: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 14,
    color: colors.text.muted,
    width: 16,
  },
  exerciseNameText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 12,
    color: colors.text.primary,
  },
  exerciseMuscleText: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 2,
  },
  startBtn: {
    backgroundColor: colors.accent.primary,
    borderRadius: 8,
    paddingVertical: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  startBtnText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 15,
    color: colors.text.inverse,
    letterSpacing: 1,
  },
  customBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: spacing[6],
  },
  customBtnText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 13,
    color: colors.text.secondary,
    letterSpacing: 0.5,
  },
  historySection: {
    marginBottom: spacing[6],
  },
  sectionHeader: {
    fontFamily: 'Syne_700Bold',
    fontSize: 12,
    color: colors.text.muted,
    letterSpacing: 1,
    marginBottom: spacing[3],
  },
  emptyHistoryCard: {
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: 8,
    padding: spacing[5],
    alignItems: 'center',
  },
  emptyHistoryText: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  historyList: {
    gap: spacing[2],
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  historyMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  historyDate: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 13,
    color: colors.text.primary,
  },
  historyStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  historyVolume: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 13,
    color: colors.text.secondary,
  },
  rpeBadge: {
    backgroundColor: colors.bg.elevated,
    borderRadius: 4,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  rpeBadgeText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
    color: colors.accent.primary,
  },
});
