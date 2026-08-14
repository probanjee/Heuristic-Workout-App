import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";

const { authenticateRequest } = vi.hoisted(() => ({
  authenticateRequest: vi.fn(),
}));

vi.mock("./_core/sdk", () => ({
  sdk: { authenticateRequest },
}));

import {
  handleStreakAlertCallback,
  streakAlertCallbackDisabledResponse,
} from "./scheduled/streaks";

function responseMock() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response & {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };
}

function requestMock(body: unknown = {}) {
  return {
    body,
    originalUrl: "/api/scheduled/streak-alerts",
  } as unknown as Request;
}

describe("disabled streak-alert callback", () => {
  beforeEach(() => {
    authenticateRequest.mockReset();
  });

  it("rejects non-cron callers before processing consistency data", async () => {
    authenticateRequest.mockResolvedValue({ isCron: false, taskUid: null });
    const response = responseMock();

    await handleStreakAlertCallback(requestMock({ streakDays: 14 }), response);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(response.json).toHaveBeenCalledWith({ error: "cron-only" });
  });

  it("returns a stable inactive response with normalized consistency context", async () => {
    authenticateRequest.mockResolvedValue({
      isCron: true,
      taskUid: "task-streaks",
    });
    const response = responseMock();

    await handleStreakAlertCallback(
      requestMock({ streakDays: 7, consistencySource: "progress_metrics" }),
      response
    );

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      ...streakAlertCallbackDisabledResponse,
      taskUid: "task-streaks",
      streakDays: 7,
      consistencySource: "progress_metrics",
    });
  });

  it("does not activate scheduling or perform notification work", async () => {
    authenticateRequest.mockResolvedValue({
      isCron: true,
      taskUid: "task-streaks",
    });
    const response = responseMock();

    await handleStreakAlertCallback(requestMock({ streakDays: -5 }), response);

    const payload = response.json.mock.calls[0]?.[0];
    expect(payload).toMatchObject({
      scheduled: false,
      activation: "deployment_required",
      skipped: "streak_alert_callback_disabled",
      streakDays: 0,
    });
    expect(payload).not.toHaveProperty("notificationId");
  });
});
