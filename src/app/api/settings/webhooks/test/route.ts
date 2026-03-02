import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTestWebhook } from "@/lib/webhooks/dispatcher";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify company membership
  const admin = createAdminClient();
  const { data: membership } = await admin
    .from("company_users")
    .select("company_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "No company found" }, { status: 404 });
  }

  const body = await request.json();
  const { webhook_id } = body;

  if (!webhook_id) {
    return NextResponse.json(
      { error: "webhook_id is required" },
      { status: 400 }
    );
  }

  // Verify webhook belongs to the company
  const { data: webhook } = await admin
    .from("webhooks")
    .select("id")
    .eq("id", webhook_id)
    .eq("company_id", membership.company_id)
    .single();

  if (!webhook) {
    return NextResponse.json(
      { error: "Webhook not found" },
      { status: 404 }
    );
  }

  const result = await sendTestWebhook(webhook_id);
  return NextResponse.json(result);
}
