import { beforeEach, describe, expect, it, vi } from "vitest";

import crypto from "node:crypto";

const db = vi.hoisted(() => ({
  consumeAuthChallenge: vi.fn(),
  createAuthChallenge: vi.fn(),
  createLocalUser: vi.fn(),
  getLatestActiveChallenge: vi.fn(),
  getUserByEmail: vi.fn(),
  getUserByPhone: vi.fn(),
  incrementAuthChallengeAttempts: vi.fn(),
  invalidateAuthChallenge: vi.fn(),
  markUserEmailVerified: vi.fn(),
  markUserPhoneVerified: vi.fn(),
  updateUserPassword: vi.fn(),
  upsertUserProfile: vi.fn(),
}));

const providers = vi.hoisted(() => {
  const otpSend = vi.fn().mockResolvedValue({ providerMessageId: "otp" });
  return {
    otpSend,
    getEmailProvider: vi.fn(() => ({
      send: vi.fn().mockResolvedValue({ providerMessageId: "email" }),
    })),
    getOtpProvider: vi.fn(() => ({ send: otpSend })),
  };
});

vi.mock("./db", () => db);
vi.mock("./auth/providers", () => providers);

import {
  requestPhoneOtp,
  verifyEmailCode,
  verifyPhoneOtp,
} from "./auth/service";

describe("authentication challenge security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.getUserByPhone.mockResolvedValue(undefined);
    db.createLocalUser.mockResolvedValue({ id: 42 });
    providers.otpSend.mockResolvedValue({ providerMessageId: "otp" });
  });

  it("rejects an expired phone challenge before user lookup", async () => {
    db.getLatestActiveChallenge.mockResolvedValueOnce(undefined);

    await expect(verifyPhoneOtp("+14155552671", "123456")).rejects.toThrow(
      "invalid or expired"
    );
    expect(db.getUserByPhone).not.toHaveBeenCalled();
  });

  it("rejects a phone challenge after the maximum attempts", async () => {
    db.getLatestActiveChallenge.mockResolvedValueOnce({
      id: 11,
      attemptCount: 5,
      challengeHash: "not-the-code",
    });

    await expect(verifyPhoneOtp("+14155552671", "123456")).rejects.toThrow(
      "invalid or expired"
    );
    expect(db.incrementAuthChallengeAttempts).not.toHaveBeenCalled();
  });

  it("rejects a phone number that is not in E.164 format", async () => {
    await expect(requestPhoneOtp("415-555-2671")).rejects.toThrow(
      "valid mobile number with the country code"
    );
    expect(db.getLatestActiveChallenge).not.toHaveBeenCalled();
    expect(db.createAuthChallenge).not.toHaveBeenCalled();
  });

  it("invalidates a challenge when OTP delivery is rejected", async () => {
    db.getLatestActiveChallenge
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ id: 21 });
    providers.otpSend.mockRejectedValueOnce(
      new Error("This phone number is not reachable by SMS")
    );

    await expect(requestPhoneOtp("+14155552671")).rejects.toThrow(
      "not reachable by SMS"
    );
    expect(db.invalidateAuthChallenge).toHaveBeenCalledWith(21);
  });

  it("blocks a resend inside the configured abuse window", async () => {
    db.getLatestActiveChallenge.mockResolvedValueOnce({
      id: 12,
      sentAt: new Date(),
      attemptCount: 0,
      challengeHash: "unused",
    });

    await expect(requestPhoneOtp("+14155552671")).rejects.toThrow(
      "wait before requesting"
    );
    expect(db.createAuthChallenge).not.toHaveBeenCalled();
    expect(providers.getOtpProvider).not.toHaveBeenCalled();
  });

  it("persists email verification before returning the user", async () => {
    const challengeHash = crypto
      .createHash("sha256")
      .update("123456")
      .digest("hex");
    const user = { id: 7, email: "athlete@example.com" };
    db.getLatestActiveChallenge.mockResolvedValueOnce({
      id: 14,
      attemptCount: 0,
      challengeHash,
    });
    db.getUserByEmail.mockResolvedValue(user);

    await expect(
      verifyEmailCode("athlete@example.com", "123456")
    ).resolves.toEqual(user);

    expect(db.consumeAuthChallenge).toHaveBeenCalledWith(14);
    expect(db.markUserEmailVerified).toHaveBeenCalledWith(7);
  });

  it("rejects an email verification challenge after the maximum attempts", async () => {
    db.getLatestActiveChallenge.mockResolvedValueOnce({
      id: 13,
      attemptCount: 5,
      challengeHash: "not-the-code",
    });

    await expect(
      verifyEmailCode("athlete@example.com", "123456")
    ).rejects.toThrow("invalid or expired");
    expect(db.incrementAuthChallengeAttempts).not.toHaveBeenCalled();
  });
});
