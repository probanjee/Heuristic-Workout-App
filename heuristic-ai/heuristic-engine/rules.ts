/**
 * File: heuristic-engine/rules.ts
 * Purpose: Core rules for the Heuristic Engine adjusting set weights, reps, rest, and fatigue alerts
 * Dependencies: ./types, ./constants, ./recovery
 */

import type { SetInput, RuleResult } from './types';
import { ENGINE_CONSTANTS } from './constants';
import { createRecoveryFlag } from './recovery';
import { roundWeight } from '../services/units/weight';

/**
 * Rule 1: Active Recovery Flag — Pre-emptive Volume Reduction
 * Fires when a recovery flag is active for this exercise.
 * Action: Reduce weight by 30% and reps by 20% (rounded).
 *
 * @param input - The current set input context
 * @returns A RuleResult indicating if matched and the proposed modifications
 */
export function ruleActiveRecoveryFlag(input: SetInput): RuleResult {
  const now = input.currentTimestamp ?? Date.now();
  const activeFlag = input.recoveryFlags.find(
    (f) =>
      (f.exerciseSlug === input.exerciseSlug || f.exerciseSlug === null) &&
      f.activeUntil > now,
  );

  if (activeFlag && activeFlag.flagType === 'volume_reduction') {
    const nextWeight = roundWeight(input.targetWeightKg * ENGINE_CONSTANTS.ADJUSTMENTS.RECOVERY_FLAG_WEIGHT_MULT);
    const nextReps = Math.ceil(input.targetReps * ENGINE_CONSTANTS.ADJUSTMENTS.RECOVERY_FLAG_REP_MULT);

    return {
      matched: true,
      ruleMatched: 'ruleActiveRecoveryFlag',
      actionType: 'volume_reduction',
      confidenceScore: ENGINE_CONSTANTS.CONFIDENCE.MATCHED,
      nextSetWeightKg: nextWeight,
      nextSetTargetReps: nextReps,
      coachNote: `Recovery flag active — volume reduced. ${activeFlag.reason}`,
    };
  }
  return { matched: false };
}

/**
 * Rule 2: Session Fatigue Index Critical — Terminate Warning
 * Fires when rolling average RPE is high (>= 8.5) and at least 4 sets are completed.
 * Action: Propose session termination warning.
 *
 * @param input - The current set input context
 * @returns A RuleResult indicating if matched and session termination request
 */
export function ruleSessionFatigue(input: SetInput): RuleResult {
  if (
    input.sessionFatigueIndex >= ENGINE_CONSTANTS.FATIGUE_THRESHOLDS.HIGH &&
    input.setNumber >= 4
  ) {
    return {
      matched: true,
      ruleMatched: 'ruleSessionFatigue',
      actionType: 'terminate_session',
      confidenceScore: ENGINE_CONSTANTS.CONFIDENCE.MATCHED,
      terminateSessionWarning: true,
      coachNote: `Average session RPE is ${input.sessionFatigueIndex.toFixed(1)} — consider ending here to protect recovery.`,
    };
  }
  return { matched: false };
}

/**
 * Rule 3: High RPE + Rep Failure — Weight Reduction + Rest Extension
 * Fires when RPE is high (>= 8) and user misses 2 or more reps.
 * Action: Reduce weight by 10% and add 45s rest. Add drop set if RPE is extremely high (>= 9).
 *
 * @param input - The current set input context
 * @returns A RuleResult with weight reduction and rest extension
 */
export function ruleRPERepFailure(input: SetInput): RuleResult {
  if (input.rpe === null || input.rpeEstimated) {
    return { matched: false };
  }

  const repDeficit = input.targetReps - input.completedReps;

  if (input.rpe >= 8 && repDeficit >= 2) {
    const addDropSet = input.rpe >= 9;
    const nextWeight = roundWeight(input.targetWeightKg * ENGINE_CONSTANTS.ADJUSTMENTS.RPE_FAILURE_WEIGHT_MULT);

    return {
      matched: true,
      ruleMatched: 'ruleRPERepFailure',
      actionType: 'reduce_weight',
      confidenceScore: ENGINE_CONSTANTS.CONFIDENCE.MATCHED,
      nextSetWeightKg: nextWeight,
      additionalRestSeconds: ENGINE_CONSTANTS.ADJUSTMENTS.RPE_FAILURE_ADDITIONAL_REST_SECS,
      addDropSet,
      coachNote: `RPE ${input.rpe} with ${repDeficit} missed reps — reducing weight 10%${addDropSet ? ' and adding a drop set' : ''}.`,
    };
  }
  return { matched: false };
}

/**
 * Rule 4: Form Degradation — Technique Correction
 * Fires when camera is active and form score drops below 60.
 * Action: Reduce weight (5% minor, 15% severe) and add rest (30s minor, 60s severe).
 *
 * @param input - The current set input context
 * @returns A RuleResult with technical correction adjustments
 */
