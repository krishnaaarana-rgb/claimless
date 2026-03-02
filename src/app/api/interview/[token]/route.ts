import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createAdminClient();

  // Find the token
  const { data: tokenData, error: tokenError } = await supabase
    .from("interview_tokens")
    .select("id, application_id, status, expires_at")
    .eq("token", token)
    .single();

  if (tokenError || !tokenData) {
    return NextResponse.json({ error: "Invalid interview link" }, { status: 404 });
  }

  if (tokenData.status === "used") {
    return NextResponse.json(
      { error: "used", message: "This interview has already been completed." },
      { status: 410 }
    );
  }

  if (tokenData.status === "expired" || new Date(tokenData.expires_at) < new Date()) {
    return NextResponse.json(
      { error: "expired", message: "This interview link has expired." },
      { status: 410 }
    );
  }

  // Fetch application with candidate, job, company
  const { data: app } = await supabase
    .from("applications")
    .select(
      `
      id,
      company_id,
      current_stage,
      candidates (id, full_name, email, github_username),
      jobs (id, title, description, employment_type, github_required),
      companies (name)
    `
    )
    .eq("id", tokenData.application_id)
    .single();

  if (!app) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const candidate = app.candidates as unknown as {
    id: string;
    full_name: string | null;
    email: string | null;
    github_username: string | null;
  } | null;

  const job = app.jobs as unknown as {
    id: string;
    title: string;
    description: string | null;
    employment_type: string | null;
    github_required: boolean;
  } | null;

  const company = app.companies as unknown as { name: string } | null;

  // Fetch interview duration from company settings
  const { data: settings } = await supabase
    .from("company_settings")
    .select("interview_duration_minutes")
    .eq("company_id", app.company_id)
    .single();

  return NextResponse.json({
    candidate_name: candidate?.full_name || "",
    candidate_email: candidate?.email || "",
    github_username: candidate?.github_username || null,
    job_title: job?.title || "",
    job_description: job?.description || "",
    company_name: company?.name || "",
    github_required: job?.github_required || false,
    interview_duration: settings?.interview_duration_minutes || 15,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createAdminClient();
  const body = await request.json();

  // Find the token
  const { data: tokenData } = await supabase
    .from("interview_tokens")
    .select("id, application_id, status, expires_at")
    .eq("token", token)
    .single();

  if (!tokenData) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }

  if (tokenData.status === "used") {
    return NextResponse.json({ error: "Interview already started" }, { status: 410 });
  }

  // Save preferred name if provided
  if (body.preferred_name) {
    // Get candidate id from application
    const { data: app } = await supabase
      .from("applications")
      .select("candidate_id")
      .eq("id", tokenData.application_id)
      .single();

    if (app) {
      await supabase
        .from("candidates")
        .update({ full_name: body.preferred_name })
        .eq("id", app.candidate_id);
    }
  }

  // If starting interview, mark token as used and advance stage
  if (body.start_interview) {
    await supabase
      .from("interview_tokens")
      .update({
        status: "used",
        used_at: new Date().toISOString(),
      })
      .eq("id", tokenData.id);

    await supabase
      .from("applications")
      .update({
        current_stage: "interview_invited",
        updated_at: new Date().toISOString(),
      })
      .eq("id", tokenData.application_id);
  }

  return NextResponse.json({ success: true });
}
