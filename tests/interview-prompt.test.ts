import { describe, it, expect } from "vitest";
import { buildIndustryInterviewPrompt, buildInterviewScoringPrompt, buildAustralianComplianceBlock } from "@/lib/claude/prompts/industry-interview";

describe("Interview Prompt Builder", () => {
  const baseInput = {
    job: {
      title: "Senior Engineer",
      description: "Build stuff",
      industry: "technology" as string | null,
      industry_niche: "backend" as string | null,
      skill_requirements: [
        { skill: "Node.js", category: "hard_skill" as const, level: "advanced" as const, required: true, weight: 5, assessment_rubric: null },
      ],
      industry_interview_context: null as string | null,
    },
    candidate: {
      name: "Jane",
      resume_text: "10 years Node.js experience",
      github_context: "Active GitHub with 50 repos",
      loom_context: "Video score: 8/10",
      pre_generated_context: "Screening brief here",
      strengths: ["Strong Node.js"],
      concerns: ["No team lead experience"],
      suggested_topics: ["System design"],
    },
    settings: {
      duration_minutes: 20,
      style: "conversational",
      focus: "technical_and_behavioral",
    },
    region: "AU" as const,
  };

  it("builds a prompt with all sections", () => {
    const prompt = buildIndustryInterviewPrompt(baseInput);

    expect(prompt).toContain("Jane");
    expect(prompt).toContain("Senior Engineer");
    expect(prompt).toContain("Node.js");
    expect(prompt).toContain("MANDATORY INTERVIEW STRUCTURE");
    expect(prompt).toContain("PHASE 1");
    expect(prompt).toContain("PHASE 2");
    expect(prompt).toContain("LIVE PROBLEM");
    expect(prompt).toContain("DEPTH PURSUIT");
    expect(prompt).toContain("ANTI-COACHING");
    expect(prompt).toContain("FAILURE MODE");
  });

  it("includes resume and GitHub context", () => {
    const prompt = buildIndustryInterviewPrompt(baseInput);
    expect(prompt).toContain("10 years Node.js");
    expect(prompt).toContain("Active GitHub");
  });

  it("includes loom and pre-generated context", () => {
    const prompt = buildIndustryInterviewPrompt(baseInput);
    expect(prompt).toContain("Video score: 8/10");
    expect(prompt).toContain("Screening brief here");
  });

  it("includes AU compliance for AU region", () => {
    const prompt = buildIndustryInterviewPrompt(baseInput);
    expect(prompt).toContain("Australian");
    expect(prompt).toContain("Fair Work");
    expect(prompt).toContain("protected attributes");
  });

  it("excludes AU compliance for non-AU region", () => {
    const input = { ...baseInput, region: null };
    const prompt = buildIndustryInterviewPrompt(input);
    expect(prompt).not.toContain("Fair Work Act");
  });

  it("includes anti-patterns (do not say 'that's alright')", () => {
    const prompt = buildIndustryInterviewPrompt(baseInput);
    expect(prompt).toContain("Do NOT say");
  });

  it("includes duration enforcement", () => {
    const prompt = buildIndustryInterviewPrompt(baseInput);
    expect(prompt).toContain("20");
    expect(prompt.toLowerCase()).toContain("do not wrap up early");
  });

  it("buildAustralianComplianceBlock includes industry regulations", () => {
    const block = buildAustralianComplianceBlock("construction");
    expect(block).toContain("SafeWork");
    expect(block).toContain("White cards");
    expect(block).toContain("SWMS");
  });

  it("buildAustralianComplianceBlock includes anti-discrimination", () => {
    const block = buildAustralianComplianceBlock("general");
    expect(block).toContain("MUST NOT ask");
    expect(block).toContain("Age");
    expect(block).toContain("disability");
  });

  it("scoring prompt includes all required output fields", () => {
    const { userPrompt } = buildInterviewScoringPrompt(baseInput, "Transcript here");
    expect(userPrompt).toContain("overall_score");
    expect(userPrompt).toContain("skill_assessments");
    expect(userPrompt).toContain("recommendation");
    expect(userPrompt).toContain("depth_reached");
    expect(userPrompt).toContain("evidence");
    expect(userPrompt).toContain("red_flags");
    expect(userPrompt).toContain("green_flags");
    expect(userPrompt).toContain("follow_up_questions");
    expect(userPrompt).toContain("hiring_risk_factors");
  });
});
