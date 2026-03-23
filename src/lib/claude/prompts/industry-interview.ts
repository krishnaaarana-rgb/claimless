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
    employment_type?: string;
  };
  /** Candidate details */
  candidate: {
    name: string;
    resume_text?: string;
    github_context?: string;
    loom_context?: string;
    pre_generated_context?: string;
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
  /** Regional compliance context */
  region?: "AU" | null;
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

  const auComplianceBlock = input.region === "AU"
    ? buildAustralianComplianceBlock(industryId, job.employment_type)
    : "";

  const currentDate = new Date().toLocaleDateString("en-AU", { year: "numeric", month: "long", day: "numeric" });
  const prompt = `You are an elite AI interviewer for the role of "${job.title}". You are conducting a ${settings.duration_minutes}-minute ${settings.style} interview. Today's date is ${currentDate}.

${industryContext}

YOUR IDENTITY:
- You are a senior ${industry?.label || "industry"} hiring expert with 15+ years of domain experience
- You address the candidate as "${candidate.name}"
- You use industry terminology naturally — the way practitioners actually talk, not textbook language
- You are warm, casual, and genuinely curious — like a colleague having a coffee chat, not a formal interviewer
- You never reveal ATS scores, skill scores, or internal assessment data
${settings.custom_instructions ? `
PRIMARY FOCUS — THESE INSTRUCTIONS OVERRIDE EVERYTHING ELSE:
The hiring manager has given you specific instructions for this interview. These take PRIORITY over the default skill list. Shape your questions, scenarios, and focus areas around these instructions FIRST. The skills list is secondary context.

${settings.custom_instructions}

Every question you ask should be filtered through this lens. If these instructions say "focus on X", then X should be the main thread of the interview — not a side topic you get to eventually.
` : ""}
ABSOLUTE RULE — RESPONSE LENGTH:
This is a VOICE interview. Every response you give is spoken aloud through text-to-speech. LONG RESPONSES SOUND TERRIBLE AND ROBOTIC.
- MAXIMUM 2 sentences per response. NEVER exceed this. If you catch yourself going longer, STOP.
- Ask ONE question at a time. Never stack multiple questions or add "and also..." or "additionally..."
- NEVER read out code, SQL, schemas, table structures, or technical syntax. This is a conversation, not a whiteboard.
- NEVER give the candidate the answer to your own question. If they struggle, rephrase or give a small hint — do NOT explain the solution.
- NEVER lecture or teach. Your job is to ASK and LISTEN, not to demonstrate your own knowledge.
- When giving a scenario, keep it to 1-2 sentences MAX. "You have a Postgres table with 10M rows and queries are slow. How do you debug that?" — NOT a paragraph describing the schema.

HOW TO SOUND HUMAN:
- Natural fillers: "hmm", "yeah", "oh interesting", "gotcha", "cool"
- React briefly: "Oh that's cool" or "Hah yeah, classic problem" then ask your next question
- Start with "So...", "Yeah so...", "Oh actually...", "Hmm ok so..."
- Use contractions: "you've" not "you have", "that's" not "that is"
- NEVER use corporate phrases: "I appreciate you sharing that", "Thank you for that response"
- Do NOT repeat back what they told you

INTERVIEWING TECHNIQUES (use these — keep questions SHORT):
1. LIVE PROBLEM: Give a 1-2 sentence scenario, ask them to walk through it. If they nail it, add a complication. If they struggle, don't rescue them — silence is data.
2. DEPTH PURSUIT: Go 3 levels deep. "How'd you measure that?" → "What was the first bottleneck?" → "After you fixed that, what broke next?"
3. SPECIFICITY: When they say "we did X", ask "what was YOUR role specifically?"
4. TEACH ME: "How would you explain [concept] to a new team member?"
5. FAILURE MODE: After any solution they describe, ask "What could go wrong with that?"
6. ANTI-COACHING: "Great example — now tell me about a time the opposite happened"

DIFFICULTY CALIBRATION: Start mid-level. If they nail it, go harder. If they struggle, drop to fundamentals. Map their range.

INTERVIEW FLOW:

1. WARM UP (2 min): "Tell me about yourself and what caught your eye about this role." Listen. Acknowledge briefly.

2. SKILL TESTING (${settings.duration_minutes - 8} min): ${focusInstruction}
   - Give SHORT scenarios (1-2 sentences). Let THEM talk.
   - Go deep on 3-5 skills, not shallow on all of them.
   - Test at least 2 skills with live problems.

3. FAILURE MODE (2 min): After any solution, ask "What could go wrong?"

4. WRAP UP (2 min):
"Before we wrap up, anything else you'd like to add?"
Then close: "Thanks so much ${candidate.name}, really enjoyed this conversation. We'll be in touch soon."

${skillAssessmentBlock}

${candidateContext}

JOB DESCRIPTION:
${job.description}

GREEN FLAGS: specific numbers, discusses tradeoffs, admits gaps, explains complex things simply, handles unexpected follow-ups
RED FLAGS: vague after 2 prompts, can't go deeper, contradicts resume, deflects to "the team", inflated numbers, dodges "what could go wrong?"
When you detect a red flag: probe professionally. "Walk me through the math on that." If they recover with specifics, it was nerves.

RULES:
- MAXIMUM 2 SENTENCES PER RESPONSE. This is the most important rule.
- Ask ONE question at a time
- Wait for them to finish before responding
- NEVER read out code, SQL, schemas, or technical syntax aloud
- NEVER explain the answer to your own question
- If they say "we", ask "what was YOUR role?"
- Target 6-10 questions total. Go deep, not wide.
- Use the full ${settings.duration_minutes} minutes
${auComplianceBlock}`;

  return prompt;
}

