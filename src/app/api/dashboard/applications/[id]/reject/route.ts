import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { dispatchWebhook } from "@/lib/webhooks/dispatcher";

export async function POST(
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

  // Verify user belongs to a company
  const { data: membership } = await admin
    .from("company_users")
    .select("company_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "No company found" }, { status: 404 });
  }

  let reason: string | null = null;
  try {
    const body = await request.json();
    reason = body.reason ?? null;
  } catch {
    // No body is fine
  }

  const { data: application, error: fetchError } = await admin
    .from("applications")
    .select("id, company_id, candidates(full_name, email), jobs(title)")
    .eq("id", id)
    .eq("company_id", membership.company_id)
    .single();

  if (fetchError || !application) {
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 }
    );
  }

  const { data: updated, error: updateError } = await admin
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
  const candidate = application.candidates as unknown as { full_name: string; email: string } | null;
  const job = application.jobs as unknown as { title: string } | null;
  dispatchWebhook(application.company_id, "candidate.rejected", {
    application_id: id,
    candidate_name: candidate?.full_name,
    candidate_email: candidate?.email,
    job_title: job?.title,
    reason: reason || "Manual rejection",
    source: "manual",
  });

  return NextResponse.json({ application: updated });
}
