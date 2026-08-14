// @ts-nocheck
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { registerStorageProxy } from "../server/_core/storageProxy";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { applySecurityHeaders } from "../server/security";
import { handleReminderCallback } from "../server/scheduled/reminders";
import { handleStreakAlertCallback } from "../server/scheduled/streaks";

const app = express();
app.disable("x-powered-by");

app.use((_req: any, res: any, next: any) => {
  try {
    applySecurityHeaders(res);
  } catch (e) {
    // Ignore security header error in serverless environment
  }
  next();
});

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

// Normalize incoming API URL paths on Vercel
app.use((req: any, _res: any, next: any) => {
  if (req.url.startsWith("/api/")) {
    req.url = req.url.slice(4);
  } else if (req.url === "/api") {
    req.url = "/";
  }
  next();
});

try {
  registerStorageProxy(app);
  registerOAuthRoutes(app);
} catch (e) {
  console.error("[Route Registration Warning]", e);
}

app.post("/scheduled/reminders", handleReminderCallback);
app.post("/scheduled/streak-alerts", handleStreakAlertCallback);

const trpcMiddleware = createExpressMiddleware({
  router: appRouter,
  createContext,
});

app.use("/trpc", trpcMiddleware);
app.use("/api/trpc", trpcMiddleware);

app.get("/", (_req: any, res: any) => {
  res.json({ status: "ok", message: "Adaptive Fitness Platform API" });
});

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("[Vercel API Error]", err);
  res.status(500).json({ error: { message: err?.message || "Server Error" } });
});

export default function handler(req: any, res: any) {
  return app(req, res);
}
