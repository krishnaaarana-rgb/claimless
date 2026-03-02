import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendATSNotification } from "@/lib/email/notifications";

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

  const body = await request.json();
  const { type } = body;

  if (!type || !["acceptance", "rejection"].includes(type)) {
    return NextResponse.json(
      { error: "type must be 'acceptance' or 'rejection'" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Verify user belongs to the company that owns this application
  const { data: membership } = await admin
    .from("company_users")
    .select("company_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "No company found" }, { status: 404 });
  }

  // Fetch application with candidate and job
  const { data: app, error: appError } = await admin
    .from("applications")
    .select(
      "id, company_id, candidates (full_name, email), jobs (title)"
    )
    .eq("id", id)
    .eq("company_id", membership.company_id)
    .single();

  if (appError || !app) {
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 }
    );
  }

  const candidate = app.candidates as unknown as {
    full_name: string | null;
    email: string | null;
  } | null;
  const job = app.jobs as unknown as { title: string } | null;

  if (!candidate?.email) {
    return NextResponse.json(
      { error: "Candidate has no email address" },
      { status: 400 }
    );
  }

  if (!job?.title) {
    return NextResponse.json(
      { error: "Job data missing" },
      { status: 400 }
    );
  }

  try {
    await sendATSNotification({
      applicationId: id,
      candidateEmail: candidate.email,
      candidateName: candidate.full_name || "Applicant",
      jobTitle: job.title,
      companyId: app.company_id,
      passed: type === "acceptance",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[notify] Failed:", error);
    return NextResponse.json(
      { error: "Failed to send email notification" },
      { status: 500 }
    );
  }
}
