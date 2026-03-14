import { describe, it, expect } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

describe("Rate Limiter", () => {
  it("allows requests when no Redis configured", async () => {
    // Without UPSTASH env vars, should fail-open
    const result = await checkRateLimit("test-key", 10, 60);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(10);
  });

  it("returns correct structure", async () => {
    const result = await checkRateLimit("test-key-2", 5, 30);
    expect(result).toHaveProperty("allowed");
    expect(result).toHaveProperty("remaining");
    expect(result).toHaveProperty("resetIn");
    expect(typeof result.allowed).toBe("boolean");
    expect(typeof result.remaining).toBe("number");
    expect(typeof result.resetIn).toBe("number");
  });
});
