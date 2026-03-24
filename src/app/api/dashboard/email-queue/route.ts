import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getCompanyId(userId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("company_users")
    .select("company_id")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.company_id ?? null;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const companyId = await getCompanyId(user.id);
  if (!companyId) return NextResponse.json({ error: "No company" }, { status: 404 });

  const admin = createAdminClient();

  // Get all application IDs for this company
  const { data: apps } = await admin
    .from("applications")
    .select("id")
    .eq("company_id", companyId);

  const appIds = (apps || []).map((a) => a.id);
  if (appIds.length === 0) {
    return NextResponse.json({ emails: [], stats: { pending: 0, processing: 0, sent: 0, failed: 0, scheduled: 0 } });
  }

  // Fetch email logs for this company's applications
  const { data: emails } = await admin
    .from("email_logs")
    .select("id, application_id, candidate_email, email_type, subject, status, scheduled, send_at, error_message, created_at")
    .in("application_id", appIds)
    .order("created_at", { ascending: false })
    .limit(200);

  const allEmails = emails || [];

  const stats = {
    pending: allEmails.filter((e) => e.status === "pending").length,
    processing: allEmails.filter((e) => e.status === "processing").length,
    sent: allEmails.filter((e) => e.status === "sent" || e.status === "delivered").length,
    failed: allEmails.filter((e) => e.status === "failed").length,
    scheduled: allEmails.filter((e) => e.scheduled && e.status === "pending").length,
  };

  return NextResponse.json({ emails: allEmails, stats });
}
