/**
 * File: store/workout.store.ts
 * Purpose: Zustand store managing active workout sessions, sets, and heuristic evaluations
 * Dependencies: zustand, @nozbe/watermelondb, @/heuristic-engine, @/database
 */

import { create } from 'zustand';
import {
  database,
  sessionsCollection,
  setsCollection,
  recoveryFlagsCollection,
  heuristicProfilesCollection,
  exercisesCollection,
} from '@/database';
import { evaluateSet, calculateSessionFatigueIndex } from '@/heuristic-engine';
import { getRecoveryRecommendationHours } from '@/heuristic-engine/recovery';
import { calculateEstimated1RM, getBestSetForOneRM } from '@/heuristic-engine/1rm';
import { Q } from '@nozbe/watermelondb';
import { triggerWorkoutCompletionSync } from '@/services/sync/sync-scheduler';
import { notificationService } from '@/services/notifications/notification-service';
import { useUserStore } from './user.store';
import type {
  HeuristicDecision,
  SetData,
  SessionData,
  HeuristicProfile,
  RecoveryFlag,
  ExerciseData,
  HeuristicSummary,
} from '@/heuristic-engine/types';

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

// ─── STATE TYPES ──────────────────────────────────────────────────────────────

interface WorkoutState {
  // Spec Required State
  currentSession: SessionData | null;
  currentExercise: ExerciseData | null;
  sets: SetData[];
  heuristicDecision: HeuristicDecision | null;
  sessionFatigueIndex: number;
  isResting: boolean;
  isRPEOpen: boolean;
  activeRecoveryAlertId: string | null;

  // Additional Supporting State
  isSessionActive: boolean;
  exerciseQueue: ExerciseData[];
  currentExerciseIndex: number;
  rpeHistory: (number | null)[];
  recoveryFlags: RecoveryFlag[];
  heuristicProfiles: Record<string, HeuristicProfile>;
  phase: 'idle' | 'pre_set' | 'active_set' | 'rpe_input' | 'rest' | 'heuristic_review' | 'complete';

  // Spec Required Actions
  startSession: (exercises: ExerciseData[], userId: string) => Promise<void>;
  logSet: (completedReps: number, actualWeightKg: number, formScore?: number | null) => Promise<void>;
  submitRPE: (rpe: number, estimated?: boolean) => Promise<HeuristicDecision>;
  acceptDecision: () => Promise<void>;
  overrideDecision: (overrideWeightKg: number, overrideReps: number) => Promise<void>;
  endSession: () => Promise<HeuristicSummary>;
  resumeSession: () => Promise<boolean>;
  resetWorkout: () => void;

  // Additional Supporting Actions
  skipRest: () => Promise<void>;
  abandonSession: () => Promise<void>;
  setRecoveryFlags: (flags: RecoveryFlag[]) => void;
  setHeuristicProfiles: (profiles: Record<string, HeuristicProfile>) => void;
}

// ─── INITIAL STATE ────────────────────────────────────────────────────────────

const initialState = {
  currentSession: null,
  currentExercise: null,
  sets: [],
  heuristicDecision: null,
  sessionFatigueIndex: 0,
  isResting: false,
  isRPEOpen: false,
  activeRecoveryAlertId: null,

  isSessionActive: false,
  exerciseQueue: [],
  currentExerciseIndex: 0,
  rpeHistory: [],
  recoveryFlags: [],
  heuristicProfiles: {},
  phase: 'idle' as const,
};

// ─── DEFAULT PROFILE GENERATOR ────────────────────────────────────────────────

function getDefaultProfile(exerciseSlug: string): HeuristicProfile {
  return {
    exerciseSlug,
    estimatedOneRmKg: null,
    avgRpeLast5: null,
    bestVolumeSession: null,
    consecutiveHighRpe: 0,
    lastSessionId: null,
    updatedAt: Date.now(),
  };
}

