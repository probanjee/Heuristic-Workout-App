import { describe, expect, it } from "vitest";
import { reminderCallbackDisabledResponse } from "./reminders";

describe("final scheduled-work boundary", () => {
  it("keeps reminder activation disabled until deployment", () => {
    expect(reminderCallbackDisabledResponse).toEqual({
      ok: true,
      scheduled: false,
      activation: "deployment_required",
      skipped: "reminder_callback_disabled",
    });
    expect("createHeartbeatJob" in reminderCallbackDisabledResponse).toBe(
      false
    );
  });
});
