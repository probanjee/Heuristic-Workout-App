import { describe, expect, it } from "vitest";
import { calculateWorkoutProgress } from "./db";

describe("calculateWorkoutProgress", () => {
  it("summarizes completed training and current streak", () => {
    const result = calculateWorkoutProgress(
      [
        {
          workoutDate: "2026-08-13",
          durationMinutes: 30,
          status: "completed",
          energy: 4,
          difficulty: 3,
        },
        {
          workoutDate: "2026-08-12",
          durationMinutes: 45,
          status: "completed",
          energy: 5,
          difficulty: 4,
        },
        {
          workoutDate: "2026-08-11",
          durationMinutes: 30,
          status: "planned",
          energy: null,
          difficulty: null,
        },
      ],
      new Date("2026-08-13T12:00:00.000Z")
    );
    expect(result.completedSessions).toBe(2);
    expect(result.completionRate).toBe(67);
    expect(result.totalMinutes).toBe(75);
    expect(result.currentStreak).toBe(2);
    expect(result.averageEnergy).toBe(4.5);
  });

  it("returns an empty baseline without fabricating sessions", () => {
    const result = calculateWorkoutProgress(
      [],
      new Date("2026-08-13T12:00:00.000Z")
    );
    expect(result.totalSessions).toBe(0);
    expect(result.completedSessions).toBe(0);
    expect(result.completionRate).toBe(0);
    expect(result.currentStreak).toBe(0);
    expect(result.trend.every(day => day.completed === 0)).toBe(true);
  });
});
