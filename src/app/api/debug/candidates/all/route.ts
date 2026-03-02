import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE() {
  const supabase = createAdminClient();

  // Find all non-seed candidates (seed data has github_username starting with "demo-")
  const { data: candidates, error: findError } = await supabase
    .from("candidates")
    .select("id, full_name, email, github_username")
    .or("github_username.is.null,github_username.not.like.demo-%");

  if (findError) {
    return NextResponse.json({ error: findError.message }, { status: 500 });
  }

  if (!candidates || candidates.length === 0) {
    return NextResponse.json({ deleted: { applications: 0, candidate_profiles: 0, candidates: 0 }, message: "No non-seed candidates found" });
  }

  const candidateIds = candidates.map((c) => c.id);

  const deleted: Record<string, number> = {
    applications: 0,
    candidate_profiles: 0,
    candidates: 0,
  };

  // Delete applications for these candidates
  const { data: apps } = await supabase
    .from("applications")
    .delete()
    .in("candidate_id", candidateIds)
    .select("id");
  deleted.applications = apps?.length ?? 0;

  // Delete candidate_profiles
  const { data: profiles } = await supabase
    .from("candidate_profiles")
    .delete()
    .in("candidate_id", candidateIds)
    .select("id");
  deleted.candidate_profiles = profiles?.length ?? 0;

  // Delete candidates
  const { data: dels } = await supabase
    .from("candidates")
    .delete()
    .in("id", candidateIds)
    .select("id");
  deleted.candidates = dels?.length ?? 0;

  return NextResponse.json({
    deleted,
    message: `Deleted ${deleted.candidates} non-seed candidates`,
    preserved: "Candidates with github_username starting with 'demo-' were kept",
  });
}
