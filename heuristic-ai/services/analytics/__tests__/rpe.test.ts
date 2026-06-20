/**
 * HeuristicAI — Unit Tests: RPE Analytics Service
 * Source of truth: TASK.md (M6 Task 5, 25)
 */

import {
  getRPETrend,
  getAverageRPEForRange,
  getHighRPESessions,
} from '../rpe';
import { setsCollection, sessionsCollection } from '@/database';

// Mock database inside mock factory
jest.mock('@/database', () => {
  const mockFetchSets = jest.fn();
  const mockFetchSessions = jest.fn();
  return {
    setsCollection: {
      query: jest.fn().mockReturnThis(),
      on: jest.fn().mockReturnThis(),
      fetch: mockFetchSets,
    },
    sessionsCollection: {
      query: jest.fn().mockReturnThis(),
      fetch: mockFetchSessions,
    },
  };
});

describe('RPE Analytics Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockSet = (rpe: number | null, rpeEstimated: boolean, dateStr: string) => ({
    rpe,
    rpeEstimated,
    completedAt: new Date(dateStr),
  });

  const createMockSession = (avgRpe: number | null, dateStr: string) => ({
    avgRpe,
    startedAt: new Date(dateStr),
  });

  test('getRPETrend groups sets by date, computes averages, and flags estimates', async () => {
    const mockSets = [
      createMockSet(7, false, '2026-06-01T10:00:00Z'),
      createMockSet(8, true, '2026-06-01T10:15:00Z'),
      createMockSet(6, false, '2026-06-03T10:00:00Z'),
      createMockSet(null, false, '2026-06-03T10:15:00Z'),
    ];
    (setsCollection as any).fetch.mockResolvedValue(mockSets);

    const trend = await getRPETrend(30);
    expect(trend).toHaveLength(2);

    expect(trend[0].date).toBe('2026-06-01');
    expect(trend[0].avgRpe).toBe(7.5);
    expect(trend[0].isEstimated).toBe(true);

    expect(trend[1].date).toBe('2026-06-03');
    expect(trend[1].avgRpe).toBe(6.0);
    expect(trend[1].isEstimated).toBe(false);
  });

  test('getRPETrend returns empty array when no sets exist', async () => {
    (setsCollection as any).fetch.mockResolvedValue([]);
    const trend = await getRPETrend(7);
    expect(trend).toEqual([]);
  });

  test('getAverageRPEForRange averages all sets and defaults to 6.0 on empty', async () => {
    (setsCollection as any).fetch.mockResolvedValue([]);
    const avgEmpty = await getAverageRPEForRange(7);
    expect(avgEmpty).toBe(6.0);

    const mockSets = [
      createMockSet(9, false, '2026-06-01'),
      createMockSet(8, false, '2026-06-01'),
      createMockSet(null, false, '2026-06-02'),
    ];
    (setsCollection as any).fetch.mockResolvedValue(mockSets);
    const avg = await getAverageRPEForRange(30);
    expect(avg).toBe(8.5);
  });

  test('getHighRPESessions counts completed sessions with avg RPE >= 8', async () => {
    const mockSessions = [
      createMockSession(8.0, '2026-06-01'),
      createMockSession(7.9, '2026-06-02'),
      createMockSession(9.0, '2026-06-03'),
      createMockSession(null, '2026-06-04'),
    ];
    (sessionsCollection as any).fetch.mockResolvedValue(mockSessions);

    const count = await getHighRPESessions(30);
    expect(count).toBe(2);
  });

  test('getHighRPESessions defaults to 0 on database exceptions', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (sessionsCollection as any).fetch.mockRejectedValue(new Error('DB connection lost'));
    const count = await getHighRPESessions(30);
    expect(count).toBe(0);
    consoleSpy.mockRestore();
  });
});
