/**
 * HeuristicAI — Lunge Form Evaluator
 * Detects: front knee tracking past toes
 */

import type { NormalizedLandmark, FormResult } from '../../heuristic-engine/types';
import { LandmarkIndex } from '../pose-detection';

export function evaluateLungeForm(landmarks: NormalizedLandmark[]): FormResult {
  const issues: string[] = [];
  let score = 100;

  if (landmarks.length < 33) {
    return { score: 0, issues: ['Could not detect pose'], timestamp: Date.now() };
  }

  const leftKnee = landmarks[LandmarkIndex.LEFT_KNEE];
  const leftAnkle = landmarks[LandmarkIndex.LEFT_ANKLE];
  const rightKnee = landmarks[LandmarkIndex.RIGHT_KNEE];
  const rightAnkle = landmarks[LandmarkIndex.RIGHT_ANKLE];

  // ── FRONT KNEE PAST TOES ──────────────────────────────────────────────────
  // Knee X should not exceed ankle X significantly (when viewed from side)
  const leftKneePastToe = leftKnee.x - leftAnkle.x;
  const rightKneePastToe = rightKnee.x - rightAnkle.x;

  if (Math.abs(leftKneePastToe) > 0.08) {
    issues.push('Front knee too far past toes — step out further');
    score -= 25;
  }

  if (Math.abs(rightKneePastToe) > 0.08) {
    issues.push('Front knee too far past toes — step out further');
    score -= 25;
  }

  return { score: Math.max(0, score), issues, timestamp: Date.now() };
}
