/**
 * File: store/__tests__/workout.store.test.ts
 * Purpose: Integration tests for the Workout Zustand Store and WatermelonDB persistence
 * Dependencies: act, ../workout.store, ../../heuristic-engine/types
 */

import { act } from 'react';

import { useWorkoutStore } from '../workout.store';
import type { ExerciseData, HeuristicSummary } from '../../heuristic-engine/types';

// Define Supabase env variables to avoid validation errors in lib/env.ts
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://mock-supabase.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';

// Mock expo-secure-store to prevent ESM parsing errors in Jest node environment
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock local NotificationService to prevent transitive ESM parsing errors in Jest node environment
jest.mock('@/services/notifications/notification-service', () => ({
  notificationService: {
    requestPermissions: jest.fn().mockResolvedValue(true),
    scheduleWorkoutReminder: jest.fn().mockResolvedValue('mock-reminder-id'),
    scheduleRecoveryAlert: jest.fn().mockResolvedValue('mock-recovery-id'),
    scheduleWorkoutRecoveryAlert: jest.fn().mockResolvedValue('mock-recovery-alert-id'),
    scheduleStreakReminder: jest.fn().mockResolvedValue('mock-streak-id'),
    scheduleWeeklyProgressSummary: jest.fn().mockResolvedValue('mock-weekly-id'),
    cancelNotification: jest.fn().mockResolvedValue(undefined),
    cancelAllNotifications: jest.fn().mockResolvedValue(undefined),
  },
  default: {
    requestPermissions: jest.fn().mockResolvedValue(true),
    scheduleWorkoutReminder: jest.fn().mockResolvedValue('mock-reminder-id'),
    scheduleRecoveryAlert: jest.fn().mockResolvedValue('mock-recovery-id'),
    scheduleWorkoutRecoveryAlert: jest.fn().mockResolvedValue('mock-recovery-alert-id'),
    scheduleStreakReminder: jest.fn().mockResolvedValue('mock-streak-id'),
    scheduleWeeklyProgressSummary: jest.fn().mockResolvedValue('mock-weekly-id'),
    cancelNotification: jest.fn().mockResolvedValue(undefined),
    cancelAllNotifications: jest.fn().mockResolvedValue(undefined),
  }
}));

// ─── STATE & MOCKS ─────────────────────────────────────────────────────────────

let mockSessions: any[] = [];

jest.mock('@/services/sync/sync-scheduler', () => ({
  triggerWorkoutCompletionSync: jest.fn(),
}));
let mockSets: any[] = [];
let mockFlags: any[] = [];
let mockProfiles: any[] = [];

