/**
 * HeuristicAI — useProgressAnalytics Hook
 * Queries and aggregates progress metrics for the selected time range.
 * Source of truth: TASK.md (M6 Task 23), PRD.md § 5.3
 */

import { useState, useEffect } from 'react';
import {
  getTotalVolumeForRange,
  getAverageRPEForRange,
  getWeeklyVolumeByMuscleGroup,
  getRPETrend,
  getTrainingStreak,
  getSessionFrequency,
  getSessionsPerWeek,
  get1RMProgression,
} from '@/services/analytics';

/**
 * Custom hook to aggregate all progress dashboard metrics.
 *
 * @param timeRangeDays - Days to analyze
 */
export function useProgressAnalytics(timeRangeDays: number) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [totalVolume, setTotalVolume] = useState(0);
  const [avgRpe, setAvgRpe] = useState(6.0);
  const [weeklyVolume, setWeeklyVolume] = useState<any[]>([]);
  const [rpeTrend, setRpeTrend] = useState<any[]>([]);
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [frequency, setFrequency] = useState<Record<string, number>>({});
  const [sessionsPerWeek, setSessionsPerWeek] = useState(0);

  const [squatOneRmProgress, setSquatOneRmProgress] = useState<any[]>([]);
  const [benchOneRmProgress, setBenchOneRmProgress] = useState<any[]>([]);
  const [deadliftOneRmProgress, setDeadliftOneRmProgress] = useState<any[]>([]);

  async function load() {
    try {
      setLoading(true);
      const [
        volumeRes,
        rpeRes,
        weeklyVolRes,
        rpeTrendRes,
        streakRes,
        frequencyRes,
        sessionsPerWeekRes,
        squatRes,
        benchRes,
        deadliftRes,
      ] = await Promise.all([
        getTotalVolumeForRange(timeRangeDays),
        getAverageRPEForRange(timeRangeDays),
        getWeeklyVolumeByMuscleGroup(timeRangeDays),
        getRPETrend(timeRangeDays),
        getTrainingStreak(),
        getSessionFrequency(timeRangeDays),
        getSessionsPerWeek(timeRangeDays),
        get1RMProgression('squat'),
        get1RMProgression('bench-press'),
        get1RMProgression('deadlift'),
      ]);

      setTotalVolume(volumeRes);
      setAvgRpe(rpeRes);
      setWeeklyVolume(weeklyVolRes);
      setRpeTrend(rpeTrendRes);
      setStreak(streakRes);
      setFrequency(frequencyRes);
      setSessionsPerWeek(sessionsPerWeekRes);
      setSquatOneRmProgress(squatRes);
      setBenchOneRmProgress(benchRes);
      setDeadliftOneRmProgress(deadliftRes);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load progress analytics.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    if (active) {
      load();
    }

    return () => {
      active = false;
    };
  }, [timeRangeDays]);

  return {
    loading,
    error,
    totalVolume,
    avgRpe,
    weeklyVolume,
    rpeTrend,
    streak,
    frequency,
    sessionsPerWeek,
    squatOneRmProgress,
    benchOneRmProgress,
    deadliftOneRmProgress,
    refetch: load,
  };
}
