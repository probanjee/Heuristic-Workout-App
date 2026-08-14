import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  upsertUserProfile: vi.fn(),
}));

vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return { ...actual, ...dbMocks };
});

import { appRouter, reminderPreferencesInput } from "./routers";

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

describe("reminder preference contract", () => {
  it("accepts an opted-in preferred time", () => {
    expect(
      reminderPreferencesInput.parse({
        enabled: true,
        preferredWorkoutTime: "07:30",
      })
    ).toEqual({ enabled: true, preferredWorkoutTime: "07:30" });
  });

  it("accepts disabling reminders without a preferred time", () => {
    expect(
      reminderPreferencesInput.parse({
        enabled: false,
        preferredWorkoutTime: null,
      })
    ).toEqual({ enabled: false, preferredWorkoutTime: null });
  });

  it("rejects malformed 24-hour times", () => {
    expect(() =>
      reminderPreferencesInput.parse({
        enabled: true,
        preferredWorkoutTime: "7:30 PM",
      })
    ).toThrow();
  });

  it("persists only the authenticated user's opt-in preferences and does not schedule", async () => {
    const profile = {
      userId: 42,
      reminderEnabled: 1,
      preferredWorkoutTime: "07:30",
    };
    dbMocks.upsertUserProfile.mockResolvedValueOnce(profile);
    const caller = appRouter.createCaller(context());

    await expect(
      caller.reminders.preferences({
        enabled: true,
        preferredWorkoutTime: "07:30",
      })
    ).resolves.toEqual({
      profile,
      activation: "deployment_required",
      scheduled: false,
    });
    expect(dbMocks.upsertUserProfile).toHaveBeenCalledWith(42, {
      reminderEnabled: 1,
      preferredWorkoutTime: "07:30",
      onboardingStep: 8,
    });
  });
});
