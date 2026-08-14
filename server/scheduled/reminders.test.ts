import { describe, expect, it, vi } from "vitest";

const sdkMocks = vi.hoisted(() => ({
  authenticateRequest: vi.fn(),
}));

vi.mock("../_core/sdk", () => ({ sdk: sdkMocks }));

import { handleReminderCallback } from "./reminders";

function response() {
  const result = {
    statusCode: 200,
    body: undefined as unknown,
    status: vi.fn(function (this: typeof result, code: number) {
      this.statusCode = code;
      return this;
    }),
    json: vi.fn(function (this: typeof result, body: unknown) {
      this.body = body;
      return this;
    }),
  };
  return result;
}

describe("scheduled reminder callback boundary", () => {
  it("rejects non-cron callers", async () => {
    sdkMocks.authenticateRequest.mockResolvedValueOnce({ isCron: false });
    const res = response();

    await handleReminderCallback(
      { originalUrl: "/api/scheduled/reminders" } as never,
      res as never
    );

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "cron-only" });
  });

  it("returns an idempotent disabled response for an authenticated cron task", async () => {
    sdkMocks.authenticateRequest.mockResolvedValueOnce({
      isCron: true,
      taskUid: "task_123",
    });
    const res = response();

    await handleReminderCallback(
      { originalUrl: "/api/scheduled/reminders" } as never,
      res as never
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      ok: true,
      scheduled: false,
      activation: "deployment_required",
      skipped: "reminder_callback_disabled",
      taskUid: "task_123",
    });
  });

  it("serializes callback failures as JSON 500 responses", async () => {
    sdkMocks.authenticateRequest.mockRejectedValueOnce(
      new Error("auth unavailable")
    );
    const res = response();

    await handleReminderCallback(
      { originalUrl: "/api/scheduled/reminders" } as never,
      res as never
    );

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual(
      expect.objectContaining({
        error: "auth unavailable",
        context: { url: "/api/scheduled/reminders", taskUid: null },
      })
    );
  });
});
