import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth/api-key";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeATSPayload, type ATSProvider } from "@/lib/integrations/ats-adapters";
import { dispatchWebhook } from "@/lib/webhooks/dispatcher";
import { checkRateLimit } from "@/lib/rate-limit";

// Allow enough time for screening (scraping + Claude) to complete
export const maxDuration = 300;

// POST /api/v1/inbound — receive candidate + job data from external ATS
export async function POST(request: NextRequest) {
  // Rate limit: 60 requests per minute per IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { allowed } = await checkRateLimit(`inbound:${ip}`, 60, 60);
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // 1. Auth
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header. Use: Bearer <api_key>" },
      { status: 401 }
    );
  }

  const { valid, companyId } = await validateApiKey(authHeader.replace("Bearer ", ""));
  if (!valid || !companyId) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  // 2. Parse body
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // 3. Determine provider from header, query param, or body
  const provider = (
    request.headers.get("x-ats-provider") ||
    request.nextUrl.searchParams.get("provider") ||
    body.provider ||
    "generic"
  ) as ATSProvider;

  const supabase = createAdminClient();

  // 4. Look up integration config for custom field mappings
  const { data: integration } = await supabase
    .from("ats_integrations")
    .select("id, field_mapping, callback_url, callback_secret, callback_events")
    .eq("company_id", companyId)
    .eq("provider", provider)
    .eq("is_active", true)
    .limit(1)
    .single();

  // 5. Normalize the payload
  let normalized;
  try {
    normalized = normalizeATSPayload(
      provider,
      body,
      integration?.field_mapping as Record<string, string> | null
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid payload";
    await logSync(supabase, integration?.id, companyId, "inbound", null, null, "failed", body, null, message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { candidate: candidateData, job: jobData } = normalized;

  // 6. Match to an existing job by title, or use job_id from query
  const jobIdParam = request.nextUrl.searchParams.get("job_id") || (body.job_id as string);
  let jobId: string | null = null;
  let jobTitle = jobData.title;

  if (jobIdParam) {
    // Direct job ID provided
    const { data: job } = await supabase
      .from("jobs")
      .select("id, title, status")
      .eq("id", jobIdParam)
      .eq("company_id", companyId)
      .single();

    if (!job) {
      await logSync(supabase, integration?.id, companyId, "inbound", null, normalized.external_candidate_id, "failed", body, null, `Job not found: ${jobIdParam}`);
      return NextResponse.json({ error: `Job not found: ${jobIdParam}` }, { status: 404 });
    }
    if (job.status !== "active") {
      await logSync(supabase, integration?.id, companyId, "inbound", null, normalized.external_candidate_id, "skipped", body, null, "Job is not active");
      return NextResponse.json({ error: "Job is not active" }, { status: 410 });
    }
    jobId = job.id;
    jobTitle = job.title;
  } else if (jobData.title) {
    // Try to match by title (fuzzy)
    const { data: jobs } = await supabase
      .from("jobs")
      .select("id, title, status")
      .eq("company_id", companyId)
      .eq("status", "active")
      .ilike("title", `%${jobData.title}%`)
      .limit(1);

    if (jobs && jobs.length > 0) {
      jobId = jobs[0].id;
      jobTitle = jobs[0].title;
    }
  }

  if (!jobId) {
    await logSync(supabase, integration?.id, companyId, "inbound", null, normalized.external_candidate_id, "failed", body, null, "No matching active job found. Provide job_id or ensure job title matches.");
    return NextResponse.json(
      { error: "No matching active job found. Provide a job_id query parameter or ensure the job title matches an active job." },
      { status: 404 }
    );
  }

  // 7. Upsert candidate by email
  const email = candidateData.email.trim().toLowerCase();

  let githubUsername = candidateData.github_username?.trim().replace(/^@/, "") || null;
  if (githubUsername) {
    const { data: ghConflict } = await supabase
      .from("candidates")
      .select("id")
      .eq("github_username", githubUsername)
      .neq("email", email)
      .single();
    if (ghConflict) githubUsername = null;
  }

  const { data: existingCandidate } = await supabase
    .from("candidates")
    .select("id")
    .eq("email", email)
    .single();

  let candidateId: string;

  if (existingCandidate) {
    candidateId = existingCandidate.id;
    const { error: updateError } = await supabase
      .from("candidates")
      .update({
        full_name: candidateData.full_name,
        phone: candidateData.phone || null,
        linkedin_url: candidateData.linkedin_url || null,
        github_username: githubUsername,
        personal_website_url: candidateData.portfolio_url || null,
      })
      .eq("id", candidateId);
    if (updateError) {
      console.warn("[inbound] Candidate update failed:", updateError.message);
    }
  } else {
    const { data: newCandidate, error: insertError } = await supabase
      .from("candidates")
      .insert({
        full_name: candidateData.full_name,
        email,
        phone: candidateData.phone || null,
        linkedin_url: candidateData.linkedin_url || null,
        github_username: githubUsername,
        personal_website_url: candidateData.portfolio_url || null,
      })
      .select("id")
      .single();

    if (insertError || !newCandidate) {
      await logSync(supabase, integration?.id, companyId, "inbound", null, normalized.external_candidate_id, "failed", body, null, `Candidate insert failed: ${insertError?.message}`);
      return NextResponse.json({ error: "Failed to create candidate" }, { status: 500 });
    }
    candidateId = newCandidate.id;
  }

  // 8. Check for duplicate application
  const { data: existingApp } = await supabase
    .from("applications")
    .select("id")
    .eq("candidate_id", candidateId)
    .eq("job_id", jobId)
    .single();

  if (existingApp) {
    await logSync(supabase, integration?.id, companyId, "inbound", existingApp.id, normalized.external_candidate_id, "skipped", body, null, "Duplicate application");
    return NextResponse.json(
      {
        message: "Candidate has already applied for this job",
        application_id: existingApp.id,
        duplicate: true,
      },
      { status: 409 }
    );
  }

  // 9. Create application
  const formData: Record<string, unknown> = {
    full_name: candidateData.full_name,
    email,
    phone: candidateData.phone,
    linkedin_url: candidateData.linkedin_url,
    github_username: candidateData.github_username,
    portfolio_url: candidateData.portfolio_url,
    resume_text: candidateData.resume_text,
    cover_letter: candidateData.cover_letter,
    source: `ats_${provider}`,
    external_candidate_id: normalized.external_candidate_id,
    external_application_id: normalized.external_application_id,
    custom_answers: normalized.custom_answers,
  };

  const { data: application, error: appError } = await supabase
    .from("applications")
    .insert({
      candidate_id: candidateId,
      job_id: jobId,
      company_id: companyId,
      current_stage: "applied",
      status: "active",
      application_form_data: formData,
    })
    .select("id")
    .single();

  if (appError || !application) {
    await logSync(supabase, integration?.id, companyId, "inbound", null, normalized.external_candidate_id, "failed", body, null, `Application insert failed: ${appError?.message}`);
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 });
  }

  // 10. Log success
  await logSync(supabase, integration?.id, companyId, "inbound", application.id, normalized.external_candidate_id, "success", body, { application_id: application.id });

  // Update integration stats
  if (integration) {
    await supabase
      .from("ats_integrations")
      .update({
        last_inbound_at: new Date().toISOString(),
        inbound_count: (integration as unknown as { inbound_count: number }).inbound_count + 1 || 1,
      })
      .eq("id", integration.id);
  }

  // 11. Dispatch webhook
  dispatchWebhook(companyId, "candidate.applied", {
    application_id: application.id,
    candidate_id: candidateId,
    candidate_name: candidateData.full_name,
    candidate_email: email,
    job_id: jobId,
    job_title: jobTitle,
    source: `ats_${provider}`,
  });

  // 12. Trigger ATS screening — await the fetch so it doesn't get killed on function exit
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  try {
    await fetch(`${baseUrl}/api/apply/screen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ application_id: application.id }),
    });
  } catch (screenErr) {
    console.error("[inbound] Screening trigger failed:", screenErr);
  }

  // 13. Return
  return NextResponse.json({
    success: true,
    application_id: application.id,
    candidate_id: candidateId,
    job_id: jobId,
    job_title: jobTitle,
    message: `Candidate "${candidateData.full_name}" submitted for "${jobTitle}". ATS screening completed.`,
  });
}

// ────────────────────────────────────────────────────────
// SYNC LOG HELPER
// ────────────────────────────────────────────────────────

async function logSync(
  supabase: ReturnType<typeof createAdminClient>,
  integrationId: string | undefined | null,
  companyId: string,
  direction: "inbound" | "outbound",
  applicationId: string | null,
  externalId: string | undefined | null,
  status: "success" | "failed" | "skipped",
  payload: unknown,
  response: unknown,
  errorMessage?: string | null
) {
  if (!integrationId) return; // Don't log if no integration configured
  await supabase.from("ats_sync_log").insert({
    integration_id: integrationId,
    company_id: companyId,
    direction,
    application_id: applicationId,
    external_id: externalId || null,
    status,
    payload,
    response,
    error_message: errorMessage || null,
  });
}
