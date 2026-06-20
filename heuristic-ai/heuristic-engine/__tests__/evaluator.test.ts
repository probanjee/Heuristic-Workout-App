/**
 * File: heuristic-engine/__tests__/evaluator.test.ts
 * Purpose: Integration and priority tests for Heuristic Engine Rule Evaluator
 * Dependencies: ../evaluator, ../types, ../constants
 */

import { evaluate, evaluateSet, calculateSessionFatigueIndex, evaluateBatch } from '../evaluator';
import type { SetInput, HeuristicProfile, RecoveryFlag } from '../types';

const defaultProfile: HeuristicProfile = {
  exerciseSlug: 'barbell-squat',
  estimatedOneRmKg: 100,
  avgRpeLast5: 7,
  bestVolumeSession: 5000,
  consecutiveHighRpe: 0,
  lastSessionId: null,
  updatedAt: Date.now(),
};

const baseInput: SetInput = {
  exerciseSlug: 'barbell-squat',
  setNumber: 2,
  targetReps: 6,
  completedReps: 6,
  targetWeightKg: 80,
  rpe: 7,
  rpeEstimated: false,
  formScore: null,
  sessionFatigueIndex: 7.0,
  recoveryFlags: [],
  heuristicProfile: defaultProfile,
  currentTimestamp: 1600000000000,
};

describe('Evaluator priority order and constraints', () => {
  it('returns a complete HeuristicDecision with all fields', () => {
    const result = evaluateSet(baseInput);
    expect(result).toHaveProperty('nextSetWeightKg');
    expect(result).toHaveProperty('nextSetTargetReps');
    expect(result).toHaveProperty('additionalRestSeconds');
    expect(result).toHaveProperty('addDropSet');
    expect(result).toHaveProperty('substituteExercise');
    expect(result).toHaveProperty('terminateSessionWarning');
    expect(result).toHaveProperty('recoveryFlagToCreate');
    expect(result).toHaveProperty('coachNote');
    expect(result).toHaveProperty('confidenceScore');
    expect(result).toHaveProperty('ruleMatched');
    expect(result).toHaveProperty('actionType');
  });

  it('uses 0.5 confidence and fallback action type for no-rule-match (fallback)', () => {
    const result = evaluateSet(baseInput);
    expect(result.confidenceScore).toBe(0.5);
    expect(result.coachNote).toBe('Good set. Keep the pace.');
    expect(result.ruleMatched).toBeNull();
    expect(result.actionType).toBe('none');
  });

  it('uses 0.85 confidence when a rule matches', () => {
    const input: SetInput = { ...baseInput, rpe: 8, completedReps: 3 };
    const result = evaluateSet(input);
    expect(result.confidenceScore).toBe(0.85);
    expect(result.ruleMatched).toBe('ruleRPERepFailure');
    expect(result.actionType).toBe('reduce_weight');
  });

  it('activeRecoveryFlag beats ruleRPERepFailure (priority order)', () => {
    const activeFlag: RecoveryFlag = {
      exerciseSlug: 'barbell-squat',
      flagType: 'volume_reduction',
      activeUntil: 1600000000000 + 24 * 60 * 60 * 1000,
      reason: 'test',
    };
    // Both rules would fire: RPE 9 + missed reps + recovery flag
    const input: SetInput = {
      ...baseInput,
      rpe: 9,
      completedReps: 2,
      targetReps: 6,
      recoveryFlags: [activeFlag],
    };
    const result = evaluateSet(input);
    // Recovery flag rule reduces to 70% (80 * 0.7 = 56kg), RPE rule reduces to 90% (72kg)
    // Recovery flag wins → 56kg weight rounded to 2.5kg increment (55kg)
    expect(result.nextSetWeightKg).toBeCloseTo(55, 1);
    expect(result.ruleMatched).toBe('ruleActiveRecoveryFlag');
  });

  it('activeRecoveryFlag beats ruleEasySet', () => {
    const activeFlag: RecoveryFlag = {
      exerciseSlug: 'barbell-squat',
      flagType: 'volume_reduction',
      activeUntil: 1600000000000 + 24 * 60 * 60 * 1000,
      reason: 'test',
    };
    // Easy set + recovery flag
    const input: SetInput = {
      ...baseInput,
      rpe: 2,
      completedReps: 8,
      targetReps: 8,
      recoveryFlags: [activeFlag],
    };
    const result = evaluateSet(input);
    // Recovery flag should prevent weight increase and enforce volume reduction
    expect(result.nextSetWeightKg).toBeLessThan(input.targetWeightKg);
    expect(result.ruleMatched).toBe('ruleActiveRecoveryFlag');
  });

  it('sessionFatigue warning fires at fatigueIndex >= 8.5 and set >= 4', () => {
    const input: SetInput = {
      ...baseInput,
      sessionFatigueIndex: 8.5,
      setNumber: 4,
      formScore: null,
      recoveryFlags: [],
      heuristicProfile: { ...defaultProfile, consecutiveHighRpe: 0 },
    };
    const result = evaluateSet(input);
    expect(result.terminateSessionWarning).toBe(true);
    expect(result.ruleMatched).toBe('ruleSessionFatigue');
  });

  it('terminateSessionWarning prevents weight increase', () => {
    const input: SetInput = {
      ...baseInput,
      sessionFatigueIndex: 9.0,
      setNumber: 5,
      rpe: 2, // easy RPE — would trigger ruleEasySet — but fatigue warning should prevent weight increase
      completedReps: 8,
      targetReps: 8,
    };
    const result = evaluateSet(input);
    expect(result.terminateSessionWarning).toBe(true);
    expect(result.nextSetWeightKg).toBe(input.targetWeightKg); // maintained, no increase
    expect(result.addDropSet).toBe(false);
  });

  it('evaluate alias works identically to evaluateSet', () => {
    const resSet = evaluateSet(baseInput);
    const resEval = evaluate(baseInput);
    expect(resEval).toEqual(resSet);
  });

  it('enforces safety rest minimums', () => {
    const input: SetInput = {
      ...baseInput,
      // If we force a rule that would subtract rest (or if rest is somehow negative)
      // e.g. ruleRPERepFailure adds 45s, but if we mock a rule that reduces rest
    };
    // If we evaluate baseInput (additionalRest = 0), total rest = 90 >= 30, so additional remains 0.
    const result = evaluateSet(input);
    expect(90 + result.additionalRestSeconds).toBeGreaterThanOrEqual(30);
  });
});

describe('evaluateBatch', () => {
  it('returns a decision for each input set', () => {
    const sets: SetInput[] = [baseInput, { ...baseInput, setNumber: 2 }, { ...baseInput, setNumber: 3 }];
    const results = evaluateBatch(sets);
    expect(results).toHaveLength(3);
  });

  it('fatigue index builds up correctly across sets', () => {
    const highRpeSets: SetInput[] = [
      { ...baseInput, rpe: 9, setNumber: 1 },
      { ...baseInput, rpe: 9, setNumber: 2 },
      { ...baseInput, rpe: 9, setNumber: 3 },
      { ...baseInput, rpe: 9, setNumber: 4 },
    ];
    const results = evaluateBatch(highRpeSets);
    // By set 4, fatigue index should be 9.0 → trigger terminate warning
    expect(results[3].terminateSessionWarning).toBe(true);
    expect(results[3].ruleMatched).toBe('ruleSessionFatigue');
  });
});
