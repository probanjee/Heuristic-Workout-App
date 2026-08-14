import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { createSupabaseServer } from "./supabase";
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
    const supabase = createSupabaseServer(opts.req, opts.res);
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();

    if (supabaseUser) {
      // Sync Supabase user to MySQL users table
      await db.upsertUser({
        openId: supabaseUser.id,
        name: supabaseUser.user_metadata?.full_name ?? supabaseUser.user_metadata?.name ?? null,
        email: supabaseUser.email ?? null,
        loginMethod: supabaseUser.app_metadata?.provider ?? "supabase",
        lastSignedIn: new Date(),
      });
      user = (await db.getUserByOpenId(supabaseUser.id)) ?? null;
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
