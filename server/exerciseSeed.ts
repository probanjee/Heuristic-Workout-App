import { exercises } from "../drizzle/schema";
import { getDb } from "./db";
import { VERIFIED_EXERCISES } from "./workoutEngine";

export async function seedVerifiedExercises() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .insert(exercises)
    .values(
      VERIFIED_EXERCISES.map(exercise => ({
        ...exercise,
        secondaryMuscles: null,
        alternativeSlugs: null,
        isSystemVerified: 1,
      }))
    )
    .onDuplicateKeyUpdate({
      set: { isSystemVerified: 1 },
    });
  return {
    seeded: VERIFIED_EXERCISES.length,
    slugs: VERIFIED_EXERCISES.map(exercise => exercise.slug),
  };
}

export function getVerifiedExerciseSlugs() {
  return VERIFIED_EXERCISES.map(exercise => exercise.slug);
}