jest.mock('../../database', () => {
  return {
    database: {
      write: jest.fn().mockImplementation(async (callback) => {
        return await callback();
      }),
    },
    sessionsCollection: {
      create: jest.fn().mockImplementation((cb) => {
        const record = {
          id: `session-${mockSessions.length + 1}`,
          userId: '',
          startedAt: new Date(),
          status: 'active',
          totalVolumeKg: null,
          avgRpe: null,
          _heuristicSummary: null,
          synced: false,
          update: jest.fn().mockImplementation(async (updateCb) => {
            updateCb(record);
            return record;
          }),
        };
        cb(record);
        mockSessions.push(record);
        return record;
      }),
      find: jest.fn().mockImplementation(async (id) => {
        const record = mockSessions.find(s => s.id === id);
        if (!record) throw new Error('Not found');
        return record;
      }),
      query: jest.fn().mockImplementation(() => ({
        fetch: jest.fn().mockImplementation(async () => {
          return mockSessions;
        }),
      })),
    },
    setsCollection: {
      create: jest.fn().mockImplementation((cb) => {
        const record = {
          id: `set-${mockSets.length + 1}`,
          sessionId: '',
          exerciseId: '',
          setNumber: 0,
          targetReps: 0,
          completedReps: 0,
          targetWeightKg: 0,
          actualWeightKg: 0,
          rpe: null,
          rpeEstimated: false,
          formScore: null,
          restSeconds: null,
          completedAt: new Date(),
          synced: false,
          _heuristicAction: null,
          get heuristicAction() {
            if (!this._heuristicAction) return null;
            return JSON.parse(this._heuristicAction);
          },
          update: jest.fn().mockImplementation(async (updateCb) => {
            updateCb(record);
            return record;
          }),
        };
        cb(record);
        mockSets.push(record);
        return record;
      }),
      find: jest.fn().mockImplementation(async (id) => {
        const record = mockSets.find(s => s.id === id);
        if (!record) throw new Error('Not found');
        return record;
      }),
      query: jest.fn().mockImplementation(() => ({
        fetch: jest.fn().mockImplementation(async () => {
          return mockSets;
        }),
      })),
    },
    recoveryFlagsCollection: {
      create: jest.fn().mockImplementation((cb) => {
        const record = {
          id: `flag-${mockFlags.length + 1}`,
          userId: '',
          exerciseId: '',
          flagType: '',
          activeUntil: 0,
          reason: '',
          createdAt: new Date(),
          toRecoveryFlag() {
            return {
              exerciseSlug: this.exerciseId,
              flagType: this.flagType,
              activeUntil: this.activeUntil,
              reason: this.reason,
            };
          },
        };
        cb(record);
        mockFlags.push(record);
        return record;
      }),
      query: jest.fn().mockImplementation(() => ({
        fetch: jest.fn().mockImplementation(async () => {
          return mockFlags;
        }),
      })),
    },
    heuristicProfilesCollection: {
      create: jest.fn().mockImplementation((cb) => {
        const record = {
          id: `profile-${mockProfiles.length + 1}`,
          userId: '',
          exerciseId: '',
          estimatedOneRmKg: null,
          avgRpeLast5: null,
          bestVolumeSession: null,
          consecutiveHighRpe: 0,
          lastSessionId: null,
          updatedAt: new Date(),
          update: jest.fn().mockImplementation(async (updateCb) => {
            updateCb(record);
            return record;
          }),
        };
        cb(record);
        mockProfiles.push(record);
        return record;
      }),
      query: jest.fn().mockImplementation(() => ({
        fetch: jest.fn().mockImplementation(async () => {
          return mockProfiles;
        }),
      })),
    },
    exercisesCollection: {
      query: jest.fn().mockImplementation(() => ({
        fetch: jest.fn().mockImplementation(async () => {
          return [
            {
              slug: 'barbell-squat',
              name: 'Barbell Squat',
              musclePrimary: 'legs',
              muscleSecondary: ['glutes'],
              equipment: 'barbell',
              difficulty: 'intermediate',
              videoUrl: '',
              formChecklist: [],
              audioCues: [],
            },
          ];
        }),
      })),
    },
  };
});

jest.mock('../workout.store', () => {
  const actual = jest.requireActual('../workout.store');
  const mockUseWorkoutStore = jest.fn((selector) => {
    const state = actual.useWorkoutStore.getState();
    return selector ? selector(state) : state;
  });
  Object.assign(mockUseWorkoutStore, actual.useWorkoutStore);
  return {
    ...actual,
    useWorkoutStore: mockUseWorkoutStore,
  };
});

// ─── TEST FIXTURES ─────────────────────────────────────────────────────────────

const mockExercises: ExerciseData[] = [
  {
    slug: 'barbell-squat',
    name: 'Barbell Squat',
    musclePrimary: 'legs',
    muscleSecondary: ['glutes'],
    equipment: 'barbell',
    difficulty: 'intermediate',
    videoUrl: '',
    formChecklist: [],
    audioCues: [],
  },
];

// ─── TEST SUITE ───────────────────────────────────────────────────────────────

