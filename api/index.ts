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

app.use((_request, response, next) => {
  try {
    applySecurityHeaders(response);
  } catch (e) {
    console.error("[Security Headers Error]", e);
  }
  next();
});

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

// URL Normalization Middleware for Vercel Serverless Functions
app.use((req, _res, next) => {
  if (req.url.startsWith("/api/")) {
    req.url = req.url.slice(4);
  }
  next();
});

registerStorageProxy(app);
registerOAuthRoutes(app);

app.post("/scheduled/reminders", handleReminderCallback);
app.post("/scheduled/streak-alerts", handleStreakAlertCallback);
app.post("/api/scheduled/reminders", handleReminderCallback);
app.post("/api/scheduled/streak-alerts", handleStreakAlertCallback);

const trpcMiddleware = createExpressMiddleware({
  router: appRouter,
  createContext,
});

app.use("/trpc", trpcMiddleware);
app.use("/api/trpc", trpcMiddleware);

// Catch-all health check / API status
app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "Adaptive Fitness Platform API" });
});

// Global Error Handler middleware to prevent serverless function crash
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[Vercel API Error Handler]", err);
  res.status(500).json({ error: { message: err?.message || "Internal Server Error" } });
});

export default function handler(req: any, res: any) {
  return app(req, res);
}
