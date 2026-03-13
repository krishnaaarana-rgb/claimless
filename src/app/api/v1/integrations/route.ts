import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getCompanyId(userId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("company_users")
    .select("company_id")
    .eq("user_id", userId)
    .single();
  return data?.company_id ?? null;
}

// GET — list ATS integrations for the company
export async function GET(_request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const companyId = await getCompanyId(user.id);
  if (!companyId) return NextResponse.json({ error: "No company found" }, { status: 404 });

  const admin = createAdminClient();
  const { data: integrations } = await admin
    .from("ats_integrations")
    .select("id, provider, name, is_active, callback_url, callback_events, last_inbound_at, last_outbound_at, inbound_count, outbound_count, created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  return NextResponse.json({ integrations: integrations || [] });
}

// POST — create a new ATS integration
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const companyId = await getCompanyId(user.id);
  if (!companyId) return NextResponse.json({ error: "No company found" }, { status: 404 });

  const body = await request.json();
  const { provider, name, callback_url, callback_secret, callback_events } = body;

  if (!provider || !["jobadder", "bullhorn", "vincere", "generic"].includes(provider)) {
    return NextResponse.json({ error: "Invalid provider. Must be: jobadder, bullhorn, vincere, or generic" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: integration, error } = await admin
    .from("ats_integrations")
    .insert({
      company_id: companyId,
      provider,
      name: name || `${provider.charAt(0).toUpperCase() + provider.slice(1)} Integration`,
      callback_url: callback_url || null,
      callback_secret: callback_secret || null,
      callback_events: callback_events || ["screening_completed", "interview_completed"],
    })
    .select("id, provider, name, is_active, callback_url, callback_events, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ integration }, { status: 201 });
}

// PATCH — update an ATS integration
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const companyId = await getCompanyId(user.id);
  if (!companyId) return NextResponse.json({ error: "No company found" }, { status: 404 });

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "Integration id is required" }, { status: 400 });

  const admin = createAdminClient();

  // Verify ownership
  const { data: existing } = await admin
    .from("ats_integrations")
    .select("id")
    .eq("id", id)
    .eq("company_id", companyId)
    .single();

  if (!existing) return NextResponse.json({ error: "Integration not found" }, { status: 404 });

  const allowedFields: Record<string, unknown> = {};
  for (const key of ["name", "is_active", "callback_url", "callback_secret", "callback_events", "field_mapping", "provider_api_key", "provider_api_url"]) {
    if (key in updates) allowedFields[key] = updates[key];
  }

  const { error } = await admin
    .from("ats_integrations")
    .update({ ...allowedFields, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

// DELETE — remove an ATS integration
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const companyId = await getCompanyId(user.id);
  if (!companyId) return NextResponse.json({ error: "No company found" }, { status: 404 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Integration id is required" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin
    .from("ats_integrations")
    .delete()
    .eq("id", id)
    .eq("company_id", companyId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
