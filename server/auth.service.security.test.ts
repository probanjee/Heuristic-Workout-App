import { describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  consumeAuthChallenge: vi.fn(),
  createAuthChallenge: vi.fn(),
  createLocalUser: vi.fn(),
  getLatestActiveChallenge: vi.fn(),
  getUserByEmail: vi.fn(),
  getUserByPhone: vi.fn(),
  incrementAuthChallengeAttempts: vi.fn(),
  markUserPhoneVerified: vi.fn(),
  updateUserPassword: vi.fn(),
  upsertUserProfile: vi.fn(),
}));

const providers = vi.hoisted(() => ({
  getEmailProvider: vi.fn(() => ({
    send: vi.fn().mockResolvedValue({ providerMessageId: "email" }),
  })),
  getOtpProvider: vi.fn(() => ({
    send: vi.fn().mockResolvedValue({ providerMessageId: "otp" }),
  })),
}));

vi.mock("./db", () => db);
vi.mock("./auth/providers", () => providers);

import {
  requestPhoneOtp,
  verifyEmailCode,
  verifyPhoneOtp,
} from "./auth/service";

describe("authentication challenge security", () => {
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
