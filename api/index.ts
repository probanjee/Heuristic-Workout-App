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

registerStorageProxy(app);
registerOAuthRoutes(app);

app.post("/api/scheduled/reminders", handleReminderCallback);
app.post("/api/scheduled/streak-alerts", handleStreakAlertCallback);

const trpcMiddleware = createExpressMiddleware({
  router: appRouter,
  createContext,
});

app.use("/api/trpc", trpcMiddleware);
app.use("/trpc", trpcMiddleware);

// Global Error Handler middleware to prevent serverless function crash
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[Vercel API Error Handler]", err);
  res.status(500).json({ error: { message: err?.message || "Internal Server Error" } });
});

export default app;
