/**
 * HeuristicAI — Squat Form Evaluator
 * Source of truth: TRD.md § 6.2
 * Detects: knee valgus, depth, torso lean
 */

import type { NormalizedLandmark, FormResult } from '../../heuristic-engine/types';
import { LandmarkIndex, calculateAngle } from '../pose-detection';

export function evaluateSquatForm(landmarks: NormalizedLandmark[]): FormResult {
  const issues: string[] = [];
  let score = 100;

  if (landmarks.length < 33) {
    return { score: 0, issues: ['Could not detect pose — ensure full body is visible'], timestamp: Date.now() };
  }

  const leftHip = landmarks[LandmarkIndex.LEFT_HIP];
  const rightHip = landmarks[LandmarkIndex.RIGHT_HIP];
  const leftKnee = landmarks[LandmarkIndex.LEFT_KNEE];
  const rightKnee = landmarks[LandmarkIndex.RIGHT_KNEE];
  const leftAnkle = landmarks[LandmarkIndex.LEFT_ANKLE];
  const rightAnkle = landmarks[LandmarkIndex.RIGHT_ANKLE];
  const leftShoulder = landmarks[LandmarkIndex.LEFT_SHOULDER];

  // ── KNEE VALGUS (knees caving inward) ─────────────────────────────────────
  // Detect: knee X is inside ankle X (normalized coordinates)
  const leftKneeOffset = leftKnee.x - leftAnkle.x;
  const rightKneeOffset = rightAnkle.x - rightKnee.x;

  if (leftKneeOffset > 0.05) {
    issues.push('Left knee caving inward — push knees out');
    score -= 20;
  }
  if (rightKneeOffset > 0.05) {
    issues.push('Right knee caving inward — push knees out');
    score -= 20;
  }

  // ── DEPTH CHECK (hip crease below knee) ───────────────────────────────────
  // In normalized coords, y increases downward; lower y = higher on screen
  const avgHipY = (leftHip.y + rightHip.y) / 2;
  const avgKneeY = (leftKnee.y + rightKnee.y) / 2;

  if (avgHipY < avgKneeY - 0.03) {
    // Good — hip crease below knees (positive feedback)
    issues.push('Good squat depth ✓');
  } else if (avgHipY > avgKneeY + 0.05) {
    // Not deep enough
    issues.push('Squat deeper — hip crease should be below knees');
    score -= 15;
  }

  // ── TORSO LEAN (>45° = excessive forward lean) ────────────────────────────
  const avgHip = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2, z: 0 };
  const torsoAngle = calculateAngle(
    { x: avgHip.x, y: 0, z: 0 }, // vertical reference
    avgHip,
    { x: leftShoulder.x, y: leftShoulder.y, z: 0 },
  );

  if (torsoAngle > 45) {
    issues.push('Excessive forward lean — brace core and keep chest up');
    score -= 15;
  }

  return {
    score: Math.max(0, score),
    issues: issues.filter((i) => !i.includes('✓')), // Only return error issues
    timestamp: Date.now(),
  };
}
