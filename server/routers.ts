import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  completeDailyWorkout,
  getExerciseCatalog,
  getExerciseMix,
  getNotificationActivity,
  getUserByOpenId,
  getUserProfile,
  getWorkoutHistory,
  getWorkoutProgress,
  logWorkoutSet,
  startDailyWorkout,
  upsertUserProfile,
  updateUserIdentity,
} from "./db";
import { buildDailyRecommendation } from "./recommendations";
import { generateDailyWorkout } from "./workoutEngine";
import { storagePut } from "./storage";

const profileInput = z.object({
  onboardingStep: z.number().int().min(0).max(8),
  onboardingCompleted: z.boolean().default(false),
  age: z.number().int().min(13).max(120).nullable().optional(),
  gender: z.string().max(32).nullable().optional(),
  heightCm: z.number().int().min(80).max(250).nullable().optional(),
  weightKg: z.number().int().min(25).max(400).nullable().optional(),
  fitnessLevel: z.string().max(32).nullable().optional(),
  primaryGoal: z.string().max(64).nullable().optional(),
  secondaryGoal: z.string().max(64).nullable().optional(),
  workoutDaysPerWeek: z.number().int().min(1).max(7).nullable().optional(),
  workoutDurationMinutes: z
    .number()
    .int()
    .min(10)
    .max(180)
    .nullable()
    .optional(),
  preferredWorkoutTime: z.string().max(16).nullable().optional(),
  environment: z.string().max(32).nullable().optional(),
  equipment: z.string().max(1000).nullable().optional(),
  exerciseExclusions: z.string().max(1000).nullable().optional(),
  sleepQuality: z.number().int().min(1).max(5).nullable().optional(),
  fatigueLevel: z.number().int().min(1).max(5).nullable().optional(),
  recoveryFeeling: z.string().max(32).nullable().optional(),
  quotePreference: z
    .enum(["balanced", "focus", "recovery", "encouragement"])
    .nullable()
    .optional(),
});

export const reminderPreferencesInput = z.object({
  enabled: z.boolean(),
  preferredWorkoutTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .nullable(),
});

export const workoutSetInput = z.object({
  workoutId: z.number().int().positive(),
  workoutExerciseId: z.number().int().positive(),
  setNumber: z.number().int().positive(),
  targetReps: z.string().min(1).max(32),
  actualReps: z.number().int().min(0).max(500),
  loadKg: z.number().int().min(0).max(1000).optional(),
  perceivedExertion: z.number().int().min(1).max(10).optional(),
});