export function ruleFormDegradation(input: SetInput): RuleResult {
  if (input.formScore === null) {
    return { matched: false };
  }

  if (input.formScore < ENGINE_CONSTANTS.FORM_THRESHOLDS.DEGRADATION_LIMIT) {
    const isSevere = input.formScore < ENGINE_CONSTANTS.FORM_THRESHOLDS.SEVERE_LIMIT;
    const multiplier = isSevere
      ? ENGINE_CONSTANTS.ADJUSTMENTS.SEVERE_FORM_WEIGHT_MULT
      : ENGINE_CONSTANTS.ADJUSTMENTS.MINOR_FORM_WEIGHT_MULT;
    const restSecs = isSevere
      ? ENGINE_CONSTANTS.ADJUSTMENTS.SEVERE_FORM_ADDITIONAL_REST_SECS
      : ENGINE_CONSTANTS.ADJUSTMENTS.MINOR_FORM_ADDITIONAL_REST_SECS;

    const nextWeight = roundWeight(input.targetWeightKg * multiplier);

    return {
      matched: true,
      ruleMatched: 'ruleFormDegradation',
      actionType: 'reduce_weight',
      confidenceScore: ENGINE_CONSTANTS.CONFIDENCE.MATCHED,
      nextSetWeightKg: nextWeight,
      additionalRestSeconds: restSecs,
      coachNote: `Form score ${input.formScore}/100 — ${isSevere ? 'significant technique breakdown detected. Reducing weight 15%.' : 'minor breakdown. Reducing weight 5%.'}`,
    };
  }
  return { matched: false };
}

/**
 * Rule 5: Deload Trigger — Chronic Overreaching Recovery Flag
 * Fires when 3 or more consecutive sessions have high RPE on this exercise.
 * Action: Create a volume reduction recovery flag.
 *
 * @param input - The current set input context
 * @returns A RuleResult with recovery flag to create
 */
export function ruleDeloadTrigger(input: SetInput): RuleResult {
  if (input.heuristicProfile.consecutiveHighRpe >= 3) {
    const now = input.currentTimestamp ?? Date.now();
    const flag = createRecoveryFlag(
      input.exerciseSlug,
      'volume_reduction',
      '3 consecutive high-RPE sessions detected. Volume reduced for recovery.',
      now
    );

    return {
      matched: true,
      ruleMatched: 'ruleDeloadTrigger',
      actionType: 'create_recovery_flag',
      confidenceScore: ENGINE_CONSTANTS.CONFIDENCE.MATCHED,
      recoveryFlagToCreate: flag,
      coachNote: `3 consecutive tough sessions on ${input.exerciseSlug}. Volume reduced 30% for the next ${flag.activeUntilHours} hours.`,
    };
  }
  return { matched: false };
}

/**
 * Rule 6: Easy Set — Progressive Overload Trigger
 * Fires when RPE is low (<= 4) and user completes all target reps.
 * Action: Increase weight by 5%.
 *
 * @param input - The current set input context
 * @returns A RuleResult with progressive overload increase
 */
export function ruleEasySet(input: SetInput): RuleResult {
  if (input.rpe === null || input.rpeEstimated) {
    return { matched: false };
  }

  if (input.rpe <= 4 && input.completedReps >= input.targetReps) {
    const nextWeight = roundWeight(input.targetWeightKg * ENGINE_CONSTANTS.ADJUSTMENTS.EASY_SET_WEIGHT_MULT);

    return {
      matched: true,
      ruleMatched: 'ruleEasySet',
      actionType: 'increase_weight',
      confidenceScore: ENGINE_CONSTANTS.CONFIDENCE.MATCHED,
      nextSetWeightKg: nextWeight,
      coachNote: `RPE ${input.rpe} — you have more in the tank. Adding 5% weight next set.`,
    };
  }
  return { matched: false };
}

/**
 * Rule 7: Drop Set Readiness
 * Fires when RPE is moderate (7-8), all reps are completed, and set number >= 3.
 * Action: Suggest a drop set for hypertrophy stimulus.
 *
 * @param input - The current set input context
 * @returns A RuleResult suggesting a drop set
 */
export function ruleDropSetReadiness(input: SetInput): RuleResult {
  if (input.rpe === null || input.rpeEstimated) {
    return { matched: false };
  }

  if (
    input.rpe >= 7 &&
    input.rpe <= 8 &&
    input.completedReps >= input.targetReps &&
    input.setNumber >= 3
  ) {
    return {
      matched: true,
      ruleMatched: 'ruleDropSetReadiness',
      actionType: 'add_drop_set',
      confidenceScore: ENGINE_CONSTANTS.CONFIDENCE.MATCHED,
      addDropSet: true,
      coachNote: `RPE ${input.rpe} — great work. A drop set here would maximize stimulus.`,
    };
  }
  return { matched: false };
}

/**
 * Rule 8: Consistent Form Improvement
 * Fires when form score is excellent (>= 85), RPE manageable (<= 7), and all reps completed.
 * Action: Increase weight by 2.5%.
 *
 * @param input - The current set input context
 * @returns A RuleResult with form-based progression increase
 */
export function ruleConsistentFormImprovement(input: SetInput): RuleResult {
  const effectiveRpe = input.rpe ?? ENGINE_CONSTANTS.DEFAULT_RPE;

  if (
    input.formScore !== null &&
    input.formScore >= ENGINE_CONSTANTS.FORM_THRESHOLDS.EXCELLENT_LIMIT &&
    effectiveRpe <= 7 &&
    input.completedReps >= input.targetReps
  ) {
    const nextWeight = roundWeight(input.targetWeightKg * ENGINE_CONSTANTS.ADJUSTMENTS.FORM_IMPROVEMENT_WEIGHT_MULT);

    return {
      matched: true,
      ruleMatched: 'ruleConsistentFormImprovement',
      actionType: 'increase_weight',
      confidenceScore: ENGINE_CONSTANTS.CONFIDENCE.MATCHED,
      nextSetWeightKg: nextWeight,
      coachNote: `Excellent form (${input.formScore}/100) — adding 2.5% weight to challenge you.`,
    };
  }
  return { matched: false };
}
