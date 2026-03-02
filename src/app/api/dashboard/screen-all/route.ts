import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { screenApplication } from "@/lib/claude/prompts/ats-screening";
import { scrapeWebsite } from "@/lib/scraping/website";

async function getCompanyId(userId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("company_users")
    .select("company_id")
    .eq("user_id", userId)
    .single();
  return data?.company_id ?? null;
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companyId = await getCompanyId(user.id);
  const admin = createAdminClient();

  // Find all unscreened applications (applied, pending_review, or stage_1 without score)
  let query = admin
    .from("applications")
    .select(
      `
      id,
      application_form_data,
      candidates (full_name, email, github_username, linkedin_url, personal_website_url),
      jobs (title, description, employment_type)
    `
    )
    .in("current_stage", ["applied", "pending_review"])
    .is("stage_1_score", null);

  if (companyId) {
    query = query.eq("company_id", companyId);
  }

  const { data: applications, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!applications || applications.length === 0) {
    return NextResponse.json({
      screened: 0,
      passed: 0,
      failed: 0,
      message: "No unscreened applications found",
    });
  }

  let passed = 0;
  let failed = 0;
  let errors = 0;

  for (const app of applications) {
    try {
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
        errors++;
        continue;
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
        passed++;
      } else {
        updateData.current_stage = "rejected";
        updateData.status = "rejected";
        updateData.rejected_reason = `ATS screening: ${screening.summary}`;
        failed++;
      }

      await admin.from("applications").update(updateData).eq("id", app.id);
    } catch (err) {
      console.error(`[screen-all] Error screening application ${app.id}:`, err);
      errors++;
    }
  }

  return NextResponse.json({
    screened: passed + failed,
    passed,
    failed,
    errors,
    message: `Screened ${passed + failed} candidates. ${passed} passed, ${failed} failed.${errors > 0 ? ` ${errors} errors.` : ""}`,
  });
}
