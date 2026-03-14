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
        candidate_id,
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
    let autoInviteInterview = false;
    const { data: companySettings } = await supabase
      .from("company_settings")
      .select("ats_pass_threshold, ats_auto_reject, auto_invite_interview")
      .eq("company_id", app.company_id)
      .single();
    if (companySettings) {
      atsThreshold = companySettings.ats_pass_threshold ?? 40;
      atsAutoReject = companySettings.ats_auto_reject ?? true;
      autoInviteInterview = companySettings.auto_invite_interview ?? false;
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

    // 3b. Scrape candidate-submitted supporting links
    const rawLinks = (formData.supporting_links as string[]) || [];
    const supportingLinksContent: { url: string; content: string }[] = [];
    for (const link of rawLinks.slice(0, 5)) {
      if (link?.trim()) {
        try {
          const content = await scrapeWebsite(link.trim());
          if (content) {
            supportingLinksContent.push({ url: link.trim(), content });
          }
        } catch {
          console.warn("[apply/screen] Failed to scrape supporting link:", link);
        }
      }
    }
    if (supportingLinksContent.length > 0) {
      console.log("[apply/screen] Scraped", supportingLinksContent.length, "supporting links");
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
      supportingLinksContent: supportingLinksContent.length > 0 ? supportingLinksContent : undefined,
      customAnswers: customAnswers.filter((a) => a.answer?.trim()),
      threshold: atsThreshold,
    });

    console.log(
      "[apply/screen] ATS screening complete:",
      screening.recommendation,
      "score:",
      screening.match_score
    );

    // 4b. Generate interview brief from screening data (for ALL candidates, not just GitHub)
    const interviewBrief = [
      `Candidate: ${candidate.full_name || "Unknown"}`,
      `Role: ${job.title}`,
      `ATS Score: ${screening.match_score}/100 (${screening.recommendation})`,
      `Summary: ${screening.summary}`,
      screening.strengths.length > 0 ? `Strengths: ${screening.strengths.join("; ")}` : "",
      screening.concerns.length > 0 ? `Concerns to probe: ${screening.concerns.join("; ")}` : "",
      screening.consistency_flags && screening.consistency_flags.length > 0
        ? `Resume consistency flags: ${screening.consistency_flags.join("; ")}`
        : "",
      screening.key_qualifications
        .filter((q) => !q.met)
        .map((q) => `Unmet qualification: ${q.qualification} — ${q.evidence}`)
        .join("\n"),
      screening.suggested_interview_topics.length > 0
        ? `Topics to explore: ${screening.suggested_interview_topics.join("; ")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    // 5. Update application with results
    const updateData: Record<string, unknown> = {
      stage_1_score: screening.match_score,
      stage_1_passed: screening.pass,
      match_score: screening.match_score,
      match_breakdown: {
        ...screening,
        interview_brief: interviewBrief,
      },
      updated_at: new Date().toISOString(),
    };

    if (screening.pass) {
      updateData.current_stage = autoInviteInterview ? "interview_invited" : "stage_1_passed";
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

    // Auto-create interview token if screening passed and auto-invite is enabled
    if (screening.pass && autoInviteInterview) {
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7-day expiry

      await supabase.from("interview_tokens").insert({
        application_id,
        token,
        status: "pending",
        expires_at: expiresAt.toISOString(),
      });

      // Fire interview invite email (fire and forget)
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const interviewUrl = `${baseUrl}/interview/${token}/prep`;
      console.log("[screen] Auto-invited to interview:", interviewUrl);

      // Trigger invite email via the existing invite endpoint
      fetch(`${baseUrl}/api/candidates/${app.candidate_id}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application_id,
          interview_url: interviewUrl,
          auto_invited: true,
        }),
      }).catch(() => {});
    }

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

    // Auto-trigger Loom analysis if candidate submitted a Loom URL (fire and forget)
    const loomUrl = formData.loom_url as string;
    if (loomUrl?.includes("loom.com")) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      fetch(`${baseUrl}/api/loom/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application_id, loom_url: loomUrl }),
      }).catch((err) => {
        console.error("[screen] Loom analysis trigger failed:", err);
      });
    }

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