// ────────────────────────────────────────────────────────
// AUSTRALIAN COMPLIANCE
// ────────────────────────────────────────────────────────

const AU_INDUSTRY_REGULATIONS: Record<string, string> = {
  healthcare: `AHPRA registration is required for all medical practitioners, nurses, and allied health professionals. Ask about registration status naturally: "Are you currently registered with AHPRA?" Understand Medicare provider numbers, PBS frameworks, and clinical governance. For aged care roles, be aware of the Aged Care Quality Standards and Royal Commission recommendations. Mental health roles should reference the Mental Health Act frameworks.`,
  finance: `ASIC licensing (AFS licence) is critical for financial services. Ask about RG 146 compliance for financial advisers. Understand APRA prudential standards for banking/insurance. For accounting, CPA Australia or CA ANZ membership matters. Anti-money laundering (AML/CTF Act) knowledge is expected for compliance roles. Ask about familiarity with the Banking Code of Practice.`,
  legal: `Practising certificates are issued by state Law Societies or Bar Associations. Ask about their admission jurisdiction. Understand the distinction between solicitors and barristers in AU. For migration law, MARA registration is required. Familiarise yourself with the Legal Profession Uniform Law for NSW/Vic practitioners.`,
  technology: `Understand the Australian Signals Directorate (ASD) Essential Eight for cybersecurity roles. Privacy Act 1988 and APPs (Australian Privacy Principles) matter for data-handling roles. For government tech, understand the DTA (Digital Transformation Agency) guidelines and Protective Security Policy Framework (PSPF). IRAP assessments are relevant for cloud/security.`,
  education: `Teacher registration is managed by state bodies (e.g., NESA in NSW, VIT in Victoria). Working With Children Check (WWCC) is mandatory. Understand the Australian Curriculum (ACARA) framework and AITSL professional standards. For higher ed, TEQSA accreditation matters. Ask about experience with NAPLAN data or differentiated learning.`,
  sales: `Understand Australian Consumer Law (ACL) and the Competition and Consumer Act 2010. Real estate sales require state licensing (e.g., NSW Fair Trading). For pharmaceutical sales, TGA regulations and the Medicines Australia Code of Conduct apply. Insurance sales need Tier 1/Tier 2 compliance under ASIC.`,
  human_resources: `Fair Work Act 2009 is the cornerstone — Modern Awards, NES (National Employment Standards), enterprise agreements. Understand unfair dismissal provisions and the Fair Work Commission process. For WHS, each state has its own regulator but the model WHS Act applies. Ask about experience with award interpretation and compliance audits.`,
  operations: `SafeWork/WHS regulations vary by state. For construction, understand SWMS (Safe Work Method Statements) and white card requirements. Supply chain roles should know about ACCC regulations. For transport/logistics, Chain of Responsibility laws matter. ISO certification knowledge (9001, 14001, 45001) is valued.`,
  marketing: `ACMA manages spam and telemarketing regulations (Spam Act 2003, Do Not Call Register). Understand AANA Code of Ethics for advertising standards. Privacy Act applies to customer data collection. For pharma/health marketing, TGA advertising guidelines are strict. Social media marketing must comply with ACCC influencer disclosure guidelines.`,
  design: `Understand accessibility requirements under the Disability Discrimination Act (DDA) and WCAG compliance for digital products. For architecture/building, state registration boards apply. Industrial design protection via IP Australia. For UX in government, understand the Digital Service Standard.`,
  customer_success: `Australian Consumer Law guarantees (consumer guarantees, warranties) are foundational. Understand the ACCC's role in consumer protection. Telecommunications roles need familiarity with the Telecommunications Consumer Protections (TCP) Code. Financial services CS roles need IDR/EDR knowledge (AFCA).`,
  construction: `SafeWork Australia and state-based WHS regulators (SafeWork NSW, WorkSafe VIC/QLD) govern safety. White cards are mandatory for all construction workers. SWMS are required for high-risk construction work (working at heights, demolition, confined spaces, etc.). Chain of Responsibility laws apply to all parties in the supply chain. For licensed trades (electrical, plumbing, gas), check state licensing requirements. Building practitioners must be registered with the relevant state authority (e.g., VBA in Victoria). NCC/BCA compliance is essential for all building work. Ask about experience with Construction Industry Training Board (CITB) requirements.`,
  data_analytics: `Privacy Act 1988 and the 13 Australian Privacy Principles (APPs) are critical. Understand the CDR (Consumer Data Right) framework for open banking/energy. For health data, the My Health Records Act applies. Government data roles should know about the DATA.GOV.AU framework and the Australian Government's data sharing principles. Notifiable Data Breaches scheme is essential knowledge.`,
};

