import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/briefs/[token] — public endpoint for viewing a shared brief
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createAdminClient();

  // 1. Find the brief token
  const { data: brief, error: briefError } = await supabase
    .from("brief_tokens")
    .select("id, company_id, application_ids, brief_type, job_id, title, note, expires_at, view_count")
    .eq("token", token)
    .single();

  if (briefError || !brief) {
    return NextResponse.json({ error: "Brief not found" }, { status: 404 });
  }

  // 2. Check expiration
  if (new Date(brief.expires_at) < new Date()) {
    return NextResponse.json({ error: "This brief link has expired" }, { status: 410 });
  }

  // 3. Update view count
  await supabase
    .from("brief_tokens")
    .update({
      view_count: brief.view_count + 1,
      last_viewed_at: new Date().toISOString(),
    })
    .eq("id", brief.id);

  // 4. Fetch company info
  const { data: company } = await supabase
    .from("companies")
    .select("name, primary_color")
    .eq("id", brief.company_id)
    .single();

  // 5. Fetch applications with candidate and job data
  const { data: applications } = await supabase
    .from("applications")
    .select(
      `id, current_stage, match_score, match_breakdown, application_form_data, created_at,
       candidates (id, full_name, email, phone, linkedin_url, github_username, personal_website_url),
       jobs (id, title, department, location, employment_type, industry, industry_niche)`
    )
    .in("id", brief.application_ids);

  if (!applications || applications.length === 0) {
    return NextResponse.json({ error: "No application data found" }, { status: 404 });
  }

  // 6. Fetch job info if shortlist
  let jobInfo = null;
  if (brief.job_id) {
    const { data: job } = await supabase
      .from("jobs")
      .select("id, title, department, location, employment_type")
      .eq("id", brief.job_id)
      .single();
    jobInfo = job;
  }

  // 7. Build response — only expose what's needed for the brief
  const candidates = applications.map((app) => {
    const candidate = (app.candidates as unknown) as Record<string, unknown> | null;
    const job = (app.jobs as unknown) as Record<string, unknown> | null;
    const screening = app.match_breakdown as Record<string, unknown> | null;
    const formData = app.application_form_data as Record<string, unknown> | null;
    const interviewScoring = formData?.interview_scoring as Record<string, unknown> | undefined;

    const atsScore = (screening as { match_score?: number } | null)?.match_score ?? null;
    const ivScore = (interviewScoring?.overall_score ?? interviewScoring?.interview_score ?? null) as number | null;
    const combinedScore =
      atsScore != null && ivScore != null
        ? Math.round(atsScore * 0.4 + ivScore * 0.6)
        : atsScore ?? ivScore ?? null;

    return {
      application_id: app.id,
      candidate: {
        full_name: (candidate?.full_name as string) || "Unknown",
        email: (candidate?.email as string) || null,
        phone: (candidate?.phone as string) || null,
        linkedin_url: (candidate?.linkedin_url as string) || (formData?.linkedin_url as string) || null,
        github_username: (candidate?.github_username as string) || (formData?.github_username as string) || null,
        portfolio_url: (candidate?.personal_website_url as string) || (formData?.portfolio_url as string) || null,
      },
      job: {
        title: (job?.title as string) || "Unknown Position",
        department: (job?.department as string) || null,
        location: (job?.location as string) || null,
      },
      scores: {
        ats: atsScore,
        interview: ivScore,
        combined: combinedScore,
      },
      screening: screening
        ? {
            summary: (screening as { summary?: string }).summary || null,
            strengths: (screening as { strengths?: string[] }).strengths || [],
            concerns: (screening as { concerns?: string[] }).concerns || [],
            key_qualifications: (screening as { key_qualifications?: unknown[] }).key_qualifications || [],
          }
        : null,
      interview: interviewScoring
        ? {
            overall_impression: interviewScoring.overall_impression || null,
            recommendation: interviewScoring.recommendation || null,
            recommendation_reasoning: interviewScoring.recommendation_reasoning || null,
            communication_score: interviewScoring.communication_score ?? null,
            technical_score: interviewScoring.technical_score ?? null,
            cultural_fit_score: interviewScoring.cultural_fit_score ?? null,
            confidence_score: interviewScoring.confidence_score ?? null,
            hard_skill_average: interviewScoring.hard_skill_average ?? null,
            soft_skill_average: interviewScoring.soft_skill_average ?? null,
            strengths: interviewScoring.strengths || [],
            areas_for_improvement: interviewScoring.areas_for_improvement || [],
            key_moments: interviewScoring.key_moments || [],
            consistency_analysis: interviewScoring.consistency_analysis || null,
            hiring_risk_factors: interviewScoring.hiring_risk_factors || [],
            comparison_notes: interviewScoring.comparison_notes || null,
            follow_up_questions: interviewScoring.follow_up_questions || [],
            skill_assessments: interviewScoring.skill_assessments || [],
          }
        : null,
      applied_at: app.created_at,
    };
  });

  // Sort by combined score descending for shortlist
  candidates.sort((a, b) => (b.scores.combined ?? 0) - (a.scores.combined ?? 0));

  return NextResponse.json({
    brief_type: brief.brief_type,
    title: brief.title,
    note: brief.note,
    company: {
      name: company?.name || "Company",
      primary_color: (company as { primary_color?: string } | null)?.primary_color || "#2383E2",
    },
    job: jobInfo,
    candidates,
  });
}
