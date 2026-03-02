import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getCompanyId(userId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("company_users")
    .select("company_id")
    .eq("user_id", userId)
    .single();
  return data?.company_id ?? null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companyId = await getCompanyId(user.id);
  if (!companyId) {
    return NextResponse.json({ error: "No company found" }, { status: 404 });
  }

  const admin = createAdminClient();
  const { data: job, error } = await admin
    .from("jobs")
    .select("*, applications(id, current_stage, match_score, match_breakdown)")
    .eq("id", id)
    .eq("company_id", companyId)
    .single();

  if (error || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const apps = job.applications as unknown as {
    id: string;
    current_stage: string;
    match_score: number | null;
    match_breakdown: { pass?: boolean } | null;
  }[] | null;

  const appList = Array.isArray(apps) ? apps : [];

  const stageCount: Record<string, number> = {};
  let totalScore = 0;
  let scoreCount = 0;
  let passedCount = 0;
  let screenedCount = 0;

  for (const app of appList) {
    const stage = app.current_stage || "applied";
    stageCount[stage] = (stageCount[stage] || 0) + 1;

    if (app.match_score != null) {
      totalScore += app.match_score;
      scoreCount++;
      screenedCount++;
      if (app.match_breakdown?.pass) passedCount++;
    }
  }

  return NextResponse.json({
    job: {
      ...job,
      applications: undefined,
      applicant_count: appList.length,
      stage_counts: stageCount,
      avg_score: scoreCount > 0 ? Math.round(totalScore / scoreCount) : null,
      pass_rate:
        screenedCount > 0
          ? Math.round((passedCount / screenedCount) * 100)
          : null,
      passed_count: stageCount.stage_1_passed || 0,
      interviewing_count:
        (stageCount.interview_invited || 0) +
        (stageCount.interview_completed || 0),
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companyId = await getCompanyId(user.id);
  if (!companyId) {
    return NextResponse.json({ error: "No company found" }, { status: 404 });
  }

  const body = await request.json();
  const admin = createAdminClient();

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  const allowed = [
    "title",
    "description",
    "department",
    "location",
    "employment_type",
    "status",
    "application_form_config",
    "github_required",
    "stage_config",
  ];
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  if (body.status === "active") {
    updates.published_at = new Date().toISOString();
  }

  const { data: job, error } = await admin
    .from("jobs")
    .update(updates)
    .eq("id", id)
    .eq("company_id", companyId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ job });
}
