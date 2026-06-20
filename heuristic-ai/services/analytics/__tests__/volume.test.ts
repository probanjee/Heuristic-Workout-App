/**
 * HeuristicAI — Unit Tests: Volume Analytics Service
 * Source of truth: TASK.md (M6 Task 4, 25)
 */

import {
  getCutoffTime,
  getStartOfWeek,
  getWeeklyVolumeByMuscleGroup,
  getVolumeByExercise,
  getTotalVolumeForRange,
} from '../volume';
import { setsCollection, exercisesCollection } from '@/database';

// Mock database inside mock factory
jest.mock('@/database', () => {
  const mockFetchSets = jest.fn();
  const mockFetchExercises = jest.fn();
  return {
    setsCollection: {
      query: jest.fn().mockReturnThis(),
      on: jest.fn().mockReturnThis(),
      fetch: mockFetchSets,
    },
    exercisesCollection: {
      query: jest.fn().mockReturnThis(),
      fetch: mockFetchExercises,
    },
  };
});

describe('Volume Analytics Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockSet = (exerciseId: string, weight: number, reps: number, dateStr: string) => ({
    exerciseId,
    actualWeightKg: weight,
    completedReps: reps,
    completedAt: new Date(dateStr),
  });

  test('getCutoffTime returns expected timestamps', () => {
    const time = getCutoffTime(7);
    expect(time).toBeGreaterThan(0);
    expect(getCutoffTime(0)).toBe(0);
    expect(getCutoffTime(-5)).toBe(0);
  });

  test('getStartOfWeek resolves to preceding Monday', () => {
    const start1 = getStartOfWeek(new Date('2026-06-08T10:00:00Z'));
    expect(start1).toBe('2026-06-08');

    const start2 = getStartOfWeek(new Date('2026-06-11T12:00:00Z'));
    expect(start2).toBe('2026-06-08');

    const start3 = getStartOfWeek(new Date('2026-06-14T08:00:00Z'));
    expect(start3).toBe('2026-06-08');
  });

  test('getTotalVolumeForRange returns sum of all volumes in range', async () => {
    const mockSets = [
      createMockSet('squat', 100, 5, '2026-06-05T10:00:00Z'),
      createMockSet('bench-press', 80, 8, '2026-06-06T10:00:00Z'),
    ];
    (setsCollection as any).fetch.mockResolvedValue(mockSets);

    const total = await getTotalVolumeForRange(30);
    expect(total).toBe(1140);
  });

  test('getVolumeByExercise calculates and sorts exercise volumes', async () => {
    const mockSets = [
      createMockSet('squat', 100, 5, '2026-06-05'),
      createMockSet('squat', 100, 5, '2026-06-05'),
      createMockSet('bench-press', 80, 8, '2026-06-06'),
    ];
    (setsCollection as any).fetch.mockResolvedValue(mockSets);

    const mockExercises = [
      { slug: 'squat', name: 'Barbell Back Squat' },
      { slug: 'bench-press', name: 'Barbell Bench Press' },
    ];
    (exercisesCollection as any).fetch.mockResolvedValue(mockExercises);

    const breakdown = await getVolumeByExercise(30);
    expect(breakdown).toHaveLength(2);
    
    expect(breakdown[0].exerciseName).toBe('Barbell Back Squat');
    expect(breakdown[0].volume).toBe(1000);
    expect(breakdown[1].exerciseName).toBe('Barbell Bench Press');
    expect(breakdown[1].volume).toBe(640);
  });

  test('getWeeklyVolumeByMuscleGroup groups correctly by week and muscle group', async () => {
    const mockSets = [
      createMockSet('squat', 100, 5, '2026-06-02T10:00:00Z'),
      createMockSet('deadlift', 120, 5, '2026-06-03T10:00:00Z'),
      createMockSet('squat', 105, 5, '2026-06-10T10:00:00Z'),
    ];
    (setsCollection as any).fetch.mockResolvedValue(mockSets);

    const mockExercises = [
      { slug: 'squat', musclePrimary: 'legs' },
      { slug: 'deadlift', musclePrimary: 'back' },
    ];
    (exercisesCollection as any).fetch.mockResolvedValue(mockExercises);

    const weekly = await getWeeklyVolumeByMuscleGroup(30);
    expect(weekly).toHaveLength(3);

    expect(weekly[0].week).toBe('2026-06-01');
    expect(weekly[0].muscle).toBe('back');
    expect(weekly[0].volume).toBe(600);

    expect(weekly[1].week).toBe('2026-06-01');
    expect(weekly[1].muscle).toBe('legs');
    expect(weekly[1].volume).toBe(500);

    expect(weekly[2].week).toBe('2026-06-08');
    expect(weekly[2].muscle).toBe('legs');
    expect(weekly[2].volume).toBe(525);
  });
});
