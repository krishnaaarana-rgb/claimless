import { NextResponse } from "next/server";
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
  const admin = createAdminClient();

  let query = admin
    .from("applications")
    .select(
      `
      id,
      candidate_id,
      current_stage,
      stage_1_score,
      match_score,
      match_breakdown,
      status,
      created_at,
      candidates (id, full_name, email, github_username),
      jobs (title)
    `
    )
    .order("created_at", { ascending: false });

  if (companyId) {
    query = query.eq("company_id", companyId);
  }

  const { data: applications, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  type StageKey = "applied" | "stage_1_passed" | "interview_invited" | "interview_completed" | "rejected";
  const columns: Record<StageKey, unknown[]> = {
    applied: [],
    stage_1_passed: [],
    interview_invited: [],
    interview_completed: [],
    rejected: [],
  };

  for (const app of applications || []) {
    const candidate = app.candidates as unknown as Record<string, unknown> | null;
    const job = app.jobs as unknown as Record<string, unknown> | null;

    const entry = {
      application_id: app.id,
      candidate_id: app.candidate_id,
      full_name: candidate?.full_name ?? null,
      email: candidate?.email ?? null,
      github_username: candidate?.github_username ?? null,
      stage_1_score: app.stage_1_score,
      match_score: app.match_score ?? null,
      match_breakdown: app.match_breakdown ?? null,
      status: app.status,
      current_stage: app.current_stage,
      created_at: app.created_at,
      job_title: job?.title ?? null,
    };

    const stage = app.current_stage as string;

    // Map stages to columns
    if (stage === "applied" || stage === "pending_review" || stage === "screening") {
      columns.applied.push(entry);
    } else if (stage === "stage_1_passed") {
      columns.stage_1_passed.push(entry);
    } else if (stage === "interview_invited") {
      columns.interview_invited.push(entry);
    } else if (stage === "interview_completed" || stage === "hired") {
      columns.interview_completed.push(entry);
    } else if (stage === "rejected" || stage === "stage_1_failed") {
      columns.rejected.push(entry);
    } else {
      // Unknown stage — put in applied
      columns.applied.push(entry);
    }
  }

  return NextResponse.json({ columns });
}
