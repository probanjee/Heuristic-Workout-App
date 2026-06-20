/**
 * File: heuristic-engine/__tests__/rules.test.ts
 * Purpose: Unit tests for Heuristic Engine core rules
 * Dependencies: ../rules, ../types, ../constants
 */

import {
  ruleRPERepFailure,
  ruleEasySet,
  ruleFormDegradation,
  ruleSessionFatigue,
  ruleDeloadTrigger,
  ruleActiveRecoveryFlag,
  ruleDropSetReadiness,
  ruleConsistentFormImprovement,
} from '../rules';
import type { SetInput, HeuristicProfile, RecoveryFlag } from '../types';
import { ENGINE_CONSTANTS } from '../constants';

// ─── TEST FIXTURES ─────────────────────────────────────────────────────────────

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
  currentTimestamp: 1600000000000, // deterministic timestamp
};

// ─── RULE 1: ruleRPERepFailure ────────────────────────────────────────────────

describe('ruleRPERepFailure', () => {
  it('triggers at RPE 8 with 2 missed reps', () => {
    const input: SetInput = {
      ...baseInput,
      rpe: 8,
      completedReps: 4,
      targetReps: 6,
    };
    const result = ruleRPERepFailure(input);
    expect(result.matched).toBe(true);
    expect(result.ruleMatched).toBe('ruleRPERepFailure');
    expect(result.actionType).toBe('reduce_weight');
    expect(result.nextSetWeightKg).toBeCloseTo(72.5, 1);
    expect(result.additionalRestSeconds).toBe(45);
    expect(result.addDropSet).toBe(false);
  });

  it('adds drop set when RPE is 9', () => {
    const input: SetInput = { ...baseInput, rpe: 9, completedReps: 3, targetReps: 6 };
    const result = ruleRPERepFailure(input);
    expect(result.matched).toBe(true);
    expect(result.ruleMatched).toBe('ruleRPERepFailure');
    expect(result.actionType).toBe('reduce_weight');
    expect(result.addDropSet).toBe(true);
  });

  it('adds drop set when RPE is 10', () => {
    const input: SetInput = { ...baseInput, rpe: 10, completedReps: 2, targetReps: 6 };
    const result = ruleRPERepFailure(input);
    expect(result.matched).toBe(true);
    expect(result.addDropSet).toBe(true);
  });

  it('does NOT trigger at RPE 8 with only 1 missed rep', () => {
    const input: SetInput = { ...baseInput, rpe: 8, completedReps: 5, targetReps: 6 };
    expect(ruleRPERepFailure(input).matched).toBe(false);
  });

  it('does NOT trigger at RPE 7 even with 3 missed reps', () => {
    const input: SetInput = { ...baseInput, rpe: 7, completedReps: 3, targetReps: 6 };
    expect(ruleRPERepFailure(input).matched).toBe(false);
  });

  it('does NOT trigger when RPE is estimated (rpeEstimated = true)', () => {
    const input: SetInput = {
      ...baseInput,
      rpe: 9,
      completedReps: 2,
      rpeEstimated: true,
    };
    expect(ruleRPERepFailure(input).matched).toBe(false);
  });

  it('does NOT trigger when rpe is null', () => {
    const input: SetInput = { ...baseInput, rpe: null, completedReps: 2 };
    expect(ruleRPERepFailure(input).matched).toBe(false);
  });

  it('coachNote mentions RPE and missed reps', () => {
    const input: SetInput = { ...baseInput, rpe: 8, completedReps: 3, targetReps: 6 };
    const result = ruleRPERepFailure(input);
    expect(result.coachNote).toContain('RPE 8');
    expect(result.coachNote).toContain('3 missed reps');
  });
});

// ─── RULE 2: ruleEasySet ─────────────────────────────────────────────────────

describe('ruleEasySet', () => {
  it('triggers at RPE 4 with all reps completed', () => {
    const input: SetInput = { ...baseInput, rpe: 4, completedReps: 6, targetReps: 6 };
    const result = ruleEasySet(input);
    expect(result.matched).toBe(true);
    expect(result.ruleMatched).toBe('ruleEasySet');
    expect(result.actionType).toBe('increase_weight');
    expect(result.nextSetWeightKg).toBeCloseTo(85.0, 1);
  });

  it('triggers at RPE 1 (absolute minimum)', () => {
    const input: SetInput = { ...baseInput, rpe: 1, completedReps: 8, targetReps: 8 };
    expect(ruleEasySet(input).matched).toBe(true);
  });

  it('does NOT trigger at RPE 5', () => {
    const input: SetInput = { ...baseInput, rpe: 5, completedReps: 6, targetReps: 6 };
    expect(ruleEasySet(input).matched).toBe(false);
  });

  it('does NOT trigger at RPE 4 with missed reps', () => {
    const input: SetInput = { ...baseInput, rpe: 4, completedReps: 5, targetReps: 6 };
    expect(ruleEasySet(input).matched).toBe(false);
  });

  it('does NOT trigger with estimated RPE', () => {
    const input: SetInput = { ...baseInput, rpe: 3, completedReps: 6, rpeEstimated: true };
    expect(ruleEasySet(input).matched).toBe(false);
  });
});

