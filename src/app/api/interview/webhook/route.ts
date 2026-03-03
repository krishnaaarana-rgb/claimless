import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface VapiMessage {
  role: string;
  content?: string;
  message?: string;
}

export async function POST(request: NextRequest) {
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

    console.log(
      "[vapi-webhook] Processing end-of-call for:",
      application.candidates?.full_name
    );

    // Build full transcript text
    const transcriptText = (messages || [])
      .filter(
        (m: VapiMessage) => m.role === "assistant" || m.role === "user"
      )
      .map(
        (m: VapiMessage) =>
          `${m.role === "assistant" ? "Interviewer" : "Candidate"}: ${m.content || m.message}`
      )
      .join("\n\n");

    // Store transcript and recording URL
    await supabase
      .from("applications")
      .update({
        current_stage: "interview_completed",
        application_form_data: {
          ...application.application_form_data,
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
