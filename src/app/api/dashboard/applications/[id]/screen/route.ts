import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { screenApplication } from "@/lib/claude/prompts/ats-screening";
import { scrapeWebsite } from "@/lib/scraping/website";

export async function POST(
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

  const admin = createAdminClient();

  const { data: app, error: appError } = await admin
    .from("applications")
    .select(
      `
      id,
      application_form_data,
      candidates (full_name, email, github_username, linkedin_url, personal_website_url),
      jobs (title, description, employment_type)
    `
    )
    .eq("id", id)
    .single();

  if (appError || !app) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const candidate = app.candidates as unknown as {
    full_name: string | null;
    email: string | null;
    github_username: string | null;
    linkedin_url: string | null;
    personal_website_url: string | null;
  } | null;

  const job = app.jobs as unknown as {
    title: string;
    description: string | null;
    employment_type: string | null;
  } | null;

  if (!candidate || !job) {
    return NextResponse.json({ error: "Missing candidate or job data" }, { status: 400 });
  }

  const formData = (app.application_form_data || {}) as Record<string, unknown>;
  const customAnswers = (formData.custom_answers as { question: string; answer: string }[]) || [];

  const portfolioUrl = candidate.personal_website_url || (formData.portfolio_url as string) || null;
  let websiteContent: string | null = null;
  if (portfolioUrl) {
    const scraped = await scrapeWebsite(portfolioUrl);
    websiteContent = scraped || null;
  }

  const screening = await screenApplication({
    jobTitle: job.title,
    jobDescription: job.description || "",
    employmentType: job.employment_type || "full_time",
    candidateName: candidate.full_name || "Unknown",
    candidateEmail: candidate.email || "",
    resumeText: (formData.resume_text as string) || null,
    coverLetter: (formData.cover_letter as string) || null,
    linkedinUrl: candidate.linkedin_url || (formData.linkedin_url as string) || null,
    githubUsername: candidate.github_username || (formData.github_username as string) || null,
    portfolioUrl,
    websiteContent,
    customAnswers: customAnswers.filter((a) => a.answer?.trim()),
  });

  const updateData: Record<string, unknown> = {
    stage_1_score: screening.match_score,
    stage_1_passed: screening.pass,
    match_score: screening.match_score,
    match_breakdown: screening,
    updated_at: new Date().toISOString(),
  };

  if (screening.pass) {
    updateData.current_stage = "stage_1_passed";
  } else {
    updateData.current_stage = "rejected";
    updateData.status = "rejected";
    updateData.rejected_reason = `ATS screening: ${screening.summary}`;
  }

  const { error: updateError } = await admin
    .from("applications")
    .update(updateData)
    .eq("id", id);

  if (updateError) {
    console.error("[screen] Failed to update application:", updateError);
    return NextResponse.json({ error: "Failed to save screening results" }, { status: 500 });
  }

  return NextResponse.json({ screening });
}
