import { describe, expect, it } from "vitest";
import { workoutCompletionInput, workoutSetInput } from "./routers";

describe("workout execution input contracts", () => {
  it("accepts a valid set log with optional load and RPE", () => {
    expect(
      workoutSetInput.parse({
        workoutId: 7,
        workoutExerciseId: 12,
        setNumber: 1,
        targetReps: "8-10",
        actualReps: 9,
        loadKg: 20,
        perceivedExertion: 7,
      })
    ).toMatchObject({
      workoutId: 7,
      actualReps: 9,
      loadKg: 20,
      perceivedExertion: 7,
    });
  });

  it("rejects invalid execution identifiers and feedback ranges", () => {
    expect(() =>
      workoutSetInput.parse({
        workoutId: 0,
        workoutExerciseId: 1,
        setNumber: 1,
        targetReps: "8",
        actualReps: 8,
      })
    ).toThrow();
    expect(() =>
      workoutSetInput.parse({
        workoutId: 1,
        workoutExerciseId: 1,
        setNumber: 1,
        targetReps: "8",
        actualReps: 8,
        perceivedExertion: 11,
      })
    ).toThrow();
    expect(() =>
      workoutCompletionInput.parse({ workoutId: 1, energy: 0, difficulty: 3 })
    ).toThrow();
  });
});
