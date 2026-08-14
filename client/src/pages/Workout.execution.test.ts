import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./Workout.tsx", import.meta.url), "utf8");

describe("workout execution experience contract", () => {
  it("includes a live session timer and completion progress visualization", () => {
    expect(source).toContain("sessionStartedAt");
    expect(source).toContain("elapsedSeconds");
    expect(source).toContain("formattedElapsed");
    expect(source).toContain("Session progress");
    expect(source).toContain("completionPercent");
    expect(source).toContain("Exercise complete");
    expect(source).toContain("timerPaused");
    expect(source).toContain("toggleTimer");
    expect(source).toContain("Resume timer");
    expect(source).toContain("adaptive-workout-timer:");
    expect(source).toContain("exercise-guide-motion-label");
    expect(source).toContain("exercise-guide-${movementPattern}");
    expect(source).toContain("lower · press");
    expect(source).toContain("tutorialMedia");
    expect(source).toContain("exercise demonstration");
    expect(source).toContain("onError={() => setMediaFailed(true)}");
  });

  it("uses practical session language instead of internal engine terminology", () => {
    expect(source).toContain("TODAY’S SESSION");
    expect(source).toContain("Start the session to begin the timer");
    expect(source).not.toContain("TODAY’S ADAPTIVE SESSION");
    expect(source).not.toContain("the engine can choose exercises");
  });
});
