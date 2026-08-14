import { describe, expect, it } from "vitest";
import {
  isValidEmail,
  isValidInternationalPhone,
  isValidOtp,
  isValidPassword,
} from "./authValidation";

describe("authentication validation", () => {
  it("accepts valid email and password input", () => {
    expect(isValidEmail("athlete@example.com")).toBe(true);
    expect(isValidPassword("strongpass")).toBe(true);
  });

  it("rejects malformed email and short passwords", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidPassword("short")).toBe(false);
  });

  it("requires international phone format and exactly six OTP digits", () => {
    expect(isValidInternationalPhone("+14155552671")).toBe(true);
    expect(isValidInternationalPhone("4155552671")).toBe(false);
    expect(isValidOtp("123456")).toBe(true);
    expect(isValidOtp("12345")).toBe(false);
    expect(isValidOtp("12345a")).toBe(false);
  });
});
