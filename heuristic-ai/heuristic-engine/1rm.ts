/**
 * File: heuristic-engine/1rm.ts
 * Purpose: One-Rep Max (1RM) calculators using Epley and Brzycki formulas
 * Dependencies: None
 */

import { roundWeight } from '../services/units/weight';

export class InvalidArgumentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidArgumentError';
  }
}

/**
 * Calculates 1RM using the Epley formula.
 * Formula: 1RM = weight * (1 + reps / 30)
 *
 * @param weightKg - Weight lifted in kg
 * @param reps - Repetitions performed
 * @returns Estimated 1RM in kg
 * @throws InvalidArgumentError if weightKg <= 0 or reps <= 0
 */
export function calculateEpley1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0) {
    throw new InvalidArgumentError('Weight must be greater than 0');
  }
  if (reps <= 0) {
    throw new InvalidArgumentError('Reps must be greater than 0');
  }
  if (reps === 1) {
    return weightKg;
  }
  return weightKg * (1 + reps / 30);
}

/**
 * Calculates 1RM using the Brzycki formula.
 * Formula: 1RM = weight * 36 / (37 - reps)
 * Reps are clamped to 20 for safety/stability of formula.
 *
 * @param weightKg - Weight lifted in kg
 * @param reps - Repetitions performed
 * @returns Estimated 1RM in kg
 * @throws InvalidArgumentError if weightKg <= 0 or reps <= 0
 */
export function calculateBrzycki1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0) {
    throw new InvalidArgumentError('Weight must be greater than 0');
  }
  if (reps <= 0) {
    throw new InvalidArgumentError('Reps must be greater than 0');
  }
  if (reps === 1) {
    return weightKg;
  }
  const clampedReps = Math.min(reps, 20);
  return weightKg * (36 / (37 - clampedReps));
}

/**
 * Calculates Estimated 1RM by averaging Epley and Brzycki estimates.
 * Rounds the result to the nearest 0.5kg.
 *
 * @param weightKg - Weight lifted in kg
 * @param reps - Repetitions performed
 * @returns Averaged estimated 1RM in kg
 * @throws InvalidArgumentError if weightKg <= 0 or reps <= 0
 */
export function calculateEstimated1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0) {
    throw new InvalidArgumentError('Weight must be greater than 0');
  }
  if (reps <= 0) {
    throw new InvalidArgumentError('Reps must be greater than 0');
  }
  if (reps === 1) {
    return weightKg;
  }
  const epley = calculateEpley1RM(weightKg, reps);
  const brzycki = calculateBrzycki1RM(weightKg, reps);
  return roundWeight((epley + brzycki) / 2);
}

// ─── COMPATIBILITY ALIASES ───────────────────────────────────────────────────

export function calculateEpley(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  return calculateEpley1RM(weightKg, reps);
}

export function calculateBrzycki(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  return calculateBrzycki1RM(weightKg, reps);
}

export function calculateOneRM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  return calculateEstimated1RM(weightKg, reps);
}

/**
 * Estimates recommended training weight for a given target reps range.
 *
 * @param oneRmKg - Estimated 1-Rep Max in kg
 * @param targetReps - Programmed target reps
 * @returns Target weight rounded to nearest 2.5kg
 */
export function trainingWeightFromOneRM(
  oneRmKg: number,
  targetReps: number,
): number {
  const percentageMap: Record<number, number> = {
    1: 1.0,
    2: 0.97,
    3: 0.94,
    4: 0.91,
    5: 0.88,
    6: 0.85,
    7: 0.83,
    8: 0.80,
    9: 0.77,
    10: 0.75,
    11: 0.73,
    12: 0.70,
    15: 0.65,
    20: 0.60,
  };

  const keys = Object.keys(percentageMap).map(Number).sort((a, b) => a - b);
  const closestKey = keys.reduce((prev, curr) =>
    Math.abs(curr - targetReps) < Math.abs(prev - targetReps) ? curr : prev,
  );

  const percentage = percentageMap[closestKey] ?? 0.70;
  return roundWeight(oneRmKg * percentage);
}

export interface SetForCalculation {
  weightKg: number;
  reps: number;
  formScore: number | null;
}

/**
 * Scans logged sets and returns the best set to use for 1RM estimations.
 *
 * @param sets - Sets logged in the session
 * @returns Best set or null
 */
export function getBestSetForOneRM(sets: SetForCalculation[]): SetForCalculation | null {
  if (sets.length === 0) return null;

  const validSets = sets.filter((s) => s.reps >= 1 && s.reps <= 10 && s.weightKg > 0);
  if (validSets.length === 0) {
    return sets.find((s) => s.reps >= 1 && s.weightKg > 0) ?? null;
  }

  return validSets.sort((a, b) => {
    const aOneRM = calculateEstimated1RM(a.weightKg, a.reps);
    const bOneRM = calculateEstimated1RM(b.weightKg, b.reps);
    if (Math.abs(aOneRM - bOneRM) < 2) {
      return (b.formScore ?? 50) - (a.formScore ?? 50);
    }
    return bOneRM - aOneRM;
  })[0];
}
