/**
 * HeuristicAI — Pose Detection Types
 * Source of truth: TASK.md § 3, TRD.md § 6
 */

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface PoseFrame {
  landmarks: PoseLandmark[];
  timestampMs: number;
}

export interface PoseResult {
  landmarks: PoseLandmark[];
  segmentationMask?: any;
}

export interface JointAngle {
  joint: string;
  angle: number;
}

export interface PoseIssue {
  id: string;
  type: string; // 'squat', 'pushup', etc.
  message: string;
  severity: 'minor' | 'moderate' | 'severe';
}

export interface FormScore {
  score: number;
  issues: PoseIssue[];
}
