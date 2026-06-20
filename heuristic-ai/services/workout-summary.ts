/**
 * HeuristicAI — Workout Summary Logic Service
 * Provides helpers to aggregate session metrics, volume, RPE, duration, and AI coach notes.
 * Source of truth: TASK.md § 14
 */

import type { SetData, SessionData, HeuristicSummary } from '@/heuristic-engine/types';
import { calculateEstimated1RM, getBestSetForOneRM } from '@/heuristic-engine/1rm';
import { getRecoveryRecommendationHours } from '@/heuristic-engine/recovery';

/**
 * Calculates the total training volume accumulated during a workout session.
 * Formula: Sum(actual weight * completed reps) for each set.
 *
 * @param sets - Array of sets completed in the session
 * @returns Total training volume in kilograms
 */
export function calculateTotalVolume(sets: SetData[]): number {
  return sets.reduce((sum, s) => sum + s.actualWeightKg * s.completedReps, 0);
}

/**
 * Calculates the average Rate of Perceived Exertion (RPE) across all sets that have it logged.
 * Sets with null RPE (skipped) are excluded from the average calculation.
 * If no sets have an RPE rating, returns a default value of 6.0.
 *
 * @param sets - Array of sets completed in the session
 * @returns Average RPE rating rounded to 1 decimal place
 */
export function calculateAverageRPE(sets: SetData[]): number {
  const rpeValues = sets.map((s) => s.rpe).filter((r): r is number => r !== null);
  if (rpeValues.length === 0) return 6.0;
  const sum = rpeValues.reduce((a, b) => a + b, 0);
  return Math.round((sum / rpeValues.length) * 10) / 10;
}

/**
 * Calculates the elapsed session duration in seconds.
 *
 * @param startedAt - Unix timestamp (ms) when the session started
 * @param endedAt - Unix timestamp (ms) when the session ended, or null if active
 * @returns Session duration in seconds
 */
export function calculateSessionDuration(startedAt: number, endedAt: number | null): number {
  const end = endedAt ?? Date.now();
  return Math.max(0, Math.floor((end - startedAt) / 1000));
}

/**
 * Groups and counts heuristic decisions (coach notes) to isolate the top 3 matches.
 * Ordered by frequency descending.
 *
 * @param sets - Array of sets completed in the session
 * @returns Array of grouped coach notes and their frequency counts (up to 3 items)
 */
export function getTopHeuristicNotes(sets: SetData[]): { coachNote: string; count: number }[] {
  const noteCounts: Record<string, number> = {};
  for (const s of sets) {
    if (s.heuristicAction?.coachNote) {
      const note = s.heuristicAction.coachNote;
      noteCounts[note] = (noteCounts[note] ?? 0) + 1;
    }
  }

  return Object.entries(noteCounts)
    .sort((a, b) => b[1] - a[1]) // highest frequency first
    .slice(0, 3)
    .map(([coachNote, count]) => ({ coachNote, count }));
}

/**
 * Compiles a comprehensive HeuristicSummary payload for the completed session.
 * Combines volume, RPE, duration, top heuristic decisions, estimated 1RM, and form score averages.
 *
 * @param session - The parent session data record
 * @param sets - All sets logged under the session
 * @returns Generated heuristic summary data
 */
export function generateSessionSummary(session: SessionData, sets: SetData[]): HeuristicSummary {
  const totalVolume = calculateTotalVolume(sets);
  const avgRpe = calculateAverageRPE(sets);
  const topDecisions = getTopHeuristicNotes(sets);

  // Calculate 1RM from best set in the entire session
  const bestSetInput = sets.map((s) => ({
    weightKg: s.actualWeightKg,
    reps: s.completedReps,
    formScore: s.formScore,
  }));
  const bestSet = getBestSetForOneRM(bestSetInput);
  const estimatedOneRmKg = bestSet ? calculateEstimated1RM(bestSet.weightKg, bestSet.reps) : null;

  // Recovery recommendation based on average RPE
  const recoveryRecommendationHours = getRecoveryRecommendationHours(avgRpe);

  // Group form scores by exercise slug to present average performance
  const exerciseSlugs = Array.from(new Set(sets.map((s) => s.exerciseSlug)));
  const formSummary = exerciseSlugs
    .map((slug) => {
      const exerciseSets = sets.filter((s) => s.exerciseSlug === slug);
      const scores = exerciseSets.map((s) => s.formScore).filter((score): score is number => score !== null);
      if (scores.length === 0) return null;
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      return {
        exerciseSlug: slug,
        avgScore: Math.round(avgScore),
      };
    })
    .filter((item): item is { exerciseSlug: string; avgScore: number } => item !== null);

  return {
    totalVolume,
    avgRpe,
    topDecisions,
    recoveryRecommendationHours,
    estimatedOneRmKg,
    formSummary,
  };
}