// ─── STORE IMPLEMENTATION ─────────────────────────────────────────────────────

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  ...initialState,

  // ─── START SESSION ──────────────────────────────────────────────────────────
  startSession: async (exercises, userId) => {
    if (exercises.length === 0) {
      throw new Error('Cannot start session with zero exercises');
    }

    const now = new Date();
    let sessionRecord: any;

    // Persist session startup to DB
    await database.write(async () => {
      sessionRecord = await sessionsCollection.create((record: any) => {
        record.userId = userId;
        record.startedAt = now;
        record.status = 'active';
        record.synced = false;
      });
    });

    // Populate active recovery flags and heuristic profiles
    const dbFlags = await recoveryFlagsCollection.query().fetch();
    const activeFlags = dbFlags.map((f: any) => f.toRecoveryFlag());

    const dbProfiles = await heuristicProfilesCollection.query().fetch();
    const profilesRecord: Record<string, HeuristicProfile> = {};
    for (const p of dbProfiles) {
      profilesRecord[p.exerciseId] = {
        exerciseSlug: p.exerciseId,
        estimatedOneRmKg: p.estimatedOneRmKg,
        avgRpeLast5: p.avgRpeLast5,
        bestVolumeSession: p.bestVolumeSession,
        consecutiveHighRpe: p.consecutiveHighRpe,
        lastSessionId: p.lastSessionId,
        updatedAt: p.updatedAt.getTime(),
      };
    }

    set({
      isSessionActive: true,
      currentSession: {
        id: sessionRecord.id,
        userId,
        startedAt: now.getTime(),
        endedAt: null,
        status: 'active',
        totalVolumeKg: null,
        avgRpe: null,
        heuristicSummary: null,
        synced: false,
      },
      currentExercise: exercises[0],
      exerciseQueue: exercises,
      currentExerciseIndex: 0,
      sets: [],
      rpeHistory: [],
      sessionFatigueIndex: 0,
      heuristicDecision: null,
      isResting: false,
      isRPEOpen: false,
      recoveryFlags: activeFlags,
      heuristicProfiles: profilesRecord,
      phase: 'pre_set',
    });
  },

  // ─── LOG SET ────────────────────────────────────────────────────────────────
  logSet: async (completedReps, actualWeightKg, formScore = null) => {
    const state = get();
    if (!state.currentSession || !state.currentExercise) {
      throw new Error('No active session or exercise');
    }

    const { currentSession, currentExercise, sets } = state;
    const exerciseSets = sets.filter(s => s.exerciseSlug === currentExercise.slug);
    const setNumber = exerciseSets.length + 1;

    // Determine targets
    const targetReps = setNumber === 1
      ? 6 // default reps
      : state.heuristicDecision?.nextSetTargetReps ?? 6;
    const targetWeightKg = setNumber === 1
      ? actualWeightKg
      : state.heuristicDecision?.nextSetWeightKg ?? actualWeightKg;

    let dbSetRecord: any;

    // Persist set log directly to DB (resume-on-crash recovery)
    await database.write(async () => {
      dbSetRecord = await setsCollection.create((record: any) => {
        record.sessionId = currentSession.id!;
        record.exerciseId = currentExercise.slug;
        record.setNumber = setNumber;
        record.targetReps = targetReps;
        record.completedReps = completedReps;
        record.targetWeightKg = targetWeightKg;
        record.actualWeightKg = actualWeightKg;
        record.rpe = null;
        record.rpeEstimated = false;
        record.formScore = formScore ?? null;
        record.restSeconds = null;
        record.completedAt = new Date();
        record.synced = false;
        (record as any)._heuristicAction = null;
      });
    });

    const newSet: SetData = {
      id: dbSetRecord.id,
      sessionId: currentSession.id!,
      exerciseSlug: currentExercise.slug,
      setNumber,
      targetReps,
      completedReps,
      targetWeightKg,
      actualWeightKg,
      rpe: null,
      rpeEstimated: false,
      formScore,
      restSeconds: null,
      heuristicAction: null,
      completedAt: dbSetRecord.completedAt.getTime(),
      synced: false,
    };

    set({
      sets: [...sets, newSet],
      isRPEOpen: true,
      isResting: false,
      phase: 'rpe_input',
    });
  },

  // ─── SUBMIT RPE ─────────────────────────────────────────────────────────────
  submitRPE: async (rpe, estimated = false) => {
    const state = get();
    if (!state.currentSession || !state.currentExercise) {
      throw new Error('No active session');
    }

    const { currentSession, currentExercise, sets, recoveryFlags, heuristicProfiles } = state;
    const latestSet = sets[sets.length - 1];
    if (!latestSet) {
      throw new Error('No set logged');
    }

    // Build fatigue history and index
    const newRpeHistory = [...sets.slice(0, -1).map(s => s.rpe), estimated ? null : rpe];
    const newFatigueIndex = calculateSessionFatigueIndex(newRpeHistory);

    const profile = heuristicProfiles[currentExercise.slug] ?? getDefaultProfile(currentExercise.slug);

    // Evaluate heuristic suggestion
    const decision = evaluateSet({
      exerciseSlug: currentExercise.slug,
      setNumber: latestSet.setNumber,
      targetReps: latestSet.targetReps,
      completedReps: latestSet.completedReps,
      targetWeightKg: latestSet.targetWeightKg,
      rpe: estimated ? null : rpe,
      rpeEstimated: estimated,
      formScore: latestSet.formScore,
      sessionFatigueIndex: newFatigueIndex,
      recoveryFlags,
      heuristicProfile: profile,
    });

    // Update set in Zustand
    const updatedSets = sets.map((s) => {
      if (s.id === latestSet.id) {
        return {
          ...s,
          rpe: estimated ? null : rpe,
          rpeEstimated: estimated,
          heuristicAction: decision,
          restSeconds: decision.additionalRestSeconds,
        };
      }
      return s;
    });

    // Update set log in WatermelonDB
    await database.write(async () => {
      const dbSet = await setsCollection.find(latestSet.id!);
      await dbSet.update((record: any) => {
        record.rpe = estimated ? null : rpe;
        record.rpeEstimated = estimated;
        record.restSeconds = decision.additionalRestSeconds;
        (record as any)._heuristicAction = JSON.stringify(decision);
      });
    });

    const showBanner =
      decision.nextSetWeightKg !== latestSet.targetWeightKg ||
      decision.additionalRestSeconds > 0 ||
      decision.addDropSet ||
      decision.terminateSessionWarning ||
      decision.substituteExercise !== null;

    // Schedule recovery alert if enabled
    let recoveryAlertId: string | null = null;
    const userPrefs = useUserStore.getState().preferences;
    if (userPrefs.recoveryAlertsEnabled && decision.additionalRestSeconds > 0) {
      recoveryAlertId = await notificationService.scheduleRecoveryAlert(decision.additionalRestSeconds);
    }

    set({
      sets: updatedSets,
      rpeHistory: newRpeHistory,
      sessionFatigueIndex: newFatigueIndex,
      heuristicDecision: decision,
      isRPEOpen: false,
      isResting: true,
      activeRecoveryAlertId: recoveryAlertId,
      phase: showBanner ? 'heuristic_review' : 'rest',
    });

    return decision;
  },

  // ─── ACCEPT DECISION ────────────────────────────────────────────────────────
  acceptDecision: async () => {
    const { heuristicDecision, currentSession, activeRecoveryAlertId } = get();

    if (activeRecoveryAlertId) {
      await notificationService.cancelNotification(activeRecoveryAlertId);
    }

    if (heuristicDecision?.recoveryFlagToCreate && currentSession) {
      const flagData = heuristicDecision.recoveryFlagToCreate;
      await database.write(async () => {
        await recoveryFlagsCollection.create((record: any) => {
          record.userId = currentSession.userId;
          record.exerciseId = flagData.exerciseSlug;
          record.flagType = flagData.flagType;
          record.activeUntil = flagData.activeUntil;
          record.reason = flagData.reason;
          record.createdAt = new Date();
        });
      });

      // Reload recovery flags
      const dbFlags = await recoveryFlagsCollection.query().fetch();
      const activeFlags = dbFlags.map((f: any) => f.toRecoveryFlag());
      set({ recoveryFlags: activeFlags });
    }

    set({
      isResting: false,
      isRPEOpen: false,
      activeRecoveryAlertId: null,
      phase: 'pre_set',
    });
  },

  // ─── OVERRIDE DECISION ──────────────────────────────────────────────────────
  overrideDecision: async (overrideWeightKg, overrideReps) => {
    const { activeRecoveryAlertId } = get();
    if (activeRecoveryAlertId) {
      await notificationService.cancelNotification(activeRecoveryAlertId);
    }

    set((s) => ({
      heuristicDecision: s.heuristicDecision
        ? {
            ...s.heuristicDecision,
            nextSetWeightKg: overrideWeightKg,
            nextSetTargetReps: overrideReps,
          }
        : null,
      isResting: false,
      isRPEOpen: false,
      activeRecoveryAlertId: null,
      phase: 'pre_set',
    }));
  },

  // ─── END SESSION ────────────────────────────────────────────────────────────
  endSession: async () => {
    const state = get();
    if (!state.currentSession) {
      throw new Error('No active session');
    }

    const { currentSession, sets } = state;
    const sessionSets = sets;

    // Metrics calculations
    const totalVolume = sessionSets.reduce((sum, s) => sum + s.actualWeightKg * s.completedReps, 0);
    const rpeValues = sessionSets.map(s => s.rpe).filter((r): r is number => r !== null);
    const avgRpe = rpeValues.length > 0
      ? rpeValues.reduce((a, b) => a + b, 0) / rpeValues.length
      : 6;

    // Identify top decisions
    const noteCounts: Record<string, number> = {};
    for (const s of sessionSets) {
      if (s.heuristicAction?.coachNote) {
        const note = s.heuristicAction.coachNote;
        noteCounts[note] = (noteCounts[note] ?? 0) + 1;
      }
    }
    const topDecisions = Object.entries(noteCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([coachNote, count]) => ({ coachNote, count }));

    // Calculate 1RM from best set in session
    const bestSet = getBestSetForOneRM(
      sessionSets.map(s => ({
        weightKg: s.actualWeightKg,
        reps: s.completedReps,
        formScore: s.formScore,
      }))
    );
    const estimatedOneRmKg = bestSet ? calculateEstimated1RM(bestSet.weightKg, bestSet.reps) : null;

    const recoveryHours = getRecoveryRecommendationHours(avgRpe);

    const summary: HeuristicSummary = {
      totalVolume,
      avgRpe,
      topDecisions,
      recoveryRecommendationHours: recoveryHours,
      estimatedOneRmKg,
      formSummary: [], // Populated by camera module
    };

    // Commit completion to DB
    await database.write(async () => {
      const dbSession = await sessionsCollection.find(currentSession.id!);
      await dbSession.update((record: any) => {
        record.endedAt = new Date();
        record.status = 'completed';
        record.totalVolumeKg = totalVolume;
        record.avgRpe = avgRpe;
        (record as any)._heuristicSummary = JSON.stringify(summary);
        record.synced = false;
      });

      // Update learned profiles per exercise
      const exerciseSlugs = Array.from(new Set(sessionSets.map(s => s.exerciseSlug)));
      for (const slug of exerciseSlugs) {
        const exerciseSets = sessionSets.filter(s => s.exerciseSlug === slug);
        const exerciseBestSet = getBestSetForOneRM(
          exerciseSets.map(s => ({
            weightKg: s.actualWeightKg,
            reps: s.completedReps,
            formScore: s.formScore,
          }))
        );
        const exercise1RM = exerciseBestSet ? calculateEstimated1RM(exerciseBestSet.weightKg, exerciseBestSet.reps) : null;

        const rpeAvg = exerciseSets.map(s => s.rpe).filter((r): r is number => r !== null);
        const exerciseAvgRpe = rpeAvg.length > 0 ? rpeAvg.reduce((a, b) => a + b, 0) / rpeAvg.length : 0;
        const isHighRpeSession = exerciseAvgRpe >= 8.0;

        const profiles = await heuristicProfilesCollection.query(Q.where('exercise_id', slug)).fetch();
        const profileRecord = profiles[0];

        if (profileRecord) {
          await profileRecord.update((record: any) => {
            if (exercise1RM) record.estimatedOneRmKg = exercise1RM;
            record.avgRpeLast5 = exerciseAvgRpe;
            record.consecutiveHighRpe = isHighRpeSession ? record.consecutiveHighRpe + 1 : 0;
            record.lastSessionId = currentSession.id;
            record.updatedAt = new Date();
          });
        } else {
          await heuristicProfilesCollection.create((record: any) => {
            record.userId = currentSession.userId;
            record.exerciseId = slug;
            record.estimatedOneRmKg = exercise1RM;
            record.avgRpeLast5 = exerciseAvgRpe;
            record.consecutiveHighRpe = isHighRpeSession ? 1 : 0;
            record.lastSessionId = currentSession.id;
            record.updatedAt = new Date();
          });
        }
      }
    });

    // Reload heuristic profiles in state
    const dbProfiles = await heuristicProfilesCollection.query().fetch();
    const profilesRecord: Record<string, HeuristicProfile> = {};
    for (const p of dbProfiles) {
      profilesRecord[p.exerciseId] = {
        exerciseSlug: p.exerciseId,
        estimatedOneRmKg: p.estimatedOneRmKg,
        avgRpeLast5: p.avgRpeLast5,
        bestVolumeSession: p.bestVolumeSession,
        consecutiveHighRpe: p.consecutiveHighRpe,
        lastSessionId: p.lastSessionId,
        updatedAt: p.updatedAt.getTime(),
      };
    }

    const { activeRecoveryAlertId } = get();
    if (activeRecoveryAlertId) {
      await notificationService.cancelNotification(activeRecoveryAlertId);
    }

    set({
      isSessionActive: false,
      isResting: false,
      isRPEOpen: false,
      activeRecoveryAlertId: null,
      currentSession: {
        ...currentSession,
        endedAt: Date.now(),
        status: 'completed',
        totalVolumeKg: totalVolume,
        avgRpe,
        heuristicSummary: summary,
      },
      heuristicProfiles: profilesRecord,
      phase: 'complete',
    });

    // Trigger immediate background sync
    triggerWorkoutCompletionSync();

    // Wire local notifications: streak reminder, weekly progress summary, and recovery alert
    const userPrefs = useUserStore.getState().preferences;
    if (userPrefs.workoutRemindersEnabled) {
      await notificationService.scheduleStreakReminder();
      await notificationService.scheduleWeeklyProgressSummary();
    }
    if (userPrefs.recoveryAlertsEnabled && recoveryHours > 0) {
      await notificationService.scheduleWorkoutRecoveryAlert(recoveryHours);
    }

    return summary;
  },

  // ─── RESUME SESSION ─────────────────────────────────────────────────────────
  resumeSession: async () => {
    // Check for an active session in local DB
    const activeSessions = await sessionsCollection.query(Q.where('status', 'active')).fetch();
    const sortedActive = activeSessions.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
    const activeSession = sortedActive[0];

    if (!activeSession) {
      return false;
    }

    // Load sets logged for this active session
    const dbSets = await setsCollection.query(Q.where('session_id', activeSession.id)).fetch();
    const mappedSets: SetData[] = dbSets.map((record: any) => ({
      id: record.id,
      sessionId: record.sessionId,
      exerciseSlug: record.exerciseId,
      setNumber: record.setNumber,
      targetReps: record.targetReps,
      completedReps: record.completedReps,
      targetWeightKg: record.targetWeightKg,
      actualWeightKg: record.actualWeightKg,
      rpe: record.rpe,
      rpeEstimated: record.rpeEstimated,
      formScore: record.formScore,
      restSeconds: record.restSeconds,
      heuristicAction: record.heuristicAction, // parses JSON internally
      completedAt: record.completedAt.getTime(),
      synced: record.synced,
    }));
    mappedSets.sort((a, b) => a.completedAt - b.completedAt);

    // Reconstruct exercises in queue
    const allExercises = await exercisesCollection.query().fetch();
    const exerciseMap = new Map(allExercises.map((e: any) => [e.slug, mapExerciseModelToData(e)]));

    const uniqueSlugs = Array.from(new Set(mappedSets.map(s => s.exerciseSlug)));
    const exercisesInSession = uniqueSlugs.map(slug => exerciseMap.get(slug)).filter(Boolean) as ExerciseData[];

    const latestSet = mappedSets[mappedSets.length - 1];
    const currentExerciseSlug = latestSet ? latestSet.exerciseSlug : null;
    const currentExercise = currentExerciseSlug ? (exerciseMap.get(currentExerciseSlug) as ExerciseData) : null;

    // Load recovery flags and heuristic profiles
    const dbFlags = await recoveryFlagsCollection.query().fetch();
    const activeFlags = dbFlags.map((f: any) => f.toRecoveryFlag());

    const dbProfiles = await heuristicProfilesCollection.query().fetch();
    const profilesRecord: Record<string, HeuristicProfile> = {};
    for (const p of dbProfiles) {
      profilesRecord[p.exerciseId] = {
        exerciseSlug: p.exerciseId,
        estimatedOneRmKg: p.estimatedOneRmKg,
        avgRpeLast5: p.avgRpeLast5,
        bestVolumeSession: p.bestVolumeSession,
        consecutiveHighRpe: p.consecutiveHighRpe,
        lastSessionId: p.lastSessionId,
        updatedAt: p.updatedAt.getTime(),
      };
    }

    const rpeHistory = mappedSets.map(s => s.rpe);
    const sessionFatigueIndex = calculateSessionFatigueIndex(rpeHistory);

    set({
      currentSession: {
        id: activeSession.id,
        userId: activeSession.userId,
        startedAt: activeSession.startedAt.getTime(),
        endedAt: activeSession.endedAt ? activeSession.endedAt.getTime() : null,
        status: activeSession.status,
        totalVolumeKg: activeSession.totalVolumeKg,
        avgRpe: activeSession.avgRpe,
        heuristicSummary: activeSession.heuristicSummary,
        synced: activeSession.synced,
      },
      currentExercise: currentExercise ?? null,
      exerciseQueue: exercisesInSession,
      currentExerciseIndex: exercisesInSession.length > 0 ? exercisesInSession.length - 1 : 0,
      sets: mappedSets,
      rpeHistory,
      sessionFatigueIndex,
      recoveryFlags: activeFlags,
      heuristicProfiles: profilesRecord,
      isSessionActive: true,
      phase: 'pre_set',
      isResting: false,
      isRPEOpen: false,
    });

    return true;
  },

  // ─── RESET WORKOUT ──────────────────────────────────────────────────────────
  resetWorkout: () => set(initialState),

  // ─── ADDITIONAL ACTIONS ─────────────────────────────────────────────────────
  skipRest: async () => {
    const { activeRecoveryAlertId } = get();
    if (activeRecoveryAlertId) {
      await notificationService.cancelNotification(activeRecoveryAlertId);
    }
    set({ phase: 'pre_set', isResting: false, activeRecoveryAlertId: null });
  },

  abandonSession: async () => {
    const { currentSession } = get();
    if (!currentSession) return;

    await database.write(async () => {
      const dbSession = await sessionsCollection.find(currentSession.id!);
      await dbSession.update((record: any) => {
        record.endedAt = new Date();
        record.status = 'abandoned';
        record.synced = false;
      });
    });

    set({
      isSessionActive: false,
      isResting: false,
      isRPEOpen: false,
      currentSession: {
        ...currentSession,
        endedAt: Date.now(),
        status: 'abandoned',
      },
      phase: 'complete',
    });

    // Trigger sync for abandoned session
    triggerWorkoutCompletionSync();
  },

  setRecoveryFlags: (flags) => set({ recoveryFlags: flags }),
  setHeuristicProfiles: (profiles) => set({ heuristicProfiles: profiles }),
}));
