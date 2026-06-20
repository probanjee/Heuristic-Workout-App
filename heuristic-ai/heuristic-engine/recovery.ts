/**
 * File: heuristic-engine/recovery.ts
 * Purpose: Service for creating, checking, and filtering recovery flags
 * Dependencies: ./types, ./constants
 */

import type { RecoveryFlag } from './types';
import { ENGINE_CONSTANTS } from './constants';

/**
 * Creates a RecoveryFlag with duration based on type.
 * volume_reduction = 24h, rest_day = 48h, deload = 72h.
 * All timestamp logic is deterministic.
 *
 * @param exerciseSlug - Slug of exercise or null for full-body flag
 * @param flagType - 'volume_reduction' | 'rest_day' | 'deload'
 * @param reason - Reason for flag creation
 * @param currentTimestamp - The current Unix ms timestamp
 * @returns The created RecoveryFlag
 */
export function createRecoveryFlag(
  exerciseSlug: string | null,
  flagType: RecoveryFlag['flagType'],
  reason: string,
  currentTimestamp: number
): RecoveryFlag {
  const hours = ENGINE_CONSTANTS.RECOVERY_DURATIONS[flagType];
  return {
    exerciseSlug,
    flagType,
    activeUntil: currentTimestamp + hours * 60 * 60 * 1000,
    activeUntilHours: hours,
    reason,
  };
}

/**
 * Checks if a recovery flag is active at a given timestamp.
 *
 * @param flag - The RecoveryFlag to evaluate
 * @param currentTimestamp - Unix ms timestamp to check against
 * @returns boolean
 */
export function isRecoveryFlagActive(flag: RecoveryFlag, currentTimestamp: number): boolean {
  return flag.activeUntil > currentTimestamp;
}

/**
 * Filters a list of recovery flags, returning only those that have not expired.
 *
 * @param flags - List of RecoveryFlags
 * @param currentTimestamp - Unix ms timestamp to filter against
 * @returns Array of active RecoveryFlags
 */
export function expireRecoveryFlags(flags: RecoveryFlag[], currentTimestamp: number): RecoveryFlag[] {
  return flags.filter((f) => isRecoveryFlagActive(f, currentTimestamp));
}

/**
 * Filters a list of recovery flags, returning only those that have not expired.
 *
 * @param flags - List of RecoveryFlags
 * @param currentTimestamp - Unix ms timestamp to filter against
 * @returns Array of active RecoveryFlags
 */
export function getActiveRecoveryFlags(flags: RecoveryFlag[], currentTimestamp: number): RecoveryFlag[] {
  return flags.filter((f) => isRecoveryFlagActive(f, currentTimestamp));
}

// ─── COMPATIBILITY ALIASES & HELPERS ──────────────────────────────────────────

/**
 * Check if active using Date.now().
 */
export function isFlagActive(flag: RecoveryFlag): boolean {
  return isRecoveryFlagActive(flag, Date.now());
}

/**
 * Get active flags using Date.now().
 */
export function getActiveFlags(flags: RecoveryFlag[]): RecoveryFlag[] {
  return getActiveRecoveryFlags(flags, Date.now());
}

/**
 * Get flags relevant for a specific exercise that are active.
 */
export function getFlagsForExercise(
  flags: RecoveryFlag[],
  exerciseSlug: string,
): RecoveryFlag[] {
  const now = Date.now();
  return getActiveRecoveryFlags(flags, now).filter(
    (f) => f.exerciseSlug === exerciseSlug || f.exerciseSlug === null,
  );
}

/**
 * Returns a recommended recovery duration in hours based on average RPE.
 */
export function getRecoveryRecommendationHours(avgRpe: number): 24 | 48 | 72 {
  if (avgRpe >= 8) return 72; // high fatigue — 3 days
  if (avgRpe >= 6) return 48; // moderate fatigue — 2 days
  return 24; // low fatigue — 1 day
}

/**
 * Get time remaining in ms.
 */
export function getTimeRemainingMs(flag: RecoveryFlag): number {
  return Math.max(0, flag.activeUntil - Date.now());
}

/**
 * Get time remaining in hours.
 */
export function getTimeRemainingHours(flag: RecoveryFlag): number {
  return Math.round(getTimeRemainingMs(flag) / (60 * 60 * 1000));
}

/**
 * Returns user-facing label for a flag.
 */
export function getFlagDisplayLabel(flag: RecoveryFlag): string {
  const hours = getTimeRemainingHours(flag);
  const type =
    flag.flagType === 'volume_reduction'
      ? 'Volume reduced'
      : flag.flagType === 'rest_day'
        ? 'Rest day recommended'
        : 'Deload week active';
  return `${type} — ${hours}h remaining`;
}
