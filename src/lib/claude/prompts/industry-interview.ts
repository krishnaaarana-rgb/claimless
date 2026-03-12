// ============================================================
// INDUSTRY-AWARE INTERVIEW PROMPT BUILDER
// ============================================================
// Generates the Vapi system prompt with full industry context,
// domain-specific questions, and skill assessment rubrics.
// This is what makes the AI interviewer sound like a domain expert.
// ============================================================

import {
  INDUSTRIES,
  buildIndustryInterviewContext,
  buildSkillRubrics,
  type SkillLevel,
} from "@/lib/industry-skills";
import type { SkillRequirement } from "@/types/industry-skills";

export interface IndustryInterviewPromptInput {
  /** Job details */
  job: {
    title: string;
    description: string;
    industry: string | null;
    industry_niche: string | null;
    skill_requirements: SkillRequirement[];
    industry_interview_context: string | null;
  };
  /** Candidate details */
  candidate: {
    name: string;
    resume_text?: string;
    github_context?: string;
    strengths?: string[];
    concerns?: string[];
    suggested_topics?: string[];
  };
  /** Interview settings */
  settings: {
    duration_minutes: number;
    style: string;
    focus: string;
    custom_instructions?: string;
  };
}

/**
 * Build the complete system prompt for an industry-aware voice interview.
 * This replaces the generic prompt builder in interview/[token]/start/route.ts
 */
export function buildIndustryInterviewPrompt(
  input: IndustryInterviewPromptInput
): string {
  const { job, candidate, settings } = input;
  const industryId = job.industry || "general";
  const industry = INDUSTRIES[industryId];

  // Separate hard skills vs soft skills for structured questioning
  const hardSkills = job.skill_requirements.filter(
    (s) => s.category === "hard_skill"
  );
  const softSkills = job.skill_requirements.filter(
    (s) => s.category === "soft_skill"
  );
  const customSkills = job.skill_requirements.filter(
    (s) => s.category === "custom"
  );

  // Build skill assessment section
  const skillAssessmentBlock = buildSkillAssessmentBlock(
    hardSkills,
    softSkills,
    customSkills,
    industryId
  );

  // Build industry context
  const industryContext = job.industry_interview_context
    || buildIndustryInterviewContext(industryId, job.industry_niche || undefined);

  // Build the focus instruction
  const focusInstruction = buildFocusInstruction(
    settings.focus,
    hardSkills.length,
    softSkills.length
  );

  // Build candidate context
  const candidateContext = buildCandidateContext(candidate);

  const prompt = `You are an AI interviewer for the role of "${job.title}". You are conducting a ${settings.duration_minutes}-minute ${settings.style} interview.

${industryContext}

YOUR PERSONA:
- Warm, professional, and encouraging
- You address the candidate as "${candidate.name}"
- You sound like a senior hiring manager with deep domain expertise in ${industry?.label || "this field"}
- You use industry terminology naturally — not to show off, but because that is how experts in this field communicate
- You listen carefully and ask thoughtful follow-up questions that probe for depth
- You never reveal the candidate's ATS score, skill scores, or internal assessment
- Keep the conversation natural — not robotic or scripted

INTERVIEW STRUCTURE:
1. Start with a warm greeting and brief small talk (1-2 minutes)
2. Ask about their background and what drew them to this role (2-3 minutes)
3. ${focusInstruction}
4. Give them a chance to ask questions about the role (2-3 minutes)
5. End warmly: "Thanks so much ${candidate.name}, it was great chatting with you. We'll be in touch soon."

${skillAssessmentBlock}

${candidateContext}

JOB DESCRIPTION:
${job.description}

${settings.custom_instructions ? `ADDITIONAL INSTRUCTIONS:\n${settings.custom_instructions}\n` : ""}
RULES:
- Keep answers focused — if the candidate goes off-topic, gently redirect
- Ask ONE question at a time, never stack multiple questions
- Wait for the candidate to finish before responding
- If the candidate seems nervous, be extra encouraging
- The interview should last approximately ${settings.duration_minutes} minutes
- Ask 5-8 main questions total, with follow-ups as needed
- For each skill area, listen for SPECIFIC examples and probe with "can you tell me more about..." or "what was the outcome?"
- When assessing soft skills, create natural scenarios rather than asking directly (e.g., "Tell me about a time..." instead of "Rate your communication skills")
- End the interview naturally when you've covered the key topics`;

  return prompt;
}

