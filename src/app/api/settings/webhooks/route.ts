import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const VALID_EVENTS = [
  "candidate.applied",
  "candidate.screening_completed",
  "candidate.stage_changed",
  "candidate.interview_completed",
  "candidate.email_sent",
  "candidate.rejected",
  "candidate.hired",
];

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
  const { data: webhooks } = await admin
    .from("webhooks")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  // Get delivery stats for last 24h for each webhook
  const webhookIds = (webhooks || []).map((w) => w.id);
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  let stats: Record<string, { total: number; success: number; failed: number }> = {};

  if (webhookIds.length > 0) {
    const { data: logs } = await admin
      .from("webhook_logs")
      .select("webhook_id, success")
      .in("webhook_id", webhookIds)
      .gte("attempted_at", since);

    for (const log of logs || []) {
      if (!stats[log.webhook_id]) {
        stats[log.webhook_id] = { total: 0, success: 0, failed: 0 };
      }
      stats[log.webhook_id].total++;
      if (log.success) stats[log.webhook_id].success++;
      else stats[log.webhook_id].failed++;
    }
  }

  const result = (webhooks || []).map((w) => ({
    ...w,
    stats_24h: stats[w.id] || { total: 0, success: 0, failed: 0 },
  }));

  return NextResponse.json({ webhooks: result });
}

export async function POST(request: NextRequest) {
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
  const { name, url, events, secret } = body;

  if (!name || !url || !events || !Array.isArray(events)) {
    return NextResponse.json(
      { error: "name, url, and events are required" },
      { status: 400 }
    );
  }

  // Validate URL
  if (!url.startsWith("https://") && !url.startsWith("http://localhost")) {
    return NextResponse.json(
      { error: "URL must start with https:// (or http://localhost for testing)" },
      { status: 400 }
    );
  }

  // Validate events
  const invalidEvents = events.filter((e: string) => !VALID_EVENTS.includes(e));
  if (invalidEvents.length > 0) {
    return NextResponse.json(
      { error: `Invalid events: ${invalidEvents.join(", ")}` },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { data: webhook, error } = await admin
    .from("webhooks")
    .insert({
      company_id: companyId,
      name: name.trim(),
      url: url.trim(),
      events,
      secret: secret || null,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ webhook });
}

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
  const { id, name, url, events, is_active, secret } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // Validate URL if provided
  if (url && !url.startsWith("https://") && !url.startsWith("http://localhost")) {
    return NextResponse.json(
      { error: "URL must start with https:// (or http://localhost for testing)" },
      { status: 400 }
    );
  }

  // Validate events if provided
  if (events) {
    const invalidEvents = events.filter((e: string) => !VALID_EVENTS.includes(e));
    if (invalidEvents.length > 0) {
      return NextResponse.json(
        { error: `Invalid events: ${invalidEvents.join(", ")}` },
        { status: 400 }
      );
    }
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (name !== undefined) updates.name = name.trim();
  if (url !== undefined) updates.url = url.trim();
  if (events !== undefined) updates.events = events;
  if (is_active !== undefined) updates.is_active = is_active;
  if (secret !== undefined) updates.secret = secret || null;

  const admin = createAdminClient();
  const { data: webhook, error } = await admin
    .from("webhooks")
    .update(updates)
    .eq("id", id)
    .eq("company_id", companyId)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ webhook });
}

export async function DELETE(request: NextRequest) {
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

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const admin = createAdminClient();
  await admin
    .from("webhooks")
    .delete()
    .eq("id", id)
    .eq("company_id", companyId);

  return NextResponse.json({ success: true });
}
