import "dotenv/config";
import { describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { ENV } from "./_core/env";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";

describe("Full Application End-to-End & API Integration Suite", () => {
  const url = ENV.supabaseUrl;
  const serviceKey = ENV.supabaseServiceRoleKey;
  const anonKey = ENV.supabaseAnonKey;

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const clientA = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const clientB = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const emailA = `athlete_a_${Date.now()}@adaptivee2e.test`;
  const emailB = `athlete_b_${Date.now()}@adaptivee2e.test`;
  const password = "ValidPassword123!Secure";

  let userAId: string | null = null;
  let userBId: string | null = null;
  let tokenA: string | null = null;
  let tokenB: string | null = null;

  it("Setup: Creates two test users in Supabase Auth", async () => {
    const { data: dataA } = await admin.auth.admin.createUser({
      email: emailA,
      password,
      email_confirm: true,
      user_metadata: { full_name: "Athlete Alpha" },
    });
    userAId = dataA.user!.id;

    const { data: dataB } = await admin.auth.admin.createUser({
      email: emailB,
      password,
      email_confirm: true,
      user_metadata: { full_name: "Athlete Beta" },
    });
    userBId = dataB.user!.id;

    const { data: loginA } = await clientA.auth.signInWithPassword({
      email: emailA,
      password,
    });
    tokenA = loginA.session!.access_token;

    const { data: loginB } = await clientB.auth.signInWithPassword({
      email: emailB,
      password,
    });
    tokenB = loginB.session!.access_token;

    expect(tokenA).toBeTruthy();
    expect(tokenB).toBeTruthy();
  });

  it("Phase 3 - Rejects unauthenticated request on protected procedures", async () => {
    const unauthReq = {
      headers: {},
    } as any;
    const unauthRes = {} as any;
    const unauthCtx = await createContext({ req: unauthReq, res: unauthRes });
    const caller = appRouter.createCaller(unauthCtx);

    // publicProcedure succeeds with null
    const me = await caller.auth.me();
    expect(me).toBeNull();

    // protectedProcedure throws UNAUTHORIZED
    await expect(caller.profile.get()).rejects.toThrow();
    await expect(caller.history.list()).rejects.toThrow();
    await expect(caller.workout.startToday()).rejects.toThrow();
  });

  it("Phase 3 & 4 - Authorizes authenticated user and loads profile & catalog", async () => {
    const reqA = {
      headers: { authorization: `Bearer ${tokenA}` },
    } as any;
    const resA = {} as any;
    const ctxA = await createContext({ req: reqA, res: resA });
    const callerA = appRouter.createCaller(ctxA);

    // auth.me returns User A
    const meA = await callerA.auth.me();
    expect(meA).toBeTruthy();
    expect(meA?.openId).toBe(userAId);
    expect(meA?.email).toBe(emailA);

    // exercises catalog is accessible
    const catalog = await callerA.exercises.catalog();
    expect(Array.isArray(catalog)).toBe(true);

    // profile can be retrieved
    const profile = await callerA.profile.get();
    // Default profile or null is handled gracefully
    expect(profile === null || typeof profile === "object").toBe(true);
  });

  it("Phase 2 & 3 - User Isolation: User A and User B have strictly isolated contexts", async () => {
    const reqA = { headers: { authorization: `Bearer ${tokenA}` } } as any;
    const reqB = { headers: { authorization: `Bearer ${tokenB}` } } as any;

    const ctxA = await createContext({ req: reqA, res: {} as any });
    const ctxB = await createContext({ req: reqB, res: {} as any });

    const callerA = appRouter.createCaller(ctxA);
    const callerB = appRouter.createCaller(ctxB);

    const meA = await callerA.auth.me();
    const meB = await callerB.auth.me();

    expect(meA?.openId).toBe(userAId);
    expect(meB?.openId).toBe(userBId);
    expect(meA?.openId).not.toBe(meB?.openId);
  });

  it("Phase 1 & 4 - Workout execution and progress flow", async () => {
    const reqA = { headers: { authorization: `Bearer ${tokenA}` } } as any;
    const ctxA = await createContext({ req: reqA, res: {} as any });
    const callerA = appRouter.createCaller(ctxA);

    // Save profile for User A
    await callerA.profile.save({
      onboardingStep: 8,
      onboardingCompleted: true,
      fitnessLevel: "intermediate",
      primaryGoal: "hypertrophy",
      workoutDaysPerWeek: 4,
      workoutDurationMinutes: 45,
    });

    // Start workout
    const workout = await callerA.workout.startToday();
    expect(workout).toBeTruthy();
    expect(workout.workout).toBeTruthy();
    expect(Array.isArray(workout.exercises)).toBe(true);

    // Progress summary loads without error
    const progress = await callerA.progress.summary({ days: 30 });
    expect(progress).toBeTruthy();
    expect(typeof progress.totalWorkouts).toBe("number");
  });

  it("Teardown: Cleans up test users from Supabase Auth", async () => {
    if (userAId) await admin.auth.admin.deleteUser(userAId);
    if (userBId) await admin.auth.admin.deleteUser(userBId);
  });
});
