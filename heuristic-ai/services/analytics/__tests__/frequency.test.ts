/**
 * HeuristicAI — Unit Tests: Frequency Analytics Service
 * Source of truth: TASK.md (M6 Task 6, 25)
 */

import {
  getSessionFrequency,
  getTrainingStreak,
  getSessionsPerWeek,
} from '../frequency';
import { sessionsCollection } from '@/database';

// Mock database inside mock factory
jest.mock('@/database', () => {
  const mockFetchSessions = jest.fn();
  return {
    sessionsCollection: {
      query: jest.fn().mockReturnThis(),
      fetch: mockFetchSessions,
    },
  };
});

describe('Frequency Analytics Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const formatDateString = (offsetDays: number): string => {
    const d = new Date(Date.now() - offsetDays * 24 * 60 * 60 * 1000);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const createMockSession = (offsetDays: number) => {
    const dateStr = formatDateString(offsetDays);
    return {
      startedAt: new Date(dateStr + 'T10:00:00'),
    };
  };

  test('getSessionFrequency maps sessions to date string', async () => {
    const mockSessions = [
      createMockSession(0),
      createMockSession(0),
      createMockSession(2),
    ];
    (sessionsCollection as any).fetch.mockResolvedValue(mockSessions);

    const freq = await getSessionFrequency(30);
    const todayStr = formatDateString(0);
    const twoDaysAgoStr = formatDateString(2);

    expect(freq[todayStr]).toBe(2);
    expect(freq[twoDaysAgoStr]).toBe(1);
    expect(freq[formatDateString(5)]).toBeUndefined();
  });

  test('getTrainingStreak calculates streak correctly for active streak', async () => {
    const mockSessions = [
      createMockSession(2),
      createMockSession(1),
      createMockSession(0),
    ];
    (sessionsCollection as any).fetch.mockResolvedValue(mockSessions);

    const streak = await getTrainingStreak();
    expect(streak.currentStreak).toBe(3);
    expect(streak.longestStreak).toBe(3);
  });

  test('getTrainingStreak handles gaps and computes longest vs current streak', async () => {
    const mockSessions = [
      createMockSession(6),
      createMockSession(5),
      createMockSession(4),
      createMockSession(1),
      createMockSession(0),
    ];
    (sessionsCollection as any).fetch.mockResolvedValue(mockSessions);

    const streak = await getTrainingStreak();
    expect(streak.currentStreak).toBe(2);
    expect(streak.longestStreak).toBe(3);
  });

  test('getTrainingStreak returns 0 if last workout was too long ago', async () => {
    const mockSessions = [
      createMockSession(5),
      createMockSession(4),
    ];
    (sessionsCollection as any).fetch.mockResolvedValue(mockSessions);

    const streak = await getTrainingStreak();
    expect(streak.currentStreak).toBe(0);
    expect(streak.longestStreak).toBe(2);
  });

  test('getTrainingStreak returns 0 for empty database', async () => {
    (sessionsCollection as any).fetch.mockResolvedValue([]);
    const streak = await getTrainingStreak();
    expect(streak.currentStreak).toBe(0);
    expect(streak.longestStreak).toBe(0);
  });

  test('getSessionsPerWeek computes average sessions rate', async () => {
    const mockSessions = [
      createMockSession(20),
      createMockSession(15),
      createMockSession(10),
      createMockSession(5),
    ];
    (sessionsCollection as any).fetch.mockResolvedValue(mockSessions);

    const rate = await getSessionsPerWeek(28);
    expect(rate).toBe(1.0);
  });

  test('getSessionsPerWeek handles empty database by returning 0', async () => {
    (sessionsCollection as any).fetch.mockResolvedValue([]);
    const rate = await getSessionsPerWeek(7);
    expect(rate).toBe(0);
  });
});
