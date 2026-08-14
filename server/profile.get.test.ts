import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const { getUserProfile, upsertUserProfile } = vi.hoisted(() => ({
  getUserProfile: vi.fn(),
  upsertUserProfile: vi.fn(),
}));

vi.mock("./db", () => ({ getUserProfile, upsertUserProfile }));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 42,
    openId: "profile-test-user",
    email: "profile@example.com",
    name: "Profile Test",
    loginMethod: "test",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("profile.get", () => {
  beforeEach(() => {
    getUserProfile.mockReset();
    upsertUserProfile.mockReset();
  });

  it("returns null instead of undefined for a new authenticated user", async () => {
    getUserProfile.mockResolvedValue(null);
    const result = await appRouter.createCaller(createContext()).profile.get();
    expect(result).toBeNull();
    expect(getUserProfile).toHaveBeenCalledWith(42);
  });

  it("rejects onboarding steps outside the eight-stage flow", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(
      caller.profile.save({ onboardingStep: 9, onboardingCompleted: false })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
