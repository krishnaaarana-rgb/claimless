import { NextRequest, NextResponse } from "next/server";
import {
  getIndustryList,
  getIndustrySkillsWithNiche,
  buildIndustryInterviewContext,
  INDUSTRIES,
} from "@/lib/industry-skills";

/**
 * GET /api/industries
 * Returns the industry list and optionally skills for a specific industry.
 *
 * Query params:
 *   ?industry=healthcare          → returns skills for healthcare
 *   ?industry=healthcare&niche=nursing → returns skills + niche additions
 *   (no params)                   → returns just the industry list
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const industryId = searchParams.get("industry");
  const nicheId = searchParams.get("niche");

  // If no industry specified, return the list
  if (!industryId) {
    return NextResponse.json({
      industries: getIndustryList(),
    });
  }

  // Validate industry exists
  const industry = INDUSTRIES[industryId];
  if (!industry) {
    return NextResponse.json(
      { error: `Unknown industry: ${industryId}` },
      { status: 400 }
    );
  }

  // Return industry details with skills
  const skills = getIndustrySkillsWithNiche(
    industryId,
    nicheId || undefined
  );

  return NextResponse.json({
    industry: {
      id: industry.id,
      label: industry.label,
      icon: industry.icon,
      description: industry.description,
    },
    sub_niches: industry.sub_niches.map((n) => ({
      id: n.id,
      label: n.label,
    })),
    hard_skills: skills.hard_skills.map((s) => ({
      name: s.name,
      description: s.description,
      category: s.category,
    })),
    soft_skills: skills.soft_skills.map((s) => ({
      name: s.name,
      description: s.description,
      category: s.category,
    })),
    niche_skills: skills.niche_skills,
    interview_context_preview: buildIndustryInterviewContext(
      industryId,
      nicheId || undefined
    ),
  });
}
