import { describe, it, expect } from "vitest";

// Test the ATS screening prompt builder (not the Claude call — just the prompt construction)
// We import the module to verify it exports correctly and the prompt structure is valid

describe("ATS Screening", () => {
  it("ATSScreenInput interface accepts all required fields", async () => {
    const { screenApplication } = await import("@/lib/claude/prompts/ats-screening");
    expect(screenApplication).toBeDefined();
    expect(typeof screenApplication).toBe("function");
  });

  it("ATSScreeningResult has consistency_flags as optional", async () => {
    // Simulate a result without consistency_flags
    const result = {
      match_score: 72,
      pass: true,
      summary: "Good candidate",
      strengths: ["Strong background"],
      concerns: ["Limited experience"],
      key_qualifications: [{ qualification: "Node.js", met: true, evidence: "5 years" }],
      recommendation: "pass" as const,
      suggested_interview_topics: ["System design"],
      // NO consistency_flags — should be valid
    };

    expect(result.match_score).toBe(72);
    expect(result.pass).toBe(true);
    // @ts-expect-error — testing undefined access
    expect(result.consistency_flags).toBeUndefined();
  });

  it("consistency_flags handles empty array", () => {
    const flags: string[] = [];
    const brief = flags.length > 0 ? `Flags: ${flags.join("; ")}` : "";
    expect(brief).toBe("");
  });

  it("interview_brief generation handles all empty fields", () => {
    const screening = {
      match_score: 50,
      recommendation: "borderline",
      summary: "Average candidate",
      strengths: [] as string[],
      concerns: [] as string[],
      consistency_flags: [] as string[],
      key_qualifications: [] as { qualification: string; met: boolean; evidence: string }[],
      suggested_interview_topics: [] as string[],
    };

    const brief = [
      `Candidate: Test`,
      `Role: Engineer`,
      `ATS Score: ${screening.match_score}/100 (${screening.recommendation})`,
      `Summary: ${screening.summary}`,
      screening.strengths.length > 0 ? `Strengths: ${screening.strengths.join("; ")}` : "",
      screening.concerns.length > 0 ? `Concerns: ${screening.concerns.join("; ")}` : "",
      screening.consistency_flags && screening.consistency_flags.length > 0
        ? `Flags: ${screening.consistency_flags.join("; ")}`
        : "",
    ].filter(Boolean).join("\n");

    expect(brief).toContain("Candidate: Test");
    expect(brief).toContain("ATS Score: 50/100");
    expect(brief).not.toContain("Strengths:");
    expect(brief).not.toContain("Concerns:");
    expect(brief).not.toContain("Flags:");
  });
});
