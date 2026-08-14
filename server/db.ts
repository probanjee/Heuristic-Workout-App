import { and, desc, eq, gt, gte, inArray, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  AuthChallenge,
  InsertAuthChallenge,
  InsertUser,
  InsertUserProfile,
  UserProfile,
  authChallenges,
  dailyWorkouts,
  exercises,
  userProfiles,
  users,
  workoutExercises,
  workoutFeedback,
  workoutSets,
} from "../drizzle/schema";
import crypto from "node:crypto";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = [
    "name",
    "email",
    "loginMethod",
    "passwordHash",
    "phoneNumber",
  ] as const;

  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db
    .insert(users)
    .values(values)
    .onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByPhone(phoneNumber: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.phoneNumber, phoneNumber))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createLocalUser(
  input: Pick<
    InsertUser,
    | "email"
    | "passwordHash"
    | "phoneNumber"
    | "loginMethod"
    | "emailVerifiedAt"
    | "phoneVerifiedAt"
  > & { name?: string | null }
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const openId = `local_${crypto.randomUUID()}`;
  await db.insert(users).values({
    openId,
    name: input.name ?? null,
    email: input.email ?? null,
    passwordHash: input.passwordHash ?? null,
    phoneNumber: input.phoneNumber ?? null,
    loginMethod: input.loginMethod ?? "local",
    emailVerifiedAt: input.emailVerifiedAt ?? null,
    phoneVerifiedAt: input.phoneVerifiedAt ?? null,
  });
  const created = input.email
    ? await getUserByEmail(input.email)
    : input.phoneNumber
      ? await getUserByPhone(input.phoneNumber)
      : undefined;
  if (!created) throw new Error("Local user creation failed");
  return created;
}

export async function createAuthChallenge(input: InsertAuthChallenge) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(authChallenges).values(input);
}

export async function getLatestActiveChallenge(
  identifier: string,
  purpose: AuthChallenge["purpose"]
) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(authChallenges)
    .where(
      and(
        eq(authChallenges.identifier, identifier),
        eq(authChallenges.purpose, purpose),
        isNull(authChallenges.consumedAt),
        gt(authChallenges.expiresAt, new Date())
      )
    )
    .orderBy(desc(authChallenges.sentAt))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function consumeAuthChallenge(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(authChallenges)
    .set({ consumedAt: new Date() })
    .where(eq(authChallenges.id, id));
}

export async function incrementAuthChallengeAttempts(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const challenge = await db
    .select()
    .from(authChallenges)
    .where(eq(authChallenges.id, id))
    .limit(1);
  if (!challenge[0]) return;
  await db
    .update(authChallenges)
    .set({ attemptCount: challenge[0].attemptCount + 1 })
    .where(eq(authChallenges.id, id));
}

export async function updateUserPassword(userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(users)
    .set({ passwordHash, lastSignedIn: new Date() })
    .where(eq(users.id, userId));
}

export async function markUserPhoneVerified(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(users)
    .set({ phoneVerifiedAt: new Date(), lastSignedIn: new Date() })
    .where(eq(users.id, userId));
}

export async function getExerciseCatalog() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(exercises).where(eq(exercises.isSystemVerified, 1));
}