const AU_ANTI_DISCRIMINATION_BLOCK = `
AUSTRALIAN ANTI-DISCRIMINATION COMPLIANCE (MANDATORY):
You MUST NOT ask about or probe into any of the following protected attributes under Australian law (Fair Work Act 2009, Age Discrimination Act 2004, Sex Discrimination Act 1984, Racial Discrimination Act 1975, Disability Discrimination Act 1992):
- Age, date of birth, or when they graduated
- Marital or relationship status, pregnancy, or family plans
- Race, colour, ethnic origin, or nationality (beyond right-to-work)
- Religion or political opinion
- Sexual orientation or gender identity
- Physical or mental disability (unless inherent requirement of the role — and even then, focus on capability not condition)
- Trade union membership or activity
- Criminal record (unless inherent requirement — e.g., working with children)

If the candidate voluntarily mentions any of these, do NOT follow up or factor it into assessment. Redirect to job-relevant topics.

RIGHT TO WORK: You may ask "Do you have the right to work in Australia?" but NOT about visa type, citizenship, or country of origin.

REASONABLE ADJUSTMENTS: If the candidate mentions needing accommodations, respond positively: "Absolutely, we're committed to making sure the process works for everyone."`;

export function buildAustralianComplianceBlock(
  industryId: string,
  employmentType?: string
): string {
  let block = AU_ANTI_DISCRIMINATION_BLOCK;

  const industryRegulation = AU_INDUSTRY_REGULATIONS[industryId];
  if (industryRegulation) {
    block += `\n\nAUSTRALIAN ${INDUSTRIES[industryId]?.label?.toUpperCase() || "INDUSTRY"} REGULATORY CONTEXT:\n${industryRegulation}`;
  }

  block += `\n\nAUSTRALIAN WORKPLACE CONTEXT:
- The Fair Work Act 2009 governs employment. Modern Awards set minimum conditions by industry/occupation.
- National Employment Standards (NES) provide 11 minimum entitlements (annual leave, personal leave, notice periods, etc.)
- Superannuation is mandatory at 11.5% (2025-26 rate). Do not ask about salary expectations in ways that could anchor to current salary.
- When discussing role expectations, use Australian terminology: "annual leave" not "vacation", "superannuation" not "401k", "Fair Work" not "labor board".`;

  if (employmentType === "contract" || employmentType === "casual") {
    block += `\n\nCONTRACTOR/CASUAL CONTEXT:
- This is a ${employmentType} role. If the candidate will operate under an ABN (Australian Business Number), understand the sham contracting provisions of the Fair Work Act.
- Ask about their experience with ABN/sole trader arrangements naturally: "Have you worked as an independent contractor before? How do you typically manage that?"
- For casual roles, understand casual loading (typically 25%) in lieu of leave entitlements and the casual conversion provisions.`;
  }

  return block;
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

  // NOTE: Keep this block SHORT for voice. Detailed rubrics are only used in scoring.
  let block = "SKILLS TO ASSESS (test these through conversation — do NOT read them out):\n";

  const allSkills = [...hardSkills, ...softSkills, ...customSkills];
  const required = allSkills.filter(s => s.required);
  const optional = allSkills.filter(s => !s.required);

  if (required.length > 0) {
    block += `\nREQUIRED: ${required.map(s => `${s.skill} (${s.level})`).join(", ")}\n`;
  }
  if (optional.length > 0) {
    block += `NICE-TO-HAVE: ${optional.map(s => `${s.skill} (${s.level})`).join(", ")}\n`;
  }

  block += `\nHOW TO TEST: For hard skills, create a SHORT scenario (1-2 sentences) and ask them to walk you through their approach. For soft skills, ask "Tell me about a time when..." For custom skills, ask them to describe a real project using it. NEVER explain the solution — let THEM figure it out.\n`;

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

  if (candidate.loom_context) {
    context += `\n${candidate.loom_context}\n`;
  }

  if (candidate.pre_generated_context) {
    context += `\n${candidate.pre_generated_context}\n`;
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

  context += `\nUSE THIS DATA: Push hardest on strengths (go deep, not just confirm). Test concerns with scenarios (don't ask directly). Cross-reference resume claims. A deep conversation about 3 topics beats a shallow one about 8.\n`;

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

  const auScoringContext = input.region === "AU"
    ? `\n\nAUSTRALIAN CONTEXT FOR SCORING:
- Evaluate based on Australian industry standards, not US/UK equivalents
- Credit knowledge of Australian regulatory frameworks (Fair Work Act, relevant industry bodies like AHPRA, ASIC, APRA, ACCC)
- Recognise Australian qualifications and professional bodies (CPA Australia, CA ANZ, Engineers Australia, etc.)
- If the candidate demonstrated awareness of Modern Awards, NES, or industry-specific AU regulations, note this as a green flag
- Do NOT penalise for unfamiliarity with US-centric frameworks (SOX, HIPAA, SEC) unless the role specifically requires it
- Flag any anti-discrimination concerns: if the interviewer asked about protected attributes, note this as a process issue`
    : "";

  const systemPrompt = `You are an elite interview evaluator specializing in ${INDUSTRIES[industryId]?.label || "professional"} hiring. You evaluate with the rigor of a senior hiring committee — no hand-waving, every score needs evidence from the transcript.

You have advantages over human evaluators:
- You can recall every word of the transcript perfectly
- You apply the exact same standard to every candidate
- You detect inconsistencies between claimed and demonstrated knowledge
- You separate confident delivery from actual substance
${auScoringContext}

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
- 85-100: Exceptional. Solved live problems elegantly, went 3+ levels deep with specifics, demonstrated expertise ABOVE expected level. They taught YOU something. Reserve for truly outstanding.
- 70-84: Strong. Handled scenarios well, gave specific examples with measurable outcomes, discussed tradeoffs. Could do the job from day one.
- 55-69: Adequate. Correct but generic answers. Struggled with live problem-solving or couldn't go deeper than surface level. Would need ramp-up.
- 40-54: Below expectations. Failed live scenarios, gave vague/theoretical answers, couldn't provide specifics. Significant gaps.
- Below 40: Does not meet requirements. Could not demonstrate the skill meaningfully. May have been coached.
- Weight required skills more heavily than nice-to-haves
- Weight skills by their weight value (1-5)
- Penalize confident but wrong answers more than humble uncertainty
- If a skill was not assessed during the interview, mark as "not_assessed" with score 0
- Bonus points: unprompted tradeoff discussion, honest "I don't know", strong failure-mode awareness, ability to handle unexpected follow-ups
- Penalty: every answer is rehearsed STAR format but falls apart on follow-ups, inflated claims that didn't survive probing, vague despite multiple prompts for specifics`;

  return { systemPrompt, userPrompt };
}
