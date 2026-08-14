import { describe, expect, it } from "vitest";
import { verificationChannel, verificationCopy } from "./authFlow";

describe("signup verification delivery", () => {
  it("routes email signup through email OTP verification", () => {
    expect(verificationChannel("email")).toBe("email_otp");
    expect(verificationCopy("email")).toContain("email address");
  });

  it("routes phone signup through phone OTP verification", () => {
    expect(verificationChannel("phone")).toBe("phone_otp");
    expect(verificationCopy("phone")).toContain("mobile number");
  });
});
