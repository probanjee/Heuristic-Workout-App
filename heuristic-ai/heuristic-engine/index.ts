/**
 * File: heuristic-engine/index.ts
 * Purpose: Public barrel exports for the Heuristic Engine module
 * Dependencies: ./types, ./evaluator, ./1rm, ./recovery, ./fatigue, ./constants
 */

export { evaluate, evaluateSet, evaluateBatch } from './evaluator';
export {
  calculateEpley1RM,
  calculateBrzycki1RM,
  calculateEstimated1RM,
  calculateOneRM,
  calculateEpley,
  calculateBrzycki,
  trainingWeightFromOneRM,
  getBestSetForOneRM,
} from './1rm';
export {
  createRecoveryFlag,
  isRecoveryFlagActive,
  expireRecoveryFlags,
  getActiveRecoveryFlags,
  isFlagActive,
  getActiveFlags,
  getFlagsForExercise,
  getRecoveryRecommendationHours,
} from './recovery';
export { calculateSessionFatigueIndex, getFatigueLevel } from './fatigue';
export { ENGINE_CONSTANTS } from './constants';

export type {
  SetInput,
  HeuristicDecision,
  RuleResult,
  HeuristicProfile,
  RecoveryFlag,
  FormResult,
  NormalizedLandmark,
  SyncStatus,
  SyncState,
  WorkoutStatus,
  GoalType,
  TrainingLevel,
  EquipmentType,
  InjuryFlag,
  MuscleGroup,
  ExerciseDifficulty,
  ExerciseData,
  SetData,
  SessionData,
  HeuristicSummary,
  UserProfile,
  HeuristicRuleName,
  HeuristicActionType,
  SessionFatigueLevel,
} from './types';
