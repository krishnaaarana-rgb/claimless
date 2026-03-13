// ============================================================
// OUTBOUND PUSH — Send results back to external ATS
// ============================================================
// After screening or interview completion, push the results
// to the ATS callback URL configured in the integration.
// ============================================================

import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

export type OutboundEvent = "screening_completed" | "interview_completed";

interface OutboundPayload {
  event: OutboundEvent;
  timestamp: string;
  application_id: string;
  external_candidate_id?: string;
  external_application_id?: string;
  data: Record<string, unknown>;
}

/**
 * Push results back to all active ATS integrations for a company.
 * Called after screening or interview scoring completes.
 */
export async function pushResultsToATS(
  companyId: string,
  applicationId: string,
  event: OutboundEvent
): Promise<void> {
  const supabase = createAdminClient();

  // 1. Find active integrations that subscribe to this event
  const { data: integrations } = await supabase
    .from("ats_integrations")
    .select("id, provider, callback_url, callback_secret, callback_events, outbound_count")
    .eq("company_id", companyId)
    .eq("is_active", true);

  if (!integrations || integrations.length === 0) return;

  const activeIntegrations = integrations.filter(
    (i) => i.callback_url && (i.callback_events as string[])?.includes(event)
  );
  if (activeIntegrations.length === 0) return;

  // 2. Fetch application data
  const { data: app } = await supabase
    .from("applications")
    .select(
      `id, current_stage, match_score, match_breakdown, application_form_data, status,
       candidates (id, full_name, email),
       jobs (id, title)`
    )
    .eq("id", applicationId)
    .single();

  if (!app) return;

  const candidate = app.candidates as unknown as { id: string; full_name: string; email: string } | null;
  const job = app.jobs as unknown as { id: string; title: string } | null;
  const formData = (app.application_form_data || {}) as Record<string, unknown>;
  const screening = app.match_breakdown as Record<string, unknown> | null;
  const interviewScoring = formData.interview_scoring as Record<string, unknown> | undefined;

  // 3. Build event-specific data
  let eventData: Record<string, unknown>;

  if (event === "screening_completed") {
    eventData = {
      candidate: {
        id: candidate?.id,
        name: candidate?.full_name,
        email: candidate?.email,
      },
      job: {
        id: job?.id,
        title: job?.title,
      },
      screening: {
        score: app.match_score,
        recommendation: screening?.recommendation,
        passed: screening?.pass,
        summary: screening?.summary,
        strengths: screening?.strengths,
        concerns: screening?.concerns,
        key_qualifications: screening?.key_qualifications,
      },
      stage: app.current_stage,
      status: app.status,
    };
  } else {
    // interview_completed
    const atsScore = (screening as { match_score?: number } | null)?.match_score ?? null;
    const ivScore = (interviewScoring?.overall_score ?? interviewScoring?.interview_score ?? null) as number | null;
    const combinedScore =
      atsScore != null && ivScore != null
        ? Math.round(atsScore * 0.4 + ivScore * 0.6)
        : atsScore ?? ivScore ?? null;

    eventData = {
      candidate: {
        id: candidate?.id,
        name: candidate?.full_name,
        email: candidate?.email,
      },
      job: {
        id: job?.id,
        title: job?.title,
      },
      scores: {
        ats: atsScore,
        interview: ivScore,
        combined: combinedScore,
      },
      interview: {
        recommendation: interviewScoring?.recommendation,
        recommendation_reasoning: interviewScoring?.recommendation_reasoning,
        strengths: interviewScoring?.strengths,
        areas_for_improvement: interviewScoring?.areas_for_improvement,
        hard_skill_average: interviewScoring?.hard_skill_average,
        soft_skill_average: interviewScoring?.soft_skill_average,
        consistency_analysis: interviewScoring?.consistency_analysis,
        hiring_risk_factors: interviewScoring?.hiring_risk_factors,
      },
      screening_summary: screening?.summary,
      stage: app.current_stage,
      status: app.status,
    };
  }

  // 4. Push to each integration
  const promises = activeIntegrations.map(async (integration) => {
    const payload: OutboundPayload = {
      event,
      timestamp: new Date().toISOString(),
      application_id: applicationId,
      external_candidate_id: formData.external_candidate_id as string | undefined,
      external_application_id: formData.external_application_id as string | undefined,
      data: eventData,
    };

    let statusCode = 0;
    let responseBody = "";
    let success = false;

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "User-Agent": "Claimless-ATS-Push/1.0",
        "X-Claimless-Event": event,
      };

      // Sign if secret is configured
      if (integration.callback_secret) {
        const signature = crypto
          .createHmac("sha256", integration.callback_secret)
          .update(JSON.stringify(payload))
          .digest("hex");
        headers["X-Claimless-Signature"] = `sha256=${signature}`;
      }

      const response = await fetch(integration.callback_url!, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });

      statusCode = response.status;
      responseBody = await response.text().catch(() => "");
      success = response.ok;
    } catch (error) {
      responseBody = error instanceof Error ? error.message : "Unknown error";
    }

    // Log the push
    await supabase.from("ats_sync_log").insert({
      integration_id: integration.id,
      company_id: companyId,
      direction: "outbound",
      application_id: applicationId,
      external_id: formData.external_candidate_id as string || null,
      status: success ? "success" : "failed",
      payload,
      response: { status_code: statusCode, body: responseBody.slice(0, 1000) },
      error_message: success ? null : responseBody.slice(0, 500),
    });

    // Update stats
    if (success) {
      await supabase
        .from("ats_integrations")
        .update({
          last_outbound_at: new Date().toISOString(),
          outbound_count: (integration.outbound_count || 0) + 1,
        })
        .eq("id", integration.id);
    }

    if (!success) {
      console.error(`[ats-push] Failed to push to ${integration.callback_url}: ${statusCode} ${responseBody.slice(0, 200)}`);
    }
  });

  Promise.allSettled(promises).catch(() => {});
}
