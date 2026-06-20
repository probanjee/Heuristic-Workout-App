/**
 * HeuristicAI — One-Rep Max Analytics Service
 * Source of truth: TASK.md (M6 Task 3), TRD.md § 6
 */

import { Q } from '@nozbe/watermelondb';
import { setsCollection, sessionsCollection } from '@/database';
import { calculateEstimated1RM } from '@/heuristic-engine/1rm';
import type WorkoutSet from '@/database/models/Set';

/**
 * Helper to retrieve all logged sets for an exercise under completed sessions.
 */
async function fetchCompletedSets(exerciseSlug: string): Promise<WorkoutSet[]> {
  try {
    return await setsCollection
      .query(
        Q.where('exercise_id', exerciseSlug),
        Q.on('sessions', 'status', 'completed')
      )
      .fetch();
  } catch (err) {
    console.error('[one-rm fetchCompletedSets] Error:', err);
    return [];
  }
}

/**
 * Formats a Date object or timestamp as YYYY-MM-DD local date string.
 */
function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns the highest estimated 1RM logged for the specified exercise across all time.
 *
 * @param exerciseSlug - The unique slug of the exercise
 * @returns Best estimated 1RM in kg, or null if no data
 */
export async function getBestEstimated1RM(exerciseSlug: string): Promise<number | null> {
  const sets = await fetchCompletedSets(exerciseSlug);
  if (sets.length === 0) return null;

  let maxOneRm = 0;
  for (const set of sets) {
    if (set.actualWeightKg > 0 && set.completedReps > 0) {
      const oneRm = calculateEstimated1RM(set.actualWeightKg, set.completedReps);
      if (oneRm > maxOneRm) {
        maxOneRm = oneRm;
      }
    }
  }

  return maxOneRm > 0 ? maxOneRm : null;
}

/**
 * Returns the progression of estimated 1RM for the specified exercise over time.
 * Returns one best 1RM per workout session date, sorted chronologically.
 *
 * @param exerciseSlug - The unique slug of the exercise
 * @returns Array of date and 1RM pairings
 */
export async function get1RMProgression(
  exerciseSlug: string
): Promise<{ date: string; oneRm: number }[]> {
  const sets = await fetchCompletedSets(exerciseSlug);
  if (sets.length === 0) return [];

  // Group sets by local date
  const groups: Record<string, number> = {};
  for (const set of sets) {
    if (set.actualWeightKg <= 0 || set.completedReps <= 0) continue;
    const dateStr = formatDate(set.completedAt.getTime());
    const oneRm = calculateEstimated1RM(set.actualWeightKg, set.completedReps);
    groups[dateStr] = Math.max(groups[dateStr] ?? 0, oneRm);
  }

  return Object.entries(groups)
    .map(([date, oneRm]) => ({ date, oneRm }))
    .sort((a, b) => a.date.localeCompare(b.date)); // older to newer
}

/**
 * Compares the latest session 1RM to the previous session 1RM for an exercise.
 *
 * @param exerciseSlug - The unique slug of the exercise
 * @returns Object with current/previous 1RMs and percent change, or null
 */
export async function getLatest1RMComparison(
  exerciseSlug: string
): Promise<{ current: number; previous: number; percentChange: number } | null> {
  const progression = await get1RMProgression(exerciseSlug);
  if (progression.length < 2) {
    if (progression.length === 1) {
      return {
        current: progression[0].oneRm,
        previous: 0,
        percentChange: 0,
      };
    }
    return null;
  }

  const current = progression[progression.length - 1].oneRm;
  const previous = progression[progression.length - 2].oneRm;
  const percentChange = previous > 0 ? ((current - previous) / previous) * 100 : 0;

  return {
    current,
    previous,
    percentChange: Math.round(percentChange * 10) / 10,
  };
}