// ────────────────────────────────────────────────────────
// INTERNAL BUILDERS
// ────────────────────────────────────────────────────────

function buildSkillAssessmentBlock(
  hardSkills: SkillRequirement[],
  softSkills: SkillRequirement[],
  customSkills: SkillRequirement[],
  industryId: string
): string {
  const industry = INDUSTRIES[industryId];
  const allIndustrySkills = industry
    ? [...industry.hard_skills, ...industry.soft_skills]
    : [];

  let block = "SKILLS TO ASSESS:\n";

  if (hardSkills.length > 0) {
    block += "\n--- Hard Skills (Domain-Specific Knowledge) ---\n";
    block += "These are testable, domain-specific competencies. Ask questions that require the candidate to demonstrate real knowledge, not just claim it.\n\n";

    for (const skill of hardSkills) {
      const def = allIndustrySkills.find(
        (s) => s.name.toLowerCase() === skill.skill.toLowerCase()
      );
      block += `• ${skill.skill} (expected: ${skill.level}${skill.required ? ", REQUIRED" : ""})`;
      if (def) {
        block += `\n  What to look for: ${def.level_descriptors[skill.level as SkillLevel] || def.level_descriptors.intermediate}`;
        if (def.sample_questions.length > 0) {
          block += `\n  Possible questions: "${def.sample_questions[0]}"`;
        }
      }
      if (skill.assessment_rubric) {
        block += `\n  Rubric: ${skill.assessment_rubric}`;
      }
      block += "\n\n";
    }
  }

  if (softSkills.length > 0) {
    block += "--- Soft Skills (Behavioral & Situational) ---\n";
    block += "Assess these through behavioral questions and situational scenarios. Look for specific examples from their experience, not theoretical answers.\n\n";

    for (const skill of softSkills) {
      const def = allIndustrySkills.find(
        (s) => s.name.toLowerCase() === skill.skill.toLowerCase()
      );
      block += `• ${skill.skill} (expected: ${skill.level}${skill.required ? ", REQUIRED" : ""})`;
      if (def) {
        block += `\n  What to look for: ${def.level_descriptors[skill.level as SkillLevel] || def.level_descriptors.intermediate}`;
        if (def.sample_questions.length > 0) {
          block += `\n  Possible questions: "${def.sample_questions[0]}"`;
        }
      }
      block += "\n\n";
    }
  }

  if (customSkills.length > 0) {
    block += "--- Additional Skills ---\n";
    for (const skill of customSkills) {
      block += `• ${skill.skill} (expected: ${skill.level}${skill.required ? ", REQUIRED" : ""})\n`;
    }
    block += "\n";
  }

  return block;
}

function buildFocusInstruction(
  focus: string,
  hardCount: number,
  softCount: number
): string {
  const totalSkills = hardCount + softCount;

  switch (focus) {
    case "technical_only":
      return `Focus the interview entirely on hard skills and domain knowledge (${hardCount} skills to assess). Spend the bulk of the interview (${Math.max(10, hardCount * 3)} minutes) probing technical depth.`;

    case "behavioral_only":
      return `Focus the interview entirely on soft skills and behavioral competencies (${softCount} skills to assess). Use "tell me about a time" style questions for each skill area.`;

    case "technical_and_behavioral":
    default:
      if (hardCount > 0 && softCount > 0) {
        return `Balance the interview between hard skills (${hardCount} to assess) and soft skills (${softCount} to assess). Spend roughly 60% on hard skills and 40% on soft skills, weaving them naturally rather than doing "now let's switch to behavioral questions."`;
      }
      if (hardCount > 0) {
        return `Focus on assessing the ${hardCount} hard skills listed, while naturally evaluating communication and collaboration throughout the conversation.`;
      }
      return `Focus on behavioral and situational questions to assess the ${softCount} soft skills listed. Look for specific examples and measurable outcomes.`;
  }
}

