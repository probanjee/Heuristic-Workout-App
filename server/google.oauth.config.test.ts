import { describe, expect, it } from "vitest";

describe("Google OAuth configuration", () => {
  it("has securely injected credentials and a valid redirect URI", () => {
    expect(process.env.GOOGLE_CLIENT_ID).toBeTruthy();
    expect(process.env.GOOGLE_CLIENT_SECRET).toBeTruthy();

    const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;
    expect(redirectUri).toBe("https://localhost:8000/auth/google/callback");
    expect(() => new URL(redirectUri!)).not.toThrow();
    const redirect = new URL(redirectUri!);
    expect(["http:", "https:"]).toContain(redirect.protocol);
    if (redirect.hostname !== "localhost" && redirect.hostname !== "127.0.0.1") {
      expect(redirect.protocol).toBe("https:");
    }
  });
});

