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

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companyId = await getCompanyId(user.id);
  if (!companyId) {
    return NextResponse.json({ error: "No company found" }, { status: 404 });
  }

  const admin = createAdminClient();

  // Try to get existing settings
  let { data: settings } = await admin
    .from("company_settings")
    .select("*")
    .eq("company_id", companyId)
    .single();

  // Create defaults if none exist
  if (!settings) {
    const { data: created } = await admin
      .from("company_settings")
      .insert({ company_id: companyId })
      .select("*")
      .single();
    settings = created;
  }

  return NextResponse.json({ settings });
}

const VALID_HEX = /^#[0-9a-fA-F]{6}$/;

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companyId = await getCompanyId(user.id);
  if (!companyId) {
    return NextResponse.json({ error: "No company found" }, { status: 404 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  // Validate and pick allowed fields
  if (body.ats_pass_threshold !== undefined) {
    const val = Number(body.ats_pass_threshold);
    if (!Number.isInteger(val) || val < 1 || val > 100) {
      return NextResponse.json(
        { error: "ats_pass_threshold must be an integer 1-100" },
        { status: 400 }
      );
    }
    updates.ats_pass_threshold = val;
  }

  if (body.ats_auto_reject !== undefined) {
    updates.ats_auto_reject = Boolean(body.ats_auto_reject);
  }

  if (body.brand_accent_color !== undefined) {
    if (!VALID_HEX.test(body.brand_accent_color)) {
      return NextResponse.json(
        { error: "brand_accent_color must be a valid hex color" },
        { status: 400 }
      );
    }
    updates.brand_accent_color = body.brand_accent_color;
  }

  if (body.brand_logo_url !== undefined) {
    updates.brand_logo_url = body.brand_logo_url || null;
  }

  // Email templates
  for (const key of [
    "email_acceptance_subject",
    "email_acceptance_body",
    "email_rejection_subject",
    "email_rejection_body",
  ] as const) {
    if (body[key] !== undefined) {
      if (typeof body[key] !== "string" || body[key].trim().length === 0) {
        return NextResponse.json(
          { error: `${key} must be a non-empty string` },
          { status: 400 }
        );
      }
      updates[key] = body[key];
    }
  }

  // JSONB fields
  if (body.default_form_fields !== undefined) {
    updates.default_form_fields = body.default_form_fields;
  }
  if (body.stage_names !== undefined) {
    updates.stage_names = body.stage_names;
  }

  // Interview settings
  if (body.interview_duration_minutes !== undefined) {
    const val = Number(body.interview_duration_minutes);
    if (!Number.isInteger(val) || val < 5 || val > 60) {
      return NextResponse.json(
        { error: "interview_duration_minutes must be 5-60" },
        { status: 400 }
      );
    }
    updates.interview_duration_minutes = val;
  }
  if (body.interview_style !== undefined) {
    updates.interview_style = body.interview_style;
  }
  if (body.interview_focus !== undefined) {
    updates.interview_focus = body.interview_focus;
  }
  if (body.interview_custom_instructions !== undefined) {
    updates.interview_custom_instructions =
      body.interview_custom_instructions || null;
  }

  // Email provider
  if (body.email_provider !== undefined) {
    updates.email_provider = body.email_provider;
  }
  if (body.email_api_key !== undefined) {
    updates.email_api_key = body.email_api_key || null;
  }
  if (body.email_from_address !== undefined) {
    updates.email_from_address = body.email_from_address || null;
  }
  if (body.email_from_name !== undefined) {
    updates.email_from_name = body.email_from_name || null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  updates.updated_at = new Date().toISOString();

  const admin = createAdminClient();
  const { data: settings, error } = await admin
    .from("company_settings")
    .update(updates)
    .eq("company_id", companyId)
    .select("*")
    .single();

  if (error) {
    console.error("[settings] Update error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }

  return NextResponse.json({ settings });
}
