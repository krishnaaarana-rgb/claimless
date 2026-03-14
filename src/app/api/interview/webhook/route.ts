import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface VapiMessage {
  role: string;
  content?: string;
  message?: string;
}

export async function POST(request: NextRequest) {
  // Verify webhook is from Vapi using the server URL secret
  const vapiSecret = process.env.VAPI_API_KEY;
  if (vapiSecret) {
    const authHeader = request.headers.get("x-vapi-secret") || request.headers.get("authorization");
    if (authHeader !== vapiSecret && authHeader !== `Bearer ${vapiSecret}`) {
      console.warn("[vapi-webhook] Invalid or missing auth header");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const body = await request.json();
  const event = body.message?.type || body.type;

  console.log("[vapi-webhook] Event:", event);

  if (event === "end-of-call-report") {
    const {
      transcript,
      summary,
      recordingUrl,
      stereoRecordingUrl,
      assistant,
      call,
      endedReason,
      messages,
    } = body.message || body;

    void transcript; // included in messages

    // Find the application by assistant ID
    const supabase = createAdminClient();
    const assistantId = assistant?.id || call?.assistantId;

    if (!assistantId) {
      console.error("[vapi-webhook] No assistant ID in webhook payload");
      return NextResponse.json({ ok: true });
    }

    // Find application with this assistant ID
    const { data: applications } = await supabase
      .from("applications")
      .select("*, jobs(*), candidates(*)")
      .filter("application_form_data->>vapi_assistant_id", "eq", assistantId);

    const application = applications?.[0] as
      | (Record<string, unknown> & {
          id: string;
          application_form_data: Record<string, unknown> | null;
          jobs: { company_id: string; title: string };
          candidates: {
            id: string;
            full_name: string | null;
            email: string | null;
          };
        })
      | undefined;

    if (!application) {
      console.error(
        "[vapi-webhook] No application found for assistant:",
        assistantId
      );
      return NextResponse.json({ ok: true });
    }

    // Idempotency: skip if already processed (Vapi may retry webhooks)
    if (application.current_stage === "interview_completed") {
      console.log("[vapi-webhook] Already processed, skipping:", assistantId);
      return NextResponse.json({ ok: true, already_processed: true });
    }

    console.log(
      "[vapi-webhook] Processing end-of-call for:",
      application.candidates?.full_name
    );

    // Build full transcript text — filter out empty/null messages
    const transcriptText = (messages || [])
      .filter(
        (m: VapiMessage) =>
          (m.role === "assistant" || m.role === "user") &&
          (m.content || m.message || "").trim().length > 0
      )
      .map(
        (m: VapiMessage) =>
          `${m.role === "assistant" ? "Interviewer" : "Candidate"}: ${(m.content || m.message || "").trim()}`
      )
      .join("\n\n");

    // Store transcript and recording URL
    // Trim injected_prompt to keep JSONB size manageable (full prompt can be 5-10KB)
    const existingFormData = { ...(application.application_form_data || {}) } as Record<string, unknown>;
    if (typeof existingFormData.injected_prompt === "string" && (existingFormData.injected_prompt as string).length > 500) {
      existingFormData.injected_prompt = (existingFormData.injected_prompt as string).slice(0, 500) + "... [truncated for storage]";
    }

    await supabase
      .from("applications")
      .update({
        current_stage: "interview_completed",
        application_form_data: {
          ...existingFormData,
          interview_transcript: transcriptText,
          interview_recording_url:
            recordingUrl || stereoRecordingUrl || null,
          interview_ended_at: new Date().toISOString(),
          interview_ended_reason: endedReason,
          interview_summary_vapi: summary || null,
        },
      })
      .eq("id", application.id);

    // Mark interview token as completed
    await supabase
      .from("interview_tokens")
      .update({ status: "completed" })
      .eq("application_id", application.id)
      .in("status", ["pending", "active"]);

    // Score the interview with Claude (fire and forget)
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    fetch(`${baseUrl}/api/interview/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ application_id: application.id }),
    }).catch((err) =>
      console.error("[vapi-webhook] Score trigger failed:", err)
    );

    // Push results to ATS integrations (fire and forget)
    const { pushResultsToATS } = await import("@/lib/integrations/outbound-push");
    pushResultsToATS(
      application.jobs.company_id,
      application.id,
      "interview_completed"
    ).catch(() => {});

    // Dispatch webhook
    const { dispatchWebhook } = await import("@/lib/webhooks/dispatcher");
    dispatchWebhook(
      application.jobs.company_id,
      "candidate.interview_completed",
      {
        candidate_id: application.candidates.id,
        candidate_name: application.candidates.full_name,
        candidate_email: application.candidates.email,
        application_id: application.id,
        job_title: application.jobs.title,
        duration_seconds: call?.duration || null,
        recording_url: recordingUrl || null,
      }
    ).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
