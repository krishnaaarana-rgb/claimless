import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendATSNotification } from "@/lib/email/notifications";

/**
 * GET /api/cron/send-emails
 * Processes scheduled emails that are past their send_at time.
 * Called by Vercel Cron every 5 minutes.
 *
 * Protected by CRON_SECRET to prevent unauthorized access.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Find scheduled emails that are ready to send
  const { data: pendingEmails, error } = await supabase
    .from("email_logs")
    .select("id, application_id, candidate_email, email_type, body")
    .eq("scheduled", true)
    .eq("status", "pending")
    .lte("send_at", new Date().toISOString())
    .limit(20); // Process max 20 per run

  if (error || !pendingEmails || pendingEmails.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  let sent = 0;
  let failed = 0;

  for (const email of pendingEmails) {
    try {
      // Parse the stored notification data
      const data = typeof email.body === "string" ? JSON.parse(email.body) : email.body;

      // Atomically claim this email — only succeeds if still "pending"
      const { data: claimed } = await supabase
        .from("email_logs")
        .update({ status: "processing" })
        .eq("id", email.id)
        .eq("status", "pending")
        .select("id")
        .maybeSingle();

      if (!claimed) {
        console.log("[cron/send-emails] Email already claimed by another run, skipping:", email.id);
        continue;
      }

      // Send the actual notification (immediate=true skips delay check)
      await sendATSNotification({
        applicationId: email.application_id,
        candidateEmail: data.candidateEmail || email.candidate_email,
        candidateName: data.candidateName || "Applicant",
        jobTitle: data.jobTitle || "",
        companyId: data.companyId,
        passed: data.passed,
        interviewLink: data.interviewLink,
        immediate: true,
      });

      // Mark as sent
      await supabase
        .from("email_logs")
        .update({ status: "sent", scheduled: false })
        .eq("id", email.id);

      sent++;
    } catch (err) {
      console.error("[cron/send-emails] Failed:", email.id, err);

      await supabase
        .from("email_logs")
        .update({ status: "failed", scheduled: false })
        .eq("id", email.id);

      failed++;
    }
  }

  console.log(`[cron/send-emails] Processed: ${sent} sent, ${failed} failed`);
  return NextResponse.json({ processed: pendingEmails.length, sent, failed });
}
