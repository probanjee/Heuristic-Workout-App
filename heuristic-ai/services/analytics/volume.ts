/**
 * HeuristicAI — Volume Analytics Service
 * Source of truth: TASK.md (M6 Task 4), TRD.md § 7
 */

import { Q } from '@nozbe/watermelondb';
import { setsCollection, exercisesCollection } from '@/database';
import type WorkoutSet from '@/database/models/Set';

/**
 * Computes the cutoff timestamp (ms) for a given range in days.
 * 0 or negative days denotes "All Time" (returns 0).
 */
export function getCutoffTime(days: number): number {
  if (days <= 0) return 0;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  cutoff.setHours(0, 0, 0, 0);
  return cutoff.getTime();
}

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
 * Calculates the start date (Monday) of the week for a given date.
 */
export function getStartOfWeek(date: Date): string {
  const temp = new Date(date.getTime());
  const day = temp.getDay();
  // Adjust to Monday: if Sunday (0), go back 6 days. Otherwise, adjust to Monday (1)
  const diff = temp.getDate() - day + (day === 0 ? -6 : 1);
  temp.setDate(diff);
  return formatDate(temp.getTime());
}

/**
 * Fetches completed sets in the specified range.
 */
async function fetchSetsInRange(timeRangeDays: number): Promise<WorkoutSet[]> {
  try {
    const cutoff = getCutoffTime(timeRangeDays);
    return await setsCollection
      .query(
        Q.where('completed_at', Q.gte(cutoff)),
        Q.on('sessions', 'status', 'completed')
      )
      .fetch();
  } catch (err) {
    console.error('[volume fetchSetsInRange] Error:', err);
    return [];
  }
}

/**
 * Returns volume aggregated by week and muscle group for the selected range.
 *
 * @param timeRangeDays - Days to analyze
 * @returns Array of weekly volume per muscle group
 */
export async function getWeeklyVolumeByMuscleGroup(
  timeRangeDays: number
): Promise<{ week: string; muscle: string; volume: number }[]> {
  const sets = await fetchSetsInRange(timeRangeDays);
  if (sets.length === 0) return [];

  const exercises = await exercisesCollection.query().fetch();
  const muscleMap = new Map(exercises.map((e) => [e.slug, e.musclePrimary]));

  // Grouping key: `${weekStart}_${muscle}`
  const groups: Record<string, { week: string; muscle: string; volume: number }> = {};

  for (const set of sets) {
    const muscle = muscleMap.get(set.exerciseId) || 'Other';
    const week = getStartOfWeek(set.completedAt);
    const key = `${week}_${muscle}`;
    const vol = set.actualWeightKg * set.completedReps;

    if (!groups[key]) {
      groups[key] = { week, muscle, volume: 0 };
    }
    groups[key].volume += vol;
  }

  return Object.values(groups).sort((a, b) => {
    // Sort by week ascending, then muscle group alphabetically
    const cmp = a.week.localeCompare(b.week);
    if (cmp !== 0) return cmp;
    return a.muscle.localeCompare(b.muscle);
  });
}

/**
 * Returns volume aggregated by exercise for the selected range.
 *
 * @param timeRangeDays - Days to analyze
 * @returns Array of volume per exercise
 */
export async function getVolumeByExercise(
  timeRangeDays: number
): Promise<{ exerciseName: string; volume: number }[]> {
  const sets = await fetchSetsInRange(timeRangeDays);
  if (sets.length === 0) return [];

  const exercises = await exercisesCollection.query().fetch();
  const nameMap = new Map(exercises.map((e) => [e.slug, e.name]));

  const groups: Record<string, number> = {};
  for (const set of sets) {
    const name = nameMap.get(set.exerciseId) || set.exerciseId;
    const vol = set.actualWeightKg * set.completedReps;
    groups[name] = (groups[name] ?? 0) + vol;
  }

  return Object.entries(groups)
    .map(([exerciseName, volume]) => ({ exerciseName, volume }))
    .sort((a, b) => b.volume - a.volume); // Highest volume first
}

/**
 * Returns the total volume lifted within the specified range.
 *
 * @param timeRangeDays - Days to analyze
 * @returns Total volume in kg
 */
export async function getTotalVolumeForRange(timeRangeDays: number): Promise<number> {
  const sets = await fetchSetsInRange(timeRangeDays);
  return sets.reduce((sum, s) => sum + s.actualWeightKg * s.completedReps, 0);
}
