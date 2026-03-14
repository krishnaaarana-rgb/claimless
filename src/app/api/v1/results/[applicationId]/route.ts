import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth/api-key";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/v1/results/[applicationId] — fetch full screening + interview results
// External ATS systems poll this endpoint to get results for a candidate they pushed via inbound
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  const { applicationId } = await params;

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header" },
      { status: 401 }
    );
  }

  const { valid, companyId } = await validateApiKey(authHeader.replace("Bearer ", ""));
  if (!valid || !companyId) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: app, error } = await supabase
    .from("applications")
    .select(
      `id, current_stage, match_score, match_breakdown, application_form_data, status, created_at, updated_at,
       candidates (id, full_name, email, linkedin_url, github_username),
       jobs (id, title, department, location, employment_type)`
    )
    .eq("id", applicationId)
    .eq("company_id", companyId)
    .single();

  if (error || !app) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const candidate = app.candidates as unknown as Record<string, unknown> | null;
  const job = app.jobs as unknown as Record<string, unknown> | null;
  const formData = (app.application_form_data || {}) as Record<string, unknown>;
  const screening = app.match_breakdown as Record<string, unknown> | null;
  const interviewScoring = formData.interview_scoring as Record<string, unknown> | undefined;

  const atsScore = (screening as { match_score?: number } | null)?.match_score ?? null;
  const ivScore = (interviewScoring?.overall_score ?? interviewScoring?.interview_score ?? null) as number | null;
  const combinedScore =
    atsScore != null && ivScore != null
      ? Math.round(atsScore * 0.4 + ivScore * 0.6)
      : atsScore ?? ivScore ?? null;

  return NextResponse.json({
    application_id: app.id,
    stage: app.current_stage,
    status: app.status,
    candidate: {
      id: candidate?.id,
      full_name: candidate?.full_name,
      email: candidate?.email,
      linkedin_url: candidate?.linkedin_url,
      github_username: candidate?.github_username,
    },
    job: {
      id: job?.id,
      title: job?.title,
      department: job?.department,
      location: job?.location,
      employment_type: job?.employment_type,
    },
    scores: {
      ats: atsScore,
      interview: ivScore,
      combined: combinedScore,
    },
    screening: screening
      ? {
          match_score: atsScore,
          recommendation: screening.recommendation,
          summary: screening.summary,
          strengths: screening.strengths,
          concerns: screening.concerns,
          consistency_flags: screening.consistency_flags || [],
          key_qualifications: screening.key_qualifications,
          suggested_interview_topics: screening.suggested_interview_topics,
        }
      : null,
    interview: interviewScoring
      ? {
          recommendation: interviewScoring.recommendation,
          recommendation_reasoning: interviewScoring.recommendation_reasoning,
          overall_score: interviewScoring.overall_score,
          hard_skill_average: interviewScoring.hard_skill_average,
          soft_skill_average: interviewScoring.soft_skill_average,
          strengths: interviewScoring.strengths,
          areas_for_improvement: interviewScoring.areas_for_improvement,
          skill_assessments: interviewScoring.skill_assessments,
          consistency_analysis: interviewScoring.consistency_analysis,
          hiring_risk_factors: interviewScoring.hiring_risk_factors,
          follow_up_questions: interviewScoring.follow_up_questions,
          key_moments: interviewScoring.key_moments,
        }
      : null,
    external_ids: {
      candidate_id: formData.external_candidate_id || null,
      application_id: formData.external_application_id || null,
    },
    applied_at: app.created_at,
    updated_at: app.updated_at,
  });
}
