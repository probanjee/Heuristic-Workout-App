import { describe, expect, it } from "vitest";
import { generateDailyWorkout, VERIFIED_EXERCISES } from "./workoutEngine";
import type { UserProfile } from "../drizzle/schema";

const completeProfile = (
  overrides: Partial<UserProfile> = {}
): UserProfile => ({
  id: 1,
  userId: 1,
  onboardingStep: 8,
  onboardingCompleted: 1,
  age: 30,
  birthDate: null,
  gender: null,
  heightCm: 175,
  weightKg: 75,
  fitnessLevel: "beginner",
  primaryGoal: "fat_loss",
  secondaryGoal: null,
  workoutDaysPerWeek: 4,
  workoutDurationMinutes: 30,
  preferredWorkoutTime: "07:00",
  environment: "home",
  equipment: JSON.stringify(["dumbbells"]),
  exerciseExclusions: null,
  sleepQuality: 4,
  fatigueLevel: 2,
  recoveryFeeling: "good",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe("generateDailyWorkout", () => {
  it("returns a safe empty state for incomplete profiles", () => {
    const result = generateDailyWorkout(null);
    expect(result).toEqual({
      status: "profile_needed",
      title: null,
      goal: null,
      durationMinutes: null,
      reasonCodes: [],
      exercises: [],
    });
  });

  it("generates a time-bounded plan using available equipment", () => {
    const result = generateDailyWorkout(completeProfile());
    expect(result.status).toBe("ready");
    expect(result.exercises).toHaveLength(3);
    expect(result.reasonCodes).toContain("TIME_CONSTRAINT");
    expect(
      result.exercises.some(exercise => exercise.equipment === "dumbbells")
    ).toBe(true);
  });

  it("reduces volume and increases rest for a fatigued athlete", () => {
    const result = generateDailyWorkout(
      completeProfile({
        fatigueLevel: 5,
        recoveryFeeling: "poor",
        workoutDurationMinutes: 60,
      })
    );
    expect(result.reasonCodes).toContain("RECOVERY_ADJUSTMENT");
    expect(result.exercises.every(exercise => exercise.sets <= 2)).toBe(true);
    expect(result.exercises.every(exercise => exercise.restSeconds >= 60)).toBe(
      true
    );
  });

  it("respects exercise exclusions", () => {
    const result = generateDailyWorkout(
      completeProfile({ exerciseExclusions: JSON.stringify(["push-up"]) })
    );
    expect(result.exercises.some(exercise => exercise.slug === "push-up")).toBe(
      false
    );
  });
});

it("maps tutorial media across the complete exercise catalog", () => {
  expect(VERIFIED_EXERCISES).toHaveLength(8);
  expect(VERIFIED_EXERCISES.every(exercise => exercise.tutorialMedia)).toBe(
    true
  );
  expect(
    VERIFIED_EXERCISES.map(exercise => exercise.tutorialMedia?.src)
  ).toEqual(
    expect.arrayContaining([
      "/fitness-storage/squats_0c27dda3.gif",
      "/fitness-storage/pushups_1aaeb7ee.gif",
      "/fitness-storage/reverse-lunge_944df161.gif",
      "/fitness-storage/upward-row_e2e2fa37.gif",
      "/fitness-storage/overhead-press_646ec757.gif",
      "/fitness-storage/deadlift_67146115.gif",
      "/fitness-storage/plank-gymvisual_f5f1daae.gif",
      "/fitness-storage/band-row_88fc93a7.gif",
    ])
  );
});

it("uses goal alignment and experience constraints when selecting exercises", () => {
  const strength = generateDailyWorkout(
    completeProfile({
      primaryGoal: "strength",
      fitnessLevel: "beginner",
      equipment: JSON.stringify(["dumbbells"]),
    })
  );
  expect(strength.status).toBe("ready");
  expect(strength.reasonCodes).toContain("GOAL_ALIGNMENT");
  expect(
    strength.exercises.every(exercise => exercise.difficulty !== "advanced")
  ).toBe(true);
});

it("reduces the exercise cap for a high-frequency weekly schedule", () => {
  const result = generateDailyWorkout(
    completeProfile({ workoutDaysPerWeek: 6, workoutDurationMinutes: 60 })
  );
  expect(result.status).toBe("ready");
  expect(result.exercises.length).toBeLessThanOrEqual(4);
});
