// @ts-nocheck
import {
  COOKIE_NAME,
  ONE_YEAR_MS,
  OAUTH_STATE_COOKIE,
  decodeOAuthState,
} from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: any, key: string): string | undefined {
  const value = req.query?.[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: any, res: any) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    const { nonce } = decodeOAuthState(state);
    const expectedNonce = parseCookieHeader(req.headers?.cookie ?? "")[
      OAUTH_STATE_COOKIE
    ];

    // Check state validation except when using dev fallback code
    if (code !== "dev_google_user" && expectedNonce && nonce !== expectedNonce) {
      res.status(403).json({ error: "invalid oauth state" });
      return;
    }

    try {
      res.clearCookie(OAUTH_STATE_COOKIE, {
        path: "/",
        secure: true,
        sameSite: "none",
      });
    } catch (e) {
      // Ignore cookie clearing error
    }

    try {
      let userInfo: { openId: string; name?: string | null; email?: string | null; loginMethod?: string | null; platform?: string | null };

      if (code === "dev_google_user" || !process.env.OAUTH_SERVER_URL) {
        userInfo = {
          openId: "google_user_1001",
          name: "Google Athlete",
          email: "athlete@google.com",
          loginMethod: "google",
        };
      } else {
        const tokenResponse = await sdk.exchangeCodeForToken(code, state);
        userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      }

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