// ─── RULE 3: ruleFormDegradation ─────────────────────────────────────────────

describe('ruleFormDegradation', () => {
  it('triggers on form score 59 (minor degradation)', () => {
    const input: SetInput = { ...baseInput, formScore: 59 };
    const result = ruleFormDegradation(input);
    expect(result.matched).toBe(true);
    expect(result.ruleMatched).toBe('ruleFormDegradation');
    expect(result.actionType).toBe('reduce_weight');
    expect(result.nextSetWeightKg).toBeCloseTo(75.0, 1); // 5% reduction
    expect(result.additionalRestSeconds).toBe(30);
  });

  it('applies severe reduction at form score < 40', () => {
    const input: SetInput = { ...baseInput, formScore: 35 };
    const result = ruleFormDegradation(input);
    expect(result.matched).toBe(true);
    expect(result.ruleMatched).toBe('ruleFormDegradation');
    expect(result.actionType).toBe('reduce_weight');
    expect(result.nextSetWeightKg).toBeCloseTo(67.5, 1); // 15% reduction
    expect(result.additionalRestSeconds).toBe(60);
  });

  it('applies minor reduction at form score 40 exactly', () => {
    const input: SetInput = { ...baseInput, formScore: 40 };
    const result = ruleFormDegradation(input);
    expect(result.matched).toBe(true);
    expect(result.nextSetWeightKg).toBeCloseTo(75.0, 1);
  });

  it('does NOT trigger at form score 60', () => {
    const input: SetInput = { ...baseInput, formScore: 60 };
    expect(ruleFormDegradation(input).matched).toBe(false);
  });

  it('does NOT trigger when camera is off (formScore null)', () => {
    const input: SetInput = { ...baseInput, formScore: null };
    expect(ruleFormDegradation(input).matched).toBe(false);
  });
});

// ─── RULE 4: ruleSessionFatigue ──────────────────────────────────────────────

describe('ruleSessionFatigue', () => {
  it('triggers at fatigueIndex 8.5 and set 4', () => {
    const input: SetInput = { ...baseInput, sessionFatigueIndex: 8.5, setNumber: 4 };
    const result = ruleSessionFatigue(input);
    expect(result.matched).toBe(true);
    expect(result.ruleMatched).toBe('ruleSessionFatigue');
    expect(result.actionType).toBe('terminate_session');
    expect(result.terminateSessionWarning).toBe(true);
  });

  it('triggers at fatigueIndex 9.0 and set 5', () => {
    const input: SetInput = { ...baseInput, sessionFatigueIndex: 9.0, setNumber: 5 };
    expect(ruleSessionFatigue(input).matched).toBe(true);
  });

  it('does NOT trigger at fatigueIndex 8.4', () => {
    const input: SetInput = { ...baseInput, sessionFatigueIndex: 8.4, setNumber: 5 };
    expect(ruleSessionFatigue(input).matched).toBe(false);
  });

  it('does NOT trigger at set 3 even with high fatigue', () => {
    const input: SetInput = { ...baseInput, sessionFatigueIndex: 9.5, setNumber: 3 };
    expect(ruleSessionFatigue(input).matched).toBe(false);
  });

  it('coachNote contains fatigueIndex value', () => {
    const input: SetInput = { ...baseInput, sessionFatigueIndex: 8.7, setNumber: 5 };
    const result = ruleSessionFatigue(input);
    expect(result.coachNote).toContain('8.7');
  });
});

// ─── RULE 5: ruleDeloadTrigger ────────────────────────────────────────────────

describe('ruleDeloadTrigger', () => {
  it('triggers at consecutiveHighRpe = 3', () => {
    const input: SetInput = {
      ...baseInput,
      heuristicProfile: { ...defaultProfile, consecutiveHighRpe: 3 },
    };
    const result = ruleDeloadTrigger(input);
    expect(result.matched).toBe(true);
    expect(result.ruleMatched).toBe('ruleDeloadTrigger');
    expect(result.actionType).toBe('create_recovery_flag');
    expect(result.recoveryFlagToCreate).not.toBeNull();
    expect(result.recoveryFlagToCreate?.flagType).toBe('volume_reduction');
  });

  it('triggers at consecutiveHighRpe = 5', () => {
    const input: SetInput = {
      ...baseInput,
      heuristicProfile: { ...defaultProfile, consecutiveHighRpe: 5 },
    };
    expect(ruleDeloadTrigger(input).matched).toBe(true);
  });

  it('does NOT trigger at consecutiveHighRpe = 2', () => {
    const input: SetInput = {
      ...baseInput,
      heuristicProfile: { ...defaultProfile, consecutiveHighRpe: 2 },
    };
    expect(ruleDeloadTrigger(input).matched).toBe(false);
  });

  it('recovery flag has correct active duration (24h)', () => {
    const input: SetInput = {
      ...baseInput,
      heuristicProfile: { ...defaultProfile, consecutiveHighRpe: 3 },
    };
    const result = ruleDeloadTrigger(input);
    const flag = result.recoveryFlagToCreate!;
    const hoursRemaining = (flag.activeUntil - input.currentTimestamp!) / (1000 * 60 * 60);
    expect(hoursRemaining).toBeCloseTo(24, 1);
  });
});

