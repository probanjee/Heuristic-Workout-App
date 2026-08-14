import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  passwordHash: text("passwordHash"),
  emailVerifiedAt: timestamp("emailVerifiedAt"),
  phoneNumber: varchar("phoneNumber", { length: 24 }).unique(),
  phoneVerifiedAt: timestamp("phoneVerifiedAt"),
  role: text("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  avatarUrl: text("avatarUrl"),
  avatarKey: varchar("avatarKey", { length: 255 }),
  onboardingStep: integer("onboardingStep").default(0).notNull(),
  onboardingCompleted: integer("onboardingCompleted").default(0).notNull(),
  age: integer("age"),
  birthDate: timestamp("birthDate"),
  gender: varchar("gender", { length: 32 }),
  heightCm: integer("heightCm"),
  weightKg: integer("weightKg"),
  fitnessLevel: varchar("fitnessLevel", { length: 32 }),
  primaryGoal: varchar("primaryGoal", { length: 64 }),
  secondaryGoal: varchar("secondaryGoal", { length: 64 }),
  workoutDaysPerWeek: integer("workoutDaysPerWeek"),
  workoutDurationMinutes: integer("workoutDurationMinutes"),
  preferredWorkoutTime: varchar("preferredWorkoutTime", { length: 16 }),
  reminderEnabled: integer("reminderEnabled").default(0).notNull(),
  environment: varchar("environment", { length: 32 }),
  equipment: text("equipment"),
  exerciseExclusions: text("exerciseExclusions"),
  sleepQuality: integer("sleepQuality"),
  fatigueLevel: integer("fatigueLevel"),
  recoveryFeeling: varchar("recoveryFeeling", { length: 32 }),
  quotePreference: varchar("quotePreference", { length: 32 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

export const authChallenges = pgTable("auth_challenges", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  identifier: varchar("identifier", { length: 320 }).notNull(),
  channel: text("channel").notNull(),
  purpose: text("purpose").notNull(),
  challengeHash: varchar("challengeHash", { length: 128 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  attemptCount: integer("attemptCount").default(0).notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  consumedAt: timestamp("consumedAt"),
});

export type AuthChallenge = typeof authChallenges.$inferSelect;
export type InsertAuthChallenge = typeof authChallenges.$inferInsert;

export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 96 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  primaryMuscle: varchar("primaryMuscle", { length: 64 }).notNull(),
  secondaryMuscles: text("secondaryMuscles"),
  equipment: varchar("equipment", { length: 64 }).notNull(),
  difficulty: text("difficulty").notNull(),
  movementPattern: varchar("movementPattern", { length: 64 }).notNull(),
  instructions: text("instructions").notNull(),
  defaultSets: integer("defaultSets").notNull(),
  defaultReps: varchar("defaultReps", { length: 32 }).notNull(),
  restSeconds: integer("restSeconds").notNull(),
  alternativeSlugs: text("alternativeSlugs"),
  isSystemVerified: integer("isSystemVerified").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = typeof exercises.$inferInsert;

export const dailyWorkouts = pgTable("daily_workouts", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  workoutDate: varchar("workoutDate", { length: 10 }).notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  goal: varchar("goal", { length: 64 }).notNull(),
  durationMinutes: integer("durationMinutes").notNull(),
  reasonCodes: text("reasonCodes").notNull(),
  status: text("status").default("planned").notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type DailyWorkout = typeof dailyWorkouts.$inferSelect;
export type InsertDailyWorkout = typeof dailyWorkouts.$inferInsert;

export const workoutExercises = pgTable("workout_exercises", {
  id: serial("id").primaryKey(),
  workoutId: integer("workoutId").notNull(),
  exerciseId: integer("exerciseId").notNull(),
  position: integer("position").notNull(),
  sets: integer("sets").notNull(),
  reps: varchar("reps", { length: 32 }).notNull(),
  restSeconds: integer("restSeconds").notNull(),
  completedAt: timestamp("completedAt"),
});

export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type InsertWorkoutExercise = typeof workoutExercises.$inferInsert;

export const workoutSets = pgTable("workout_sets", {
  id: serial("id").primaryKey(),
  workoutExerciseId: integer("workoutExerciseId").notNull(),
  setNumber: integer("setNumber").notNull(),
  targetReps: varchar("targetReps", { length: 32 }).notNull(),
  actualReps: integer("actualReps"),
  loadKg: integer("loadKg"),
  perceivedExertion: integer("perceivedExertion"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WorkoutSet = typeof workoutSets.$inferSelect;
export type InsertWorkoutSet = typeof workoutSets.$inferInsert;

export const workoutFeedback = pgTable("workout_feedback", {
  id: serial("id").primaryKey(),
  workoutId: integer("workoutId").notNull().unique(),
  energy: integer("energy"),
  difficulty: integer("difficulty"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WorkoutFeedback = typeof workoutFeedback.$inferSelect;
export type InsertWorkoutFeedback = typeof workoutFeedback.$inferInsert;
