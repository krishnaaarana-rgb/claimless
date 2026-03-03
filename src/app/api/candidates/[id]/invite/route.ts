import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendATSNotification } from "@/lib/email/notifications";
import { dispatchWebhook } from "@/lib/webhooks/dispatcher";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: candidateId } = await params;

  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Get user's company
  const { data: membership } = await admin
    .from("company_users")
    .select("company_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "No company found" }, { status: 404 });
  }

  // Get candidate
  const { data: candidate } = await admin
    .from("candidates")
    .select("id, full_name, email")
    .eq("id", candidateId)
    .single();

  if (!candidate) {
    return NextResponse.json(
      { error: "Candidate not found" },
      { status: 404 }
    );
  }

  // Get latest application for this candidate within the user's company
  const { data: application } = await admin
    .from("applications")
    .select("id, current_stage, company_id, jobs(id, title)")
    .eq("candidate_id", candidateId)
    .eq("company_id", membership.company_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!application) {
    return NextResponse.json(
      { error: "No application found for this candidate" },
      { status: 404 }
    );
  }

  const job = application.jobs as unknown as {
    id: string;
    title: string;
  } | null;

  // Check if a valid (pending, non-expired) interview token already exists
  const { data: existingToken } = await admin
    .from("interview_tokens")
    .select("id, token, status, expires_at")
    .eq("application_id", application.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const hasValidToken =
    existingToken &&
    existingToken.status === "pending" &&
    new Date(existingToken.expires_at) > new Date();

  if (hasValidToken) {
    // Token already exists and is valid -- just return the link
    return NextResponse.json({
      interview_url: `${baseUrl}/interview/${existingToken.token}`,
      token: existingToken.token,
      already_existed: true,
    });
  }

  // Generate a new interview token
  const token = crypto.randomUUID();
  const expiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  const { error: tokenError } = await admin
    .from("interview_tokens")
    .insert({
      application_id: application.id,
      token,
      status: "pending",
      expires_at: expiresAt,
    });

  if (tokenError) {
    console.error("[invite] Failed to create interview token:", tokenError);
    return NextResponse.json(
      { error: "Failed to create interview token" },
      { status: 500 }
    );
  }

  const interviewUrl = `${baseUrl}/interview/${token}`;

  // Update stage to interview_invited
  const previousStage = application.current_stage;
  await admin
    .from("applications")
    .update({
      current_stage: "interview_invited",
      updated_at: new Date().toISOString(),
    })
    .eq("id", application.id);

  // Send acceptance email with interview link
  if (candidate.email && job?.title) {
    try {
      await sendATSNotification({
        applicationId: application.id,
        candidateEmail: candidate.email,
        candidateName: candidate.full_name || "Applicant",
        jobTitle: job.title,
        companyId: membership.company_id,
        passed: true,
        interviewLink: interviewUrl,
      });
    } catch (err) {
      console.error("[invite] Email send failed:", err);
      // Don't fail the request -- token is already created
    }
  }

  // Dispatch stage_changed webhook
  dispatchWebhook(membership.company_id, "candidate.stage_changed", {
    candidate_id: candidateId,
    candidate_name: candidate.full_name,
    candidate_email: candidate.email,
    application_id: application.id,
    job_title: job?.title || null,
    previous_stage: previousStage,
    new_stage: "interview_invited",
    interview_url: interviewUrl,
  }).catch(() => {});

  return NextResponse.json({
    interview_url: interviewUrl,
    token,
    already_existed: false,
  });
}
