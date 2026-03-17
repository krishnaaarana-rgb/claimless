import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/jobs/custom-skills
 * Returns all custom skills previously used across any job in this company.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Get company
  const { data: membership } = await admin
    .from("company_users")
    .select("company_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ skills: [] });
  }

  // Get all jobs with skill_requirements
  const { data: jobs } = await admin
    .from("jobs")
    .select("skill_requirements")
    .eq("company_id", membership.company_id)
    .not("skill_requirements", "is", null);

  // Extract unique custom skills
  const customSkills = new Set<string>();
  for (const job of jobs || []) {
    const reqs = job.skill_requirements as { skill: string; category: string }[] | null;
    if (!reqs) continue;
    for (const req of reqs) {
      if (req.category === "custom") {
        customSkills.add(req.skill);
      }
    }
  }

  return NextResponse.json({
    skills: Array.from(customSkills).sort(),
  });
}
