import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

// POST /api/briefs — create a shareable brief token
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get company
  const admin = createAdminClient();
  const { data: member } = await admin
    .from("company_users")
    .select("company_id")
    .eq("user_id", user.id)
    .single();

  if (!member) {
    return NextResponse.json({ error: "No company found" }, { status: 403 });
  }

  const body = await request.json();
  const { application_ids, brief_type, job_id, title, note, expires_days } = body;

  if (!application_ids || !Array.isArray(application_ids) || application_ids.length === 0) {
    return NextResponse.json({ error: "application_ids is required" }, { status: 400 });
  }

  // Verify all applications belong to this company
  const { data: apps } = await admin
    .from("applications")
    .select("id, company_id")
    .in("id", application_ids);

  if (!apps || apps.length !== application_ids.length) {
    return NextResponse.json({ error: "Some applications not found" }, { status: 404 });
  }

  const unauthorized = apps.some((a) => a.company_id !== member.company_id);
  if (unauthorized) {
    return NextResponse.json({ error: "Applications do not belong to your company" }, { status: 403 });
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (expires_days || 30));

  const { data: brief, error } = await admin
    .from("brief_tokens")
    .insert({
      company_id: member.company_id,
      created_by: user.id,
      application_ids,
      brief_type: brief_type || (application_ids.length > 1 ? "shortlist" : "single"),
      job_id: job_id || null,
      token,
      title: title || null,
      note: note || null,
      expires_at: expiresAt.toISOString(),
    })
    .select("id, token, expires_at, brief_type")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ brief });
}

// GET /api/briefs — list briefs for current company
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: member } = await admin
    .from("company_users")
    .select("company_id")
    .eq("user_id", user.id)
    .single();

  if (!member) {
    return NextResponse.json({ error: "No company found" }, { status: 403 });
  }

  const { data: briefs } = await admin
    .from("brief_tokens")
    .select("id, token, brief_type, title, note, expires_at, view_count, last_viewed_at, created_at, application_ids, job_id")
    .eq("company_id", member.company_id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ briefs: briefs || [] });
}
