import { describe, expect, it } from "vitest";

const requiredKeys = [
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_PHONE_NUMBER",
] as const;

describe("Twilio-only provider credentials", () => {
  it("are configured and accepted by the read-only Twilio account endpoint while email stays mock", async () => {
    for (const key of requiredKeys) {
      expect(process.env[key], `${key} must be configured`).toBeTruthy();
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID!;
    const authToken = process.env.TWILIO_AUTH_TOKEN!;
    let twilioResponse: Response;
    try {
      twilioResponse = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}.json`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
          },
        }
      );
    } catch (error) {
      if (error instanceof TypeError) {
        console.warn("Twilio read-only validation unavailable due to network connectivity");
        expect(process.env.AUTH_EMAIL_MODE).toBe("mock");
        return;
      }
      throw error;
    }
    expect(
      twilioResponse.ok,
      `Twilio validation failed with HTTP ${twilioResponse.status}`
    ).toBe(true);

    expect(process.env.AUTH_EMAIL_MODE).toBe("mock");
  }, 30_000);
});
