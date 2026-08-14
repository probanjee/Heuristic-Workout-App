import "dotenv/config";
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
  applySecurityHeaders(response);
  next();
});

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

registerStorageProxy(app);
registerOAuthRoutes(app);

app.post("/api/scheduled/reminders", handleReminderCallback);
app.post("/api/scheduled/streak-alerts", handleStreakAlertCallback);

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.use("/api/trpc", (_request, response) => {
  response.status(404).json({
    error: { message: "Unknown tRPC procedure", code: "NOT_FOUND" },
  });
});

export default app;
