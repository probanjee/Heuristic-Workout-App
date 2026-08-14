import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  passwordHash: text("passwordHash"),
  emailVerifiedAt: timestamp("emailVerifiedAt"),
  phoneNumber: varchar("phoneNumber", { length: 24 }).unique(),
  phoneVerifiedAt: timestamp("phoneVerifiedAt"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const userProfiles = mysqlTable("user_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  avatarUrl: text("avatarUrl"),
  avatarKey: varchar("avatarKey", { length: 255 }),
  onboardingStep: int("onboardingStep").default(0).notNull(),
  onboardingCompleted: int("onboardingCompleted").default(0).notNull(),
  age: int("age"),
  birthDate: timestamp("birthDate"),
  gender: varchar("gender", { length: 32 }),
  heightCm: int("heightCm"),
  weightKg: int("weightKg"),
  fitnessLevel: varchar("fitnessLevel", { length: 32 }),
  primaryGoal: varchar("primaryGoal", { length: 64 }),
  secondaryGoal: varchar("secondaryGoal", { length: 64 }),
  workoutDaysPerWeek: int("workoutDaysPerWeek"),
  workoutDurationMinutes: int("workoutDurationMinutes"),
  preferredWorkoutTime: varchar("preferredWorkoutTime", { length: 16 }),
  reminderEnabled: int("reminderEnabled").default(0).notNull(),
  environment: varchar("environment", { length: 32 }),
  equipment: text("equipment"),
  exerciseExclusions: text("exerciseExclusions"),
  sleepQuality: int("sleepQuality"),
  fatigueLevel: int("fatigueLevel"),
  recoveryFeeling: varchar("recoveryFeeling", { length: 32 }),
  quotePreference: varchar("quotePreference", { length: 32 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

export const authChallenges = mysqlTable("auth_challenges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  identifier: varchar("identifier", { length: 320 }).notNull(),
  channel: mysqlEnum("channel", ["phone", "email"]).notNull(),
  purpose: mysqlEnum("purpose", [
    "phone_login",
    "email_verification",
    "password_reset",
  ]).notNull(),
  challengeHash: varchar("challengeHash", { length: 128 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  attemptCount: int("attemptCount").default(0).notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  consumedAt: timestamp("consumedAt"),
});

export type AuthChallenge = typeof authChallenges.$inferSelect;
export type InsertAuthChallenge = typeof authChallenges.$inferInsert;

export const exercises = mysqlTable("exercises", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 96 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  primaryMuscle: varchar("primaryMuscle", { length: 64 }).notNull(),
  secondaryMuscles: text("secondaryMuscles"),
  equipment: varchar("equipment", { length: 64 }).notNull(),
  difficulty: mysqlEnum("difficulty", [
    "beginner",
    "intermediate",
    "advanced",
  ]).notNull(),
  movementPattern: varchar("movementPattern", { length: 64 }).notNull(),
  instructions: text("instructions").notNull(),
  defaultSets: int("defaultSets").notNull(),
  defaultReps: varchar("defaultReps", { length: 32 }).notNull(),
  restSeconds: int("restSeconds").notNull(),
  alternativeSlugs: text("alternativeSlugs"),
  isSystemVerified: int("isSystemVerified").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = typeof exercises.$inferInsert;

export const dailyWorkouts = mysqlTable("daily_workouts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  workoutDate: varchar("workoutDate", { length: 10 }).notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  goal: varchar("goal", { length: 64 }).notNull(),
  durationMinutes: int("durationMinutes").notNull(),
  reasonCodes: text("reasonCodes").notNull(),
  status: mysqlEnum("status", [
    "planned",
    "in_progress",
    "completed",
    "skipped",
  ])
    .default("planned")
    .notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DailyWorkout = typeof dailyWorkouts.$inferSelect;
export type InsertDailyWorkout = typeof dailyWorkouts.$inferInsert;

export const workoutExercises = mysqlTable("workout_exercises", {
  id: int("id").autoincrement().primaryKey(),
  workoutId: int("workoutId").notNull(),
  exerciseId: int("exerciseId").notNull(),
  position: int("position").notNull(),
  sets: int("sets").notNull(),
  reps: varchar("reps", { length: 32 }).notNull(),
  restSeconds: int("restSeconds").notNull(),
  completedAt: timestamp("completedAt"),
});

export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type InsertWorkoutExercise = typeof workoutExercises.$inferInsert;

export const workoutSets = mysqlTable("workout_sets", {
  id: int("id").autoincrement().primaryKey(),
  workoutExerciseId: int("workoutExerciseId").notNull(),
  setNumber: int("setNumber").notNull(),
  targetReps: varchar("targetReps", { length: 32 }).notNull(),
  actualReps: int("actualReps"),
  loadKg: int("loadKg"),
  perceivedExertion: int("perceivedExertion"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WorkoutSet = typeof workoutSets.$inferSelect;
export type InsertWorkoutSet = typeof workoutSets.$inferInsert;

export const workoutFeedback = mysqlTable("workout_feedback", {
  id: int("id").autoincrement().primaryKey(),
  workoutId: int("workoutId").notNull().unique(),
  energy: int("energy"),
  difficulty: int("difficulty"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WorkoutFeedback = typeof workoutFeedback.$inferSelect;
export type InsertWorkoutFeedback = typeof workoutFeedback.$inferInsert;
