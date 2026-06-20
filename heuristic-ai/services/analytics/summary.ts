/**
 * HeuristicAI — Summary Analytics Service
 * Provides helpers to query local DB and calculate session-level summaries and breakdowns.
 * Source of truth: TASK.md (M6 Task 1), PRD.md § 5.6
 */

import { Q } from '@nozbe/watermelondb';
import { sessionsCollection, setsCollection, exercisesCollection } from '@/database';
import type { SetData, SessionData, HeuristicSummary } from '@/heuristic-engine/types';
import { calculateEstimated1RM, getBestSetForOneRM } from '@/heuristic-engine/1rm';
import { getRecoveryRecommendationHours } from '@/heuristic-engine/recovery';

export interface ExerciseBreakdown {
  exerciseSlug: string;
  exerciseName: string;
  setsCount: number;
  totalVolume: number;
  avgRpe: number;
  avgFormScore: number | null;
  bestWeightKg: number;
  bestReps: number;
}

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
 * Compiles a detailed breakdown of metrics grouped by exercise.
 *
 * @param sets - Array of sets completed in the session
 * @param exerciseNameMap - Map of exercise slugs to names
 * @returns Array of exercise breakdowns
 */
export function calculateExerciseBreakdown(
  sets: SetData[],
  exerciseNameMap: Map<string, string>
): ExerciseBreakdown[] {
  const breakdownMap = new Map<string, SetData[]>();
  for (const s of sets) {
    const list = breakdownMap.get(s.exerciseSlug) ?? [];
    list.push(s);
    breakdownMap.set(s.exerciseSlug, list);
  }

  const breakdown: ExerciseBreakdown[] = [];
  for (const [slug, exerciseSets] of breakdownMap.entries()) {
    const totalVolume = calculateTotalVolume(exerciseSets);
    const rpeValues = exerciseSets.map((s) => s.rpe).filter((r): r is number => r !== null);
    const avgRpe = rpeValues.length > 0 ? rpeValues.reduce((a, b) => a + b, 0) / rpeValues.length : 6.0;

    const formScores = exerciseSets.map((s) => s.formScore).filter((f): f is number => f !== null);
    const avgFormScore = formScores.length > 0 ? formScores.reduce((a, b) => a + b, 0) / formScores.length : null;

    let bestWeightKg = 0;
    let bestReps = 0;
    for (const s of exerciseSets) {
      if (s.actualWeightKg > bestWeightKg) {
        bestWeightKg = s.actualWeightKg;
        bestReps = s.completedReps;
      } else if (s.actualWeightKg === bestWeightKg && s.completedReps > bestReps) {
        bestReps = s.completedReps;
      }
    }

    breakdown.push({
      exerciseSlug: slug,
      exerciseName: exerciseNameMap.get(slug) || slug,
      setsCount: exerciseSets.length,
      totalVolume,
      avgRpe: Math.round(avgRpe * 10) / 10,
      avgFormScore: avgFormScore !== null ? Math.round(avgFormScore) : null,
      bestWeightKg,
      bestReps,
    });
  }

  return breakdown;
}

/**
 * Generates a full workout summary for a specific completed session ID, querying local DB.
 *
 * @param sessionId - The ID of the session
 * @returns Object containing the heuristic summary and the exercise breakdown
 */
export async function generateWorkoutSummary(
  sessionId: string
): Promise<{ summary: HeuristicSummary; breakdown: ExerciseBreakdown[] } | null> {
  try {
    const sessionRecord = await sessionsCollection.find(sessionId);
    if (!sessionRecord) return null;

    const sessionData: SessionData = {
      id: sessionRecord.id,
      userId: sessionRecord.userId,
      startedAt: sessionRecord.startedAt.getTime(),
      endedAt: sessionRecord.endedAt ? sessionRecord.endedAt.getTime() : null,
      status: sessionRecord.status as any,
      totalVolumeKg: sessionRecord.totalVolumeKg,
      avgRpe: sessionRecord.avgRpe,
      heuristicSummary: sessionRecord.heuristicSummary,
      synced: sessionRecord.synced,
    };

    const setsRecords = await setsCollection.query(Q.where('session_id', sessionId)).fetch();
    const mappedSets: SetData[] = setsRecords.map((record: any) => ({
      id: record.id,
      sessionId: record.sessionId,
      exerciseSlug: record.exerciseId,
      setNumber: record.setNumber,
      targetReps: record.targetReps,
      completedReps: record.completedReps,
      targetWeightKg: record.targetWeightKg,
      actualWeightKg: record.actualWeightKg,
      rpe: record.rpe,
      rpeEstimated: record.rpeEstimated,
      formScore: record.formScore,
      restSeconds: record.restSeconds,
      heuristicAction: record.heuristicAction ? JSON.parse(record.heuristicAction) : null,
      completedAt: record.completedAt.getTime(),
      synced: record.synced,
    }));

    const exercises = await exercisesCollection.query().fetch();
    const exerciseNameMap = new Map<string, string>();
    for (const ex of exercises) {
      exerciseNameMap.set(ex.slug, ex.name);
    }

    const totalVolume = calculateTotalVolume(mappedSets);
    const avgRpe = calculateAverageRPE(mappedSets);
    const topDecisions = getTopHeuristicNotes(mappedSets);

    const bestSetInput = mappedSets.map((s) => ({
      weightKg: s.actualWeightKg,
      reps: s.completedReps,
      formScore: s.formScore,
    }));
    const bestSet = getBestSetForOneRM(bestSetInput);
    const estimatedOneRmKg = bestSet ? calculateEstimated1RM(bestSet.weightKg, bestSet.reps) : null;

    const recoveryRecommendationHours = getRecoveryRecommendationHours(avgRpe);

    const formSummary = Array.from(new Set(mappedSets.map((s) => s.exerciseSlug)))
      .map((slug) => {
        const eSets = mappedSets.filter((s) => s.exerciseSlug === slug);
        const scores = eSets.map((s) => s.formScore).filter((score): score is number => score !== null);
        if (scores.length === 0) return null;
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        return {
          exerciseSlug: slug,
          avgScore: Math.round(avgScore),
        };
      })
      .filter((item): item is { exerciseSlug: string; avgScore: number } => item !== null);

    const summary: HeuristicSummary = {
      totalVolume,
      avgRpe,
      topDecisions,
      recoveryRecommendationHours,
      estimatedOneRmKg,
      formSummary,
    };

    const breakdown = calculateExerciseBreakdown(mappedSets, exerciseNameMap);

    return {
      summary,
      breakdown,
    };
  } catch (err) {
    console.error('[generateWorkoutSummary] Failed:', err);
    return null;
  }
}
