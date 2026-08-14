import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./Home.tsx", import.meta.url), "utf8");

describe("dashboard workout navigation contract", () => {
  it("keeps the primary start action routed to workout execution", () => {
    expect(source).toMatch(/<Link href=\"\/workout\">[\s\S]*Start workout/);
    expect(source).toMatch(
      /<Link href=\{isReady \? \"\/workout\" : \"\/onboarding\"\}>/
    );
  });
});

it("uses user-facing language and rotating motivation quotes", () => {
  expect(source).toContain("Your training today");
  expect(source).toContain("Preparing your plan");
  expect(source).toContain("See why this plan");
  expect(source).toContain("MOTIVATION_QUOTES");
  expect(source).toContain("focus:");
  expect(source).toContain("recovery:");
  expect(source).toContain("encouragement:");
  expect(source).toContain("quotePreference");
  expect(source).toContain("5000");
  expect(source).toContain('aria-live="polite"');
  expect(source).not.toContain("Adaptive performance system");
  expect(source).not.toContain("Explore the engine");
  expect(source).not.toContain("Engine status:");
});
