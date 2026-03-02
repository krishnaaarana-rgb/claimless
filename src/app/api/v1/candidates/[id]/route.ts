import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth/api-key";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header" },
      { status: 401 }
    );
  }

  const { valid, companyId } = await validateApiKey(
    authHeader.replace("Bearer ", "")
  );
  if (!valid || !companyId) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();

  // Fetch application with candidate and job data
  const { data: app, error } = await supabase
    .from("applications")
    .select(
      `
      id,
      stage,
      fit_score,
      screening_status,
      screening_result,
      ai_summary,
      created_at,
      candidates (
        id,
        full_name,
        email,
        github_url,
        linkedin_url,
        personal_website_url,
        verified_skills,
        github_stats
      ),
      jobs!inner (
        id,
        title,
        company_id
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !app) {
    return NextResponse.json(
      { error: "Candidate application not found" },
      { status: 404 }
    );
  }

  const job = app.jobs as unknown as { id: string; title: string; company_id: string };
  if (job.company_id !== companyId) {
    return NextResponse.json(
      { error: "Candidate application not found" },
      { status: 404 }
    );
  }

  const candidate = app.candidates as unknown as Record<string, unknown>;

  return NextResponse.json({
    application_id: app.id,
    candidate_id: candidate.id,
    full_name: candidate.full_name,
    email: candidate.email,
    github_url: candidate.github_url,
    linkedin_url: candidate.linkedin_url,
    website_url: candidate.personal_website_url,
    verified_skills: candidate.verified_skills,
    github_stats: candidate.github_stats,
    job_id: job.id,
    job_title: job.title,
    stage: app.stage,
    fit_score: app.fit_score,
    screening_status: app.screening_status,
    screening_result: app.screening_result,
    ai_summary: app.ai_summary,
    applied_at: app.created_at,
  });
}
