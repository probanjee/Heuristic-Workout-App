import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { createAdminSupabase, createSupabaseServer } from "./supabase";
import * as db from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    let supabaseUser: any = null;

    // 1. Check Authorization Bearer header first (primary for SPA / tRPC client)
    const authHeader = opts.req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7).trim();
      if (token) {
        const adminSupabase = createAdminSupabase();
        const { data, error } = await adminSupabase.auth.getUser(token);
        if (!error && data?.user) {
          supabaseUser = data.user;
        }
      }
    }

    // 2. Fallback to cookies if Bearer token was not present or valid
    if (!supabaseUser) {
      const supabase = createSupabaseServer(opts.req, opts.res);
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        supabaseUser = data.user;
      }
    }

    if (supabaseUser) {
      // Safe fallback user object populated directly from Supabase auth.users
      const fallbackUser: User = {
        id: 1,
        openId: supabaseUser.id,
        name:
          supabaseUser.user_metadata?.full_name ??
          supabaseUser.user_metadata?.name ??
          (supabaseUser.email ? supabaseUser.email.split("@")[0] : "Athlete"),
        email: supabaseUser.email ?? null,
        loginMethod: supabaseUser.app_metadata?.provider ?? "email",
        passwordHash: null,
        emailVerifiedAt: supabaseUser.email_confirmed_at
          ? new Date(supabaseUser.email_confirmed_at)
          : null,
        phoneNumber: supabaseUser.phone ?? null,
        phoneVerifiedAt: supabaseUser.phone_confirmed_at
          ? new Date(supabaseUser.phone_confirmed_at)
          : null,
        role: "user",
        createdAt: new Date(supabaseUser.created_at),
        updatedAt: new Date(supabaseUser.updated_at ?? supabaseUser.created_at),
        lastSignedIn: new Date(),
      };

      try {
        // Sync Supabase user to users table if database is available
        await db.upsertUser({
          openId: supabaseUser.id,
          name: fallbackUser.name,
          email: supabaseUser.email ?? null,
          loginMethod: fallbackUser.loginMethod,
          lastSignedIn: new Date(),
        });
        const dbUser = await db.getUserByOpenId(supabaseUser.id);
        user = dbUser ?? fallbackUser;
      } catch {
        // If database table is not available or sync fails, use authoritative Supabase user context
        user = fallbackUser;
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
