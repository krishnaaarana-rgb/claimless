import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth/api-key";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
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

  const params = request.nextUrl.searchParams;
  const jobId = params.get("job_id");
  const stage = params.get("stage");
  const limit = Math.min(parseInt(params.get("limit") || "50"), 100);
  const offset = parseInt(params.get("offset") || "0");

  const supabase = createAdminClient();

  let query = supabase
    .from("applications")
    .select(
      `
      id,
      stage,
      fit_score,
      screening_status,
      created_at,
      candidates!inner (
        id,
        full_name,
        email,
        github_url,
        linkedin_url,
        personal_website_url
      ),
      jobs!inner (
        id,
        title
      )
    `,
      { count: "exact" }
    )
    .eq("jobs.company_id", companyId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (jobId) query = query.eq("job_id", jobId);
  if (stage) query = query.eq("stage", stage);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const candidates = (data || []).map((app) => {
    const candidate = app.candidates as unknown as Record<string, unknown>;
    const job = app.jobs as unknown as Record<string, unknown>;
    return {
      application_id: app.id,
      candidate_id: candidate.id,
      full_name: candidate.full_name,
      email: candidate.email,
      github_url: candidate.github_url,
      linkedin_url: candidate.linkedin_url,
      website_url: candidate.personal_website_url,
      job_id: job.id,
      job_title: job.title,
      stage: app.stage,
      fit_score: app.fit_score,
      screening_status: app.screening_status,
      applied_at: app.created_at,
    };
  });

  return NextResponse.json({
    candidates,
    total: count || 0,
    limit,
    offset,
  });
}
