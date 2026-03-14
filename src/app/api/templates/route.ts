import { NextRequest, NextResponse } from "next/server";
import { getTemplates, getTemplate, ALL_TEMPLATES } from "@/lib/templates";
import type { TemplateCategory } from "@/lib/templates";

/**
 * GET /api/templates
 * List all templates, optionally filtered by category and/or industry.
 *
 * Query params:
 *   ?category=email|loom_prompt|job_description|interview_questions|api_payload|automation_workflow
 *   ?industry=healthcare|sales|technology|...
 *   ?id=template_id (get a single template)
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const id = url.searchParams.get("id");

  if (id) {
    const template = getTemplate(id);
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    return NextResponse.json({ template });
  }

  const category = url.searchParams.get("category") as TemplateCategory | null;
  const industry = url.searchParams.get("industry") || undefined;

  const templates = getTemplates(category || undefined, industry);

  // Build category counts
  const categoryCounts: Record<string, number> = {};
  for (const t of ALL_TEMPLATES) {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  }

  return NextResponse.json({
    templates,
    total: templates.length,
    categories: categoryCounts,
  });
}
