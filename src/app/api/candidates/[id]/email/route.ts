import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Verify membership
  const { data: membership } = await admin
    .from("company_users")
    .select("company_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "No company found" }, { status: 404 });
  }

  const body = await request.json();
  const { subject, message, application_id } = body;

  if (!subject || !message) {
    return NextResponse.json(
      { error: "subject and message are required" },
      { status: 400 }
    );
  }

  // Get candidate email
  const { data: candidate } = await admin
    .from("candidates")
    .select("email, full_name")
    .eq("id", id)
    .single();

  if (!candidate?.email) {
    return NextResponse.json(
      { error: "Candidate has no email address" },
      { status: 400 }
    );
  }

  // Get company Resend settings
  const { data: company } = await admin
    .from("companies")
    .select("name, settings")
    .eq("id", membership.company_id)
    .single();

  const settings = (company?.settings || {}) as {
    resend_api_key?: string;
    email_from?: string;
  };

  const resendKey =
    settings.resend_api_key || process.env.RESEND_API_KEY;

  if (!resendKey) {
    return NextResponse.json(
      { error: "No email service configured" },
      { status: 400 }
    );
  }

  const fromAddress =
    settings.email_from || `noreply@${process.env.RESEND_DOMAIN || "claimless.app"}`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${company?.name || "Claimless"} <${fromAddress}>`,
        to: [candidate.email],
        subject,
        text: message,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[email] Resend error:", err);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    // Log the email
    await admin.from("email_logs").insert({
      application_id: application_id || null,
      candidate_email: candidate.email,
      email_type: "custom",
      subject,
      body: message,
      status: "sent",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[email] Error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
