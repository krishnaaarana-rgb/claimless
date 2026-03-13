import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { screenApplication } from "@/lib/claude/prompts/ats-screening";
import { scrapeWebsite } from "@/lib/scraping/website";
import { dispatchWebhook } from "@/lib/webhooks/dispatcher";
import { pushResultsToATS } from "@/lib/integrations/outbound-push";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { application_id } = body;

  if (!application_id) {
    return NextResponse.json(
      { error: "application_id is required" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  try {
    // 1. Fetch application with candidate and job
    const { data: app, error: appError } = await supabase
      .from("applications")
      .select(
        `
        id,
        company_id,
        application_form_data,
        candidates (full_name, email, github_username, linkedin_url, personal_website_url),
        jobs (title, description, employment_type)
      `
      )
      .eq("id", application_id)
      .single();

    if (appError || !app) {
      console.error("[apply/screen] Application not found:", application_id);
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
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
      console.error("[apply/screen] Missing candidate or job data for:", application_id);
      await supabase
        .from("applications")
        .update({
          current_stage: "pending_review",
          updated_at: new Date().toISOString(),
        })
        .eq("id", application_id);
      return NextResponse.json(
        { error: "Missing candidate or job data" },
        { status: 400 }
      );
    }

    // 2. Fetch company settings for threshold
    let atsThreshold = 40;
    let atsAutoReject = true;
    const { data: companySettings } = await supabase
      .from("company_settings")
      .select("ats_pass_threshold, ats_auto_reject")
      .eq("company_id", app.company_id)
      .single();
    if (companySettings) {
      atsThreshold = companySettings.ats_pass_threshold ?? 40;
      atsAutoReject = companySettings.ats_auto_reject ?? true;
    }

    // 3. Scrape portfolio website if URL provided
    const formData = (app.application_form_data || {}) as Record<string, unknown>;
    const portfolioUrl =
      candidate.personal_website_url ||
      (formData.portfolio_url as string) ||
      null;
    let websiteContent: string | null = null;
    if (portfolioUrl) {
      console.log("[apply/screen] Scraping portfolio:", portfolioUrl);
      const scraped = await scrapeWebsite(portfolioUrl);
      websiteContent = scraped || null;
      console.log(
        "[apply/screen] Website content:",
        websiteContent ? `${websiteContent.length} chars` : "none"
      );
    }

    // 4. Run ATS screening
    const customAnswers =
      (formData.custom_answers as { question: string; answer: string }[]) || [];

    const screening = await screenApplication({
      jobTitle: job.title,
      jobDescription: job.description || "",
      employmentType: job.employment_type || "full_time",
      candidateName: candidate.full_name || "Unknown",
      candidateEmail: candidate.email || "",
      resumeText: (formData.resume_text as string) || null,
      coverLetter: (formData.cover_letter as string) || null,
      linkedinUrl:
        candidate.linkedin_url || (formData.linkedin_url as string) || null,
      githubUsername:
        candidate.github_username ||
        (formData.github_username as string) ||
        null,
      portfolioUrl,
      websiteContent,
      customAnswers: customAnswers.filter((a) => a.answer?.trim()),
      threshold: atsThreshold,
    });

    console.log(
      "[apply/screen] ATS screening complete:",
      screening.recommendation,
      "score:",
      screening.match_score
    );

    // 5. Update application with results
    const updateData: Record<string, unknown> = {
      stage_1_score: screening.match_score,
      stage_1_passed: screening.pass,
      match_score: screening.match_score,
      match_breakdown: screening,
      updated_at: new Date().toISOString(),
    };

    if (screening.pass) {
      updateData.current_stage = "stage_1_passed";
    } else if (atsAutoReject) {
      updateData.current_stage = "rejected";
      updateData.status = "rejected";
      updateData.rejected_reason = `ATS screening: ${screening.summary}`;
    } else {
      updateData.current_stage = "pending_review";
    }

    await supabase
      .from("applications")
      .update(updateData)
      .eq("id", application_id);

    // Dispatch screening completed webhook
    dispatchWebhook(app.company_id, "candidate.screening_completed", {
      application_id,
      candidate_name: candidate.full_name,
      candidate_email: candidate.email,
      job_title: job.title,
      match_score: screening.match_score,
      recommendation: screening.recommendation,
      passed: screening.pass,
      summary: screening.summary,
    });

    // Dispatch rejected webhook if auto-rejected
    if (!screening.pass && atsAutoReject) {
      dispatchWebhook(app.company_id, "candidate.rejected", {
        application_id,
        candidate_name: candidate.full_name,
        candidate_email: candidate.email,
        job_title: job.title,
        reason: `ATS screening: ${screening.summary}`,
        source: "ats_auto_reject",
      });
    }

    // Push results to any connected ATS integrations (fire and forget)
    pushResultsToATS(app.company_id, application_id, "screening_completed").catch(() => {});

    // Send email notification (fire and forget, non-fatal)
    const { sendATSNotification } = await import("@/lib/email/notifications");
    sendATSNotification({
      applicationId: application_id,
      candidateEmail: candidate.email || "",
      candidateName: candidate.full_name || "Applicant",
      jobTitle: job.title,
      companyId: app.company_id,
      passed: screening.pass,
    }).catch((err) => {
      console.error("[screen] Email notification failed:", err);
    });

    return NextResponse.json({ success: true, screening });
  } catch (err) {
    // ATS failed — set to pending_review so a human can look at it
    console.error(
      "[apply/screen] ATS screening failed, setting pending_review:",
      err
    );
    await supabase
      .from("applications")
      .update({
        current_stage: "pending_review",
        updated_at: new Date().toISOString(),
      })
      .eq("id", application_id);

    return NextResponse.json(
      { error: "Screening failed, set to pending_review" },
      { status: 500 }
    );
  }
}
