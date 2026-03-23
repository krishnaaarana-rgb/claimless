import { NextRequest, NextResponse } from "next/server";
import { analyzeWithClaude } from "@/lib/claude/client";
import { INDUSTRIES } from "@/lib/industry-skills";

/**
 * POST /api/jobs/extract-skills
 * Extracts industry, skills, and metadata from a pasted job description.
 * Uses GPT-4o-mini for speed (this runs on paste, needs to be fast).
 */
export async function POST(request: NextRequest) {
  const { description } = await request.json();

  if (!description || description.length < 50) {
    return NextResponse.json({ error: "Description too short" }, { status: 400 });
  }

  // Build the list of known industries + skills for the prompt
  const industryList = Object.entries(INDUSTRIES).map(([id, def]) => ({
    id,
    label: def.label,
    skills: [...def.hard_skills.map((s) => s.name), ...def.soft_skills.map((s) => s.name)],
    niches: def.sub_niches.map((n) => ({ id: n.id, label: n.label })),
  }));

  const systemPrompt = `You are an expert at parsing job descriptions. Extract structured data from the given JD.

Available industries and their predefined skills:
${industryList.map((i) => `${i.id} (${i.label}): ${i.skills.join(", ")}\n  Niches: ${i.niches.map((n) => `${n.id}=${n.label}`).join(", ")}`).join("\n")}

Rules:
- Pick the BEST matching industry from the list above
- Pick a sub-niche if one clearly matches
- Extract skills from the JD. For each skill:
  - If it matches a predefined skill name (case-insensitive), use that exact name and set category to "hard_skill" or "soft_skill" based on the industry definition
  - If it's a new skill not in the predefined list, set category to "custom"
  - Set level based on context clues (e.g. "5+ years" = advanced/expert, "familiar with" = basic, "proficient" = intermediate)
  - Set required=true if the JD says "must have", "required", "essential", etc. Otherwise false
- Extract max 15 skills, prioritizing the most important ones
- Also extract department and location if mentioned

Return valid JSON only, no markdown.`;

  const userPrompt = `Extract skills from this job description:\n\n${description.slice(0, 6000)}`;

  try {
    const result = await analyzeWithClaude<{
      industry: string;
      industry_niche: string | null;
      skills: Array<{
        skill: string;
        category: "hard_skill" | "soft_skill" | "custom";
        level: "basic" | "intermediate" | "advanced" | "expert";
        required: boolean;
      }>;
      department: string | null;
      location: string | null;
    }>(systemPrompt, userPrompt, {
      maxTokens: 1500,
      temperature: 0,
      model: "openai/gpt-4o-mini",
    });

    // Validate industry exists
    const industry = result.industry in INDUSTRIES ? result.industry : null;

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
