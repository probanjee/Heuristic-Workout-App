/**
 * HeuristicAI — Heuristic Engine Types
 * Source of truth: TRD.md § 4.1
 */

// ─── CORE INPUT/OUTPUT TYPES ─────────────────────────────────────────────────

export interface RecoveryFlag {
  exerciseSlug: string | null; // null = full-body flag
  flagType: 'volume_reduction' | 'rest_day' | 'deload';
  activeUntil: number; // Unix timestamp (ms)
  activeUntilHours?: number; // convenience for creation
  reason: string;
}

export interface HeuristicProfile {
  exerciseSlug: string;
  estimatedOneRmKg: number | null;
  avgRpeLast5: number | null;
  bestVolumeSession: number | null;
  consecutiveHighRpe: number; // counter for deload trigger
  lastSessionId: string | null;
  updatedAt: number;
}

export interface SetInput {
  exerciseSlug: string;
  setNumber: number;
  targetReps: number;
  completedReps: number;
  targetWeightKg: number;
  rpe: number | null; // null if skipped — engine uses 6 as default
  rpeEstimated: boolean; // true if user skipped RPE input
  formScore: number | null; // 0–100; null if camera off
  sessionFatigueIndex: number; // rolling average of all RPEs in session so far
  recoveryFlags: RecoveryFlag[];
  heuristicProfile: HeuristicProfile;
  currentTimestamp?: number; // optional timestamp for deterministic evaluation
}

export type HeuristicRuleName =
  | 'ruleActiveRecoveryFlag'
  | 'ruleSessionFatigue'
  | 'ruleRPERepFailure'
  | 'ruleFormDegradation'
  | 'ruleDeloadTrigger'
  | 'ruleEasySet'
  | 'ruleDropSetReadiness'
  | 'ruleConsistentFormImprovement';

export type HeuristicActionType =
  | 'reduce_weight'
  | 'increase_weight'
  | 'maintain_weight'
  | 'add_drop_set'
  | 'terminate_session'
  | 'create_recovery_flag'
  | 'volume_reduction'
  | 'none';

export type SessionFatigueLevel = 'low' | 'moderate' | 'high';

export interface HeuristicDecision {
  nextSetWeightKg: number;
  nextSetTargetReps: number;
  additionalRestSeconds: number;
  addDropSet: boolean;
  substituteExercise: string | null; // exercise slug or null
  terminateSessionWarning: boolean;
  recoveryFlagToCreate: RecoveryFlag | null;
  coachNote: string; // human-readable one-line explanation shown to user
  confidenceScore: number; // 0–1; matched rules = 0.85, fallback = 0.5
  ruleMatched: HeuristicRuleName | null;
  actionType: HeuristicActionType;
}

export type RuleResult = Partial<HeuristicDecision> & { matched: boolean };

// ─── RULE FUNCTION SIGNATURE ──────────────────────────────────────────────────

export type RuleFunction = (input: SetInput) => RuleResult;

// ─── FORM ANALYSIS TYPES ─────────────────────────────────────────────────────

export interface FormResult {
  score: number; // 0–100
  issues: string[]; // human-readable issue descriptions
  timestamp: number; // Unix ms
}

// Landmark coordinate (normalized 0–1)
export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

// ─── SYNC TYPES ───────────────────────────────────────────────────────────────

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'synced';

export interface SyncState {
  status: SyncStatus;
  lastSyncedAt: number | null; // Unix ms
  pendingCount: number;
  errorMessage: string | null;
}

// ─── WORKOUT SESSION TYPES ────────────────────────────────────────────────────

export type WorkoutStatus = 'active' | 'completed' | 'abandoned';
export type GoalType = 'strength' | 'hypertrophy' | 'endurance' | 'fat_loss';
export type TrainingLevel = 'beginner' | 'intermediate' | 'advanced';
export type EquipmentType =
  | 'bodyweight'
  | 'dumbbells'
  | 'barbell'
  | 'cable'
  | 'bands'
  | 'full_gym';
export type InjuryFlag = 'knees' | 'lower_back' | 'shoulders' | 'wrists' | 'hips';
export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'arms'
  | 'core'
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'calves';
export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface ExerciseData {
  slug: string;
  name: string;
  musclePrimary: MuscleGroup;
  muscleSecondary: MuscleGroup[];
  equipment: EquipmentType;
  difficulty: ExerciseDifficulty;
  videoUrl: string;
  formChecklist: string[];
  audioCues: string[];
  poseModel?: 'squat' | 'pushup' | 'deadlift' | 'lunge' | 'plank' | null;
}

export interface SetData {
  id?: string;
  sessionId: string;
  exerciseSlug: string;
  setNumber: number;
  targetReps: number;
  completedReps: number;
  targetWeightKg: number;
  actualWeightKg: number;
  rpe: number | null;
  rpeEstimated: boolean;
  formScore: number | null;
  restSeconds: number | null;
  heuristicAction: HeuristicDecision | null;
  completedAt: number;
  synced: boolean;
}

export interface SessionData {
  id?: string;
  userId: string;
  startedAt: number;
  endedAt: number | null;
  status: WorkoutStatus;
  totalVolumeKg: number | null;
  avgRpe: number | null;
  heuristicSummary: HeuristicSummary | null;
  synced: boolean;
}

export interface HeuristicSummary {
  totalVolume: number;
  avgRpe: number;
  topDecisions: {
    coachNote: string;
    count: number;
  }[];
  recoveryRecommendationHours: 24 | 48 | 72;
  estimatedOneRmKg: number | null;
  formSummary: {
    exerciseSlug: string;
    avgScore: number;
  }[];
}

// ─── USER PROFILE TYPES ───────────────────────────────────────────────────────

export interface UserProfile {
  id?: string;
  firebaseUid: string | null;
  displayName: string;
  goal: GoalType;
  trainingLevel: TrainingLevel;
  equipment: EquipmentType[];
  injuryFlags: InjuryFlag[];
  createdAt: number;
  syncedAt: number | null;
}

// ─── NOTIFICATION TYPES ───────────────────────────────────────────────────────

export type NotificationType = 'recovery_flag' | 'rest_nudge' | 'weekly_summary';

export interface ScheduledNotification {
  type: NotificationType;
  scheduledFor: number; // Unix ms
  payload?: Record<string, unknown>;
}
