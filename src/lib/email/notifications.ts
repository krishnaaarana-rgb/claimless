import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "./index";
import { renderTemplate, textToHtml } from "./templates";
import { dispatchWebhook } from "@/lib/webhooks/dispatcher";

interface NotifyInput {
  applicationId: string;
  candidateEmail: string;
  candidateName: string;
  jobTitle: string;
  companyId: string;
  passed: boolean;
  interviewLink?: string;
  immediate?: boolean; // Skip delay — used by cron job to send scheduled emails
}

export async function sendATSNotification(
  input: NotifyInput
): Promise<void> {
  const supabase = createAdminClient();

  // Fetch company settings
  const { data: settings } = await supabase
    .from("company_settings")
    .select("*")
    .eq("company_id", input.companyId)
    .single();

  if (!settings) {
    console.log("[notify] No company settings found, skipping email");
    return;
  }

  // Check if email provider is configured
  if (settings.email_provider === "none" || !settings.email_api_key) {
    console.log("[notify] Email provider not configured, skipping email");
    return;
  }

  // Deduplicate: check if this application already had this type of email sent
  const emailType = input.passed ? "acceptance" : "rejection";
  const { data: existingEmail } = await supabase
    .from("email_logs")
    .select("id")
    .eq("application_id", input.applicationId)
    .eq("email_type", emailType)
    .eq("status", "sent")
    .limit(1)
    .maybeSingle();

  if (existingEmail && !input.immediate) {
    console.log("[notify] Email already sent for this application, skipping:", input.candidateEmail);
    return;
  }

  // Check if email should be delayed (skip if called with immediate flag from cron)
  const delayMinutes = settings.email_delay_minutes ?? 0;
  if (delayMinutes > 0 && !input.immediate) {
    const sendAt = new Date(Date.now() + delayMinutes * 60 * 1000);
    console.log(`[notify] Scheduling email for ${sendAt.toISOString()} (${delayMinutes}min delay)`);

    // Store scheduled email in email_logs for cron processing
    await supabase.from("email_logs").insert({
      application_id: input.applicationId,
      candidate_email: input.candidateEmail,
      email_type: input.passed ? "acceptance" : "rejection",
      subject: `Scheduled: ${input.passed ? "acceptance" : "rejection"} for ${input.jobTitle}`,
      body: JSON.stringify({
        candidateName: input.candidateName,
        candidateEmail: input.candidateEmail,
        jobTitle: input.jobTitle,
        companyId: input.companyId,
        passed: input.passed,
        interviewLink: input.interviewLink,
      }),
      status: "pending",
      send_at: sendAt.toISOString(),
      scheduled: true,
    });
    return;
  }

  // Fetch company name
  const { data: company } = await supabase
    .from("companies")
    .select("name")
    .eq("id", input.companyId)
    .single();

  const companyName = company?.name || "Our Company";

  // If candidate passed, use provided interview link or generate a new token
  let interviewLink = "";
  if (input.passed) {
    if (input.interviewLink) {
      // Use pre-built link (avoids creating duplicate tokens)
      interviewLink = input.interviewLink;
      console.log("[notify] Using provided interview link:", interviewLink);
    } else {
      // Create a new interview token
      const token = crypto.randomUUID();
      const { error: tokenError } = await supabase
        .from("interview_tokens")
        .insert({
          application_id: input.applicationId,
          token,
          status: "pending",
          expires_at: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
        });

      if (tokenError) {
        console.error("[notify] Failed to create interview token:", tokenError);
      } else {
        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        interviewLink = `${baseUrl}/interview/${token}`;
        console.log("[notify] Interview link generated:", interviewLink);
      }
    }
  }

  const vars = {
    candidate_name: input.candidateName,
    job_title: input.jobTitle,
    company_name: companyName,
    interview_link: interviewLink,
  };

  let subject: string;
  let body: string;

  if (input.passed) {
    subject = renderTemplate(settings.email_acceptance_subject, vars);
    body = renderTemplate(settings.email_acceptance_body, vars);
  } else {
    subject = renderTemplate(settings.email_rejection_subject, vars);
    body = renderTemplate(settings.email_rejection_body, vars);
  }

  const html = textToHtml(body, {
    logoUrl: settings.brand_logo_url || undefined,
    accentColor: settings.brand_accent_color || undefined,
    companyName,
  });

  const result = await sendEmail(
    {
      to: input.candidateEmail,
      subject,
      html,
      from: settings.email_from_address || undefined,
      fromName: settings.email_from_name || companyName,
      replyTo: settings.email_reply_to || settings.email_from_address || undefined,
    },
    settings.email_api_key
  );

  const notificationType = input.passed ? "acceptance" : "rejection";

  // Update application with notification tracking
  if (result.success) {
    await supabase
      .from("applications")
      .update({
        notification_sent: true,
        notification_sent_at: new Date().toISOString(),
        notification_type: notificationType,
      })
      .eq("id", input.applicationId);

    // Dispatch email_sent webhook
    dispatchWebhook(input.companyId, "candidate.email_sent", {
      application_id: input.applicationId,
      candidate_name: input.candidateName,
      candidate_email: input.candidateEmail,
      job_title: input.jobTitle,
      email_type: notificationType,
      subject,
    });

    console.log(
      "[notify] Email sent successfully:",
      notificationType,
      "to",
      input.candidateEmail
    );
  } else {
    console.error("[notify] Email failed:", result.error);
  }

  // Log to email_logs — skip if called from cron (cron manages its own log entry)
  if (!input.immediate) {
    await supabase
      .from("email_logs")
      .insert({
        application_id: input.applicationId,
        candidate_email: input.candidateEmail,
        email_type: notificationType,
        subject,
        status: result.success ? "sent" : "failed",
        error_message: result.error || null,
      })
      .then(() => {
        console.log("[notify] Logged email for", input.candidateEmail);
      });
  }
}
