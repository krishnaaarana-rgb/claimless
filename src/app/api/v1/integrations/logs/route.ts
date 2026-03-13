import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/v1/integrations/logs — view ATS sync logs
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: companyUser } = await admin
    .from("company_users")
    .select("company_id")
    .eq("user_id", user.id)
    .single();

  if (!companyUser) return NextResponse.json({ error: "No company found" }, { status: 404 });

  const params = request.nextUrl.searchParams;
  const integrationId = params.get("integration_id");
  const direction = params.get("direction");
  const limit = Math.min(parseInt(params.get("limit") || "50"), 100);
  const offset = parseInt(params.get("offset") || "0");

  let query = admin
    .from("ats_sync_log")
    .select("id, integration_id, direction, application_id, external_id, status, error_message, created_at", { count: "exact" })
    .eq("company_id", companyUser.company_id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (integrationId) query = query.eq("integration_id", integrationId);
  if (direction) query = query.eq("direction", direction);

  const { data: logs, count } = await query;

  return NextResponse.json({
    logs: logs || [],
    total: count || 0,
    limit,
    offset,
  });
}