describe('Workout Zustand Store with WatermelonDB', () => {
  beforeEach(() => {
    mockSessions = [];
    mockSets = [];
    mockFlags = [];
    mockProfiles = [];
    act(() => {
      useWorkoutStore.getState().resetWorkout();
    });
    jest.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const state = useWorkoutStore.getState();
    expect(state.currentSession).toBeNull();
    expect(state.currentExercise).toBeNull();
    expect(state.sets).toEqual([]);
    expect(state.heuristicDecision).toBeNull();
    expect(state.sessionFatigueIndex).toBe(0);
    expect(state.isResting).toBe(false);
    expect(state.isRPEOpen).toBe(false);
  });

  it('should start a session and create database record', async () => {
    await act(async () => {
      await useWorkoutStore.getState().startSession(mockExercises, 'user-123');
    });

    const state = useWorkoutStore.getState();
    expect(state.isSessionActive).toBe(true);
    expect(state.currentSession?.userId).toBe('user-123');
    expect(state.currentSession?.status).toBe('active');
    expect(state.currentExercise?.slug).toBe('barbell-squat');
    expect(mockSessions).toHaveLength(1);
    expect(mockSessions[0].userId).toBe('user-123');
  });

  it('should log a set, write to database, and open RPE slider', async () => {
    await act(async () => {
      await useWorkoutStore.getState().startSession(mockExercises, 'user-123');
      await useWorkoutStore.getState().logSet(6, 80, 80);
    });

    const state = useWorkoutStore.getState();
    expect(state.sets).toHaveLength(1);
    expect(state.sets[0].completedReps).toBe(6);
    expect(state.sets[0].actualWeightKg).toBe(80);
    expect(state.sets[0].formScore).toBe(80);
    expect(state.isRPEOpen).toBe(true);
    expect(state.isResting).toBe(false);
    expect(mockSets).toHaveLength(1);
    expect(mockSets[0].completedReps).toBe(6);
  });

  it('should submit RPE, evaluate heuristic, and update database set', async () => {
    await act(async () => {
      await useWorkoutStore.getState().startSession(mockExercises, 'user-123');
      await useWorkoutStore.getState().logSet(6, 80, 80);
      await useWorkoutStore.getState().submitRPE(8);
    });

    const state = useWorkoutStore.getState();
    expect(state.sets[0].rpe).toBe(8);
    expect(state.isRPEOpen).toBe(false);
    expect(state.isResting).toBe(true);
    expect(state.sessionFatigueIndex).toBe(8);
    expect(state.heuristicDecision).not.toBeNull();
    expect(mockSets[0].rpe).toBe(8);
  });

  it('should accept a heuristic suggestion and reload flags', async () => {
    await act(async () => {
      await useWorkoutStore.getState().startSession(mockExercises, 'user-123');
      await useWorkoutStore.getState().logSet(6, 80, 80);
      await useWorkoutStore.getState().submitRPE(8);
      await useWorkoutStore.getState().acceptDecision();
    });

    const state = useWorkoutStore.getState();
    expect(state.isResting).toBe(false);
    expect(state.isRPEOpen).toBe(false);
  });

  it('should override decision and modify targets', async () => {
    await act(async () => {
      await useWorkoutStore.getState().startSession(mockExercises, 'user-123');
      await useWorkoutStore.getState().logSet(6, 80, 80);
      await useWorkoutStore.getState().submitRPE(8);
      await useWorkoutStore.getState().overrideDecision(85, 5);
    });

    const state = useWorkoutStore.getState();
    expect(state.heuristicDecision?.nextSetWeightKg).toBe(85);
    expect(state.heuristicDecision?.nextSetTargetReps).toBe(5);
    expect(state.isResting).toBe(false);
  });

  it('should end a session and write summary metrics to DB', async () => {
    let summary: HeuristicSummary | undefined;
    await act(async () => {
      await useWorkoutStore.getState().startSession(mockExercises, 'user-123');
      await useWorkoutStore.getState().logSet(6, 80, 85);
      await useWorkoutStore.getState().submitRPE(7);
      summary = await useWorkoutStore.getState().endSession();
    });

    const state = useWorkoutStore.getState();
    expect(state.isSessionActive).toBe(false);
    expect(state.currentSession?.status).toBe('completed');
    expect(summary).toBeDefined();
    expect(summary?.totalVolume).toBe(480);
    expect(summary?.avgRpe).toBe(7);
    expect(mockSessions[0].status).toBe('completed');
    expect(mockSessions[0].totalVolumeKg).toBe(480);
  });

  it('should resume an active session from DB', async () => {
    // 1. Setup an active session in the mock DB lists
    mockSessions = [
      {
        id: 'session-123',
        userId: 'user-abc',
        startedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
        status: 'active',
        totalVolumeKg: null,
        avgRpe: null,
        heuristicSummary: null,
        synced: false,
        update: jest.fn(),
      },
    ];

    mockSets = [
      {
        id: 'set-123',
        sessionId: 'session-123',
        exerciseId: 'barbell-squat',
        setNumber: 1,
        targetReps: 6,
        completedReps: 6,
        targetWeightKg: 80,
        actualWeightKg: 80,
        rpe: 7,
        rpeEstimated: false,
        formScore: 85,
        restSeconds: 90,
        completedAt: new Date(Date.now() - 25 * 60 * 1000),
        synced: false,
        _heuristicAction: null,
        get heuristicAction() { return null; },
        update: jest.fn(),
      },
    ];

    let resumed = false;
    await act(async () => {
      resumed = await useWorkoutStore.getState().resumeSession();
    });

    const state = useWorkoutStore.getState();
    expect(resumed).toBe(true);
    expect(state.isSessionActive).toBe(true);
    expect(state.currentSession?.id).toBe('session-123');
    expect(state.sets).toHaveLength(1);
    expect(state.sessionFatigueIndex).toBe(7);
    expect(state.currentExercise?.slug).toBe('barbell-squat');
  });

  it('should return false to resume if no active session in DB', async () => {
    let resumed = true;
    await act(async () => {
      resumed = await useWorkoutStore.getState().resumeSession();
    });
    expect(resumed).toBe(false);
  });
});
