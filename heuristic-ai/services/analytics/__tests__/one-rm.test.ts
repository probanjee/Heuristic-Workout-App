/**
 * HeuristicAI — Unit Tests: One-Rep Max Analytics Service
 * Source of truth: TASK.md (M6 Task 3, 25)
 */

import {
  getBestEstimated1RM,
  get1RMProgression,
  getLatest1RMComparison,
} from '../one-rm';
import { setsCollection } from '@/database';

// Mock database setsCollection inside mock factory
jest.mock('@/database', () => {
  const mockFetchSets = jest.fn();
  return {
    setsCollection: {
      query: jest.fn().mockReturnThis(),
      on: jest.fn().mockReturnThis(),
      fetch: mockFetchSets,
    },
  };
});

// Mock 1RM formula
jest.mock('@/heuristic-engine/1rm', () => ({
  calculateEstimated1RM: (weight: number, reps: number) => weight * (1 + reps / 30),
}));

describe('One-Rep Max Analytics Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockSet = (weight: number, reps: number, timestamp: number) => ({
    actualWeightKg: weight,
    completedReps: reps,
    completedAt: new Date(timestamp),
  });

  test('getBestEstimated1RM returns null when no sets are found', async () => {
    (setsCollection as any).fetch.mockResolvedValue([]);
    const result = await getBestEstimated1RM('squat');
    expect(result).toBeNull();
  });

  test('getBestEstimated1RM returns best 1RM among sets', async () => {
    const mockSets = [
      createMockSet(100, 6, 1600000000000),
      createMockSet(110, 5, 1600000000000),
      createMockSet(120, 2, 1600000000000),
    ];
    (setsCollection as any).fetch.mockResolvedValue(mockSets);

    const result = await getBestEstimated1RM('squat');
    expect(result).toBeCloseTo(128.33, 2);
  });

  test('get1RMProgression groups by date and returns sorted array', async () => {
    const mockSets = [
      createMockSet(100, 6, new Date('2026-06-01T10:00:00Z').getTime()),
      createMockSet(110, 5, new Date('2026-06-01T10:15:00Z').getTime()),
      createMockSet(115, 5, new Date('2026-06-03T10:00:00Z').getTime()),
      createMockSet(95, 6, new Date('2026-05-30T10:00:00Z').getTime()),
    ];
    (setsCollection as any).fetch.mockResolvedValue(mockSets);

    const progression = await get1RMProgression('squat');
    expect(progression).toHaveLength(3);
    
    expect(progression[0].date).toBe('2026-05-30');
    expect(progression[0].oneRm).toBeCloseTo(114.0, 1);

    expect(progression[1].date).toBe('2026-06-01');
    expect(progression[1].oneRm).toBeCloseTo(128.3, 1);

    expect(progression[2].date).toBe('2026-06-03');
    expect(progression[2].oneRm).toBeCloseTo(134.2, 1);
  });

  test('getLatest1RMComparison returns null if no sessions', async () => {
    (setsCollection as any).fetch.mockResolvedValue([]);
    const result = await getLatest1RMComparison('squat');
    expect(result).toBeNull();
  });

  test('getLatest1RMComparison returns current 1RM and 0 previous for exactly 1 session', async () => {
    const mockSets = [createMockSet(100, 6, new Date('2026-06-01T10:00:00Z').getTime())];
    (setsCollection as any).fetch.mockResolvedValue(mockSets);

    const result = await getLatest1RMComparison('squat');
    expect(result).not.toBeNull();
    expect(result?.current).toBeCloseTo(120, 1);
    expect(result?.previous).toBe(0);
    expect(result?.percentChange).toBe(0);
  });

  test('getLatest1RMComparison calculates correct percent change for multiple sessions', async () => {
    const mockSets = [
      createMockSet(100, 6, new Date('2026-06-01T10:00:00Z').getTime()),
      createMockSet(110, 6, new Date('2026-06-03T10:00:00Z').getTime()),
    ];
    (setsCollection as any).fetch.mockResolvedValue(mockSets);

    const result = await getLatest1RMComparison('squat');
    expect(result).not.toBeNull();
    expect(result?.current).toBeCloseTo(132, 1);
    expect(result?.previous).toBeCloseTo(120, 1);
    expect(result?.percentChange).toBe(10);
  });
});
