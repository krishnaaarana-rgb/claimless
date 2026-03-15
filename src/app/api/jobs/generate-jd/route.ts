import { NextRequest, NextResponse } from "next/server";
import { generateTextWithClaude } from "@/lib/claude/client";
import { INDUSTRIES } from "@/lib/industry-skills";

/**
 * POST /api/jobs/generate-jd
 * Generate a job description using AI, optimised for ATS screening and voice interview.
 *
 * Body: { title, industry?, skills?, notes? }
 */
export async function POST(request: NextRequest) {
  const { title, industry, skills, notes } = await request.json();

  if (!title) {
    return NextResponse.json({ error: "Job title is required" }, { status: 400 });
  }

  const industryDef = industry ? INDUSTRIES[industry] : null;
  const industryLabel = industryDef?.label || "";

  // Build skill context for the prompt
  let skillContext = "";
  if (skills && Array.isArray(skills) && skills.length > 0) {
    skillContext = `\nThe role requires these specific skills (include them naturally in the description):\n${skills.map((s: { skill: string; level: string; required: boolean }) => `- ${s.skill} (${s.level}${s.required ? ", required" : ", nice-to-have"})`).join("\n")}`;
  }

  const systemPrompt = `You are an expert recruitment copywriter. Write job descriptions that are:
1. Clear and specific — describe what the person will actually DO, not corporate jargon
2. Structured for AI screening — include measurable requirements, specific tools/technologies, and clear seniority signals so an AI can accurately match candidates
3. Structured for AI interviews — include enough context about the role's challenges and day-to-day so an AI interviewer can generate relevant scenarios and probe the right areas
4. Honest about what matters — separate "must have" from "nice to have"
5. Written in second person ("you'll" not "the successful candidate will")

Do NOT use:
- Corporate buzzwords ("synergy", "leverage", "dynamic environment")
- Vague requirements ("strong communication skills" without context)
- Unrealistic wish lists (don't ask for 10 years of experience in a 3-year-old technology)

DO include:
- What they'll actually work on in the first 90 days
- What tools/technologies they'll use daily
- What the team looks like and who they report to
- What success looks like in this role
- Specific challenges they'll face (this helps the AI interviewer generate better scenarios)`;

  const userPrompt = `Write a job description for: ${title}
${industryLabel ? `Industry: ${industryLabel}` : ""}
${skillContext}
${notes ? `\nAdditional context from the hiring manager:\n${notes}` : ""}

Format the output as a complete job description. Do NOT include a title header (the system adds that separately). Start directly with the role overview.

Write in plain text, not markdown. Use line breaks between sections. Keep it under 800 words.`;

  try {
    const description = await generateTextWithClaude(systemPrompt, userPrompt, {
      maxTokens: 2048,
      temperature: 0.7,
    });

    return NextResponse.json({ description: description.trim() });
  } catch (err) {
    console.error("[generate-jd] Failed:", err);
    return NextResponse.json({ error: "Failed to generate JD" }, { status: 500 });
  }
}
