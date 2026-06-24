import { describe, expect, it } from "vitest";
import { getRateLimitWaitMs } from "./rate-limit.js";

describe("getRateLimitWaitMs", () => {
  it("returns zero when reset time is already past", () => {
    const resetAt = new Date(Date.now() - 1000);
    expect(getRateLimitWaitMs(resetAt)).toBe(0);
  });

  it("returns positive wait time when reset time is in the future", () => {
    const resetAt = new Date(Date.now() + 5000);
    expect(getRateLimitWaitMs(resetAt)).toBeGreaterThan(0);
  });
});
