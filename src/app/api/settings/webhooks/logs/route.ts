import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: membership } = await admin
    .from("company_users")
    .select("company_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "No company found" }, { status: 404 });
  }

  const params = request.nextUrl.searchParams;
  const webhookId = params.get("webhook_id");
  const limit = Math.min(parseInt(params.get("limit") || "50"), 100);

  // Get company's webhook IDs
  const { data: webhooks } = await admin
    .from("webhooks")
    .select("id")
    .eq("company_id", membership.company_id);

  const webhookIds = (webhooks || []).map((w) => w.id);
  if (webhookIds.length === 0) {
    return NextResponse.json({ logs: [] });
  }

  let query = admin
    .from("webhook_logs")
    .select("id, webhook_id, event, payload, status_code, response_body, success, duration_ms, attempted_at")
    .in("webhook_id", webhookIds)
    .order("attempted_at", { ascending: false })
    .limit(limit);

  if (webhookId && webhookIds.includes(webhookId)) {
    query = query.eq("webhook_id", webhookId);
  }

  const { data: logs } = await query;

  return NextResponse.json({ logs: logs || [] });
}
