/**
 * HeuristicAI — Pose Detection Utilities
 * Geometric helpers for joint angle and distance calculations.
 * Source of truth: TASK.md § 6, TRD.md § 6.2
 */

import type { PoseLandmark } from './pose-types';

/**
 * Calculates the angle formed by three landmarks at the vertex (p2).
 * Returns the angle in degrees in the range [0, 180].
 */
export function calculateAngle(
  p1: PoseLandmark,
  p2: PoseLandmark,
  p3: PoseLandmark
): number {
  if (!p1 || !p2 || !p3) return 0;
  
  const radians =
    Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
  
  let angle = Math.abs((radians * 180.0) / Math.PI);
  
  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  
  return angle;
}

/**
 * Calculates the 2D Euclidean distance between two landmarks.
 */
export function calculateDistance(p1: PoseLandmark, p2: PoseLandmark): number {
  if (!p1 || !p2) return 0;
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}
