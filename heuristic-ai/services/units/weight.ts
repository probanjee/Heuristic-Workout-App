/**
 * HeuristicAI — Weight Rounding Utilities
 * Centralizes rounding logic for barbell/dumbbell weights (defaults to 2.5kg increments).
 * Source of truth: TASK.md § 12, PRD.md § 4.3
 */

/**
 * Rounds a weight value to the nearest specified increment (default is 2.5kg).
 * @param weight The raw weight to round
 * @param increment The rounding increment (e.g. 2.5, 0.5)
 * @returns Rounded weight value
 */
export function roundWeight(weight: number, increment = 2.5): number {
  if (increment <= 0) return weight;
  return Math.round(weight / increment) * increment;
}
