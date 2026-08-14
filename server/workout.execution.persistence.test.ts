import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL("../drizzle/0003_true_katie_power.sql", import.meta.url),
  "utf8"
);

describe("workout execution persistence contract", () => {
  it("contains non-destructive migrated tables for set logs and session feedback", () => {
    expect(migration).toMatch(/CREATE TABLE.*workout_sets/i);
    expect(migration).toMatch(/CREATE TABLE.*workout_feedback/i);
    expect(migration).toMatch(/workoutExerciseId/i);
    expect(migration).toMatch(/actualReps/i);
    expect(migration).toMatch(/loadKg/i);
    expect(migration).toMatch(/perceivedExertion/i);
    expect(migration).toMatch(/completedAt/i);
    expect(migration).toMatch(/workoutId/i);
    expect(migration).not.toMatch(/DROP TABLE/i);
  });

  it("keeps execution records attached to workout-owned entities", () => {
    expect(migration).toMatch(/`workoutId` int NOT NULL/);
    expect(migration).toMatch(/`workoutExerciseId` int NOT NULL/);
    expect(migration).toMatch(/workout_feedback_workoutId_unique/);
    expect(migration).toMatch(/daily_workouts/i);
    expect(migration).toMatch(/workout_exercises/i);
  });
});
