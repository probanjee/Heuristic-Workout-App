import type { UserProfile } from "../drizzle/schema";

export const RECOMMENDATION_REASON_CODES = [
  "GOAL_ALIGNMENT",
  "MUSCLE_RECOVERY",
  "TIME_CONSTRAINT",
  "EQUIPMENT_CONSTRAINT",
  "RECOVERY_ADJUSTMENT",
  "PROGRESSIVE_OVERLOAD",
] as const;

export type RecommendationReasonCode =
  (typeof RECOMMENDATION_REASON_CODES)[number];

export type DailyRecommendation = {
  status: "ready";
  title: string;
  summary: string;
  durationMinutes: number;
  exerciseCount: number;
  goalFit: string;
  reasons: RecommendationReasonCode[];
};

export type RecommendationState =
  | { status: "incomplete"; missingFields: string[] }
  | DailyRecommendation;

const requiredProfileFields = [
  ["primaryGoal", "a primary goal"],
  ["fitnessLevel", "an experience level"],
  ["workoutDurationMinutes", "a workout duration"],
  ["environment", "a workout environment"],
] as const;

export function buildDailyRecommendation(
  profile: UserProfile | null | undefined
): RecommendationState {
  if (!profile) {
    return {
      status: "incomplete",
      missingFields: requiredProfileFields.map(([, label]) => label),
    };
  }

  const missingFields = requiredProfileFields
    .filter(
      ([field]) => profile[field] === null || profile[field] === undefined
    )
    .map(([, label]) => label);

  if (missingFields.length > 0 || !profile.onboardingCompleted) {
    return {
      status: "incomplete",
      missingFields:
        missingFields.length > 0
          ? missingFields
          : ["a completed onboarding profile"],
    };
  }

  const durationMinutes = profile.workoutDurationMinutes ?? 30;
  const exerciseCount =
    durationMinutes <= 25 ? 4 : durationMinutes <= 45 ? 5 : 6;
  const reasons: RecommendationReasonCode[] = [
    "GOAL_ALIGNMENT",
    "MUSCLE_RECOVERY",
  ];

  if (durationMinutes <= 30) reasons.push("TIME_CONSTRAINT");
  if (profile.environment === "home" || profile.environment === "minimal") {
    reasons.push("EQUIPMENT_CONSTRAINT");
  }
  if ((profile.fatigueLevel ?? 1) >= 4 || (profile.sleepQuality ?? 5) <= 2) {
    reasons.push("RECOVERY_ADJUSTMENT");
  }
  reasons.push("PROGRESSIVE_OVERLOAD");

  const goal = profile.primaryGoal?.replaceAll("_", " ") ?? "your goal";
  const formattedGoal = goal.charAt(0).toUpperCase() + goal.slice(1);

  return {
    status: "ready",
    title: `${formattedGoal} foundation session`,
    summary: `A focused ${durationMinutes}-minute session shaped around ${goal}, your available environment, and current recovery signal.`,
    durationMinutes,
    exerciseCount,
    goalFit: "High",
    reasons,
  };
}
