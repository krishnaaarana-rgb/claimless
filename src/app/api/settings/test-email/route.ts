import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/index";
import { renderTemplate, textToHtml } from "@/lib/email/templates";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Get user's company
  const { data: membership } = await admin
    .from("company_users")
    .select("company_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "No company found" }, { status: 404 });
  }

  // Get company settings
  const { data: settings } = await admin
    .from("company_settings")
    .select(
      "email_provider, email_api_key, email_from_address, email_from_name, email_acceptance_subject, email_acceptance_body"
    )
    .eq("company_id", membership.company_id)
    .single();

  if (
    !settings ||
    settings.email_provider === "none" ||
    !settings.email_api_key
  ) {
    return NextResponse.json(
      { error: "Email provider not configured. Save your API key first." },
      { status: 400 }
    );
  }

  // Get company name
  const { data: company } = await admin
    .from("companies")
    .select("name")
    .eq("id", membership.company_id)
    .single();

  const companyName = company?.name || "Your Company";

  // Send test using the acceptance template with sample vars
  const vars = {
    candidate_name: "Jane Doe",
    job_title: "Sample Position",
    company_name: companyName,
  };

  const subject = renderTemplate(
    settings.email_acceptance_subject || "Test email from {{company_name}}",
    vars
  );
  const body = renderTemplate(
    settings.email_acceptance_body ||
      "Hi {{candidate_name}},\n\nThis is a test email from {{company_name}}.\n\nYour email provider is configured correctly!",
    vars
  );

  const result = await sendEmail(
    {
      to: user.email!,
      subject,
      html: textToHtml(body),
      from: settings.email_from_address || undefined,
      fromName: settings.email_from_name || companyName,
    },
    settings.email_api_key
  );

  if (!result.success) {
    return NextResponse.json(
      { error: result.error || "Failed to send test email" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