export async function getExerciseMix(userId: number, days = 30) {
  const db = await getDb();
  if (!db) return [];
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - Math.max(7, Math.min(days, 180)));
  const cutoffDate = cutoff.toISOString().slice(0, 10);
  const rows = await db
    .select({
      name: exercises.name,
      primaryMuscle: exercises.primaryMuscle,
      workoutId: dailyWorkouts.id,
      setId: workoutSets.id,
    })
    .from(dailyWorkouts)
    .innerJoin(
      workoutExercises,
      eq(workoutExercises.workoutId, dailyWorkouts.id)
    )
    .innerJoin(exercises, eq(workoutExercises.exerciseId, exercises.id))
    .leftJoin(
      workoutSets,
      eq(workoutSets.workoutExerciseId, workoutExercises.id)
    )
    .where(
      and(
        eq(dailyWorkouts.userId, userId),
        eq(exercises.isSystemVerified, 1),
        gte(dailyWorkouts.workoutDate, cutoffDate)
      )
    );
  const totals = new Map<
    string,
    { name: string; primaryMuscle: string; sets: number; sessions: Set<number> }
  >();
  for (const row of rows) {
    const existing = totals.get(row.name) ?? {
      name: row.name,
      primaryMuscle: row.primaryMuscle,
      sets: 0,
      sessions: new Set<number>(),
    };
    if (row.setId !== null) existing.sets += 1;
    existing.sessions.add(row.workoutId);
    totals.set(row.name, existing);
  }
  return Array.from(totals.values())
    .map(item => ({
      name: item.name,
      primaryMuscle: item.primaryMuscle,
      sets: item.sets,
      sessions: item.sessions.size,
    }))
    .sort((a, b) => b.sets - a.sets || a.name.localeCompare(b.name));
}

