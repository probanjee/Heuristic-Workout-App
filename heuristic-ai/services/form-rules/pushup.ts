/**
 * HeuristicAI — Pushup Form Evaluator
 * Detects: elbow flare, hip drop, pike
 */

import type { NormalizedLandmark, FormResult } from '../../heuristic-engine/types';
import { LandmarkIndex, calculateAngle } from '../pose-detection';

export function evaluatePushupForm(landmarks: NormalizedLandmark[]): FormResult {
  const issues: string[] = [];
  let score = 100;

  if (landmarks.length < 33) {
    return { score: 0, issues: ['Could not detect pose'], timestamp: Date.now() };
  }

  const leftShoulder = landmarks[LandmarkIndex.LEFT_SHOULDER];
  const rightShoulder = landmarks[LandmarkIndex.RIGHT_SHOULDER];
  const leftElbow = landmarks[LandmarkIndex.LEFT_ELBOW];
  const rightElbow = landmarks[LandmarkIndex.RIGHT_ELBOW];
  const leftWrist = landmarks[LandmarkIndex.LEFT_WRIST];
  const rightWrist = landmarks[LandmarkIndex.RIGHT_WRIST];
  const leftHip = landmarks[LandmarkIndex.LEFT_HIP];
  const rightHip = landmarks[LandmarkIndex.RIGHT_HIP];
  const leftAnkle = landmarks[LandmarkIndex.LEFT_ANKLE];

  // ── ELBOW FLARE (should be < 60° from torso) ──────────────────────────────
  const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
  const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);

  // Elbow flare: elbow x is far from shoulder x relative to body width
  const bodyWidth = Math.abs(leftShoulder.x - rightShoulder.x);
  const leftElbowFlare = Math.abs(leftElbow.x - leftShoulder.x) / bodyWidth;
  const rightElbowFlare = Math.abs(rightElbow.x - rightShoulder.x) / bodyWidth;

  if (leftElbowFlare > 0.5 || rightElbowFlare > 0.5) {
    issues.push('Elbows flaring too wide — tuck elbows to 45°');
    score -= 20;
  }

  // ── HIP DROP ─────────────────────────────────────────────────────────────
  // Hip Y should be close to shoulder Y (horizontal plank position)
  const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
  const avgHipY = (leftHip.y + rightHip.y) / 2;
  const hipDrop = avgHipY - avgShoulderY;

  if (hipDrop > 0.05) {
    issues.push('Hips sagging — engage your core');
    score -= 25;
  }

  // ── PIKE (hips too high) ──────────────────────────────────────────────────
  if (avgHipY < avgShoulderY - 0.05) {
    issues.push('Hips too high (piking) — lower your hips');
    score -= 15;
  }

  return { score: Math.max(0, score), issues, timestamp: Date.now() };
}
