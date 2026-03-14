import { createClient } from "@/lib/supabase/client";
import { createAdminClient } from "@/lib/supabase/admin";

export type Role = "owner" | "admin" | "member" | "viewer";

export interface Membership {
  userId: string;
  companyId: string;
  role: Role;
  email: string;
  fullName: string | null;
}

/**
 * Get the authenticated user or return null.
 */
export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Get user's company membership (company_id + role).
 * Returns null if user is not a member of any company.
 */
export async function getMembership(
  userId: string
): Promise<Membership | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("company_users")
    .select("company_id, role, email, full_name")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return null;

  return {
    userId,
    companyId: data.company_id,
    role: data.role as Role,
    email: data.email,
    fullName: data.full_name,
  };
}

/**
 * Get authenticated user's membership in one call.
 * Returns null if not authenticated or not a member.
 */
export async function getAuthMembership(): Promise<Membership | null> {
  const user = await getAuthUser();
  if (!user) return null;
  return getMembership(user.id);
}

/**
 * Check if a role meets a minimum permission level.
 * Hierarchy: owner > admin > member > viewer
 */
const ROLE_LEVEL: Record<Role, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  viewer: 1,
};

export function hasMinRole(userRole: Role, minRole: Role): boolean {
  return ROLE_LEVEL[userRole] >= ROLE_LEVEL[minRole];
}

/**
 * Check if user can manage a specific job (owner/admin or assigned recruiter).
 */
export async function canManageJob(
  userId: string,
  companyId: string,
  role: Role,
  jobId: string
): Promise<boolean> {
  // Owner and admin can manage any job
  if (hasMinRole(role, "admin")) return true;

  // Members can manage jobs they're assigned to
  if (role === "member") {
    const admin = createAdminClient();
    const { data } = await admin
      .from("job_assignments")
      .select("id")
      .eq("job_id", jobId)
      .eq("user_id", userId)
      .eq("company_id", companyId)
      .maybeSingle();
    return !!data;
  }

  return false;
}

/**
 * Check if user can manage candidates for a specific job.
 * Same logic as canManageJob — if you're assigned to the job, you can manage its candidates.
 */
export const canManageCandidates = canManageJob;

/**
 * Permission matrix — what each role can do.
 */
export const PERMISSIONS = {
  // Settings & company config
  manageSettings: ["owner", "admin"] as Role[],
  // Team management
  manageTeam: ["owner", "admin"] as Role[],
  // Job CRUD
  createJob: ["owner", "admin", "member"] as Role[],
  deleteJob: ["owner", "admin"] as Role[],
  // Candidate management (additional job assignment check needed)
  manageCandidates: ["owner", "admin", "member"] as Role[],
  // Bulk operations
  bulkOperations: ["owner", "admin"] as Role[],
  // View only
  viewDashboard: ["owner", "admin", "member", "viewer"] as Role[],
};

/**
 * Quick role check helper for API routes.
 */
export function checkPermission(role: Role, permission: keyof typeof PERMISSIONS): boolean {
  return PERMISSIONS[permission].includes(role);
}
