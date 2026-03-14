/**
 * Loom video analysis prompt.
 *
 * Analyses the transcript of a candidate's Loom submission for
 * communication clarity, confidence, technical depth, and relevance.
 * Generalised for any role/industry — not hardcoded to a specific company.
 */

export interface LoomAnalysisInput {
  candidateName: string;
  jobTitle: string;
  jobDescription: string;
  transcript: string;
  durationSeconds: number | null;
}

export function buildLoomAnalysisPrompt(input: LoomAnalysisInput): {
  systemPrompt: string;
  userPrompt: string;
} {
  const systemPrompt = `You are a hiring analyst evaluating a candidate's video introduction. You assess communication skills, professionalism, and whether the candidate demonstrates genuine understanding of their claimed experience.

You must respond with ONLY valid JSON matching the exact schema. No markdown, no explanation.`;

  const userPrompt = `Analyse this video transcript from ${input.candidateName} applying for the "${input.jobTitle}" role.

JOB CONTEXT:
${input.jobDescription}

VIDEO TRANSCRIPT:
${input.transcript}

${input.durationSeconds ? `Video duration: ${Math.round(input.durationSeconds / 60)} minutes` : ""}

EVALUATION CRITERIA:

1. COMMUNICATION CLARITY (0-10)
- Are ideas expressed clearly and concisely?
- Is there a logical flow?
- Do they give concrete examples or stay vague?
- Appropriate pacing — not rushed, not rambling?

2. CONFIDENCE & PRESENCE (0-10)
- Comfortable with the material (not reading a script)?
- Appropriate energy — genuine, not performative?
- Self-assured without arrogance?

3. TECHNICAL DEPTH (0-10)
- Do they go beyond surface-level when discussing their work?
- Do they mention specific tools, methods, outcomes, numbers?
- Can they explain WHY they made decisions, not just WHAT they did?

4. RELEVANCE TO ROLE (0-10)
- Do they address what's relevant for this specific role?
- Do they show understanding of what the job actually requires?
- Do they connect their experience to the role's needs?

RED FLAGS TO CHECK:
- Speaks negatively about past employers
- Makes claims that sound inflated or unverifiable
- Very short (<1 min) or very long (>5 min) — poor judgement on communication
- Generic talking points that could apply to any job
- Focuses only on what they want, not what they bring

GREEN FLAGS TO NOTE:
- Specific examples with outcomes/numbers
- Self-awareness about growth areas
- Shows they researched the role/company
- Explains complex things simply
- Mentions proof of work (portfolio, projects, results)

Produce a JSON object:
{
  "communication_clarity_score": <0-10>,
  "confidence_score": <0-10>,
  "technical_depth_score": <0-10>,
  "relevance_score": <0-10>,
  "overall_score": <0-10>,
  "summary": "2-3 sentence assessment of the candidate's video",
  "strengths": ["specific things they did well, with evidence from transcript"],
  "concerns": ["specific concerns, with evidence"],
  "key_quotes": ["2-3 short paraphrased quotes from the transcript (use single quotes inside, no special characters)"]
}

CRITICAL: Your response must be valid JSON. Do not use double quotes inside string values — use single quotes instead. Do not use special characters, em-dashes, or curly quotes.

SCORING:
- 8-10: Exceptional. Clear, specific, demonstrates real expertise. Move to interview.
- 6-7: Good. Solid communication, some depth. Worth progressing.
- 4-5: Adequate but concerns. Generic, surface-level, or unclear.
- Below 4: Significant issues. Poor communication or red flags.

Be fair but discerning. We want candidates who can communicate clearly and back up their claims with specifics.`;

  return { systemPrompt, userPrompt };
}
