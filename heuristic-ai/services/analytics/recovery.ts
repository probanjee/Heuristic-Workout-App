/**
 * HeuristicAI — Recovery Recommendation Service
 * Source of truth: TASK.md (M6 Task 2), PRD.md § 5.3
 */

export interface RecoveryRecommendation {
  hours: number;
  severity: 'low' | 'moderate' | 'high';
  message: string;
}

/**
 * Calculates the required recovery time and compiles coaching recommendations
 * based on RPE, technique issues, and fatigue indexes.
 *
 * @param avgRpe - The average RPE logged during the session
 * @param minFormScore - The lowest form score logged (null if camera was off)
 * @param fatigueIndex - The session's rolling fatigue index (0 to 10)
 * @returns Object with recovery hours, severity, and custom coach message
 */
export function generateRecoveryRecommendation(
  avgRpe: number,
  minFormScore: number | null,
  fatigueIndex: number
): RecoveryRecommendation {
  let hours = 24;
  let severity: 'low' | 'moderate' | 'high' = 'low';
  let message = '';

  // 1. RPE-based recovery hours
  if (avgRpe >= 8.0) {
    hours = 72;
    severity = 'high';
    message = 'High-intensity output logged. Give your nervous system ample rest before your next session.';
  } else if (avgRpe >= 6.0) {
    hours = 48;
    severity = 'moderate';
    message = 'Moderate workload logged. Ensure proper sleep and nutrition before your next hard effort.';
  } else {
    hours = 24;
    severity = 'low';
    message = 'Low-intensity output logged. Ready to train again after light active recovery.';
  }

  // 2. Severe form score warning
  if (minFormScore !== null && minFormScore < 60) {
    message += ' Technique breakdown detected. Prioritize movement quality in your next session.';
  }

  // 3. High fatigue index warning
  if (fatigueIndex > 7.5) {
    message += ' High fatigue levels detected. Consider a deload session next.';
  }

  return {
    hours,
    severity,
    message,
  };
}
