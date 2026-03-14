import { describe, it, expect } from "vitest";

describe("Claude JSON Parser", () => {
  // Test the JSON cleaning/parsing logic that analyzeWithClaude uses

  it("strips markdown code fences", () => {
    const raw = '```json\n{"score": 85}\n```';
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    expect(JSON.parse(cleaned)).toEqual({ score: 85 });
  });

  it("handles JSON with trailing text", () => {
    const raw = '{"score": 85} Here is my analysis...';
    const match = raw.match(/\{[\s\S]*\}/);
    expect(match).toBeTruthy();
    expect(JSON.parse(match![0])).toEqual({ score: 85 });
  });

  it("handles curly quotes in JSON strings", () => {
    const raw = '{"quote": "He said \u2018hello\u2019 to me"}';
    const fixed = raw
      .replace(/\u2018|\u2019/g, "'")
      .replace(/\u201C|\u201D/g, '\\"');
    expect(() => JSON.parse(fixed)).not.toThrow();
  });

  it("handles em-dashes", () => {
    const raw = '{"text": "first \u2014 second"}';
    const fixed = raw.replace(/\u2014/g, "--").replace(/\u2013/g, "-");
    expect(() => JSON.parse(fixed)).not.toThrow();
    const parsed = JSON.parse(fixed);
    expect(parsed.text).toContain("--");
  });

  it("handles trailing commas", () => {
    const raw = '{"items": ["a", "b", ], "score": 5, }';
    const fixed = raw.replace(/,\s*([}\]])/g, "$1");
    expect(() => JSON.parse(fixed)).not.toThrow();
  });

  it("handles control characters", () => {
    const raw = '{"text": "line1\x00line2\x01line3"}';
    const fixed = raw.replace(/[\x00-\x1f]/g, " ");
    expect(() => JSON.parse(fixed)).not.toThrow();
  });
});