export async function getNotificationActivity(userId: number) {
  const [profile, history] = await Promise.all([
    getUserProfile(userId),
    getWorkoutHistory(userId, 8),
  ]);
  return {
    reminderEnabled: Boolean(profile?.reminderEnabled),
    preferredWorkoutTime: profile?.preferredWorkoutTime ?? null,
    deliveryStatus: "disabled_until_deployment" as const,
    events: history.map(item => ({
      id: item.id,
      date: item.workoutDate,
      label:
        item.status === "completed"
          ? "Workout completed"
          : `Workout ${item.status}`,
      status: item.status,
    })),
  };
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserProfile(
  userId: number
): Promise<UserProfile | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateUserIdentity(userId: number, name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(users).set({ name: name.trim() }).where(eq(users.id, userId));
  return getUserById(userId);
}

export async function upsertUserProfile(
  userId: number,
  input: Omit<InsertUserProfile, "id" | "userId" | "createdAt" | "updatedAt">
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const values: InsertUserProfile = { userId, ...input };
  const { userId: _ignored, ...updateSet } = values;
  await db
    .insert(userProfiles)
    .values(values)
    .onDuplicateKeyUpdate({ set: updateSet });
  return getUserProfile(userId);
}

export async function startDailyWorkout(
  userId: number,
  workoutDate: string,
  plan: {
    title: string;
    goal: string;
    durationMinutes: number;
    reasonCodes: string[];
    exercises: Array<{
      slug: string;
      position: number;
      sets: number;
      reps: string;
      restSeconds: number;
    }>;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const existing = await db
    .select()
    .from(dailyWorkouts)
    .where(
      and(
        eq(dailyWorkouts.userId, userId),
        eq(dailyWorkouts.workoutDate, workoutDate)
      )
    )
    .limit(1);
  if (existing[0]) {
    await db
      .update(dailyWorkouts)
      .set({
        status: "in_progress",
        startedAt: existing[0].startedAt ?? new Date(),
      })
      .where(eq(dailyWorkouts.id, existing[0].id));
    const existingExercises = await db
      .select({
        id: workoutExercises.id,
        workoutId: workoutExercises.workoutId,
        exerciseId: workoutExercises.exerciseId,
        position: workoutExercises.position,
        sets: workoutExercises.sets,
        reps: workoutExercises.reps,
        restSeconds: workoutExercises.restSeconds,
        completedAt: workoutExercises.completedAt,
        slug: exercises.slug,
      })
      .from(workoutExercises)
      .innerJoin(exercises, eq(workoutExercises.exerciseId, exercises.id))
      .where(
        and(
          eq(workoutExercises.workoutId, existing[0].id),
          eq(exercises.isSystemVerified, 1)
        )
      );
    return {
      ...existing[0],
      status: "in_progress" as const,
      exercises: existingExercises,
    };
  }

  const exerciseRows = await db
    .select({ id: exercises.id, slug: exercises.slug })
    .from(exercises)
    .where(
      and(
        inArray(
          exercises.slug,
          plan.exercises.map(exercise => exercise.slug)
        ),
        eq(exercises.isSystemVerified, 1)
      )
    );
  const exerciseIds = new Map(exerciseRows.map(row => [row.slug, row.id]));
  await db.insert(dailyWorkouts).values({
    userId,
    workoutDate,
    title: plan.title,
    goal: plan.goal,
    durationMinutes: plan.durationMinutes,
    reasonCodes: JSON.stringify(plan.reasonCodes),
    status: "in_progress",
    startedAt: new Date(),
  });
  const created = await db
    .select()
    .from(dailyWorkouts)
    .where(
      and(
        eq(dailyWorkouts.userId, userId),
        eq(dailyWorkouts.workoutDate, workoutDate)
      )
    )
    .orderBy(desc(dailyWorkouts.id))
    .limit(1);
  const workout = created[0];
  if (!workout) throw new Error("Daily workout creation failed");
  const rows = plan.exercises.flatMap(exercise => {
    const exerciseId = exerciseIds.get(exercise.slug);
    return exerciseId
      ? [
          {
            workoutId: workout.id,
            exerciseId,
            position: exercise.position,
            sets: exercise.sets,
            reps: exercise.reps,
            restSeconds: exercise.restSeconds,
          },
        ]
      : [];
  });
  if (rows.length) await db.insert(workoutExercises).values(rows);
  const persistedExercises = await db
    .select({
      id: workoutExercises.id,
      workoutId: workoutExercises.workoutId,
      exerciseId: workoutExercises.exerciseId,
      position: workoutExercises.position,
      sets: workoutExercises.sets,
      reps: workoutExercises.reps,
      restSeconds: workoutExercises.restSeconds,
      completedAt: workoutExercises.completedAt,
      slug: exercises.slug,
    })
    .from(workoutExercises)
    .innerJoin(exercises, eq(workoutExercises.exerciseId, exercises.id))
    .where(
      and(
        eq(workoutExercises.workoutId, workout.id),
        eq(exercises.isSystemVerified, 1)
      )
    );
  return { ...workout, exercises: persistedExercises };
}

export type WorkoutProgressRow = {
  workoutDate: string;
  durationMinutes: number;
  status: "planned" | "in_progress" | "completed" | "skipped";
  energy: number | null;
  difficulty: number | null;
};

export function calculateWorkoutProgress(
  history: WorkoutProgressRow[],
  now = new Date()
) {
  const completed = history.filter(item => item.status === "completed");
  const totalMinutes = completed.reduce(
    (sum, item) => sum + item.durationMinutes,
    0
  );
  const average = (values: Array<number | null>) => {
    const valid = values.filter((value): value is number => value !== null);
    return valid.length
      ? Math.round(
          (valid.reduce((sum, value) => sum + value, 0) / valid.length) * 10
        ) / 10
      : null;
  };
  const completedDates = new Set(completed.map(item => item.workoutDate));
  let streak = 0;
  const cursor = new Date(now);
  while (completedDates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  const trend = Array.from({ length: 7 }, (_, offset) => {
    const day = new Date(now);
    day.setUTCDate(day.getUTCDate() - (6 - offset));
    const date = day.toISOString().slice(0, 10);
    return { date, completed: completedDates.has(date) ? 1 : 0 };
  });
  return {
    totalSessions: history.length,
    completedSessions: completed.length,
    completionRate: history.length
      ? Math.round((completed.length / history.length) * 100)
      : 0,
    totalMinutes,
    currentStreak: streak,
    averageEnergy: average(history.map(item => item.energy)),
    averageDifficulty: average(history.map(item => item.difficulty)),
    trend,
  };
}

export async function getWorkoutProgress(userId: number, days = 180) {
  const history = await getWorkoutHistory(
    userId,
    Math.max(7, Math.min(days, 180))
  );
  return calculateWorkoutProgress(
    history.map(item => ({
      workoutDate: item.workoutDate,
      durationMinutes: item.durationMinutes,
      status: item.status,
      energy: item.energy,
      difficulty: item.difficulty,
    }))
  );
}

export async function getWorkoutHistory(
  userId: number,
  limit = 20,
  days = 180
) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      id: dailyWorkouts.id,
      workoutDate: dailyWorkouts.workoutDate,
      title: dailyWorkouts.title,
      goal: dailyWorkouts.goal,
      durationMinutes: dailyWorkouts.durationMinutes,
      status: dailyWorkouts.status,
      completedAt: dailyWorkouts.completedAt,
      energy: workoutFeedback.energy,
      difficulty: workoutFeedback.difficulty,
      notes: workoutFeedback.notes,
    })
    .from(dailyWorkouts)
    .leftJoin(workoutFeedback, eq(workoutFeedback.workoutId, dailyWorkouts.id))
    .where(eq(dailyWorkouts.userId, userId))
    .orderBy(desc(dailyWorkouts.workoutDate))
    .limit(limit);
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - Math.max(7, Math.min(days, 180)));
  const cutoffDate = cutoff.toISOString().slice(0, 10);
  const rangedRows = rows.filter(row => row.workoutDate >= cutoffDate);
  return Promise.all(
    rangedRows.map(async row => {
      const sets = await db
        .select({ id: workoutSets.id })
        .from(workoutSets)
        .innerJoin(
          workoutExercises,
          eq(workoutSets.workoutExerciseId, workoutExercises.id)
        )
        .where(eq(workoutExercises.workoutId, row.id));
      return { ...row, setCount: sets.length };
    })
  );
}

