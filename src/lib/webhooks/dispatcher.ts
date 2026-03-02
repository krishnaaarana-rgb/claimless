import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

// All supported webhook events
export type WebhookEvent =
  | "candidate.applied"
  | "candidate.screening_completed"
  | "candidate.stage_changed"
  | "candidate.interview_completed"
  | "candidate.email_sent"
  | "candidate.rejected"
  | "candidate.hired";

interface WebhookPayload {
  event: WebhookEvent | "test";
  timestamp: string;
  data: Record<string, unknown>;
}

export async function dispatchWebhook(
  companyId: string,
  event: WebhookEvent,
  data: Record<string, unknown>
): Promise<void> {
  const supabase = createAdminClient();

  // Find all active webhooks for this company that subscribe to this event
  const { data: webhooks } = await supabase
    .from("webhooks")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .contains("events", [event]);

  if (!webhooks || webhooks.length === 0) return;

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  // Fire all webhooks in parallel (non-blocking)
  const promises = webhooks.map(async (webhook) => {
    const startTime = Date.now();
    let statusCode = 0;
    let responseBody = "";
    let success = false;

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "User-Agent": "Claimless-Webhook/1.0",
        "X-Webhook-Event": event,
        "X-Webhook-Id": webhook.id,
      };

      // Sign the payload if secret is set
      if (webhook.secret) {
        const signature = crypto
          .createHmac("sha256", webhook.secret)
          .update(JSON.stringify(payload))
          .digest("hex");
        headers["X-Webhook-Signature"] = `sha256=${signature}`;
      }

      const response = await fetch(webhook.url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      });

      statusCode = response.status;
      responseBody = await response.text().catch(() => "");
      success = response.ok;
    } catch (error) {
      responseBody =
        error instanceof Error ? error.message : "Unknown error";
    }

    const durationMs = Date.now() - startTime;

    // Log the delivery attempt
    await supabase.from("webhook_logs").insert({
      webhook_id: webhook.id,
      event,
      payload,
      status_code: statusCode,
      response_body: responseBody.slice(0, 1000),
      success,
      duration_ms: durationMs,
    });

    if (!success) {
      console.error(
        `[webhook] Failed delivery to ${webhook.url}: ${statusCode} ${responseBody.slice(0, 200)}`
      );
    }
  });

  // Fire all but don't await -- webhooks are fire-and-forget
  Promise.allSettled(promises).catch(() => {});
}

/**
 * Send a test webhook to verify the URL works.
 * Unlike dispatchWebhook, this returns the result synchronously.
 */
export async function sendTestWebhook(
  webhookId: string
): Promise<{ success: boolean; status_code: number; duration_ms: number; error?: string }> {
  const supabase = createAdminClient();

  const { data: webhook } = await supabase
    .from("webhooks")
    .select("*, companies (name)")
    .eq("id", webhookId)
    .single();

  if (!webhook) {
    return { success: false, status_code: 0, duration_ms: 0, error: "Webhook not found" };
  }

  const company = webhook.companies as unknown as { name: string } | null;

  const payload: WebhookPayload = {
    event: "test",
    timestamp: new Date().toISOString(),
    data: {
      message: "This is a test webhook from Claimless",
      webhook_id: webhookId,
      company: company?.name || "Your Company",
    },
  };

  const startTime = Date.now();
  let statusCode = 0;
  let responseBody = "";
  let success = false;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "Claimless-Webhook/1.0",
      "X-Webhook-Event": "test",
      "X-Webhook-Id": webhookId,
    };

    if (webhook.secret) {
      const signature = crypto
        .createHmac("sha256", webhook.secret)
        .update(JSON.stringify(payload))
        .digest("hex");
      headers["X-Webhook-Signature"] = `sha256=${signature}`;
    }

    const response = await fetch(webhook.url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    statusCode = response.status;
    responseBody = await response.text().catch(() => "");
    success = response.ok;
  } catch (error) {
    responseBody =
      error instanceof Error ? error.message : "Unknown error";
  }

  const durationMs = Date.now() - startTime;

  // Log the test delivery
  await supabase.from("webhook_logs").insert({
    webhook_id: webhookId,
    event: "test",
    payload,
    status_code: statusCode,
    response_body: responseBody.slice(0, 1000),
    success,
    duration_ms: durationMs,
  });

  return {
    success,
    status_code: statusCode,
    duration_ms: durationMs,
    error: success ? undefined : responseBody.slice(0, 200),
  };
}
