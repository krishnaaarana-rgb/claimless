import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = createAdminClient();

  const { data: candidates, error } = await supabase
    .from("candidates")
    .select("id, github_username, full_name, email, created_at, github_access_token");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const sanitized = (candidates || []).map((c) => ({
    id: c.id,
    github_username: c.github_username,
    full_name: c.full_name,
    email: c.email,
    created_at: c.created_at,
    has_github_access_token: c.github_access_token != null && c.github_access_token !== "",
  }));

  return NextResponse.json({ candidates: sanitized });
}
