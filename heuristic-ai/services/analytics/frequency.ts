/**
 * HeuristicAI — Frequency Analytics Service
 * Source of truth: TASK.md (M6 Task 6), PRD.md § 5.3
 */

import { Q } from '@nozbe/watermelondb';
import { sessionsCollection } from '@/database';
import { getCutoffTime } from './volume';

/**
 * Formats a timestamp into a YYYY-MM-DD string.
 */
function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns session counts grouped by YYYY-MM-DD for the selected range.
 * Useful for the calendar frequency heatmap.
 *
 * @param timeRangeDays - Days to analyze
 * @returns Map of date string to session count
 */
export async function getSessionFrequency(
  timeRangeDays: number
): Promise<Record<string, number>> {
  try {
    const cutoff = getCutoffTime(timeRangeDays);
    const sessions = await sessionsCollection
      .query(
        Q.where('status', 'completed'),
        Q.where('started_at', Q.gte(cutoff))
      )
      .fetch();

    const freqMap: Record<string, number> = {};
    for (const session of sessions) {
      const dateStr = formatDate(session.startedAt.getTime());
      freqMap[dateStr] = (freqMap[dateStr] ?? 0) + 1;
    }
    return freqMap;
  } catch (err) {
    console.error('[frequency getSessionFrequency] Error:', err);
    return {};
  }
}

/**
 * Calculates the user's current and longest consecutive training day streaks.
 * A streak remains alive if there is at most a 1-day gap between workouts.
 *
 * @returns Object containing currentStreak and longestStreak
 */
export async function getTrainingStreak(): Promise<{ currentStreak: number; longestStreak: number }> {
  try {
    const sessions = await sessionsCollection
      .query(Q.where('status', 'completed'), Q.sortBy('started_at', Q.asc))
      .fetch();

    if (sessions.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Isolate unique dates in order
    const uniqueDates = Array.from(
      new Set(sessions.map((s) => formatDate(s.startedAt.getTime())))
    ).sort();

    let longestStreak = 0;
    let currentStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    const todayStr = formatDate(Date.now());
    const yesterdayStr = formatDate(Date.now() - 86400000);

    const parsedDates = uniqueDates.map((d) => new Date(d + 'T00:00:00'));

    for (let i = 0; i < parsedDates.length; i++) {
      const curDate = parsedDates[i];
      if (prevDate === null) {
        tempStreak = 1;
      } else {
        const diffTime = Math.abs(curDate.getTime() - prevDate.getTime());
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      prevDate = curDate;
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // If the last workout was today or yesterday, the streak is alive
    const lastWorkoutStr = uniqueDates[uniqueDates.length - 1];
    if (lastWorkoutStr === todayStr || lastWorkoutStr === yesterdayStr) {
      currentStreak = tempStreak;
    } else {
      currentStreak = 0;
    }

    return { currentStreak, longestStreak };
  } catch (err) {
    console.error('[frequency getTrainingStreak] Error:', err);
    return { currentStreak: 0, longestStreak: 0 };
  }
}

/**
 * Calculates the average sessions per week over the range.
 *
 * @param timeRangeDays - Days to analyze
 * @returns Average sessions per week rounded to 1 decimal place
 */
export async function getSessionsPerWeek(timeRangeDays: number): Promise<number> {
  try {
    const cutoff = getCutoffTime(timeRangeDays);
    const sessions = await sessionsCollection
      .query(
        Q.where('status', 'completed'),
        Q.where('started_at', Q.gte(cutoff))
      )
      .fetch();

    if (sessions.length === 0) return 0;

    let weeks = timeRangeDays / 7;
    if (timeRangeDays <= 0) {
      // All time: find the difference between now and first session
      const allSessions = await sessionsCollection
        .query(Q.where('status', 'completed'), Q.sortBy('started_at', Q.asc))
        .fetch();
      if (allSessions.length === 0) return 0;
      const firstSessionTime = allSessions[0].startedAt.getTime();
      const diffMs = Date.now() - firstSessionTime;
      weeks = Math.max(1, diffMs / (7 * 24 * 60 * 60 * 1000));
    }

    return Math.round((sessions.length / weeks) * 10) / 10;
  } catch (err) {
    console.error('[frequency getSessionsPerWeek] Error:', err);
    return 0;
  }
}
