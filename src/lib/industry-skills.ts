// ============================================================
// INDUSTRY SKILLS TAXONOMY
// ============================================================
// This file defines the complete industry → skill mapping used
// across job creation, ATS screening, and AI voice interviews.
// Each industry has:
//   - hard_skills: domain-specific, testable competencies
//   - soft_skills: behavioral & situational competencies
//   - interview_context: hints for the AI interviewer persona
//   - sub_niches: optional specializations within the industry
// ============================================================

export type SkillCategory = "hard_skill" | "soft_skill";

export type SkillLevel = "basic" | "intermediate" | "advanced" | "expert";

export interface IndustrySkill {
  name: string;
  category: SkillCategory;
  /** What this skill actually means — shown to recruiters as a tooltip */
  description: string;
  /** Example interview questions the AI can draw from */
  sample_questions: string[];
  /** What "good" looks like at each level — used for scoring rubrics */
  level_descriptors: {
    basic: string;
    intermediate: string;
    advanced: string;
    expert: string;
  };
}

export interface IndustrySubNiche {
  id: string;
  label: string;
  /** Additional skills specific to this niche */
  additional_skills: string[];
  /** Extra context for the AI interviewer */
  interview_hints: string;
}

export interface IndustryDefinition {
  id: string;
  label: string;
  icon: string;
  description: string;
  /** Persona instructions for the AI voice interviewer */
  interview_context: {
    persona: string;
    tone: string;
    domain_terminology: string[];
    red_flags_to_probe: string[];
    what_great_looks_like: string;
  };
  hard_skills: IndustrySkill[];
  soft_skills: IndustrySkill[];
  sub_niches: IndustrySubNiche[];
}

// ============================================================
// INDUSTRY DEFINITIONS
// Assembled from per-industry files in src/lib/industries/skills/
// To add/edit skills, edit the individual industry file.
// ============================================================

import { healthcareIndustry } from "@/lib/industries/skills/healthcare";
import { financeIndustry } from "@/lib/industries/skills/finance";
import { salesIndustry } from "@/lib/industries/skills/sales";
import { legalIndustry } from "@/lib/industries/skills/legal";
import { technologyIndustry } from "@/lib/industries/skills/technology";
import { marketingIndustry } from "@/lib/industries/skills/marketing";
import { human_resourcesIndustry } from "@/lib/industries/skills/human_resources";
import { educationIndustry } from "@/lib/industries/skills/education";
import { operationsIndustry } from "@/lib/industries/skills/operations";
import { designIndustry } from "@/lib/industries/skills/design";
import { customer_successIndustry } from "@/lib/industries/skills/customer_success";
import { data_analyticsIndustry } from "@/lib/industries/skills/data_analytics";
import { constructionIndustry } from "@/lib/industries/skills/construction";
import { generalIndustry } from "@/lib/industries/skills/general";

export const INDUSTRIES: Record<string, IndustryDefinition> = {
  healthcare: healthcareIndustry,
  finance: financeIndustry,
  sales: salesIndustry,
  legal: legalIndustry,
  technology: technologyIndustry,
  marketing: marketingIndustry,
  human_resources: human_resourcesIndustry,
  education: educationIndustry,
  operations: operationsIndustry,
  design: designIndustry,
  customer_success: customer_successIndustry,
  data_analytics: data_analyticsIndustry,
  construction: constructionIndustry,
  general: generalIndustry,
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/** Get sorted list of industries for dropdowns */
export function getIndustryList(): { id: string; label: string; icon: string }[] {
  return Object.values(INDUSTRIES)
    .filter((i) => i.id !== "general")
    .sort((a, b) => a.label.localeCompare(b.label))
    .concat([INDUSTRIES.general]);
}

/** Get all skills (hard + soft) for an industry */
export function getIndustrySkills(industryId: string): IndustrySkill[] {
  const industry = INDUSTRIES[industryId];
  if (!industry) return [];
  return [...industry.hard_skills, ...industry.soft_skills];
}

/** Get skills for an industry including sub-niche additions */
export function getIndustrySkillsWithNiche(
  industryId: string,
  nicheId?: string
): { hard_skills: IndustrySkill[]; soft_skills: IndustrySkill[]; niche_skills: string[] } {
  const industry = INDUSTRIES[industryId];
  if (!industry) return { hard_skills: [], soft_skills: [], niche_skills: [] };

  const niche = nicheId
    ? industry.sub_niches.find((n) => n.id === nicheId)
    : undefined;

  return {
    hard_skills: industry.hard_skills,
    soft_skills: industry.soft_skills,
    niche_skills: niche?.additional_skills || [],
  };
}

/** Build interview context for a specific industry + niche combination */
export function buildIndustryInterviewContext(
  industryId: string,
  nicheId?: string
): string {
  const industry = INDUSTRIES[industryId];
  if (!industry) return "";

  const niche = nicheId
    ? industry.sub_niches.find((n) => n.id === nicheId)
    : undefined;

  let context = `INDUSTRY CONTEXT: ${industry.label}\n`;
  context += `${industry.interview_context.persona}\n\n`;
  context += `TONE: ${industry.interview_context.tone}\n\n`;

  if (industry.interview_context.domain_terminology.length > 0) {
    context += `DOMAIN TERMINOLOGY (use naturally in conversation): ${industry.interview_context.domain_terminology.join(", ")}\n\n`;
  }

  context += `RED FLAGS TO PROBE:\n${industry.interview_context.red_flags_to_probe.map((r) => `- ${r}`).join("\n")}\n\n`;
  context += `WHAT GREAT LOOKS LIKE: ${industry.interview_context.what_great_looks_like}\n`;

  if (niche) {
    context += `\nSPECIALIZATION: ${niche.label}\n`;
    context += `${niche.interview_hints}\n`;
    context += `Additional skills to probe: ${niche.additional_skills.join(", ")}\n`;
  }

  return context;
}

/** Build skill assessment rubric for post-interview scoring */
export function buildSkillRubrics(
  skills: { name: string; level: SkillLevel }[],
  industryId: string
): { skill: string; expected_level: string; rubric: string }[] {
  const industry = INDUSTRIES[industryId];
  if (!industry) return [];

  const allSkills = [...industry.hard_skills, ...industry.soft_skills];

  return skills.map((req) => {
    const skillDef = allSkills.find(
      (s) => s.name.toLowerCase() === req.name.toLowerCase()
    );
    if (!skillDef) {
      return {
        skill: req.name,
        expected_level: req.level,
        rubric: `Assess the candidate's ${req.name} at the ${req.level} level.`,
      };
    }
    return {
      skill: req.name,
      expected_level: req.level,
      rubric: `Expected: ${skillDef.level_descriptors[req.level]}`,
    };
  });
}
