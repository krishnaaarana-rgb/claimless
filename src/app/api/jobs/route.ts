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

export async function GET() {
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
  const { data: jobs, error } = await admin
    .from("jobs")
    .select("*, applications(id, current_stage, match_score, match_breakdown)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const result = (jobs || []).map((job) => {
    const apps = job.applications as unknown as {
      id: string;
      current_stage: string;
      match_score: number | null;
      match_breakdown: { pass?: boolean } | null;
    }[] | null;

    const appList = Array.isArray(apps) ? apps : [];
    const applicantCount = appList.length;

    // Count by stage
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

    return {
      ...job,
      applications: undefined,
      applicant_count: applicantCount,
      stage_counts: stageCount,
      avg_score: scoreCount > 0 ? Math.round(totalScore / scoreCount) : null,
      pass_rate: screenedCount > 0 ? Math.round((passedCount / screenedCount) * 100) : null,
      passed_count: stageCount.stage_1_passed || 0,
      interviewing_count: (stageCount.interview_invited || 0) + (stageCount.interview_completed || 0),
    };
  });

  return NextResponse.json({ jobs: result });
}

export async function POST(request: NextRequest) {
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

  if (!body.title || !body.description) {
    return NextResponse.json(
      { error: "Title and description are required" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const isDraft = body.status === "draft";

  const { data: job, error } = await admin
    .from("jobs")
    .insert({
      company_id: companyId,
      title: body.title,
      description: body.description,
      department: body.department || null,
      location: body.location || null,
      employment_type: body.employment_type || "full_time",
      stage_config: {
        stage_1_proof_of_work: true,
        stage_2_loom: false,
        stage_3_voice: true,
      },
      voice_interview_config: {
        max_duration_minutes: 30,
        focus_areas: [],
        custom_questions: [],
      },
      application_form_config: body.application_form_config || null,
      github_required: body.github_required ?? false,
      status: isDraft ? "draft" : "active",
      published_at: isDraft ? null : new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ job });
}
