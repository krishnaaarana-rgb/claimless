import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth/api-key";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header" },
      { status: 401 }
    );
  }

  const { valid, companyId } = await validateApiKey(
    authHeader.replace("Bearer ", "")
  );
  if (!valid || !companyId) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const webhookId = params.get("webhook_id");
  const limit = Math.min(parseInt(params.get("limit") || "50"), 100);
  const offset = parseInt(params.get("offset") || "0");

  const supabase = createAdminClient();

  // First get company's webhook IDs
  const { data: webhooks } = await supabase
    .from("webhooks")
    .select("id")
    .eq("company_id", companyId);

  const webhookIds = (webhooks || []).map((w) => w.id);

  if (webhookIds.length === 0) {
    return NextResponse.json({ logs: [], total: 0, limit, offset });
  }

  let query = supabase
    .from("webhook_logs")
    .select("id, webhook_id, event, status_code, success, duration_ms, attempted_at", {
      count: "exact",
    })
    .in("webhook_id", webhookIds)
    .order("attempted_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (webhookId && webhookIds.includes(webhookId)) {
    query = query.eq("webhook_id", webhookId);
  }

  const { data: logs, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    logs: logs || [],
    total: count || 0,
    limit,
    offset,
  });
}
