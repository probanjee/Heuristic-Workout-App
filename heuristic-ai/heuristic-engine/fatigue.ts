/**
 * File: heuristic-engine/fatigue.ts
 * Purpose: Logic for calculating session fatigue indices and corresponding fatigue levels
 * Dependencies: ./types, ./constants
 */

import type { SessionFatigueLevel } from './types';
import { ENGINE_CONSTANTS } from './constants';

/**
 * Calculates the rolling average RPE across all completed sets in the session.
 * Null RPEs are ignored.
 * If the input is empty or contains only nulls, returns 0.
 *
 * @param rpes - List of RPE scores logged so far
 * @returns Average RPE (0 if no valid RPEs)
 */
export function calculateSessionFatigueIndex(rpes: (number | null)[]): number {
  const validRpes = rpes.filter((r): r is number => r !== null);
  if (validRpes.length === 0) {
    return 0;
  }
  const sum = validRpes.reduce((acc, val) => acc + val, 0);
  return sum / validRpes.length;
}

/**
 * Maps a numeric fatigue index to a categorical fatigue level.
 *
 * @param index - The session fatigue index
 * @returns 'high' | 'moderate' | 'low'
 */
export function getFatigueLevel(index: number): SessionFatigueLevel {
  if (index >= ENGINE_CONSTANTS.FATIGUE_THRESHOLDS.HIGH) {
    return 'high';
  }
  if (index >= ENGINE_CONSTANTS.FATIGUE_THRESHOLDS.MODERATE) {
    return 'moderate';
  }
  return 'low';
}
