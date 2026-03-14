import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthMembership, hasMinRole } from "@/lib/auth/permissions";

/**
 * GET /api/jobs/assignments?job_id=xxx
 * List all recruiters assigned to a job.
 */
export async function GET(request: NextRequest) {
  const membership = await getAuthMembership();
  if (!membership) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobId = request.nextUrl.searchParams.get("job_id");
  const admin = createAdminClient();

  if (jobId) {
    // Assignments for a specific job
    const { data } = await admin
      .from("job_assignments")
      .select("id, user_id, assigned_by, created_at")
      .eq("job_id", jobId)
      .eq("company_id", membership.companyId);

    // Get user details for assigned users
    const userIds = (data || []).map((a) => a.user_id);
    const { data: users } = userIds.length > 0
      ? await admin
          .from("company_users")
          .select("user_id, email, full_name, role")
          .eq("company_id", membership.companyId)
          .in("user_id", userIds)
      : { data: [] };

    const userMap = new Map((users || []).map((u) => [u.user_id, u]));

    return NextResponse.json({
      assignments: (data || []).map((a) => ({
        ...a,
        user: userMap.get(a.user_id) || null,
      })),
    });
  }

  // All assignments for the company (for dashboard views)
  const { data } = await admin
    .from("job_assignments")
    .select("id, job_id, user_id, created_at")
    .eq("company_id", membership.companyId);

  return NextResponse.json({ assignments: data || [] });
}

/**
 * POST /api/jobs/assignments
 * Assign a recruiter to a job. Admin/owner only.
 * Body: { job_id: string, user_id: string }
 */
export async function POST(request: NextRequest) {
  const membership = await getAuthMembership();
  if (!membership || !hasMinRole(membership.role, "admin")) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { job_id, user_id } = await request.json();
  if (!job_id || !user_id) {
    return NextResponse.json({ error: "job_id and user_id required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Verify the user belongs to the same company
  const { data: targetUser } = await admin
    .from("company_users")
    .select("user_id")
    .eq("user_id", user_id)
    .eq("company_id", membership.companyId)
    .maybeSingle();

  if (!targetUser) {
    return NextResponse.json({ error: "User not found in your company" }, { status: 404 });
  }

  // Verify job belongs to company
  const { data: job } = await admin
    .from("jobs")
    .select("id")
    .eq("id", job_id)
    .eq("company_id", membership.companyId)
    .maybeSingle();

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const { error } = await admin.from("job_assignments").upsert(
    {
      job_id,
      user_id,
      company_id: membership.companyId,
      assigned_by: membership.userId,
    },
    { onConflict: "job_id,user_id" }
  );

  if (error) {
    console.error("[assignments] Insert error:", error);
    return NextResponse.json({ error: "Failed to assign" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

/**
 * DELETE /api/jobs/assignments?job_id=xxx&user_id=yyy
 * Remove a recruiter from a job. Admin/owner only.
 */
export async function DELETE(request: NextRequest) {
  const membership = await getAuthMembership();
  if (!membership || !hasMinRole(membership.role, "admin")) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const jobId = request.nextUrl.searchParams.get("job_id");
  const userId = request.nextUrl.searchParams.get("user_id");

  if (!jobId || !userId) {
    return NextResponse.json({ error: "job_id and user_id required" }, { status: 400 });
  }

  const admin = createAdminClient();
  await admin
    .from("job_assignments")
    .delete()
    .eq("job_id", jobId)
    .eq("user_id", userId)
    .eq("company_id", membership.companyId);

  return NextResponse.json({ success: true });
}
