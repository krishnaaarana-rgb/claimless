import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { dispatchWebhook } from "@/lib/webhooks/dispatcher";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { job_id, form_data } = body;

  if (!job_id || !form_data?.email || !form_data?.full_name) {
    return NextResponse.json(
      { error: "Job ID, full name, and email are required" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const email = form_data.email.trim().toLowerCase();

  // 1. Validate job exists and is active
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id, company_id, title, description, employment_type, status")
    .eq("id", job_id)
    .single();

  if (jobError || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (job.status !== "active") {
    return NextResponse.json(
      { error: "This position is no longer accepting applications" },
      { status: 410 }
    );
  }

  // 2. Normalize github_username
  let githubUsername = form_data.github_username?.trim().replace(/^@/, "") || null;

  if (githubUsername) {
    const { data: ghConflict } = await supabase
      .from("candidates")
      .select("id")
      .eq("github_username", githubUsername)
      .neq("email", email)
      .single();

    if (ghConflict) {
      console.log("[apply] GitHub username", githubUsername, "taken by another candidate, storing in form_data only");
      githubUsername = null;
    }
  }

  // 3. Upsert candidate by email
  const { data: existingCandidate } = await supabase
    .from("candidates")
    .select("id")
    .eq("email", email)
    .single();

  let candidateId: string;

  if (existingCandidate) {
    candidateId = existingCandidate.id;
    const candidateFields = {
      full_name: form_data.full_name,
      phone: form_data.phone || null,
      linkedin_url: form_data.linkedin_url || null,
      github_username: githubUsername,
      personal_website_url: form_data.portfolio_url || null,
      resume_url: form_data.resume_filename || null,
    };

    const { error: updateError } = await supabase
      .from("candidates")
      .update(candidateFields)
      .eq("id", candidateId);

    if (updateError) {
      if (updateError.code === "23505" && githubUsername) {
        console.warn(`[apply] GitHub username ${githubUsername} UNIQUE conflict on update, retrying without`);
        await supabase
          .from("candidates")
          .update({ ...candidateFields, github_username: null })
          .eq("id", candidateId);
      } else {
        console.error("[apply] Candidate update error:", updateError);
      }
    }
  } else {
    const candidateFields = {
      full_name: form_data.full_name,
      email,
      phone: form_data.phone || null,
      linkedin_url: form_data.linkedin_url || null,
      github_username: githubUsername,
      personal_website_url: form_data.portfolio_url || null,
      resume_url: form_data.resume_filename || null,
    };

    let { data: newCandidate, error: candidateError } = await supabase
      .from("candidates")
      .insert(candidateFields)
      .select("id")
      .single();

    if (candidateError && candidateError.code === "23505" && githubUsername) {
      console.warn(`[apply] GitHub username ${githubUsername} UNIQUE conflict on insert, retrying without`);
      const retry = await supabase
        .from("candidates")
        .insert({ ...candidateFields, github_username: null })
        .select("id")
        .single();
      newCandidate = retry.data;
      candidateError = retry.error;
    }

    if (candidateError || !newCandidate) {
      console.error("[apply] Candidate insert error:", candidateError);
      return NextResponse.json(
        { error: "Failed to create candidate record" },
        { status: 500 }
      );
    }
    candidateId = newCandidate.id;
  }

  // 4. Check for duplicate application
  const { data: existingApp } = await supabase
    .from("applications")
    .select("id")
    .eq("candidate_id", candidateId)
    .eq("job_id", job_id)
    .single();

  if (existingApp) {
    return NextResponse.json(
      { error: "You've already applied for this position", duplicate: true },
      { status: 409 }
    );
  }

  // 5. Create application
  const { data: application, error: appError } = await supabase
    .from("applications")
    .insert({
      candidate_id: candidateId,
      job_id: job_id,
      company_id: job.company_id,
      current_stage: "applied",
      status: "active",
      application_form_data: form_data,
    })
    .select("id")
    .single();

  if (appError || !application) {
    console.error("[apply] Application insert error:", appError);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }

  console.log("[apply] Application created:", application.id);

  // 5b. Dispatch webhook (fire-and-forget)
  dispatchWebhook(job.company_id, "candidate.applied", {
    application_id: application.id,
    candidate_id: candidateId,
    candidate_name: form_data.full_name,
    candidate_email: email,
    job_id: job.id,
    job_title: job.title,
  });

  // 6. Fire-and-forget background ATS screening
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  fetch(`${baseUrl}/api/apply/screen`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ application_id: application.id }),
  }).catch(() => {});

  // 7. Return success immediately — candidate never waits for screening
  return NextResponse.json({
    success: true,
    application_id: application.id,
  });
}
