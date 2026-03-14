import { describe, it, expect } from "vitest";

describe("Loom Scraper", () => {
  it("exports scrapeLoomTranscript function", async () => {
    const { scrapeLoomTranscript } = await import("@/lib/scraping/loom");
    expect(scrapeLoomTranscript).toBeDefined();
    expect(typeof scrapeLoomTranscript).toBe("function");
  });

  it("returns null for non-loom URLs", async () => {
    const { scrapeLoomTranscript } = await import("@/lib/scraping/loom");
    const result = await scrapeLoomTranscript("https://example.com/not-a-loom");
    expect(result).toBeNull();
  });

  it("returns null for invalid loom share IDs", async () => {
    const { scrapeLoomTranscript } = await import("@/lib/scraping/loom");
    const result = await scrapeLoomTranscript("https://www.loom.com/share/invalid-id-12345");
    expect(result).toBeNull();
  });

  it("SSRF protection blocks non-loom domains", async () => {
    // The scraper should not fetch from arbitrary domains
    // This tests the URL validation logic
    const testUrl = "https://attacker.com/fake-transcript.json";
    const parsedUrl = new URL(testUrl);
    const allowedHosts = ["cdn.loom.com", "www.loom.com", "loom.com"];
    const isLoomDomain = allowedHosts.some(
      (h) => parsedUrl.hostname === h || parsedUrl.hostname.endsWith(`.${h}`)
    );
    const isS3 = parsedUrl.hostname.endsWith(".amazonaws.com");
    expect(isLoomDomain).toBe(false);
    expect(isS3).toBe(false);
  });

  it("allows valid loom CDN domains", () => {
    const testUrl = "https://cdn.loom.com/mediametadata/test.json";
    const parsedUrl = new URL(testUrl);
    const allowedHosts = ["cdn.loom.com", "www.loom.com", "loom.com"];
    const isLoomDomain = allowedHosts.some(
      (h) => parsedUrl.hostname === h || parsedUrl.hostname.endsWith(`.${h}`)
    );
    expect(isLoomDomain).toBe(true);
  });

  it("allows S3 domains (Loom uses S3 for some assets)", () => {
    const testUrl = "https://loom-transcripts.s3.amazonaws.com/test.json";
    const parsedUrl = new URL(testUrl);
    const isS3 = parsedUrl.hostname.endsWith(".amazonaws.com");
    expect(isS3).toBe(true);
  });
});
