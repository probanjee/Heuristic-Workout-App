import type { Express, Request, Response } from "express";
import { createSupabaseServer } from "./supabase";

/**
 * Supabase OAuth callback handler.
 * After a user completes an OAuth flow (e.g. Google), Supabase redirects to
 * /api/auth/callback with a `code` query parameter. We exchange it for a
 * session here, which sets the auth cookies on the response.
 */
export function registerOAuthRoutes(app: Express) {
  app.get("/api/auth/callback", async (req: Request, res: Response) => {
    const code = typeof req.query.code === "string" ? req.query.code : undefined;
    const next = typeof req.query.next === "string" ? req.query.next : "/";

    if (!code) {
      res.redirect(302, `/?error=missing_code`);
      return;
    }

    try {
      const supabase = createSupabaseServer(req, res);
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("[Supabase OAuth] Code exchange failed:", error.message);
        res.redirect(302, `/?error=auth_failed`);
        return;
      }

      // Session cookies are automatically set by the Supabase server client.
      res.redirect(302, next);
    } catch (error) {
      console.error("[Supabase OAuth] Callback failed:", error);
      res.redirect(302, `/?error=callback_failed`);
    }
  });
}
