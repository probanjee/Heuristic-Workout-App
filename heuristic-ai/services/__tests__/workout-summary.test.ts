/**
 * HeuristicAI — Unit Tests: Workout Summary Service
 * Source of truth: TASK.md § 17
 */

import {
  calculateTotalVolume,
  calculateAverageRPE,
  calculateSessionDuration,
  getTopHeuristicNotes,
  generateSessionSummary,
} from '../workout-summary';
import type { SetData, SessionData } from '@/heuristic-engine/types';

// Mock getBestSetForOneRM and calculateEstimated1RM
jest.mock('@/heuristic-engine/1rm', () => ({
  calculateEstimated1RM: (weight: number, reps: number) => weight * (1 + reps / 30),
  getBestSetForOneRM: (sets: any[]) => sets[0] || null,
}));

// Mock getRecoveryRecommendationHours
jest.mock('@/heuristic-engine/recovery', () => ({
  getRecoveryRecommendationHours: (avgRpe: number) => (avgRpe >= 8 ? 72 : avgRpe >= 6 ? 48 : 24),
}));

describe('Workout Summary Service', () => {
  const mockSets: SetData[] = [
    {
      sessionId: 'session-1',
      exerciseSlug: 'barbell-squat',
      setNumber: 1,
      targetReps: 6,
      completedReps: 6,
      targetWeightKg: 100,
      actualWeightKg: 100,
      rpe: 7,
      rpeEstimated: false,
      formScore: 90,
      restSeconds: 90,
      completedAt: Date.now() - 300000,
      synced: false,
      heuristicAction: {
        nextSetWeightKg: 100,
        nextSetTargetReps: 6,
        additionalRestSeconds: 0,
        addDropSet: false,
        substituteExercise: null,
        terminateSessionWarning: false,
        recoveryFlagToCreate: null,
        coachNote: 'Good set. Keep the pace.',
        confidenceScore: 0.5,
        ruleMatched: null,
        actionType: 'none',
      },
    },
    {
      sessionId: 'session-1',
      exerciseSlug: 'barbell-squat',
      setNumber: 2,
      targetReps: 6,
      completedReps: 5,
      targetWeightKg: 100,
      actualWeightKg: 100,
      rpe: 9,
      rpeEstimated: false,
      formScore: 80,
      restSeconds: 120,
      completedAt: Date.now() - 150000,
      synced: false,
      heuristicAction: {
        nextSetWeightKg: 90,
        nextSetTargetReps: 6,
        additionalRestSeconds: 30,
        addDropSet: false,
        substituteExercise: null,
        terminateSessionWarning: false,
        recoveryFlagToCreate: null,
        coachNote: 'RPE 9 on set 2. Reducing weight 10%.',
        confidenceScore: 0.85,
        ruleMatched: 'ruleRPERepFailure',
        actionType: 'reduce_weight',
      },
    },
  ];

  const mockSession: SessionData = {
    id: 'session-1',
    userId: 'user-123',
    startedAt: Date.now() - 600000, // 10 minutes ago
    endedAt: Date.now(),
    status: 'completed',
    totalVolumeKg: null,
    avgRpe: null,
    heuristicSummary: null,
    synced: false,
  };

  test('calculateTotalVolume accumulates sets volume correctly', () => {
    // Volume: (100 * 6) + (100 * 5) = 600 + 500 = 1100
    const volume = calculateTotalVolume(mockSets);
    expect(volume).toBe(1100);
  });

  test('calculateAverageRPE averages RPE ratings and handles nulls', () => {
    // RPEs: 7 and 9. Mean = 8.
    const avgRpe = calculateAverageRPE(mockSets);
    expect(avgRpe).toBe(8.0);

    const setsWithNull: SetData[] = [
      ...mockSets,
      {
        ...mockSets[0],
        rpe: null, // skipped set
      },
    ];
    // RPEs: 7 and 9 (third is ignored). Mean = 8.
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
    const startedAt = 10000;
    const endedAt = 25000;
    const duration = calculateSessionDuration(startedAt, endedAt);
    expect(duration).toBe(15);
  });

  test('getTopHeuristicNotes groups and sorts coach notes by count', () => {
    const notes = getTopHeuristicNotes(mockSets);
    expect(notes).toHaveLength(2);
    expect(notes[0].coachNote).toBe('Good set. Keep the pace.');
    expect(notes[0].count).toBe(1);
  });

  test('generateSessionSummary compiles correct HeuristicSummary payload', () => {
    const summary = generateSessionSummary(mockSession, mockSets);
    expect(summary.totalVolume).toBe(1100);
    expect(summary.avgRpe).toBe(8.0);
    expect(summary.recoveryRecommendationHours).toBe(72); // avgRpe 8.0 maps to 72h
    expect(summary.estimatedOneRmKg).toBe(120); // 100 * (1 + 6/30) = 120 (first set best)
    expect(summary.formSummary).toHaveLength(1);
    expect(summary.formSummary[0].exerciseSlug).toBe('barbell-squat');
    expect(summary.formSummary[0].avgScore).toBe(85); // (90 + 80) / 2 = 85
  });
});
