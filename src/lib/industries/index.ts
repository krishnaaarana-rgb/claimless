/**
 * Industry definitions — re-exports from the main industry-skills file.
 *
 * The full skill taxonomy lives in src/lib/industry-skills.ts.
 * This module provides per-industry access and maps how each
 * industry connects to ATS screening, Loom analysis, and the
 * voice interview.
 *
 * Pipeline mapping:
 *   ATS Screening  → uses skill_requirements from job config
 *   Loom Analysis   → industry-agnostic (communication assessment)
 *   Voice Interview → uses interview_context, skills, AU compliance
 *   Scoring         → uses skill rubrics from level_descriptors
 */

export {
  INDUSTRIES,
  buildIndustryInterviewContext,
  buildSkillRubrics,
  type IndustryDefinition,
  type IndustrySkill,
  type IndustrySubNiche,
  type SkillCategory,
  type SkillLevel,
} from "@/lib/industry-skills";

import { INDUSTRIES } from "@/lib/industry-skills";

/** Get a specific industry definition */
export function getIndustry(id: string) {
  return INDUSTRIES[id] || null;
}

/** List all industry IDs */
export function getIndustryIds(): string[] {
  return Object.keys(INDUSTRIES);
}

/** Get all industries except 'general' */
export function getSpecificIndustries() {
  return Object.entries(INDUSTRIES)
    .filter(([id]) => id !== "general")
    .map(([industryId, def]) => ({ industryId, ...def }));
}

/** Get industries with their skill counts */
export function getIndustrySummaries() {
  return Object.entries(INDUSTRIES).map(([id, def]) => ({
    id,
    label: def.label,
    icon: def.icon,
    hardSkillCount: def.hard_skills.length,
    softSkillCount: def.soft_skills.length,
    subNicheCount: def.sub_niches.length,
    totalSkills: def.hard_skills.length + def.soft_skills.length,
  }));
}

/**
 * Pipeline connection map — shows where each industry's data
 * is used in the candidate pipeline.
 */
export const PIPELINE_CONNECTIONS = {
  ats_screening: {
    file: "src/lib/claude/prompts/ats-screening.ts",
    uses: "skill_requirements from job config — evaluates resume against industry-specific skills",
  },
  loom_analysis: {
    file: "src/lib/claude/prompts/loom-analysis.ts",
    uses: "job title + description for relevance scoring — industry-agnostic",
  },
  voice_interview: {
    file: "src/lib/claude/prompts/industry-interview.ts",
    uses: "interview_context (persona, tone, terminology), hard_skills + soft_skills with level_descriptors, sub_niche interview_hints, AU_INDUSTRY_REGULATIONS",
  },
  scoring: {
    file: "src/lib/claude/prompts/industry-interview.ts (buildInterviewScoringPrompt)",
    uses: "skill rubrics from level_descriptors, industry label for comparison",
  },
};
