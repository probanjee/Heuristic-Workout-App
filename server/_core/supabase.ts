import { createClient } from "@supabase/supabase-js";
import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";
import type { Request, Response } from "express";
import { ENV } from "./env";

/**
 * Admin Supabase client (service role key).
 * Use for server-side operations like user lookup, NOT for user-scoped queries.
 */
export function createAdminSupabase() {
  if (!ENV.supabaseUrl || !ENV.supabaseServiceRoleKey) {
    console.warn("[Supabase] Admin client: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured");
  }
  return createClient(ENV.supabaseUrl, ENV.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Create a Supabase client bound to the Express request/response.
 * Reads auth cookies from the request and writes updated cookies to the response.
 */
export function createSupabaseServer(req: Request, res: Response) {
  return createServerClient(ENV.supabaseUrl, ENV.supabaseAnonKey, {
    cookies: {
      getAll() {
        return parseCookieHeader(req.headers.cookie ?? "");
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          res.append(
            "Set-Cookie",
            serializeCookieHeader(name, value, options)
          );
        });
      },
    },
  });
}
