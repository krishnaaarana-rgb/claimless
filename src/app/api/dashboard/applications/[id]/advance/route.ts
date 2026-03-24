import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMembership, hasMinRole } from "@/lib/auth/permissions";

const STAGE_ORDER = [
  "applied",
  "pending_review",
  "stage_1_passed",
  "interview_invited",
  "interview_completed",
  "hired",
] as const;

export async function POST(
  _request: NextRequest,
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

  // Verify user belongs to a company and has sufficient role
  const membership = await getMembership(user.id);

  if (!membership) {
    return NextResponse.json({ error: "No company found" }, { status: 404 });
  }

  if (!hasMinRole(membership.role, "member")) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const { data: application, error: fetchError } = await admin
    .from("applications")
    .select("*, candidates (full_name, email), jobs (title)")
    .eq("id", id)
    .eq("company_id", membership.companyId)
    .single();

  if (fetchError || !application) {
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 }
    );
  }

  if (application.current_stage === "hired") {
    return NextResponse.json(
      { error: "Application is already shortlisted" },
      { status: 400 }
    );
  }

  if (application.current_stage === "rejected") {
    return NextResponse.json(
      { error: "Cannot advance a rejected application" },
      { status: 400 }
    );
  }

  const currentIndex = STAGE_ORDER.indexOf(
    application.current_stage as (typeof STAGE_ORDER)[number]
  );
  const nextStage = currentIndex >= 0 ? STAGE_ORDER[currentIndex + 1] : STAGE_ORDER[1];

  if (!nextStage) {
    return NextResponse.json(
      { error: "No next stage available" },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = {
    current_stage: nextStage,
    updated_at: new Date().toISOString(),
  };

  if (nextStage === "hired") {
    updates.status = "hired";
    updates.shortlisted_at = new Date().toISOString();
  }

  const { data: updated, error: updateError } = await admin
    .from("applications")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to advance application", details: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ application: updated });
}
