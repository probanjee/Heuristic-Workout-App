import { describe, expect, it } from "vitest";
import { SECURITY_HEADERS, applySecurityHeaders } from "./security";

describe("security header policy", () => {
  it("applies the baseline browser protections", () => {
    const headers = new Map<string, string>();
    applySecurityHeaders({
      setHeader(name, value) {
        headers.set(name, String(value));
        return this;
      },
    });

    expect(Object.fromEntries(headers)).toEqual(SECURITY_HEADERS);
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("X-Frame-Options")).toBe("DENY");
  });
});
