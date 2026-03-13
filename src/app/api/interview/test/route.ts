import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// POST /api/interview/test — create a test interview session
// Creates a temporary candidate + application + interview token for internal testing
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: membership } = await admin
    .from("company_users")
    .select("company_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "No company found" }, { status: 404 });
  }

  const body = await request.json();
  const { job_id, candidate_name, candidate_email, resume_text } = body;

  if (!job_id || !candidate_name) {
    return NextResponse.json(
      { error: "job_id and candidate_name are required" },
      { status: 400 }
    );
  }

  // Verify job belongs to company
  const { data: job } = await admin
    .from("jobs")
    .select("id, title, company_id")
    .eq("id", job_id)
    .eq("company_id", membership.company_id)
    .single();

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  // Use a test email so we don't pollute real candidate data
  const testEmail =
    candidate_email ||
    `test-${Date.now()}@claimless-test.internal`;

  // Upsert test candidate
  const { data: existing } = await admin
    .from("candidates")
    .select("id")
    .eq("email", testEmail)
    .single();

  let candidateId: string;

  if (existing) {
    candidateId = existing.id;
    await admin
      .from("candidates")
      .update({ full_name: candidate_name })
      .eq("id", candidateId);
  } else {
    const { data: newCandidate, error } = await admin
      .from("candidates")
      .insert({
        full_name: candidate_name,
        email: testEmail,
      })
      .select("id")
      .single();

    if (error || !newCandidate) {
      return NextResponse.json(
        { error: "Failed to create test candidate" },
        { status: 500 }
      );
    }
    candidateId = newCandidate.id;
  }

  // Create application
  const { data: application, error: appError } = await admin
    .from("applications")
    .insert({
      candidate_id: candidateId,
      job_id: job.id,
      company_id: membership.company_id,
      current_stage: "interview_invited",
      status: "active",
      application_form_data: {
        full_name: candidate_name,
        email: testEmail,
        resume_text: resume_text || null,
        source: "test_interview",
      },
    })
    .select("id")
    .single();

  if (appError || !application) {
    return NextResponse.json(
      { error: "Failed to create test application" },
      { status: 500 }
    );
  }

  // Create interview token
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h

  const { error: tokenError } = await admin
    .from("interview_tokens")
    .insert({
      application_id: application.id,
      token,
      status: "pending",
      expires_at: expiresAt,
    });

  if (tokenError) {
    return NextResponse.json(
      { error: "Failed to create interview token" },
      { status: 500 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return NextResponse.json({
    interview_url: `${baseUrl}/interview/${token}`,
    token,
    application_id: application.id,
    candidate_id: candidateId,
    job_title: job.title,
    expires_in: "24 hours",
  });
}
