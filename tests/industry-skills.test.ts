import { describe, it, expect } from "vitest";
import { INDUSTRIES, buildIndustryInterviewContext, buildSkillRubrics } from "@/lib/industry-skills";

describe("Industry Skills Taxonomy", () => {
  const industryIds = Object.keys(INDUSTRIES);

  it("has at least 13 industries", () => {
    expect(industryIds.length).toBeGreaterThanOrEqual(13);
  });

  it("includes construction industry", () => {
    expect(INDUSTRIES.construction).toBeDefined();
    expect(INDUSTRIES.construction.label).toContain("Construction");
  });

  it("every industry has required fields", () => {
    for (const [id, industry] of Object.entries(INDUSTRIES)) {
      expect(industry.id, `${id} missing id`).toBe(id);
      expect(industry.label, `${id} missing label`).toBeTruthy();
      expect(industry.description, `${id} missing description`).toBeTruthy();
      expect(industry.interview_context, `${id} missing interview_context`).toBeDefined();
      expect(industry.interview_context.persona, `${id} missing persona`).toBeTruthy();
      expect(industry.interview_context.tone, `${id} missing tone`).toBeTruthy();
      expect(Array.isArray(industry.hard_skills), `${id} hard_skills not array`).toBe(true);
      expect(Array.isArray(industry.soft_skills), `${id} soft_skills not array`).toBe(true);
      expect(Array.isArray(industry.sub_niches), `${id} sub_niches not array`).toBe(true);
    }
  });

  it("every skill has sample questions and level descriptors", () => {
    for (const [id, industry] of Object.entries(INDUSTRIES)) {
      const allSkills = [...industry.hard_skills, ...industry.soft_skills];
      for (const skill of allSkills) {
        expect(skill.name, `${id}/${skill.name} missing name`).toBeTruthy();
        expect(skill.description, `${id}/${skill.name} missing description`).toBeTruthy();
        expect(skill.level_descriptors, `${id}/${skill.name} missing level_descriptors`).toBeDefined();
        expect(skill.level_descriptors.basic, `${id}/${skill.name} missing basic level`).toBeTruthy();
        expect(skill.level_descriptors.intermediate, `${id}/${skill.name} missing intermediate level`).toBeTruthy();
        expect(skill.level_descriptors.advanced, `${id}/${skill.name} missing advanced level`).toBeTruthy();
        expect(skill.level_descriptors.expert, `${id}/${skill.name} missing expert level`).toBeTruthy();
      }
    }
  });

  it("buildIndustryInterviewContext returns valid context for each industry", () => {
    for (const id of industryIds) {
      if (id === "general") continue;
      const context = buildIndustryInterviewContext(id);
      expect(context, `${id} context empty`).toBeTruthy();
      expect(typeof context).toBe("string");
      expect(context.length).toBeGreaterThan(50);
    }
  });

  it("buildSkillRubrics returns rubrics for valid skills", () => {
    const rubrics = buildSkillRubrics(
      [{ name: "Clinical Documentation", level: "intermediate" }],
      "healthcare"
    );
    expect(rubrics.length).toBeGreaterThan(0);
    expect(rubrics[0].skill).toBe("Clinical Documentation");
    expect(rubrics[0].rubric).toBeTruthy();
  });

  it("construction has WHS skill", () => {
    const whs = INDUSTRIES.construction.hard_skills.find(
      (s) => s.name.includes("WHS") || s.name.includes("Safety")
    );
    expect(whs).toBeDefined();
  });
});
