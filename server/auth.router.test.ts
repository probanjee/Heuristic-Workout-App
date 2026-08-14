import { describe, expect, it, vi } from "vitest";
import { authEmail, authPhone } from "./auth/router";
import type { TrpcContext } from "./_core/context";

const service = vi.hoisted(() => ({
  requestEmailVerification: vi.fn().mockResolvedValue(undefined),
  requestPasswordReset: vi.fn().mockResolvedValue(undefined),
  requestPhoneOtp: vi.fn().mockResolvedValue({ userId: 7 }),
  resetPassword: vi.fn().mockResolvedValue(undefined),
  signInWithEmail: vi
    .fn()
    .mockResolvedValue({ openId: "local_1", name: "Athlete" }),
  signUpWithEmail: vi.fn().mockResolvedValue(undefined),
  verifyEmailCode: vi
    .fn()
    .mockResolvedValue({ openId: "local_1", name: "Athlete" }),
  verifyPhoneOtp: vi
    .fn()
    .mockResolvedValue({ openId: "local_2", name: "Athlete" }),
}));

vi.mock("./auth/service", () => service);

function createContext(): TrpcContext {
  return {
    user: undefined,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("authentication router contracts", () => {
  it("signs in with email and invokes compatible session issuance", async () => {
    const setSessionCookie = vi.fn().mockResolvedValue({ success: true });
    const caller = authEmail(setSessionCookie).createCaller(createContext());

    await expect(
      caller.signIn({ email: "athlete@example.com", password: "password123" })
    ).resolves.toEqual({ success: true });
    expect(setSessionCookie).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ openId: "local_1" })
    );
  });

  it("verifies email code and invokes session issuance", async () => {
    const setSessionCookie = vi.fn().mockResolvedValue({ success: true });
    const caller = authEmail(setSessionCookie).createCaller(createContext());

    await expect(
      caller.verify({ email: "athlete@example.com", code: "123456" })
    ).resolves.toEqual({ success: true });
    expect(service.verifyEmailCode).toHaveBeenCalledWith(
      "athlete@example.com",
      "123456"
    );
    expect(setSessionCookie).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ openId: "local_1" })
    );
  });

  it("resends email verification through the email provider boundary", async () => {
    const caller = authEmail(vi.fn()).createCaller(createContext());

    await expect(
      caller.resendVerification({ email: "athlete@example.com" })
    ).resolves.toEqual({ success: true });
    expect(service.requestEmailVerification).toHaveBeenCalledWith(
      "athlete@example.com"
    );
  });

  it("requests and verifies phone OTP through the phone branch", async () => {
    const setSessionCookie = vi.fn().mockResolvedValue({ success: true });
    const caller = authPhone(setSessionCookie).createCaller(createContext());

    await expect(caller.requestOtp({ phone: "+14155552671" })).resolves.toEqual(
      { success: true }
    );
    await expect(
      caller.verifyOtp({ phone: "+14155552671", code: "123456" })
    ).resolves.toEqual({ success: true });
    expect(setSessionCookie).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ openId: "local_2" })
    );
  });

  it("rejects insecure email and phone verification payloads before service calls", async () => {
    const caller = authEmail(vi.fn()).createCaller(createContext());
    await expect(
      caller.verify({ email: "not-an-email", code: "123" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });

    const phoneCaller = authPhone(vi.fn()).createCaller(createContext());
    await expect(
      phoneCaller.verifyOtp({ phone: "123", code: "abcdef" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(service.verifyEmailCode).not.toHaveBeenCalledWith(
      "not-an-email",
      "123"
    );
  });
});
