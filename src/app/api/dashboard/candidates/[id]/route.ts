import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [candidateRes, profileRes, applicationsRes] = await Promise.all([
    supabase.from("candidates").select("*").eq("id", id).single(),
    supabase
      .from("candidate_profiles")
      .select("*")
      .eq("candidate_id", id)
      .single(),
    supabase
      .from("applications")
      .select(`*, jobs (title, department, location)`)
      .eq("candidate_id", id),
  ]);

  if (candidateRes.error || !candidateRes.data) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  return NextResponse.json({
    candidate: candidateRes.data,
    profile: profileRes.data ?? null,
    applications: applicationsRes.data ?? [],
  });
}
