import { describe, expect, it } from "vitest";
import { ENV } from "../_core/env";
import { getEmailProvider, getOtpProvider } from "./providers";

describe("authentication provider safety", () => {
  it("does not expose OTP contents from the development adapter", async () => {
    const originalMode = ENV.authMode;
    const originalProduction = ENV.isProduction;
    ENV.authMode = "mock";
    ENV.isProduction = false;

    const result = await getOtpProvider().send({
      to: "+14155552671",
      code: "123456",
      expiresInMinutes: 10,
    });

    expect(result.providerMessageId).toMatch(/^mock_otp_/);
    expect(result.providerMessageId).not.toContain("123456");
    ENV.authMode = originalMode;
    ENV.isProduction = originalProduction;
  });

  it("does not expose email content from the development adapter", async () => {
    const originalMode = ENV.authMode;
    const originalProduction = ENV.isProduction;
    ENV.authMode = "mock";
    ENV.isProduction = false;

    const result = await getEmailProvider().send({
      to: "athlete@example.com",
      subject: "Verify account",
      html: "secret verification code",
    });

    expect(result.providerMessageId).toMatch(/^mock_email_/);
    expect(result.providerMessageId).not.toContain("secret");
    ENV.authMode = originalMode;
    ENV.isProduction = originalProduction;
  });
});
