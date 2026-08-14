import { describe, expect, it } from "vitest";
import { getEmailProvider, getOtpProvider } from "./auth/providers";

describe("Twilio-only production authentication mode", () => {
  it.runIf(process.env.TWILIO_ACCOUNT_SID)("uses live OTP mode, mock email mode, and accepts the Twilio account credentials", async () => {
    expect(process.env.AUTH_MODE).toBe("production");
    expect(process.env.AUTH_OTP_MODE).toBe("production");
    expect(process.env.AUTH_EMAIL_MODE).toBe("mock");
    expect(getOtpProvider().constructor.name).toBe("TwilioOtpProvider");
    expect(getEmailProvider().constructor.name).toBe("MockEmailProvider");

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    expect(accountSid).toBeTruthy();
    expect(authToken).toBeTruthy();

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid!)}.json`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        },
      }
    );

    expect(
      response.ok,
      `Twilio validation failed with HTTP ${response.status}`
    ).toBe(true);
  }, 30_000);
});
