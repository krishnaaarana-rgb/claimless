import { NextRequest, NextResponse } from "next/server";
import { analyzeWithClaude } from "@/lib/claude/client";
import { INDUSTRIES } from "@/lib/industry-skills";

/**
 * POST /api/jobs/extract-skills
 * Extracts industry, skills, and metadata from a pasted job description.
 * Uses GPT-4o-mini for speed.
 */
export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();

    if (!description || description.length < 50) {
      return NextResponse.json({ error: "Description too short" }, { status: 400 });
    }

    // Only send industry IDs + labels (not all skills — that bloats the prompt)
    const industryIds = Object.entries(INDUSTRIES).map(([id, def]) => `${id} (${def.label})`).join(", ");

    const systemPrompt = `You parse job descriptions and extract structured data. Return valid JSON only, no markdown.

Available industry IDs: ${industryIds}

Return this JSON structure:
{
  "industry": "one of the industry IDs above, or null",
  "industry_niche": "optional sub-specialization string or null",
  "skills": [
    { "skill": "Skill Name", "category": "hard_skill|soft_skill|custom", "level": "basic|intermediate|advanced|expert", "required": true/false }
  ],
  "department": "string or null",
  "location": "string or null"
}

Rules:
- Extract 5-15 skills from the JD, most important first
- category: use "hard_skill" for technical/tools, "soft_skill" for behavioral, "custom" for domain-specific
- level: "5+ years" → expert, "3+ years" → advanced, "experience with" → intermediate, "familiar" → basic
- required: true if "must have", "required", "essential"; false otherwise`;

    const result = await analyzeWithClaude<{
      industry: string | null;
      industry_niche: string | null;
      skills: Array<{
        skill: string;
        category: "hard_skill" | "soft_skill" | "custom";
        level: "basic" | "intermediate" | "advanced" | "expert";
        required: boolean;
      }>;
      department: string | null;
      location: string | null;
    }>(systemPrompt, description.slice(0, 4000), {
      maxTokens: 1500,
      temperature: 0,
      model: "openai/gpt-4o-mini",
    });

    // Validate industry exists in our taxonomy
    const industry = result.industry && result.industry in INDUSTRIES ? result.industry : null;

    // Add weight to skills
    const skills = (result.skills || []).map((s, i) => ({
      ...s,
      weight: Math.max(1, 5 - Math.floor(i / 3)),
    }));

    return NextResponse.json({
      industry,
      industry_niche: result.industry_niche,
      skills,
      department: result.department,
      location: result.location,
    });
  } catch (err) {
    console.error("[extract-skills] Failed:", err);
    return NextResponse.json({ error: "Failed to extract skills" }, { status: 500 });
  }
}