export async function logWorkoutSet(
  userId: number,
  input: {
    workoutId: number;
    workoutExerciseId: number;
    setNumber: number;
    targetReps: string;
    actualReps: number;
    loadKg?: number;
    perceivedExertion?: number;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const ownedWorkout = await db
    .select({ workoutId: dailyWorkouts.id })
    .from(dailyWorkouts)
    .where(
      and(
        eq(dailyWorkouts.id, input.workoutId),
        eq(dailyWorkouts.userId, userId)
      )
    )
    .limit(1);
  if (!ownedWorkout[0]) throw new Error("Workout not found");
  const ownedExercise = await db
    .select({ id: workoutExercises.id })
    .from(workoutExercises)
    .where(
      and(
        eq(workoutExercises.id, input.workoutExerciseId),
        eq(workoutExercises.workoutId, input.workoutId)
      )
    )
    .limit(1);
  if (!ownedExercise[0]) throw new Error("Workout exercise not found");
  await db.insert(workoutSets).values({
    workoutExerciseId: input.workoutExerciseId,
    setNumber: input.setNumber,
    targetReps: input.targetReps,
    actualReps: input.actualReps,
    loadKg: input.loadKg ?? null,
    perceivedExertion: input.perceivedExertion ?? null,
    completedAt: new Date(),
  });
  return { status: "logged" as const };
}

export async function completeDailyWorkout(
  userId: number,
  workoutId: number,
  feedback?: { energy?: number; difficulty?: number; notes?: string }
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const ownedWorkout = await db
    .select()
    .from(dailyWorkouts)
    .where(
      and(eq(dailyWorkouts.id, workoutId), eq(dailyWorkouts.userId, userId))
    )
    .limit(1);
  if (!ownedWorkout[0]) throw new Error("Workout not found");
  await db
    .update(dailyWorkouts)
    .set({ status: "completed", completedAt: new Date() })
    .where(eq(dailyWorkouts.id, workoutId));
  if (feedback) {
    await db
      .insert(workoutFeedback)
      .values({ workoutId, ...feedback })
      .onDuplicateKeyUpdate({ set: feedback });
  }
  return { status: "completed" as const, workoutId };
}
