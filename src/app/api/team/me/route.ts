import { NextResponse } from "next/server";
import { getAuthMembership } from "@/lib/auth/permissions";

/**
 * GET /api/team/me
 * Returns the current user's role and company membership info.
 */
export async function GET() {
  const membership = await getAuthMembership();

  if (!membership) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({
    role: membership.role,
    company_id: membership.companyId,
    email: membership.email,
    full_name: membership.fullName,
  });
}