// ─── RULE 6: ruleActiveRecoveryFlag ──────────────────────────────────────────

describe('ruleActiveRecoveryFlag', () => {
  const activeFlag: RecoveryFlag = {
    exerciseSlug: 'barbell-squat',
    flagType: 'volume_reduction',
    activeUntil: 1600000000000 + 24 * 60 * 60 * 1000, // active relative to baseInput timestamp
    reason: 'Test recovery flag',
  };

  it('triggers when matching exercise has active flag', () => {
    const input: SetInput = { ...baseInput, recoveryFlags: [activeFlag] };
    const result = ruleActiveRecoveryFlag(input);
    expect(result.matched).toBe(true);
    expect(result.ruleMatched).toBe('ruleActiveRecoveryFlag');
    expect(result.actionType).toBe('volume_reduction');
    expect(result.nextSetWeightKg).toBeCloseTo(55.0, 1);
    expect(result.nextSetTargetReps).toBe(Math.ceil(6 * 0.80));
  });

  it('triggers for full-body flag (exerciseSlug = null)', () => {
    const fullBodyFlag: RecoveryFlag = {
      ...activeFlag,
      exerciseSlug: null,
    };
    const input: SetInput = { ...baseInput, recoveryFlags: [fullBodyFlag] };
    expect(ruleActiveRecoveryFlag(input).matched).toBe(true);
  });

  it('does NOT trigger when flag is for a different exercise', () => {
    const otherFlag: RecoveryFlag = { ...activeFlag, exerciseSlug: 'bench-press' };
    const input: SetInput = { ...baseInput, recoveryFlags: [otherFlag] };
    expect(ruleActiveRecoveryFlag(input).matched).toBe(false);
  });

  it('does NOT trigger when flag has expired', () => {
    const expiredFlag: RecoveryFlag = {
      ...activeFlag,
      activeUntil: 1600000000000 - 1000, // expired 1 second before baseInput timestamp
    };
    const input: SetInput = { ...baseInput, recoveryFlags: [expiredFlag] };
    expect(ruleActiveRecoveryFlag(input).matched).toBe(false);
  });

  it('does NOT trigger with no recovery flags', () => {
    const input: SetInput = { ...baseInput, recoveryFlags: [] };
    expect(ruleActiveRecoveryFlag(input).matched).toBe(false);
  });
});

// ─── RULE 7: ruleDropSetReadiness ────────────────────────────────────────────

describe('ruleDropSetReadiness', () => {
  it('triggers at RPE 7-8 with all reps completed at set 3+', () => {
    const input: SetInput = { ...baseInput, rpe: 7, completedReps: 6, targetReps: 6, setNumber: 3 };
    const result = ruleDropSetReadiness(input);
    expect(result.matched).toBe(true);
    expect(result.ruleMatched).toBe('ruleDropSetReadiness');
    expect(result.actionType).toBe('add_drop_set');
    expect(result.addDropSet).toBe(true);
  });

  it('does NOT trigger at set 2', () => {
    const input: SetInput = { ...baseInput, rpe: 7, completedReps: 6, setNumber: 2 };
    expect(ruleDropSetReadiness(input).matched).toBe(false);
  });

  it('does NOT trigger at RPE 9', () => {
    const input: SetInput = { ...baseInput, rpe: 9, completedReps: 6, setNumber: 3 };
    expect(ruleDropSetReadiness(input).matched).toBe(false);
  });
});

// ─── RULE 8: ruleConsistentFormImprovement ────────────────────────────────────

describe('ruleConsistentFormImprovement', () => {
  it('triggers on excellent form (≥85) with manageable RPE (≤7)', () => {
    const input: SetInput = {
      ...baseInput,
      formScore: 90,
      rpe: 6,
      completedReps: 6,
      targetReps: 6,
    };
    const result = ruleConsistentFormImprovement(input);
    expect(result.matched).toBe(true);
    expect(result.ruleMatched).toBe('ruleConsistentFormImprovement');
    expect(result.actionType).toBe('increase_weight');
    expect(result.nextSetWeightKg).toBeCloseTo(82.5, 1);
  });

  it('does NOT trigger at form score 84', () => {
    const input: SetInput = { ...baseInput, formScore: 84, rpe: 6, completedReps: 6 };
    expect(ruleConsistentFormImprovement(input).matched).toBe(false);
  });

  it('does NOT trigger at RPE 8', () => {
    const input: SetInput = { ...baseInput, formScore: 90, rpe: 8, completedReps: 6 };
    expect(ruleConsistentFormImprovement(input).matched).toBe(false);
  });

  it('does NOT trigger when camera is off', () => {
    const input: SetInput = { ...baseInput, formScore: null, rpe: 5, completedReps: 6 };
    expect(ruleConsistentFormImprovement(input).matched).toBe(false);
  });
});
