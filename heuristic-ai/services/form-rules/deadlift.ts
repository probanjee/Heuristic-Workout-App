/**
 * HeuristicAI — Deadlift Form Evaluator
 * Detects: lumbar rounding, bar path drift
 */

import type { NormalizedLandmark, FormResult } from '../../heuristic-engine/types';
import { LandmarkIndex, calculateAngle } from '../pose-detection';

export function evaluateDeadliftForm(landmarks: NormalizedLandmark[]): FormResult {
  const issues: string[] = [];
  let score = 100;

  if (landmarks.length < 33) {
    return { score: 0, issues: ['Could not detect pose'], timestamp: Date.now() };
  }

  const leftShoulder = landmarks[LandmarkIndex.LEFT_SHOULDER];
  const rightShoulder = landmarks[LandmarkIndex.RIGHT_SHOULDER];
  const leftHip = landmarks[LandmarkIndex.LEFT_HIP];
  const rightHip = landmarks[LandmarkIndex.RIGHT_HIP];
  const leftKnee = landmarks[LandmarkIndex.LEFT_KNEE];

  // ── LUMBAR ROUNDING ───────────────────────────────────────────────────────
  // Approximate by checking if shoulders are significantly forward of hips
  const avgShoulderX = (leftShoulder.x + rightShoulder.x) / 2;
  const avgHipX = (leftHip.x + rightHip.x) / 2;
  const shoulderForwardOfHip = avgShoulderX - avgHipX;

  // In a side profile, shoulders should not be too far forward of hips during pull
  if (Math.abs(shoulderForwardOfHip) > 0.15) {
    issues.push('Keep your back straight — brace your lower back');
    score -= 25;
  }

  // ── TORSO ANGLE CHECK ─────────────────────────────────────────────────────
  // Back angle during lift should stay controlled
  const avgHip = { x: avgHipX, y: (leftHip.y + rightHip.y) / 2, z: 0 };
  const avgShoulder = { x: avgShoulderX, y: (leftShoulder.y + rightShoulder.y) / 2, z: 0 };

  // Rough check: if hips and knees are at similar heights, user is mid-pull
  const hipKneeDiff = Math.abs(avgHip.y - leftKnee.y);
  if (hipKneeDiff < 0.05 && Math.abs(shoulderForwardOfHip) > 0.10) {
    issues.push('Keep the bar close to your body');
    score -= 15;
  }

  return { score: Math.max(0, score), issues, timestamp: Date.now() };
}