export const workoutCompletionInput = z.object({
  workoutId: z.number().int().positive(),
  energy: z.number().int().min(1).max(5).optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
  notes: z.string().max(2000).optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      // Clear legacy session cookie if present
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  exercises: router({
    catalog: protectedProcedure.query(() => getExerciseCatalog()),
  }),
  profile: router({
    get: protectedProcedure.query(({ ctx }) => getUserProfile(ctx.user.id)),
    updateIdentity: protectedProcedure
      .input(z.object({ name: z.string().trim().min(2).max(120) }))
      .mutation(({ ctx, input }) =>
        updateUserIdentity(ctx.user.id, input.name)
      ),
    uploadAvatar: protectedProcedure
      .input(
        z.object({
          fileName: z.string().min(1).max(160),
          contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
          dataUrl: z.string().max(7_000_000),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const match = input.dataUrl.match(
          /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/
        );
        if (!match || match[1] !== input.contentType)
          throw new Error("Unsupported avatar format");
        const bytes = Buffer.from(match[2], "base64");
        if (bytes.byteLength > 5 * 1024 * 1024)
          throw new Error("Avatar must be 5 MB or smaller");
        const ext =
          input.contentType === "image/jpeg"
            ? "jpg"
            : input.contentType.slice(6);
        const uploaded = await storagePut(
          `profiles/${ctx.user.id}/avatar.${ext}`,
          bytes,
          input.contentType
        );
        const profile = await upsertUserProfile(ctx.user.id, {
          avatarUrl: uploaded.url,
          avatarKey: uploaded.key,
        });
        return { profile, url: uploaded.url };
      }),
    save: protectedProcedure.input(profileInput).mutation(({ ctx, input }) => {
      const { onboardingCompleted, ...profile } = input;
      return upsertUserProfile(ctx.user.id, {
        ...profile,
        onboardingCompleted: onboardingCompleted ? 1 : 0,
      });
    }),
  }),
  notifications: router({
    activity: protectedProcedure.query(({ ctx }) =>
      getNotificationActivity(ctx.user.id)
    ),
  }),
  analytics: router({
    exerciseMix: protectedProcedure
      .input(
        z
          .object({ days: z.number().int().min(7).max(180).default(30) })
          .optional()
      )
      .query(({ ctx, input }) =>
        getExerciseMix(ctx.user.id, input?.days ?? 30)
      ),
  }),
  reminders: router({
    preferences: protectedProcedure
      .input(reminderPreferencesInput)
      .mutation(async ({ ctx, input }) => {
        const profile = await upsertUserProfile(ctx.user.id, {
          reminderEnabled: input.enabled ? 1 : 0,
          preferredWorkoutTime: input.preferredWorkoutTime,
          onboardingStep: 8,
        });
        return {
          profile,
          activation: "deployment_required" as const,
          scheduled: false as const,
        };
      }),
  }),
  recommendation: router({
    today: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getUserProfile(ctx.user.id);
      return buildDailyRecommendation(profile);
    }),
  }),
  history: router({
    list: protectedProcedure
      .input(
        z
          .object({ days: z.number().int().min(7).max(180).default(30) })
          .optional()
      )
      .query(({ ctx, input }) =>
        getWorkoutHistory(ctx.user.id, 100, input?.days ?? 30)
      ),
  }),
  progress: router({
    summary: protectedProcedure
      .input(
        z
          .object({ days: z.number().int().min(7).max(180).default(30) })
          .optional()
      )
      .query(({ ctx, input }) =>
        getWorkoutProgress(ctx.user.id, input?.days ?? 30)
      ),
  }),
  assistant: router({
    ask: protectedProcedure
      .input(z.object({ question: z.string().trim().min(2).max(1000) }))
      .mutation(async ({ ctx, input }) => {
        const profile = await getUserProfile(ctx.user.id);
        const plan = generateDailyWorkout(profile);
        const response = await invokeLLM({
          model: "gpt-5-mini",
          messages: [
            {
              role: "system",
              content:
                "You are Adaptive Fitness Assistant. Give concise, safety-conscious fitness guidance and explain the supplied plan. The deterministic recommendation engine is authoritative: never invent, replace, or prescribe a different workout. Encourage a qualified professional for pain, injury, or medical concerns.",
            },
            {
              role: "user",
              content: JSON.stringify({
                question: input.question,
                profile,
                plan,
              }),
            },
          ],
          reasoning: { effort: "minimal" },
        });
        const content = response.choices[0]?.message?.content;
        return typeof content === "string"
          ? content
          : "I could not prepare an answer right now. Please try again.";
      }),
  }),
  workout: router({
    today: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getUserProfile(ctx.user.id);
      return generateDailyWorkout(profile);
    }),
    start: protectedProcedure.mutation(async ({ ctx }) => {
      const profile = await getUserProfile(ctx.user.id);
      const plan = generateDailyWorkout(profile);
      if (
        plan.status !== "ready" ||
        !plan.title ||
        !plan.goal ||
        !plan.durationMinutes
      ) {
        return { status: "profile_needed" as const };
      }
      const workout = await startDailyWorkout(
        ctx.user.id,
        new Date().toISOString().slice(0, 10),
        {
          title: plan.title,
          goal: plan.goal,
          durationMinutes: plan.durationMinutes,
          reasonCodes: plan.reasonCodes,
          exercises: plan.exercises,
        }
      );
      return { status: "started" as const, workout };
    }),
    logSet: protectedProcedure
      .input(workoutSetInput)
      .mutation(({ ctx, input }) => logWorkoutSet(ctx.user.id, input)),
    complete: protectedProcedure
      .input(workoutCompletionInput)
      .mutation(({ ctx, input }) =>
        completeDailyWorkout(ctx.user.id, input.workoutId, {
          energy: input.energy,
          difficulty: input.difficulty,
          notes: input.notes,
        })
      ),
  }),
});

export type AppRouter = typeof appRouter;
