/**
 * HeuristicAI — Unit Tests: Summary Analytics Service
 * Source of truth: TASK.md (M6 Task 25)
 */

import {
  calculateTotalVolume,
  calculateAverageRPE,
  calculateSessionDuration,
  getTopHeuristicNotes,
  calculateExerciseBreakdown,
  generateWorkoutSummary,
} from '../summary';
import type { SetData } from '@/heuristic-engine/types';
import { sessionsCollection, setsCollection, exercisesCollection } from '@/database';

// Mock WatermelonDB database collections inside mock factory
jest.mock('@/database', () => {
  const mockFind = jest.fn();
  const mockFetchSets = jest.fn();
  const mockFetchExercises = jest.fn();
  
  return {
    sessionsCollection: {
      find: mockFind,
    },
    setsCollection: {
      query: jest.fn().mockReturnThis(),
      fetch: mockFetchSets,
    },
    exercisesCollection: {
      query: jest.fn().mockReturnThis(),
      fetch: mockFetchExercises,
    },
  };
});

// Mock 1RM calculations
jest.mock('@/heuristic-engine/1rm', () => ({
  calculateEstimated1RM: (weight: number, reps: number) => weight * (1 + reps / 30),
  getBestSetForOneRM: (sets: any[]) => sets[0] || null,
}));

// Mock recovery recommendations
jest.mock('@/heuristic-engine/recovery', () => ({
  getRecoveryRecommendationHours: (avgRpe: number) => (avgRpe >= 8 ? 72 : avgRpe >= 6 ? 48 : 24),
}));

describe('Summary Analytics Service', () => {
  const mockSets: SetData[] = [
    {
      sessionId: 'session-1',
      exerciseSlug: 'squat',
      setNumber: 1,
      targetReps: 6,
      completedReps: 6,
      targetWeightKg: 100,
      actualWeightKg: 100,
      rpe: 7,
      rpeEstimated: false,
      formScore: 90,
      restSeconds: 90,
      heuristicAction: {
        coachNote: 'Drive knees out.',
        actionType: 'none',
      } as any,
      completedAt: 100000,
      synced: false,
    },
    {
      sessionId: 'session-1',
      exerciseSlug: 'squat',
      setNumber: 2,
      targetReps: 6,
      completedReps: 5,
      targetWeightKg: 100,
      actualWeightKg: 100,
      rpe: 9,
      rpeEstimated: false,
      formScore: 80,
      restSeconds: 90,
      heuristicAction: {
        coachNote: 'RPE 9 detected. Reducing weight next set.',
        actionType: 'reduce_weight',
      } as any,
      completedAt: 200000,
      synced: false,
    },
    {
      sessionId: 'session-1',
      exerciseSlug: 'bench-press',
      setNumber: 1,
      targetReps: 8,
      completedReps: 8,
      targetWeightKg: 60,
      actualWeightKg: 60,
      rpe: 8,
      rpeEstimated: false,
      formScore: 85,
      restSeconds: 90,
      heuristicAction: {
        coachNote: 'Solid bar path.',
        actionType: 'none',
      } as any,
      completedAt: 300000,
      synced: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('calculateTotalVolume accumulates sets volume correctly', () => {
    const volume = calculateTotalVolume(mockSets);
    expect(volume).toBe(1580);
  });

  test('calculateAverageRPE averages RPE ratings and ignores nulls', () => {
    const avgRpe = calculateAverageRPE(mockSets);
    expect(avgRpe).toBe(8.0);

    const setsWithNull: SetData[] = [
      ...mockSets,
      {
        ...mockSets[0],
        rpe: null,
      },
    ];
    const avgRpeWithNull = calculateAverageRPE(setsWithNull);
    expect(avgRpeWithNull).toBe(8.0);
  });

  test('calculateAverageRPE defaults to 6.0 if no RPE is logged', () => {
    const emptyRpeSets: SetData[] = [
      { ...mockSets[0], rpe: null },
      { ...mockSets[1], rpe: null },
    ];
    const avgRpe = calculateAverageRPE(emptyRpeSets);
    expect(avgRpe).toBe(6.0);
  });

  test('calculateSessionDuration computes time difference in seconds', () => {
    const duration = calculateSessionDuration(10000, 25000);
    expect(duration).toBe(15);
  });

  test('getTopHeuristicNotes groups and sorts coach notes by count', () => {
    const notes = getTopHeuristicNotes(mockSets);
    expect(notes).toHaveLength(3);
    expect(notes[0].coachNote).toBe('Drive knees out.');
    expect(notes[0].count).toBe(1);
  });

  test('calculateExerciseBreakdown groups sets and calculates stats by exercise', () => {
    const exerciseNameMap = new Map<string, string>([
      ['squat', 'Barbell Back Squat'],
      ['bench-press', 'Barbell Bench Press'],
    ]);

    const breakdown = calculateExerciseBreakdown(mockSets, exerciseNameMap);
    expect(breakdown).toHaveLength(2);

    const squatBreak = breakdown.find((b) => b.exerciseSlug === 'squat');
    expect(squatBreak).toBeDefined();
    expect(squatBreak?.exerciseName).toBe('Barbell Back Squat');
    expect(squatBreak?.setsCount).toBe(2);
    expect(squatBreak?.totalVolume).toBe(1100);
    expect(squatBreak?.avgRpe).toBe(8.0);
    expect(squatBreak?.avgFormScore).toBe(85);
    expect(squatBreak?.bestWeightKg).toBe(100);
    expect(squatBreak?.bestReps).toBe(6);
  });

  test('generateWorkoutSummary compiles correct summary payload from DB queries', async () => {
    const mockSessionObj = {
      id: 'session-1',
      userId: 'user-123',
      startedAt: { getTime: () => 100000 },
      endedAt: { getTime: () => 400000 },
      status: 'completed',
      totalVolumeKg: 1580,
      avgRpe: 8.0,
      heuristicSummary: null,
      synced: false,
    };

    const mockSetsRecords = mockSets.map((s) => ({
      id: `${s.exerciseSlug}-${s.setNumber}`,
      sessionId: s.sessionId,
      exerciseId: s.exerciseSlug,
      setNumber: s.setNumber,
      targetReps: s.targetReps,
      completedReps: s.completedReps,
      targetWeightKg: s.targetWeightKg,
      actualWeightKg: s.actualWeightKg,
      rpe: s.rpe,
      rpeEstimated: s.rpeEstimated,
      formScore: s.formScore,
      restSeconds: s.restSeconds,
      heuristicAction: JSON.stringify(s.heuristicAction),
      completedAt: { getTime: () => s.completedAt },
      synced: s.synced,
    }));

    const mockExercisesRecords = [
      { slug: 'squat', name: 'Barbell Back Squat' },
      { slug: 'bench-press', name: 'Barbell Bench Press' },
    ];

    (sessionsCollection.find as jest.Mock).mockResolvedValue(mockSessionObj);
    (setsCollection as any).fetch.mockResolvedValue(mockSetsRecords);
    (exercisesCollection as any).fetch.mockResolvedValue(mockExercisesRecords);

    const result = await generateWorkoutSummary('session-1');
    expect(result).not.toBeNull();
    expect(result?.summary.totalVolume).toBe(1580);
    expect(result?.summary.avgRpe).toBe(8.0);
    expect(result?.summary.recoveryRecommendationHours).toBe(72);
    expect(result?.summary.estimatedOneRmKg).toBe(120);
    expect(result?.summary.formSummary).toHaveLength(2);
    expect(result?.breakdown).toHaveLength(2);
  });
});
