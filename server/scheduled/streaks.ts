import { sdk } from "../_core/sdk";

export const streakAlertCallbackDisabledResponse = {
  ok: true,
  scheduled: false,
  activation: "deployment_required" as const,
  skipped: "streak_alert_callback_disabled",
};

export async function handleStreakAlertCallback(
  request: any,
  response: any
): Promise<void> {
  try {
    const user = await sdk.authenticateRequest(request);
    if (!user.isCron || !user.taskUid) {
      response.status(403).json({ error: "cron-only" });
      return;
    }

    const streakDays = Number(request.body?.streakDays ?? 0);
    const consistencySource =
      request.body?.consistencySource ?? "server_consistency_metrics";

    response.status(200).json({
      ...streakAlertCallbackDisabledResponse,
      taskUid: user.taskUid,
      streakDays:
        Number.isFinite(streakDays) && streakDays >= 0 ? streakDays : 0,
      consistencySource,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    response.status(500).json({
      error: message,
      context: {
        url: request.originalUrl,
        taskUid: null,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
