import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { dispatchWebhook } from "@/lib/webhooks/dispatcher";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  let reason: string | null = null;
  try {
    const body = await request.json();
    reason = body.reason ?? null;
  } catch {
    // No body is fine
  }

  const { data: application, error: fetchError } = await supabase
    .from("applications")
    .select("id")
    .eq("id", id)
    .single();

  if (fetchError || !application) {
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 }
    );
  }

  // Fetch candidate and job info for webhook payload
  const { data: appDetails } = await supabase
    .from("applications")
    .select("company_id, candidates(full_name, email), jobs(title)")
    .eq("id", id)
    .single();

  const { data: updated, error: updateError } = await supabase
    .from("applications")
    .update({
      current_stage: "rejected",
      status: "rejected",
      rejected_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to reject application", details: updateError.message },
      { status: 500 }
    );
  }

  // Dispatch rejected webhook
  if (appDetails) {
    const candidate = appDetails.candidates as unknown as { full_name: string; email: string } | null;
    const job = appDetails.jobs as unknown as { title: string } | null;
    dispatchWebhook(appDetails.company_id, "candidate.rejected", {
      application_id: id,
      candidate_name: candidate?.full_name,
      candidate_email: candidate?.email,
      job_title: job?.title,
      reason: reason || "Manual rejection",
      source: "manual",
    });
  }

  return NextResponse.json({ application: updated });
}
