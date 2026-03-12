// ============================================================
// INDUSTRY SKILLS — Extended Types
// ============================================================
// These types extend the existing database types in database.ts
// to support the industry-aware skills taxonomy.
// ============================================================

import type { SkillCategory, SkillLevel } from "@/lib/industry-skills";

/** Enhanced skill requirement with category and assessment context */
export interface SkillRequirement {
  /** Skill name (from taxonomy or custom) */
  skill: string;
  /** hard_skill, soft_skill, or custom (free-form additions) */
  category: SkillCategory | "custom";
  /** Expected proficiency level */
  level: SkillLevel;
  /** Whether this skill is required vs nice-to-have */
  required: boolean;
  /** Importance weight 1-5 for scoring (default 3) */
  weight: number;
  /** Auto-populated rubric from taxonomy, or custom text */
  assessment_rubric?: string;
}

/** Extended Job type with industry fields */
export interface JobWithIndustry {
  industry: string | null;
  industry_niche: string | null;
  skill_requirements: SkillRequirement[];
  industry_interview_context: string | null;
}

/** Input for creating/updating a job with industry skills */
export interface JobSkillsInput {
  industry: string;
  industry_niche?: string;
  skill_requirements: SkillRequirement[];
}

/** Interview skill assessment result (post-interview scoring) */
export interface SkillAssessment {
  skill: string;
  category: SkillCategory | "custom";
  expected_level: SkillLevel;
  assessed_level: SkillLevel | "not_assessed";
  score: number; // 0-100
  evidence: string;
  notes: string;
}

/** Full interview scoring with skill breakdown */
export interface IndustryInterviewScoring {
  overall_score: number;
  skill_assessments: SkillAssessment[];
  hard_skill_average: number;
  soft_skill_average: number;
  recommendation: "strong_hire" | "hire" | "maybe" | "no_hire" | "strong_no_hire";
  recommendation_reasoning: string;
  strengths: string[];
  areas_for_improvement: string[];
  key_moments: { timestamp_approx: string; description: string }[];
  follow_up_questions: string[];
}
