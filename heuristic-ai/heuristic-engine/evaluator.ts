/**
 * File: heuristic-engine/evaluator.ts
 * Purpose: Priority-ordered rule evaluator for the Heuristic Engine
 * Dependencies: ./types, ./constants, ./rules, ./fatigue
 */

import type { SetInput, HeuristicDecision, RuleFunction } from './types';
import { ENGINE_CONSTANTS } from './constants';
import { roundWeight } from '../services/units/weight';
import {
  ruleActiveRecoveryFlag,
  ruleSessionFatigue,
  ruleRPERepFailure,
  ruleFormDegradation,
  ruleDeloadTrigger,
  ruleEasySet,
  ruleDropSetReadiness,
  ruleConsistentFormImprovement,
} from './rules';
import { calculateSessionFatigueIndex } from './fatigue';

// Re-export for compatibility with other components and existing tests
export { calculateSessionFatigueIndex } from './fatigue';

// Rule priority ordering: safety and fatigue checks first, then load adjustments, then progression
const RULE_PRIORITY: RuleFunction[] = [
  ruleActiveRecoveryFlag,
  ruleSessionFatigue,
  ruleRPERepFailure,
  ruleFormDegradation,
  ruleDeloadTrigger,
  ruleEasySet,
  ruleDropSetReadiness,
  ruleConsistentFormImprovement,
];

/**
 * Evaluates a set input against rules in priority order and returns a HeuristicDecision.
 * Enforces safety limits: reps >= 1, rest >= MIN_REST_SECONDS, weight rounded to nearest 0.5kg.
 *
 * @param input - The set performance data
 * @returns A complete HeuristicDecision structure
 */
export function evaluateSet(input: SetInput): HeuristicDecision {
  // 1. Setup fallback / default decision
  const decision: HeuristicDecision = {
    nextSetWeightKg: input.targetWeightKg,
    nextSetTargetReps: input.targetReps,
    additionalRestSeconds: 0,
    addDropSet: false,
    substituteExercise: null,
    terminateSessionWarning: false,
    recoveryFlagToCreate: null,
    coachNote: 'Good set. Keep the pace.',
    confidenceScore: ENGINE_CONSTANTS.CONFIDENCE.FALLBACK, // 0.5
    ruleMatched: null,
    actionType: 'none',
  };

  // 2. Evaluate rules in priority order — first match wins
  for (const rule of RULE_PRIORITY) {
    const result = rule(input);
    if (result.matched) {
      // Merge rule result overrides into the default decision
      Object.assign(decision, result);
      // Clean up the temporary matched field
      delete (decision as any).matched;
      break;
    }
  }

  // 3. Apply safety constraints and rules
  
  // Weight rounded using centralized utility (defaults to 2.5kg)
  decision.nextSetWeightKg = roundWeight(decision.nextSetWeightKg);

  // Reps never below 1
  if (decision.nextSetTargetReps < 1) {
    decision.nextSetTargetReps = 1;
  }

  // Rest seconds never below minimum
  const totalRest = ENGINE_CONSTANTS.DEFAULT_REST_SECONDS + decision.additionalRestSeconds;
  if (totalRest < ENGINE_CONSTANTS.MIN_REST_SECONDS) {
    decision.additionalRestSeconds = ENGINE_CONSTANTS.MIN_REST_SECONDS - ENGINE_CONSTANTS.DEFAULT_REST_SECONDS;
  }

  // Safety: never increase weight during a terminate warning
  if (decision.terminateSessionWarning) {
    decision.nextSetWeightKg = Math.min(decision.nextSetWeightKg, input.targetWeightKg);
    decision.addDropSet = false;
  }

  // Safety: never increase weight if a recovery flag was created
  if (decision.recoveryFlagToCreate !== null) {
    decision.nextSetWeightKg = Math.min(decision.nextSetWeightKg, input.targetWeightKg);
    decision.addDropSet = false;
  }

  return decision;
}

/**
 * Compatibility alias for evaluateSet.
 */
export function evaluate(input: SetInput): HeuristicDecision {
  return evaluateSet(input);
}

/**
 * Evaluates multiple sets sequentially.
 * Used for session replay, logging, and historical simulation.
 *
 * @param sets - Array of historical set data
 * @returns Array of decisions corresponding to each set
 */
export function evaluateBatch(sets: SetInput[]): HeuristicDecision[] {
  const rpeHistory: (number | null)[] = [];
  return sets.map((set) => {
    const currentFatigue = calculateSessionFatigueIndex(rpeHistory);
    const decision = evaluateSet({
      ...set,
      sessionFatigueIndex: currentFatigue,
    });
    rpeHistory.push(set.rpe);
    return decision;
  });
}
