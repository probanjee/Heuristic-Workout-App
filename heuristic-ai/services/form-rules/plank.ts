/**
 * HeuristicAI — Plank Form Evaluator
 * Detects: hip drop, neck crane
 */

import type { NormalizedLandmark, FormResult } from '../../heuristic-engine/types';
import { LandmarkIndex } from '../pose-detection';

export function evaluatePlankForm(landmarks: NormalizedLandmark[]): FormResult {
  const issues: string[] = [];
  let score = 100;

  if (landmarks.length < 33) {
    return { score: 0, issues: ['Could not detect pose'], timestamp: Date.now() };
  }

  const leftShoulder = landmarks[LandmarkIndex.LEFT_SHOULDER];
  const rightShoulder = landmarks[LandmarkIndex.RIGHT_SHOULDER];
  const leftHip = landmarks[LandmarkIndex.LEFT_HIP];
  const rightHip = landmarks[LandmarkIndex.RIGHT_HIP];
  const leftAnkle = landmarks[LandmarkIndex.LEFT_ANKLE];
  const nose = landmarks[LandmarkIndex.NOSE];

  const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
  const avgHipY = (leftHip.y + rightHip.y) / 2;
  const avgShoulderX = (leftShoulder.x + rightShoulder.x) / 2;

  // ── HIP DROP ─────────────────────────────────────────────────────────────
  // In plank, hips should be in line with shoulders (same Y level)
  const hipDrop = avgHipY - avgShoulderY;
  if (hipDrop > 0.08) {
    issues.push('Hips dropping — squeeze glutes and lift');
    score -= 30;
  }

  // ── HIP PIKE ─────────────────────────────────────────────────────────────
  if (avgHipY < avgShoulderY - 0.08) {
    issues.push('Hips too high — lower to a straight line');
    score -= 15;
  }

  // ── NECK CRANE ────────────────────────────────────────────────────────────
  // Head should be neutral — nose should be roughly in line with shoulders
  if (nose.y < avgShoulderY - 0.10) {
    issues.push('Head up too high — keep your neck neutral');
    score -= 15;
  }

  return { score: Math.max(0, score), issues, timestamp: Date.now() };
}
