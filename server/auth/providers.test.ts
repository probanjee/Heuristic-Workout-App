import { describe, expect, it, vi } from "vitest";
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

  it("maps a Twilio invalid-destination 400 to safe actionable feedback", async () => {
    const originalMode = ENV.authMode;
    const originalOtpMode = ENV.authOtpMode;
    const originalProduction = ENV.isProduction;
    const originalSid = ENV.twilioAccountSid;
    const originalToken = ENV.twilioAuthToken;
    const originalPhone = ENV.twilioPhoneNumber;
    ENV.authMode = "production";
    ENV.authOtpMode = "production";
    ENV.isProduction = true;
    ENV.twilioAccountSid = "ACtest";
    ENV.twilioAuthToken = "token";
    ENV.twilioPhoneNumber = "+14155552671";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ code: 21211 }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      )
    );

    await expect(
      getOtpProvider().send({
        to: "+19995550123",
        code: "123456",
        expiresInMinutes: 10,
      })
    ).rejects.toThrow("not reachable by SMS");

    vi.unstubAllGlobals();
    ENV.authMode = originalMode;
    ENV.authOtpMode = originalOtpMode;
    ENV.isProduction = originalProduction;
    ENV.twilioAccountSid = originalSid;
    ENV.twilioAuthToken = originalToken;
    ENV.twilioPhoneNumber = originalPhone;
  });

  it("maps a Twilio trial-account destination rejection to verification guidance", async () => {
    const originalMode = ENV.authMode;
    const originalOtpMode = ENV.authOtpMode;
    const originalProduction = ENV.isProduction;
    const originalSid = ENV.twilioAccountSid;
    const originalToken = ENV.twilioAuthToken;
    const originalPhone = ENV.twilioPhoneNumber;
    ENV.authMode = "production";
    ENV.authOtpMode = "production";
    ENV.isProduction = true;
    ENV.twilioAccountSid = "ACtest";
    ENV.twilioAuthToken = "token";
    ENV.twilioPhoneNumber = "+14155552671";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ code: 21608 }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      )
    );

    await expect(
      getOtpProvider().send({
        to: "+19995550123",
        code: "123456",
        expiresInMinutes: 10,
      })
    ).rejects.toThrow("not verified for the current SMS account");

    vi.unstubAllGlobals();
    ENV.authMode = originalMode;
    ENV.authOtpMode = originalOtpMode;
    ENV.isProduction = originalProduction;
    ENV.twilioAccountSid = originalSid;
    ENV.twilioAuthToken = originalToken;
    ENV.twilioPhoneNumber = originalPhone;
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
