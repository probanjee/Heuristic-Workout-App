import { describe, expect, it } from "vitest";
import { getVerifiedExerciseSlugs } from "./exerciseSeed";
import { VERIFIED_EXERCISES } from "./workoutEngine";

describe("verified exercise seed", () => {
  it("is exactly the engine-owned verified catalog", () => {
    expect(getVerifiedExerciseSlugs()).toEqual(
      VERIFIED_EXERCISES.map(exercise => exercise.slug)
    );
    expect(
      VERIFIED_EXERCISES.every(exercise => exercise.instructions.length > 20)
    ).toBe(true);
    expect(
      VERIFIED_EXERCISES.every(exercise => !Object.hasOwn(exercise, "rating"))
    ).toBe(true);
  });
});