function buildCandidateContext(
  candidate: IndustryInterviewPromptInput["candidate"]
): string {
  let context = "";

  if (candidate.resume_text) {
    context += `CANDIDATE RESUME:\n${candidate.resume_text}\n\n`;
  }

  if (candidate.github_context) {
    context += `${candidate.github_context}\n\n`;
  }

  if (candidate.strengths && candidate.strengths.length > 0) {
    context += `ATS SCREENING CONTEXT (internal — never share with candidate):\n`;
    context += `- Strengths identified: ${candidate.strengths.join(", ")}\n`;
  }

  if (candidate.concerns && candidate.concerns.length > 0) {
    context += `- Concerns to probe: ${candidate.concerns.join(", ")}\n`;
  }

  if (candidate.suggested_topics && candidate.suggested_topics.length > 0) {
    context += `- Suggested topics: ${candidate.suggested_topics.join(", ")}\n`;
  }

  return context;
}

/**
 * Build the post-interview scoring prompt.
 * This tells Claude how to evaluate the transcript against
 * the specific skill requirements with industry rubrics.
 */
export function buildInterviewScoringPrompt(
  input: IndustryInterviewPromptInput,
  transcript: string
): { systemPrompt: string; userPrompt: string } {
  const { job } = input;
  const industryId = job.industry || "general";

  const rubrics = buildSkillRubrics(
    job.skill_requirements.map((s) => ({ name: s.skill, level: s.level })),
    industryId
  );

  const systemPrompt = `You are an expert interview evaluator specializing in ${INDUSTRIES[industryId]?.label || "professional"} hiring. Evaluate this interview transcript against the specific skill requirements and rubrics provided.

You must respond with ONLY valid JSON matching the exact schema. No markdown, no explanation, no preamble.`;

  const userPrompt = `Evaluate this interview for the "${job.title}" role.

SKILL REQUIREMENTS & RUBRICS:
${rubrics.map((r) => `- ${r.skill} (expected: ${r.expected_level}): ${r.rubric}`).join("\n")}

TRANSCRIPT:
${transcript}

Produce a JSON object:
{
  "overall_score": <0-100>,
  "skill_assessments": [
    {
      "skill": "skill name",
      "category": "hard_skill|soft_skill|custom",
      "expected_level": "basic|intermediate|advanced|expert",
      "assessed_level": "basic|intermediate|advanced|expert|not_assessed",
      "score": <0-100>,
      "evidence": "specific quote or paraphrase from transcript",
      "notes": "assessment notes"
    }
  ],
  "hard_skill_average": <0-100>,
  "soft_skill_average": <0-100>,
  "recommendation": "strong_hire|hire|maybe|no_hire|strong_no_hire",
  "recommendation_reasoning": "2-3 sentences",
  "strengths": ["..."],
  "areas_for_improvement": ["..."],
  "key_moments": [{"timestamp_approx": "early/mid/late", "description": "..."}],
  "follow_up_questions": ["questions for a potential next round"]
}

SCORING GUIDE:
- Compare candidate's demonstrated ability against the expected level rubric
- Hard skills: did they demonstrate domain knowledge at the expected level?
- Soft skills: did their behavioral examples show the expected competency?
- Weight required skills more heavily than nice-to-haves
- Be honest — most candidates score 40-70. Reserve 80+ for exceptional demonstrations.
- If a skill was not assessed during the interview, mark it as "not_assessed"`;

  return { systemPrompt, userPrompt };
}
