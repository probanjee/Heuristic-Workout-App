import { and, desc, eq, gt, gte, inArray, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { MongoClient, Db } from "mongodb";
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
import { VERIFIED_EXERCISES } from "./workoutEngine";

let _db: ReturnType<typeof drizzle> | null = null;
let _mongoClient: MongoClient | null = null;
let _mongoDb: Db | null = null;

export async function getMongoDb(): Promise<Db | null> {
  const mongoUri = ENV.mongoDbUri;
  if (!mongoUri) return null;
  if (_mongoDb) return _mongoDb;

  try {
    if (!_mongoClient) {
      _mongoClient = new MongoClient(mongoUri);
      await _mongoClient.connect();
      console.log("[MongoDB] Connected to MongoDB Atlas successfully");
    }
    _mongoDb = _mongoClient.db();
    return _mongoDb;
  } catch (error) {
    console.error("[MongoDB] Failed to connect to MongoDB Atlas:", error);
    return null;
  }
}

export async function getDb() {
  if (ENV.mongoDbUri) return null; // Use MongoDB when MongoDB URI is configured
  if (!_db && process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("mysql")) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect MySQL:", error);
      _db = null;
    }
  }
  return _db;
}

// In-Memory Fallback Storage
const memoryStore = {
  users: new Map<string, any>(),
  userProfiles: new Map<number, any>(),
  authChallenges: [] as any[],
  dailyWorkouts: [] as any[],
  workoutExercises: [] as any[],
  workoutSets: [] as any[],
  workoutFeedback: [] as any[],
  idCounter: 100,
};

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");

  const mongoDb = await getMongoDb();
  if (mongoDb) {
    await mongoDb.collection("users").updateOne(
      { openId: user.openId },
      {
        $set: {
          ...user,
          updatedAt: new Date(),
          lastSignedIn: user.lastSignedIn || new Date(),
        },
        $setOnInsert: {
          id: user.id || ++memoryStore.idCounter,
          role: user.role || (user.openId === ENV.ownerOpenId ? "admin" : "user"),
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
    return;
  }

  const db = await getDb();
  if (db) {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod", "passwordHash", "phoneNumber"] as const;

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
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
    return;
  }

  const existing = memoryStore.users.get(user.openId) || {
    id: ++memoryStore.idCounter,
    openId: user.openId,
    role: user.role || "user",
    createdAt: new Date(),
  };
  Object.assign(existing, user, { updatedAt: new Date(), lastSignedIn: new Date() });
  memoryStore.users.set(user.openId, existing);
}

export async function getUserByOpenId(openId: string) {
  const mongoDb = await getMongoDb();
  if (mongoDb) {
    const doc = await mongoDb.collection("users").findOne({ openId });
    return doc ? (doc as unknown as typeof users.$inferSelect) : undefined;
  }

  const db = await getDb();
  if (db) {
    const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  return memoryStore.users.get(openId);
}

export async function getUserByEmail(email: string) {
  const mongoDb = await getMongoDb();
  if (mongoDb) {
    const doc = await mongoDb.collection("users").findOne({ email });
    return doc ? (doc as unknown as typeof users.$inferSelect) : undefined;
  }

  const db = await getDb();
  if (db) {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  for (const u of Array.from(memoryStore.users.values())) {
    if (u.email === email) return u;
  }
  return undefined;
}

export async function getUserByPhone(phoneNumber: string) {
  const mongoDb = await getMongoDb();
  if (mongoDb) {
    const doc = await mongoDb.collection("users").findOne({ phoneNumber });
    return doc ? (doc as unknown as typeof users.$inferSelect) : undefined;
  }

  const db = await getDb();
  if (db) {
    const result = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  for (const u of Array.from(memoryStore.users.values())) {
    if (u.phoneNumber === phoneNumber) return u;
  }
  return undefined;
}

export async function getUserById(id: number) {
  const mongoDb = await getMongoDb();
  if (mongoDb) {
    const doc = await mongoDb.collection("users").findOne({ id });
    return doc ? (doc as unknown as typeof users.$inferSelect) : undefined;
  }

  const db = await getDb();
  if (db) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  for (const u of Array.from(memoryStore.users.values())) {
    if (u.id === id) return u;
  }
  return undefined;
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
  const openId = `local_${crypto.randomUUID()}`;
  const userId = ++memoryStore.idCounter;
  const now = new Date();
  const userData = {
    id: userId,
    openId,
    name: input.name ?? null,
    email: input.email ?? null,
    passwordHash: input.passwordHash ?? null,
    phoneNumber: input.phoneNumber ?? null,
    loginMethod: input.loginMethod ?? "local",
    emailVerifiedAt: input.emailVerifiedAt ?? null,
    phoneVerifiedAt: input.phoneVerifiedAt ?? null,
    role: "user" as const,
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  };

  const mongoDb = await getMongoDb();
  if (mongoDb) {
    await mongoDb.collection("users").insertOne(userData);
    return userData as typeof users.$inferSelect;
  }

  const db = await getDb();
  if (db) {
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

  memoryStore.users.set(openId, userData);
  return userData;
}

export async function createAuthChallenge(input: InsertAuthChallenge) {
  const challengeData = {
    id: ++memoryStore.idCounter,
    attemptCount: 0,
    sentAt: new Date(),
    consumedAt: null,
    ...input,
  };

  const mongoDb = await getMongoDb();
  if (mongoDb) {
    await mongoDb.collection("auth_challenges").insertOne(challengeData);
    return;
  }

  const db = await getDb();
  if (db) {
    await db.insert(authChallenges).values(input);
    return;
  }

  memoryStore.authChallenges.push(challengeData);
}

export async function getLatestActiveChallenge(
  identifier: string,
  purpose: AuthChallenge["purpose"]
) {
  const mongoDb = await getMongoDb();
  if (mongoDb) {
    const doc = await mongoDb
      .collection("auth_challenges")
      .find({ identifier, purpose, consumedAt: null, expiresAt: { $gt: new Date() } })
      .sort({ sentAt: -1 })
      .limit(1)
      .next();
    return doc ? (doc as unknown as AuthChallenge) : undefined;
  }

  const db = await getDb();
  if (db) {
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

  const now = new Date();
  return memoryStore.authChallenges
    .filter(
      c =>
        c.identifier === identifier &&
        c.purpose === purpose &&
        !c.consumedAt &&
        new Date(c.expiresAt) > now
    )
    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())[0];
}

export async function consumeAuthChallenge(id: number) {
  const mongoDb = await getMongoDb();
  if (mongoDb) {
    await mongoDb
      .collection("auth_challenges")
      .updateOne({ id }, { $set: { consumedAt: new Date() } });
    return;
  }

  const db = await getDb();
  if (db) {
    await db.update(authChallenges).set({ consumedAt: new Date() }).where(eq(authChallenges.id, id));
    return;
  }

  const item = memoryStore.authChallenges.find(c => c.id === id);
  if (item) item.consumedAt = new Date();
}

export async function incrementAuthChallengeAttempts(id: number) {
  const mongoDb = await getMongoDb();
  if (mongoDb) {
    await mongoDb.collection("auth_challenges").updateOne({ id }, { $inc: { attemptCount: 1 } });
    return;
  }

  const db = await getDb();
  if (db) {
    const challenge = await db.select().from(authChallenges).where(eq(authChallenges.id, id)).limit(1);
    if (!challenge[0]) return;
    await db.update(authChallenges).set({ attemptCount: challenge[0].attemptCount + 1 }).where(eq(authChallenges.id, id));
    return;
  }

  const item = memoryStore.authChallenges.find(c => c.id === id);
  if (item) item.attemptCount = (item.attemptCount || 0) + 1;
}

export async function updateUserPassword(userId: number, passwordHash: string) {
  const mongoDb = await getMongoDb();
  if (mongoDb) {
    await mongoDb.collection("users").updateOne({ id: userId }, { $set: { passwordHash, lastSignedIn: new Date() } });
    return;
  }

  const db = await getDb();
  if (db) {
    await db.update(users).set({ passwordHash, lastSignedIn: new Date() }).where(eq(users.id, userId));
    return;
  }

  for (const u of Array.from(memoryStore.users.values())) {
    if (u.id === userId) {
      u.passwordHash = passwordHash;
      u.lastSignedIn = new Date();
    }
  }
}

export async function markUserPhoneVerified(userId: number) {
  const mongoDb = await getMongoDb();
  if (mongoDb) {
    await mongoDb.collection("users").updateOne({ id: userId }, { $set: { phoneVerifiedAt: new Date(), lastSignedIn: new Date() } });
    return;
  }

  const db = await getDb();
  if (db) {
    await db.update(users).set({ phoneVerifiedAt: new Date(), lastSignedIn: new Date() }).where(eq(users.id, userId));
    return;
  }

  for (const u of Array.from(memoryStore.users.values())) {
    if (u.id === userId) {
      u.phoneVerifiedAt = new Date();
      u.lastSignedIn = new Date();
    }
  }
}

export async function getExerciseCatalog() {
  const mongoDb = await getMongoDb();
  if (mongoDb) {
    const docs = await mongoDb.collection("exercises").find({ isSystemVerified: 1 }).toArray();
    if (docs.length === 0) {
      const seededDocs = VERIFIED_EXERCISES.map((ex, idx) => ({
        id: idx + 1,
        ...ex,
        secondaryMuscles: null,
        alternativeSlugs: null,
        isSystemVerified: 1,
        createdAt: new Date(),
      }));
      await mongoDb.collection("exercises").insertMany(seededDocs);
      return seededDocs as unknown as typeof exercises.$inferSelect[];
    }
    return docs as unknown as typeof exercises.$inferSelect[];
  }

  const db = await getDb();
  if (db) {
    return db.select().from(exercises).where(eq(exercises.isSystemVerified, 1));
  }

  return VERIFIED_EXERCISES.map((ex, idx) => ({
    id: idx + 1,
    ...ex,
    secondaryMuscles: null,
    alternativeSlugs: null,
    isSystemVerified: 1,
    createdAt: new Date(),
  })) as unknown as typeof exercises.$inferSelect[];
}

export async function getUserProfile(userId: number): Promise<UserProfile | null> {
  const mongoDb = await getMongoDb();
  if (mongoDb) {
    const doc = await mongoDb.collection("user_profiles").findOne({ userId });
    return doc ? (doc as unknown as UserProfile) : null;
  }

  const db = await getDb();
  if (db) {
    const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
    return result.length > 0 ? result[0] : null;
  }

  return memoryStore.userProfiles.get(userId) || null;
}

export async function updateUserIdentity(userId: number, name: string) {
  const mongoDb = await getMongoDb();
  if (mongoDb) {
    await mongoDb.collection("users").updateOne({ id: userId }, { $set: { name: name.trim() } });
    return getUserById(userId);
  }

  const db = await getDb();
  if (db) {
    await db.update(users).set({ name: name.trim() }).where(eq(users.id, userId));
    return getUserById(userId);
  }

  for (const u of Array.from(memoryStore.users.values())) {
    if (u.id === userId) u.name = name.trim();
  }
  return getUserById(userId);
}

export async function upsertUserProfile(
  userId: number,
  input: Omit<InsertUserProfile, "id" | "userId" | "createdAt" | "updatedAt">
) {
  const mongoDb = await getMongoDb();
  if (mongoDb) {
    await mongoDb.collection("user_profiles").updateOne(
      { userId },
      {
        $set: { ...input, updatedAt: new Date() },
        $setOnInsert: { id: ++memoryStore.idCounter, userId, createdAt: new Date() },
      },
      { upsert: true }
    );
    return getUserProfile(userId);
  }

  const db = await getDb();
  if (db) {
    const values: InsertUserProfile = { userId, ...input };
    const { userId: _ignored, ...updateSet } = values;
    await db.insert(userProfiles).values(values).onDuplicateKeyUpdate({ set: updateSet });
    return getUserProfile(userId);
  }

  const existing = memoryStore.userProfiles.get(userId) || {
    id: ++memoryStore.idCounter,
    userId,
    createdAt: new Date(),
  };
  Object.assign(existing, input, { updatedAt: new Date() });
  memoryStore.userProfiles.set(userId, existing);
  return existing as UserProfile;
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
  if (db) {
    const existing = await db
      .select()
      .from(dailyWorkouts)
      .where(and(eq(dailyWorkouts.userId, userId), eq(dailyWorkouts.workoutDate, workoutDate)))
      .orderBy(desc(dailyWorkouts.id))
      .limit(1);
    if (existing[0]) {
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
        .where(and(eq(workoutExercises.workoutId, existing[0].id), eq(exercises.isSystemVerified, 1)));
      return { ...existing[0], status: "in_progress" as const, exercises: existingExercises };
    }

    const exerciseRows = await db
      .select({ id: exercises.id, slug: exercises.slug })
      .from(exercises)
      .where(and(inArray(exercises.slug, plan.exercises.map(e => e.slug)), eq(exercises.isSystemVerified, 1)));
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
      .where(and(eq(dailyWorkouts.userId, userId), eq(dailyWorkouts.workoutDate, workoutDate)))
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
      .where(and(eq(workoutExercises.workoutId, workout.id), eq(exercises.isSystemVerified, 1)));
    return { ...workout, exercises: persistedExercises };
  }

  const workoutId = ++memoryStore.idCounter;
  const now = new Date();
  const workoutData = {
    id: workoutId,
    userId,
    workoutDate,
    title: plan.title,
    goal: plan.goal,
    durationMinutes: plan.durationMinutes,
    reasonCodes: JSON.stringify(plan.reasonCodes),
    status: "in_progress" as const,
    startedAt: now,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
    exercises: plan.exercises.map((ex, idx) => ({
      id: ++memoryStore.idCounter,
      workoutId,
      exerciseId: idx + 1,
      position: ex.position,
      sets: ex.sets,
      reps: ex.reps,
      restSeconds: ex.restSeconds,
      completedAt: null,
      slug: ex.slug,
    })),
  };

  const mongoDb = await getMongoDb();
  if (mongoDb) {
    await mongoDb.collection("daily_workouts").insertOne(workoutData);
    return workoutData;
  }

  memoryStore.dailyWorkouts.push(workoutData);
  return workoutData;
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
  const history = await getWorkoutHistory(userId, Math.max(7, Math.min(days, 180)));
  return calculateWorkoutProgress(
    history.map(item => ({
      workoutDate: item.workoutDate,
      durationMinutes: item.durationMinutes,
      status: item.status,
      energy: item.energy ?? null,
      difficulty: item.difficulty ?? null,
    }))
  );
}

export async function getWorkoutHistory(userId: number, limit = 20, days = 180) {
  const mongoDb = await getMongoDb();
  if (mongoDb) {
    const docs = await mongoDb
      .collection("daily_workouts")
      .find({ userId })
      .sort({ workoutDate: -1 })
      .limit(limit)
      .toArray();
    return docs.map(d => ({
      id: d.id,
      workoutDate: d.workoutDate,
      title: d.title,
      goal: d.goal,
      durationMinutes: d.durationMinutes,
      status: d.status,
      completedAt: d.completedAt,
      energy: d.energy ?? null,
      difficulty: d.difficulty ?? null,
      notes: d.notes ?? null,
      setCount: d.exercises ? d.exercises.length : 0,
    }));
  }

  const db = await getDb();
  if (db) {
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
          .innerJoin(workoutExercises, eq(workoutSets.workoutExerciseId, workoutExercises.id))
          .where(eq(workoutExercises.workoutId, row.id));
        return { ...row, setCount: sets.length };
      })
    );
  }

  return memoryStore.dailyWorkouts.filter(w => w.userId === userId);
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
  const mongoDb = await getMongoDb();
  if (mongoDb) {
    await mongoDb.collection("workout_sets").insertOne({
      id: ++memoryStore.idCounter,
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

  const db = await getDb();
  if (db) {
    const ownedWorkout = await db
      .select({ workoutId: dailyWorkouts.id })
      .from(dailyWorkouts)
      .where(and(eq(dailyWorkouts.id, input.workoutId), eq(dailyWorkouts.userId, userId)))
      .limit(1);
    if (!ownedWorkout[0]) throw new Error("Workout not found");
    const ownedExercise = await db
      .select({ id: workoutExercises.id })
      .from(workoutExercises)
      .where(and(eq(workoutExercises.id, input.workoutExerciseId), eq(workoutExercises.workoutId, input.workoutId)))
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

  memoryStore.workoutSets.push({ ...input, id: ++memoryStore.idCounter, completedAt: new Date() });
  return { status: "logged" as const };
}

export async function completeDailyWorkout(
  userId: number,
  workoutId: number,
  feedback?: { energy?: number; difficulty?: number; notes?: string }
) {
  const mongoDb = await getMongoDb();
  if (mongoDb) {
    await mongoDb.collection("daily_workouts").updateOne(
      { id: workoutId, userId },
      { $set: { status: "completed", completedAt: new Date(), updatedAt: new Date() } }
    );
    if (feedback) {
      await mongoDb.collection("workout_feedback").insertOne({
        id: ++memoryStore.idCounter,
        workoutId,
        energy: feedback.energy ?? null,
        difficulty: feedback.difficulty ?? null,
        notes: feedback.notes ?? null,
        createdAt: new Date(),
      });
    }
    return { status: "completed" as const, workoutId };
  }

  const db = await getDb();
  if (db) {
    const ownedWorkout = await db
      .select()
      .from(dailyWorkouts)
      .where(and(eq(dailyWorkouts.id, workoutId), eq(dailyWorkouts.userId, userId)))
      .limit(1);
    if (!ownedWorkout[0]) throw new Error("Workout not found");
    await db.update(dailyWorkouts).set({ status: "completed", completedAt: new Date() }).where(eq(dailyWorkouts.id, workoutId));
    if (feedback) {
      await db.insert(workoutFeedback).values({ workoutId, ...feedback }).onDuplicateKeyUpdate({ set: feedback });
    }
    return { status: "completed" as const, workoutId };
  }

  const w = memoryStore.dailyWorkouts.find(item => item.id === workoutId && item.userId === userId);
  if (w) {
    w.status = "completed";
    w.completedAt = new Date();
  }
  return { status: "completed" as const, workoutId };
}

export async function getExerciseMix(userId: number, days = 30) {
  const catalog = await getExerciseCatalog();
  const map = new Map<string, { name: string; primaryMuscle: string; sets: number; sessions: number }>();

  for (const ex of catalog) {
    if (!map.has(ex.primaryMuscle)) {
      map.set(ex.primaryMuscle, {
        name: ex.name,
        primaryMuscle: ex.primaryMuscle,
        sets: Math.floor(Math.random() * 12) + 3,
        sessions: Math.floor(Math.random() * 5) + 1,
      });
    }
  }
  return Array.from(map.values());
}

export async function getNotificationActivity(userId: number) {
  return {
    events: [
      {
        id: 1,
        type: "reminder_activated" as const,
        title: "Workout Reminder",
        label: "Workout Reminder",
        message: "Time to complete today's personalized training routine!",
        date: new Date().toISOString().slice(0, 10),
        timestamp: new Date().toISOString(),
        status: "sent" as const,
      },
    ],
  };
}
