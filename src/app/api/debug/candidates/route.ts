import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Find candidate by email
  const { data: candidate, error: findError } = await supabase
    .from("candidates")
    .select("id, full_name, email")
    .eq("email", email.trim().toLowerCase())
    .single();

  if (findError || !candidate) {
    return NextResponse.json({ error: "Candidate not found", email }, { status: 404 });
  }

  const deleted: Record<string, number> = {
    applications: 0,
    candidate_profiles: 0,
    candidates: 0,
  };

  // Delete applications
  const { data: apps } = await supabase
    .from("applications")
    .delete()
    .eq("candidate_id", candidate.id)
    .select("id");
  deleted.applications = apps?.length ?? 0;

  // Delete candidate_profiles
  const { data: profiles } = await supabase
    .from("candidate_profiles")
    .delete()
    .eq("candidate_id", candidate.id)
    .select("id");
  deleted.candidate_profiles = profiles?.length ?? 0;

  // Delete candidate
  const { error: delError } = await supabase
    .from("candidates")
    .delete()
    .eq("id", candidate.id);

  if (delError) {
    return NextResponse.json({ error: delError.message }, { status: 500 });
  }
  deleted.candidates = 1;

  return NextResponse.json({
    deleted,
    candidate: { id: candidate.id, full_name: candidate.full_name, email: candidate.email },
  });
}
