import { describe, expect, it } from "vitest";
import { buildDailyRecommendation } from "./recommendations";
import type { UserProfile } from "../drizzle/schema";

const completeProfile = {
  id: 1,
  userId: 42,
  onboardingStep: 8,
  onboardingCompleted: 1,
  age: 28,
  gender: "prefer_not_to_say",
  heightCm: 175,
  weightKg: 75,
  fitnessLevel: "intermediate",
  primaryGoal: "build_strength",
  secondaryGoal: "mobility",
  workoutDaysPerWeek: 4,
  workoutDurationMinutes: 30,
  preferredWorkoutTime: "07:00",
  environment: "home",
  equipment: "dumbbells",
  exerciseExclusions: null,
  sleepQuality: 2,
  fatigueLevel: 4,
  recoveryFeeling: "low",
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies UserProfile;

describe("buildDailyRecommendation", () => {
  it("returns an explicit incomplete state for a missing profile", () => {
    expect(buildDailyRecommendation(null)).toEqual({
      status: "incomplete",
      missingFields: [
        "a primary goal",
        "an experience level",
        "a workout duration",
        "a workout environment",
      ],
    });
  });

  it("returns transparent reason codes for a completed profile", () => {
    const result = buildDailyRecommendation(completeProfile);
    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;

    expect(result.exerciseCount).toBe(5);
    expect(result.reasons).toEqual([
      "GOAL_ALIGNMENT",
      "MUSCLE_RECOVERY",
      "TIME_CONSTRAINT",
      "EQUIPMENT_CONSTRAINT",
      "RECOVERY_ADJUSTMENT",
      "PROGRESSIVE_OVERLOAD",
    ]);
  });
});
