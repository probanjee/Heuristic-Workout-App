/**
 * File: heuristic-engine/constants.ts
 * Purpose: Centrally defined constants for Heuristic Engine rules and configurations
 * Dependencies: None
 */

export const ENGINE_CONSTANTS = {
  // Rest times (in seconds)
  DEFAULT_REST_SECONDS: 90,
  MIN_REST_SECONDS: 30,

  // RPE boundaries
  MIN_RPE: 1,
  MAX_RPE: 10,
  DEFAULT_RPE: 6,

  // Weight and rep adjustment multipliers
  ADJUSTMENTS: {
    RPE_FAILURE_WEIGHT_MULT: 0.90, // -10% weight
    RPE_FAILURE_ADDITIONAL_REST_SECS: 45,

    EASY_SET_WEIGHT_MULT: 1.05, // +5% weight

    MINOR_FORM_WEIGHT_MULT: 0.95, // -5% weight
    MINOR_FORM_ADDITIONAL_REST_SECS: 30,

    SEVERE_FORM_WEIGHT_MULT: 0.85, // -15% weight
    SEVERE_FORM_ADDITIONAL_REST_SECS: 60,

    RECOVERY_FLAG_WEIGHT_MULT: 0.70, // -30% weight
    RECOVERY_FLAG_REP_MULT: 0.80, // -20% reps

    FORM_IMPROVEMENT_WEIGHT_MULT: 1.025, // +2.5% weight
  },

  // Form score thresholds
  FORM_THRESHOLDS: {
    DEGRADATION_LIMIT: 60, // below 60 is degradation
    SEVERE_LIMIT: 40,      // below 40 is severe degradation
    EXCELLENT_LIMIT: 85,   // 85 and above is excellent form
  },

  // Fatigue index thresholds
  FATIGUE_THRESHOLDS: {
    HIGH: 8.5,
    MODERATE: 7.0,
  },

  // Rule confidence scores
  CONFIDENCE: {
    MATCHED: 0.85,
    FALLBACK: 0.5,
  },

  // Recovery durations (in hours)
  RECOVERY_DURATIONS: {
    volume_reduction: 24,
    rest_day: 48,
    deload: 72,
  },
} as const;
