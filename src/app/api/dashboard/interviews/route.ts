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

export interface InterviewScoring {
  overall_score?: number;
  interview_score?: number;
  overall_impression?: string;
  communication_score?: number;
  technical_score?: number;
  cultural_fit_score?: number;
  confidence_score?: number;
  strengths?: string[];
  areas_for_improvement?: string[];
  key_moments?: { timestamp_approx: string; description: string; impact?: string }[];
  recommendation?: string;
  recommendation_reasoning?: string;
  follow_up_questions?: string[];
  hiring_risk_factors?: string[];
  consistency_analysis?: string;
}

export interface InterviewRecord {
  application_id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string | null;
  job_id: string;
  job_title: string;
  current_stage: string;
  applied_at: string;
  interview_scoring: InterviewScoring | null;
  interview_transcript: string | null;
  interview_recording_url: string | null;
  interview_started_at: string | null;
  interview_ended_at: string | null;
  interview_summary: string | null;
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

  const { data: applications, error } = await admin
    .from("applications")
    .select(
      `
      id,
      candidate_id,
      current_stage,
      status,
      created_at,
      application_form_data,
      job_id,
      candidates (id, full_name, email),
      jobs (id, title)
    `
    )
    .eq("company_id", companyId)
    .in("current_stage", ["interview_completed", "interview_invited", "hired"])
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const interviews: InterviewRecord[] = (applications || []).map((app) => {
    const candidate = app.candidates as unknown as {
      id: string;
      full_name: string | null;
      email: string | null;
    } | null;
    const job = app.jobs as unknown as {
      id: string;
      title: string;
    } | null;
    const formData = app.application_form_data as Record<string, unknown> | null;

    const scoring = (formData?.interview_scoring as InterviewScoring) ?? null;

    return {
      application_id: app.id,
      candidate_id: candidate?.id ?? app.candidate_id,
      candidate_name: candidate?.full_name ?? "Unknown",
      candidate_email: candidate?.email ?? null,
      job_id: job?.id ?? app.job_id,
      job_title: job?.title ?? "Unknown",
      current_stage: app.current_stage,
      applied_at: app.created_at,
      interview_scoring: scoring,
      interview_transcript: (formData?.interview_transcript as string) ?? null,
      interview_recording_url: (formData?.interview_recording_url as string) ?? null,
      interview_started_at: (formData?.interview_started_at as string) ?? null,
      interview_ended_at: (formData?.interview_ended_at as string) ?? null,
      interview_summary: (formData?.interview_summary_vapi as string) ?? null,
    };
  });

  return NextResponse.json({ interviews });
}
