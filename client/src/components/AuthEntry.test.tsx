import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EmailVerificationStep } from "./AuthEntry";

describe("AuthEntry verification branches", () => {
  it("renders the email OTP verification step with resend action", () => {
    const html = renderToString(
      React.createElement(EmailVerificationStep, {
        email: "athlete@example.com",
        code: "",
        isSubmitting: false,
        onCodeChange: () => undefined,
        onVerify: async () => undefined,
        onResend: async () => undefined,
      })
    );

    expect(html).toContain("athlete@example.com");
    expect(html).toContain("Verify email and continue");
    expect(html).toContain("Resend code");
  });

  it("keeps phone signup on the phone OTP channel", async () => {
    const { verificationChannel } = await import("@/lib/authFlow");
    expect(verificationChannel("phone")).toBe("phone_otp");
  });
});
