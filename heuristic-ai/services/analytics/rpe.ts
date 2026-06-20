/**
 * HeuristicAI — RPE Analytics Service
 * Source of truth: TASK.md (M6 Task 5), PRD.md § 5.3
 */

import { Q } from '@nozbe/watermelondb';
import { setsCollection, sessionsCollection } from '@/database';
import { getCutoffTime } from './volume';
import type WorkoutSet from '@/database/models/Set';

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
 * Returns RPE average trend per workout session date, sorted chronologically.
 *
 * @param timeRangeDays - Days to analyze
 * @returns Array of date, avg RPE, and estimated status objects
 */
export async function getRPETrend(
  timeRangeDays: number
): Promise<{ date: string; avgRpe: number; isEstimated: boolean }[]> {
  try {
    const cutoff = getCutoffTime(timeRangeDays);
    const sets = await setsCollection
      .query(
        Q.where('completed_at', Q.gte(cutoff)),
        Q.on('sessions', 'status', 'completed')
      )
      .fetch();

    if (sets.length === 0) return [];

    // Group by date
    const dateGroups: Record<string, { rpes: number[]; estimatedCount: number }> = {};
    for (const set of sets) {
      if (set.rpe === null) continue;
      const dateStr = formatDate(set.completedAt.getTime());

      if (!dateGroups[dateStr]) {
        dateGroups[dateStr] = { rpes: [], estimatedCount: 0 };
      }
      dateGroups[dateStr].rpes.push(set.rpe);
      if (set.rpeEstimated) {
        dateGroups[dateStr].estimatedCount++;
      }
    }

    return Object.entries(dateGroups)
      .map(([date, data]) => {
        const sum = data.rpes.reduce((a, b) => a + b, 0);
        const avgRpe = sum / data.rpes.length;
        // Marked estimated if at least one set in the day was estimated
        const isEstimated = data.estimatedCount > 0;
        return {
          date,
          avgRpe: Math.round(avgRpe * 10) / 10,
          isEstimated,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (err) {
    console.error('[rpe getRPETrend] Error:', err);
    return [];
  }
}

/**
 * Calculates the average RPE across all sets logged in the specified range.
 *
 * @param timeRangeDays - Days to analyze
 * @returns Average RPE rounded to 1 decimal place (default 6.0 if no data)
 */
export async function getAverageRPEForRange(timeRangeDays: number): Promise<number> {
  try {
    const cutoff = getCutoffTime(timeRangeDays);
    const sets = await setsCollection
      .query(
        Q.where('completed_at', Q.gte(cutoff)),
        Q.on('sessions', 'status', 'completed')
      )
      .fetch();

    const rpeValues = sets.map((s) => s.rpe).filter((r): r is number => r !== null);
    if (rpeValues.length === 0) return 6.0;

    const sum = rpeValues.reduce((a, b) => a + b, 0);
    return Math.round((sum / rpeValues.length) * 10) / 10;
  } catch (err) {
    console.error('[rpe getAverageRPEForRange] Error:', err);
    return 6.0;
  }
}

/**
 * Counts the number of sessions in the specified range with an average RPE >= 8.0.
 *
 * @param timeRangeDays - Days to analyze
 * @returns Count of high-RPE sessions
 */
export async function getHighRPESessions(timeRangeDays: number): Promise<number> {
  try {
    const cutoff = getCutoffTime(timeRangeDays);
    const sessions = await sessionsCollection
      .query(
        Q.where('status', 'completed'),
        Q.where('started_at', Q.gte(cutoff))
      )
      .fetch();

    return sessions.filter((s) => s.avgRpe && s.avgRpe >= 8.0).length;
  } catch (err) {
    console.error('[rpe getHighRPESessions] Error:', err);
    return 0;
  }
}
