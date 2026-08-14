import { ENV } from "../_core/env";

export type OtpMessage = { to: string; code: string; expiresInMinutes: number };
export type EmailMessage = { to: string; subject: string; html: string };

export interface OtpProvider {
  send(message: OtpMessage): Promise<{ providerMessageId: string }>;
}

export interface EmailProvider {
  send(message: EmailMessage): Promise<{ providerMessageId: string }>;
}

class MockOtpProvider implements OtpProvider {
  async send(message: OtpMessage) {
    if (!ENV.isProduction) {
      console.info(
        `[Auth Mock OTP] Delivery requested for ${message.to}; verification remains server-side.`
      );
    }
    return { providerMessageId: `mock_otp_${Date.now()}` };
  }
}

class MockEmailProvider implements EmailProvider {
  async send(message: EmailMessage) {
    if (!ENV.isProduction) {
      console.info(
        `[Auth Mock Email] Delivery requested for ${message.to}: ${message.subject}`
      );
    }
    return { providerMessageId: `mock_email_${Date.now()}` };
  }
}

class TwilioOtpProvider implements OtpProvider {
  async send(message: OtpMessage) {
    const body = new URLSearchParams({
      To: message.to,
      From: ENV.twilioPhoneNumber,
      Body: `Your Adaptive Fitness verification code is ${message.code}. It expires in ${message.expiresInMinutes} minutes.`,
    });
    const credentials = Buffer.from(
      `${ENV.twilioAccountSid}:${ENV.twilioAuthToken}`
    ).toString("base64");
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${ENV.twilioAccountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      }
    );
    if (!response.ok) {
      let providerCode: number | undefined;
      try {
        const details = (await response.json()) as { code?: number | string };
        providerCode =
          details.code === undefined ? undefined : Number(details.code);
      } catch {
        // Keep provider response bodies out of application errors and logs.
      }
      if (providerCode === 21211 || providerCode === 21614) {
        throw new Error(
          "This phone number is not reachable by SMS. Use a valid mobile number with its country code."
        );
      }
      if (providerCode === 21606 || providerCode === 21212) {
        throw new Error(
          "SMS delivery is not available from the configured sender. Please contact support."
        );
      }
      if (providerCode === 21608) {
        throw new Error(
          "This destination is not verified for the current SMS account. Verify it in Twilio or use a production sender."
        );
      }
      if (providerCode === 21610) {
        throw new Error(
          "This number has opted out of SMS messages. Use a different mobile number."
        );
      }
      if (providerCode === 30006) {
        throw new Error(
          "This number cannot receive text messages. Use a mobile number with its country code."
        );
      }
      if (providerCode === 30007) {
        throw new Error(
          "The carrier blocked this message. Check the number and try again later."
        );
      }
      if (providerCode === 21408 || providerCode === 20003) {
        throw new Error(
          "SMS service configuration needs attention. Please contact support."
        );
      }
      throw new Error(
        "SMS service rejected the request. Check the number in international format and try again."
      );
    }
    const result = (await response.json()) as { sid: string };
    return { providerMessageId: result.sid };
  }
}

class ResendEmailProvider implements EmailProvider {
  async send(message: EmailMessage) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ENV.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: ENV.resendFromEmail,
        to: [message.to],
        subject: message.subject,
        html: message.html,
      }),
    });
    if (!response.ok)
      throw new Error(`Resend delivery failed with status ${response.status}`);
    const result = (await response.json()) as { id: string };
    return { providerMessageId: result.id };
  }
}

export function getOtpProvider(): OtpProvider {
  const configured =
    ENV.authMode === "production" &&
    ENV.authOtpMode === "production" &&
    ENV.twilioAccountSid &&
    ENV.twilioAuthToken &&
    ENV.twilioPhoneNumber;
  if (configured) return new TwilioOtpProvider();
  if (ENV.isProduction && ENV.authOtpMode === "production")
    throw new Error(
      "Twilio credentials are required for production phone verification"
    );
  return new MockOtpProvider();
}

export function getEmailProvider(): EmailProvider {
  const configured =
    ENV.authMode === "production" &&
    ENV.authEmailMode === "production" &&
    ENV.resendApiKey &&
    ENV.resendFromEmail;
  if (configured) return new ResendEmailProvider();
  if (ENV.isProduction && ENV.authEmailMode === "production")
    throw new Error(
      "Resend credentials are required for production email delivery"
    );
  return new MockEmailProvider();
}
