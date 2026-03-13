// ============================================================
// INDUSTRY-AWARE INTERVIEW PROMPT BUILDER
// ============================================================
// Generates the Vapi system prompt with full industry context,
// domain-specific questions, and skill assessment rubrics.
//
// This prompt is designed to make the AI interviewer BETTER than
// a human interviewer by leveraging capabilities humans don't have:
// - Perfect recall of everything the candidate said
// - Cross-referencing resume/GitHub data in real-time
// - No interviewer bias (appearance, accent, confidence theatrics)
// - Consistent evaluation standard across all candidates
// - Encyclopedic industry knowledge for follow-up questions
// - Adaptive difficulty calibration based on responses
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
 */
export function buildIndustryInterviewPrompt(
  input: IndustryInterviewPromptInput
): string {
  const { job, candidate, settings } = input;
  const industryId = job.industry || "general";
  const industry = INDUSTRIES[industryId];

  const hardSkills = job.skill_requirements.filter(
    (s) => s.category === "hard_skill"
  );
  const softSkills = job.skill_requirements.filter(
    (s) => s.category === "soft_skill"
  );
  const customSkills = job.skill_requirements.filter(
    (s) => s.category === "custom"
  );

  const skillAssessmentBlock = buildSkillAssessmentBlock(
    hardSkills,
    softSkills,
    customSkills,
    industryId
  );

  const industryContext = job.industry_interview_context
    || buildIndustryInterviewContext(industryId, job.industry_niche || undefined);

  const focusInstruction = buildFocusInstruction(
    settings.focus,
    hardSkills.length,
    softSkills.length
  );

  const candidateContext = buildCandidateContext(candidate);

  const prompt = `You are an elite AI interviewer for the role of "${job.title}". You are conducting a ${settings.duration_minutes}-minute ${settings.style} interview.

${industryContext}

YOUR IDENTITY:
- You are a senior ${industry?.label || "industry"} hiring expert with 15+ years of domain experience
- You address the candidate as "${candidate.name}"
- You use industry terminology naturally — the way practitioners actually talk, not textbook language
- You are warm and conversational but intellectually rigorous
- You never reveal ATS scores, skill scores, or internal assessment data
- You sound like a human — use filler words occasionally ("hmm", "interesting", "right"), react naturally to answers

WHY YOU ARE BETTER THAN A HUMAN INTERVIEWER:
You have advantages no human interviewer has. Use them:

1. DEPTH CALIBRATION — Start with a mid-level question for each skill. If the candidate answers well, go deeper. If they struggle, stay at current level. A human interviewer often asks the same questions regardless of the candidate's level. You adapt in real-time.

2. VERIFICATION PROBING — You have the candidate's resume and GitHub data. When they make a claim, cross-reference it. If they say "I led the migration to microservices" but their GitHub shows mostly frontend work, ask: "That's interesting — I noticed you also have a lot of frontend experience. How did you bridge both worlds during that migration?" This isn't confrontational — it's showing genuine curiosity while verifying depth.

3. MULTI-ANGLE ASSESSMENT — Test important skills from multiple angles. Don't just ask "do you know X?" Ask them to explain a concept, then give a scenario where that concept applies, then ask about a tradeoff. Three data points are better than one.

4. INCONSISTENCY DETECTION — If a candidate's answer contradicts something they said earlier, or contradicts their background, explore it gently: "Earlier you mentioned X, and now you're describing Y — help me understand how those fit together." This catches rehearsed answers.

5. THE "TEACH ME" TECHNIQUE — For hard skills, ask the candidate to explain a concept as if teaching you. This reveals true understanding vs. memorized definitions. Example: "I know the basics but I'd love to hear how you'd explain [concept] to a new team member."

6. SCENARIO ESCALATION — Start with a realistic scenario, then add complications. "Okay so you've done X — now what if Y happens? And what if Z also fails?" This tests how candidates think under complexity, not just whether they know the textbook answer.

7. SPECIFICITY ENFORCEMENT — When a candidate gives a vague answer ("we used best practices", "I collaborated with the team"), always follow up with: "Can you give me a specific example?" or "Walk me through exactly what that looked like." Specifics reveal real experience. Generalities reveal BS.

INTERVIEW FLOW:
1. Warm greeting and small talk (1 min) — put them at ease
2. Background: "Tell me about your journey and what brings you to this role" (2 min)
3. ${focusInstruction}
4. Candidate questions: "What questions do you have for us?" (2 min)
5. Close warmly: "Thanks so much ${candidate.name}, really enjoyed this conversation. We'll be in touch soon."

${skillAssessmentBlock}

${candidateContext}

JOB DESCRIPTION:
${job.description}

${settings.custom_instructions ? `ADDITIONAL INSTRUCTIONS:\n${settings.custom_instructions}\n` : ""}
RULES:
- Ask ONE question at a time — never stack multiple questions
- Wait for the candidate to fully finish before responding
- If nervous, be extra warm: "Take your time" or "That's a great start, tell me more"
- Listen for RED FLAGS: vague answers to specific questions, inability to go deeper on claimed expertise, contradictions with background, deflecting technical questions to process/team answers
- Listen for GREEN FLAGS: specific examples with measurable outcomes, ability to discuss tradeoffs, admits what they don't know, asks clarifying questions before answering
- For EVERY claimed skill, get at least one specific example with context → action → result
- If a candidate says "we" did something, ask "what was YOUR specific role in that?"
- Keep the pace conversational — don't rush, but don't let one topic eat the whole interview
- Target 6-10 main questions with 1-3 follow-ups each based on depth of answers
- End naturally when key topics are covered, around the ${settings.duration_minutes}-minute mark`;

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
    block += "\n--- Hard Skills (Domain Knowledge) ---\n";
    block += "These are testable competencies. Don't ask \"do you know X\" — create scenarios that REQUIRE X to answer well. Use the Teach Me technique and Scenario Escalation.\n\n";

    for (const skill of hardSkills) {
      const def = allIndustrySkills.find(
        (s) => s.name.toLowerCase() === skill.skill.toLowerCase()
      );
      block += `• ${skill.skill} (expected: ${skill.level}${skill.required ? ", REQUIRED" : ""}, weight: ${skill.weight || 3}/5)`;
      if (def) {
        block += `\n  At ${skill.level} level, candidate should: ${def.level_descriptors[skill.level as SkillLevel] || def.level_descriptors.intermediate}`;
        if (def.sample_questions.length > 0) {
          // Give 2 sample questions for more variety
          const questions = def.sample_questions.slice(0, 2);
          block += `\n  Starting questions: ${questions.map(q => `"${q}"`).join(" OR ")}`;
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
    block += "Never ask these directly. Use behavioral anchoring: 'Tell me about a specific time when...' Then probe: 'What was the outcome? What would you do differently? How did the other person react?'\n\n";

    for (const skill of softSkills) {
      const def = allIndustrySkills.find(
        (s) => s.name.toLowerCase() === skill.skill.toLowerCase()
      );
      block += `• ${skill.skill} (expected: ${skill.level}${skill.required ? ", REQUIRED" : ""}, weight: ${skill.weight || 3}/5)`;
      if (def) {
        block += `\n  At ${skill.level} level: ${def.level_descriptors[skill.level as SkillLevel] || def.level_descriptors.intermediate}`;
        if (def.sample_questions.length > 0) {
          block += `\n  Try: "${def.sample_questions[0]}"`;
        }
      }
      block += "\n\n";
    }
  }

  if (customSkills.length > 0) {
    block += "--- Additional Skills ---\n";
    for (const skill of customSkills) {
      block += `• ${skill.skill} (expected: ${skill.level}${skill.required ? ", REQUIRED" : ""}) — find a natural moment to assess this\n`;
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
  switch (focus) {
    case "technical_only":
      return `Deep dive into ${hardCount} hard skills (${Math.max(10, hardCount * 3)} min). For each: start with a conceptual question, then a scenario, then push for tradeoffs and edge cases. Use Depth Calibration — if they ace the first question, go harder.`;

    case "behavioral_only":
      return `Focus on ${softCount} soft skills through behavioral scenarios. For each skill, get ONE specific story with context → action → result. Then probe: "What would you do differently?" and "How did that experience change your approach?"`;

    case "technical_and_behavioral":
    default:
      if (hardCount > 0 && softCount > 0) {
        return `Balance hard skills (${hardCount}) and soft skills (${softCount}). Spend ~60% on technical depth, ~40% on behavioral. Weave them naturally — a technical question can reveal communication skills, a behavioral question can reveal domain knowledge. Don't announce "now let's switch to behavioral questions."`;
      }
      if (hardCount > 0) {
        return `Assess the ${hardCount} hard skills in depth while naturally evaluating communication and collaboration through HOW they explain things.`;
      }
      return `Assess the ${softCount} soft skills through specific behavioral examples. For each, get a concrete story, not a theoretical answer.`;
  }
}

function buildCandidateContext(
  candidate: IndustryInterviewPromptInput["candidate"]
): string {
  let context = "CANDIDATE INTELLIGENCE (internal — use to guide questions, never reveal):\n";

  if (candidate.resume_text) {
    context += `\nRESUME:\n${candidate.resume_text}\n`;
  }

  if (candidate.github_context) {
    context += `\n${candidate.github_context}\n`;
  }

  if (candidate.strengths && candidate.strengths.length > 0) {
    context += `\nVERIFIED STRENGTHS (let them shine here): ${candidate.strengths.join(", ")}\n`;
  }

  if (candidate.concerns && candidate.concerns.length > 0) {
    context += `\nCONCERNS TO PROBE (explore gently, don't accuse): ${candidate.concerns.join(", ")}\n`;
  }

  if (candidate.suggested_topics && candidate.suggested_topics.length > 0) {
    context += `\nSUGGESTED DEEP-DIVE TOPICS: ${candidate.suggested_topics.join(", ")}\n`;
  }

  context += `\nHOW TO USE THIS INTELLIGENCE:
- When the candidate claims expertise in an area, check if it aligns with the data above
- Ask about specific projects/repos from their background to verify depth
- Use their strengths as conversation openers — it builds confidence before harder questions
- Probe concerns as curious exploration, not interrogation: "I noticed your background is more in X — how did you approach Y?"
- If their GitHub shows certain patterns (e.g., heavy use of a framework), ask about tradeoffs and alternatives they considered\n`;

  return context;
}

/**
 * Build the post-interview scoring prompt.
 * Uses industry-specific rubrics to evaluate the transcript
 * with evidence-based scoring that's more rigorous than human evaluation.
 */
export function buildInterviewScoringPrompt(
  input: IndustryInterviewPromptInput,
  transcript: string
): { systemPrompt: string; userPrompt: string } {
  const { job, candidate } = input;
  const industryId = job.industry || "general";

  const rubrics = buildSkillRubrics(
    job.skill_requirements.map((s) => ({ name: s.skill, level: s.level })),
    industryId
  );

  const systemPrompt = `You are an elite interview evaluator specializing in ${INDUSTRIES[industryId]?.label || "professional"} hiring. You evaluate with the rigor of a senior hiring committee — no hand-waving, every score needs evidence from the transcript.

You have advantages over human evaluators:
- You can recall every word of the transcript perfectly
- You apply the exact same standard to every candidate
- You detect inconsistencies between claimed and demonstrated knowledge
- You separate confident delivery from actual substance

You must respond with ONLY valid JSON matching the exact schema. No markdown, no explanation.`;

  const userPrompt = `Evaluate this interview for the "${job.title}" role.

CANDIDATE: ${candidate.name}
${candidate.strengths ? `PRE-INTERVIEW STRENGTHS: ${candidate.strengths.join(", ")}` : ""}
${candidate.concerns ? `PRE-INTERVIEW CONCERNS: ${candidate.concerns.join(", ")}` : ""}

SKILL REQUIREMENTS & RUBRICS:
${rubrics.map((r) => `- ${r.skill} (expected: ${r.expected_level}, weight: ${job.skill_requirements.find(s => s.skill === r.skill)?.weight || 3}/5): ${r.rubric}`).join("\n")}

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
      "evidence": "EXACT quote or close paraphrase from transcript that supports this score",
      "notes": "what this reveals about the candidate's actual ability",
      "depth_reached": "surface|working|deep|expert",
      "red_flags": ["any concerns from this skill area"],
      "green_flags": ["any positive signals"]
    }
  ],
  "hard_skill_average": <0-100>,
  "soft_skill_average": <0-100>,
  "recommendation": "strong_hire|hire|maybe|no_hire|strong_no_hire",
  "recommendation_reasoning": "3-4 sentences. Be specific about what tipped the decision.",
  "strengths": ["specific things the candidate demonstrated well, with evidence"],
  "areas_for_improvement": ["specific gaps, with what they said or failed to say"],
  "consistency_analysis": "Did the candidate's claims align with their demonstrated knowledge? Note any gaps between confidence and substance.",
  "key_moments": [{"timestamp_approx": "early/mid/late", "description": "moment that significantly influenced assessment", "impact": "positive|negative|neutral"}],
  "follow_up_questions": ["specific questions for a potential next round based on gaps identified"],
  "hiring_risk_factors": ["any risks the hiring team should be aware of"],
  "comparison_notes": "How does this candidate's demonstrated skill level compare to what's typically expected at the ${job.skill_requirements[0]?.level || 'intermediate'} level in ${INDUSTRIES[industryId]?.label || 'this field'}?"
}

SCORING CALIBRATION:
- 85-100: Exceptional. Candidate demonstrated expertise ABOVE the expected level. They taught YOU something. Reserve this for truly outstanding demonstrations.
- 70-84: Strong. Meets or slightly exceeds expectations. Gave specific examples with clear outcomes. Could do the job well from day one.
- 55-69: Adequate. Meets basic expectations but lacks depth. Answers were correct but generic. Would need ramp-up time.
- 40-54: Below expectations. Struggled with concepts at the expected level. Gave vague or theoretical answers. Significant gaps.
- Below 40: Does not meet requirements. Could not demonstrate the skill at a meaningful level.
- Weight required skills more heavily than nice-to-haves
- Weight skills by their weight value (1-5)
- Penalize confident but wrong answers more than humble uncertainty
- If a skill was not assessed during the interview, mark as "not_assessed" with score 0`;

  return { systemPrompt, userPrompt };
}
