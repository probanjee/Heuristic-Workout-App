import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  getUserProfile: vi.fn(),
  startDailyWorkout: vi.fn(),
  logWorkoutSet: vi.fn(),
  completeDailyWorkout: vi.fn(),
}));

vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return { ...actual, ...dbMocks };
});

import { appRouter } from "./routers";

function context(): TrpcContext {
  return {
    user: {
      id: 42,
      openId: "test",
      name: "Athlete",
      email: "athlete@example.com",
      loginMethod: "test",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("protected workout procedures", () => {
  it("returns profile_needed instead of generating without a profile", async () => {
    dbMocks.getUserProfile.mockResolvedValueOnce(null);
    const caller = appRouter.createCaller(context());
    await expect(caller.workout.start()).resolves.toEqual({
      status: "profile_needed",
    });
    expect(dbMocks.startDailyWorkout).not.toHaveBeenCalled();
  });

  it("starts a persisted workout for a complete profile", async () => {
    dbMocks.getUserProfile.mockResolvedValueOnce({
      primaryGoal: "strength",
      workoutDurationMinutes: 45,
      fitnessLevel: "beginner",
    });
    dbMocks.startDailyWorkout.mockResolvedValueOnce({ id: 12, exercises: [] });
    const caller = appRouter.createCaller(context());
    await expect(caller.workout.start()).resolves.toEqual({
      status: "started",
      workout: { id: 12, exercises: [] },
    });
    expect(dbMocks.startDailyWorkout).toHaveBeenCalledWith(
      42,
      expect.any(String),
      expect.objectContaining({
        goal: "strength",
        durationMinutes: 45,
        exercises: expect.any(Array),
      })
    );
  });

  it("passes the authenticated owner to set logging and completion", async () => {
    dbMocks.logWorkoutSet.mockResolvedValueOnce({ status: "logged" });
    dbMocks.completeDailyWorkout.mockResolvedValueOnce({
      status: "completed",
      workoutId: 9,
    });
    const caller = appRouter.createCaller(context());
    await expect(
      caller.workout.logSet({
        workoutId: 9,
        workoutExerciseId: 10,
        setNumber: 1,
        targetReps: "8",
        actualReps: 8,
      })
    ).resolves.toEqual({ status: "logged" });
    await expect(
      caller.workout.complete({ workoutId: 9, energy: 4, difficulty: 3 })
    ).resolves.toEqual({ status: "completed", workoutId: 9 });
    expect(dbMocks.logWorkoutSet).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ workoutId: 9 })
    );
    expect(dbMocks.completeDailyWorkout).toHaveBeenCalledWith(42, 9, {
      energy: 4,
      difficulty: 3,
    });
  });
});
