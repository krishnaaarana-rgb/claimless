import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { dispatchWebhook } from "@/lib/webhooks/dispatcher";

const VALID_STAGES = [
  "applied",
  "pending_review",
  "screening",
  "stage_1_passed",
  "stage_1_failed",
  "interview_invited",
  "interview_completed",
  "hired",
  "rejected",
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Verify membership
  const { data: membership } = await admin
    .from("company_users")
    .select("company_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "No company found" }, { status: 404 });
  }

  const body = await request.json();
  const { stage, application_id } = body;

  if (!stage || !VALID_STAGES.includes(stage)) {
    return NextResponse.json(
      { error: `stage must be one of: ${VALID_STAGES.join(", ")}` },
      { status: 400 }
    );
  }

  if (!application_id) {
    return NextResponse.json(
      { error: "application_id is required" },
      { status: 400 }
    );
  }

  // Fetch the current stage before update
  const { data: currentApp } = await admin
    .from("applications")
    .select("current_stage, candidates(full_name, email), jobs(title)")
    .eq("id", application_id)
    .eq("company_id", membership.company_id)
    .single();

  // Update the application stage
  const { error } = await admin
    .from("applications")
    .update({ current_stage: stage, updated_at: new Date().toISOString() })
    .eq("id", application_id)
    .eq("company_id", membership.company_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Dispatch stage_changed webhook
  const candidate = currentApp?.candidates as unknown as { full_name: string; email: string } | null;
  const job = currentApp?.jobs as unknown as { title: string } | null;

  dispatchWebhook(membership.company_id, "candidate.stage_changed", {
    application_id,
    candidate_id: id,
    candidate_name: candidate?.full_name,
    candidate_email: candidate?.email,
    job_title: job?.title,
    previous_stage: currentApp?.current_stage,
    new_stage: stage,
  });

  // Also dispatch shortlisted webhook if moving to hired/shortlisted
  if (stage === "hired") {
    dispatchWebhook(membership.company_id, "candidate.hired", {
      application_id,
      candidate_id: id,
      candidate_name: candidate?.full_name,
      candidate_email: candidate?.email,
      job_title: job?.title,
    });
  }

  return NextResponse.json({ success: true, stage });
}
