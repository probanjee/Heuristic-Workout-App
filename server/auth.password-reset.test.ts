import { describe, expect, it } from "vitest";
import { authEmail } from "./auth/router";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: undefined,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("password reset auth contracts", () => {
  it("rejects malformed reset codes and weak replacement passwords", async () => {
    const caller = authEmail(async () => ({ success: true })).createCaller(
      createContext()
    );

    await expect(
      caller.resetPassword({
        email: "athlete@example.com",
        code: "123",
        password: "weak",
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects malformed reset-request email input", async () => {
    const caller = authEmail(async () => ({ success: true })).createCaller(
      createContext()
    );

    await expect(
      caller.requestPasswordReset({ email: "not-an-email" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
