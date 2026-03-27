import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMembership, hasMinRole } from "@/lib/auth/permissions";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: candidateId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await getMembership(user.id);
  if (!membership || !hasMinRole(membership.role, "admin")) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const admin = createAdminClient();

  // Verify candidate belongs to this company
  const { data: apps } = await admin
    .from("applications")
    .select("id")
    .eq("candidate_id", candidateId)
    .eq("company_id", membership.companyId);

  if (!apps || apps.length === 0) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  const appIds = apps.map((a) => a.id);

  // Delete related records in order (foreign key dependencies)
  await admin.from("interview_tokens").delete().in("application_id", appIds);
  await admin.from("email_logs").delete().in("application_id", appIds);
  await admin.from("voice_interviews").delete().in("application_id", appIds);
  await admin.from("loom_submissions").delete().in("application_id", appIds);
  await admin.from("applications").delete().eq("candidate_id", candidateId).eq("company_id", membership.companyId);
  await admin.from("candidates").delete().eq("id", candidateId);

  return NextResponse.json({ success: true });
}
