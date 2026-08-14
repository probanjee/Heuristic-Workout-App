import { describe, expect, it } from "vitest";
import { getManagedOAuthRedirectUri } from "../const";

describe("managed OAuth redirect", () => {
  it("uses the hosted managed callback path", () => {
    expect(getManagedOAuthRedirectUri("https://preview.example.com")).toBe(
      "https://preview.example.com/api/oauth/callback"
    );
  });

  it("does not use the Google Cloud localhost callback", () => {
    expect(getManagedOAuthRedirectUri("https://preview.example.com")).not.toBe(
      "https://localhost:8000/auth/google/callback"
    );
  });
});

