import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import AuthEntry from "./AuthEntry";

describe("AuthEntry rendering and validation", () => {
  it("renders the sign in entry interface with email and password fields", () => {
    const html = renderToString(React.createElement(AuthEntry));
    expect(html).toContain("Sign in to your workspace");
    expect(html).toContain("Sign in with email");
    expect(html).toContain("Continue with Google");
  });

  it("keeps phone signup on the phone OTP channel", async () => {
    const { verificationChannel } = await import("@/lib/authFlow");
    expect(verificationChannel("phone")).toBe("phone_otp");
  });
});
