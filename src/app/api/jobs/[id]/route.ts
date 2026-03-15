import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildIndustryInterviewContext } from "@/lib/industry-skills";

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
    .select("*, applications(id, current_stage, match_score, match_breakdown, application_form_data)")
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
    application_form_data: Record<string, unknown> | null;
  }[] | null;

  const appList = Array.isArray(apps) ? apps : [];

  const stageCount: Record<string, number> = {};
  let totalScore = 0;
  let scoreCount = 0;
  let passedCount = 0;
  let screenedCount = 0;
  let totalIvScore = 0;
  let ivScoreCount = 0;
  let ivInvitedCount = 0;
  let ivCompletedCount = 0;

  for (const app of appList) {
    const stage = app.current_stage || "applied";
    stageCount[stage] = (stageCount[stage] || 0) + 1;

    if (app.match_score != null) {
      totalScore += app.match_score;
      scoreCount++;
      screenedCount++;
      if (app.match_breakdown?.pass) passedCount++;
    }

    // Interview metrics
    if (stage === "interview_invited" || stage === "interview_completed" || stage === "hired") {
      ivInvitedCount++;
    }
    const scoring = app.application_form_data?.interview_scoring as {
      overall_score?: number;
      interview_score?: number;
    } | null | undefined;
    const ivScore = scoring?.overall_score ?? scoring?.interview_score;
    if (ivScore != null) {
      totalIvScore += ivScore;
      ivScoreCount++;
      ivCompletedCount++;
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
      avg_interview_score: ivScoreCount > 0 ? Math.round(totalIvScore / ivScoreCount) : null,
      interview_completion_rate: ivInvitedCount > 0 ? Math.round((ivCompletedCount / ivInvitedCount) * 100) : null,
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
    "industry",
    "industry_niche",
    "skill_requirements",
    "attachments",
  ];
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  // Re-generate industry interview context when industry changes
  if (body.industry !== undefined) {
    updates.industry_interview_context = body.industry
      ? buildIndustryInterviewContext(body.industry, body.industry_niche || undefined)
      : null;
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
