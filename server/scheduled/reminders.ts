import { sdk } from "../_core/sdk";

export const reminderCallbackDisabledResponse = {
  ok: true,
  scheduled: false,
  activation: "deployment_required" as const,
  skipped: "reminder_callback_disabled",
};

export async function handleReminderCallback(
  request: any,
  response: any
): Promise<void> {
  try {
    const user = await sdk.authenticateRequest(request);
    if (!user.isCron || !user.taskUid) {
      response.status(403).json({ error: "cron-only" });
      return;
    }

    response.status(200).json({
      ...reminderCallbackDisabledResponse,
      taskUid: user.taskUid,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    response.status(500).json({
      error: message,
      context: {
        url: request.originalUrl,
        taskUid: null,
      },
    });
  }
}
