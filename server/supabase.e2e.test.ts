import "dotenv/config";
import { describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { ENV } from "./_core/env";

describe("Supabase Auth End-to-End Test Matrix", () => {
  const url = ENV.supabaseUrl;
  const anonKey = ENV.supabaseAnonKey;
  const serviceKey = ENV.supabaseServiceRoleKey;

  const client = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const testEmail = `test_athlete_${Date.now()}@supabaseauthfitness.com`;
  const testPassword = "ValidPassword123!Secure";
  let createdUserId: string | null = null;

  it("Test A: Creates new user account in Supabase Auth", async () => {
    const { data, error } = await admin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { full_name: "Test Athlete" },
    });

    expect(error).toBeNull();
    expect(data?.user).toBeTruthy();
    expect(data?.user?.email).toBe(testEmail);
    expect(data?.user?.user_metadata?.full_name).toBe("Test Athlete");
    createdUserId = data.user.id;
  });

  it("Test B: Signs in existing user with correct email and password", async () => {
    const { data, error } = await client.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    expect(error).toBeNull();
    expect(data.session).toBeTruthy();
    expect(data.user).toBeTruthy();
    expect(data.user?.id).toBe(createdUserId);
    expect(data.session?.access_token).toBeTruthy();
  });

  it("Test C: Rejects login with incorrect password and returns invalid_credentials", async () => {
    const { data, error } = await client.auth.signInWithPassword({
      email: testEmail,
      password: "WrongPassword999!",
    });

    expect(data.session).toBeNull();
    expect(error).toBeTruthy();
    expect(error?.code).toBe("invalid_credentials");
    expect(error?.message).toBe("Invalid login credentials");
  });

  it("Test D: Rejects login with unknown/unregistered email", async () => {
    const { data, error } = await client.auth.signInWithPassword({
      email: `unknown_${Date.now()}@unregisteredtest.com`,
      password: "AnyPassword123!",
    });

    expect(data.session).toBeNull();
    expect(error).toBeTruthy();
    expect(error?.code).toBe("invalid_credentials");
    expect(error?.message).toBe("Invalid login credentials");
  });

  it("Test E: Session verification via Supabase access token", async () => {
    // 1. Sign in to get access token
    const { data: signInData } = await client.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    const token = signInData.session!.access_token;
    expect(token).toBeTruthy();

    // 2. Validate token
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    expect(userError).toBeNull();
    expect(userData.user?.id).toBe(createdUserId);
    expect(userData.user?.email).toBe(testEmail);
  });

  it("Test F: Cleans up test user and verifies deletion", async () => {
    if (createdUserId) {
      const { error } = await admin.auth.admin.deleteUser(createdUserId);
      expect(error).toBeNull();
    }
  });
});
