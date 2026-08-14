import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const serverSource = readFileSync(
  new URL("./_core/index.ts", import.meta.url),
  "utf8"
);

describe("tRPC API boundary", () => {
  it("keeps unknown API procedures in JSON instead of the HTML shell", () => {
    expect(serverSource).toContain('app.use("/api/trpc"');
    expect(serverSource).toContain("response.status(404).json");
    expect(serverSource).toContain('code: "NOT_FOUND"');
  });
});
