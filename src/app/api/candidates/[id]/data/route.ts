import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// DELETE /api/candidates/[id]/data — Privacy Act compliant data erasure
// Removes all personal data for a candidate while preserving anonymised aggregate records
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: candidateId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Verify company ownership
  const { data: companyUser } = await admin
    .from("company_users")
    .select("company_id")
    .eq("user_id", user.id)
    .single();

  if (!companyUser) {
    return NextResponse.json({ error: "No company found" }, { status: 404 });
  }

  // Verify the candidate belongs to this company (via applications)
  const { data: applications } = await admin
    .from("applications")
    .select("id, company_id")
    .eq("candidate_id", candidateId)
    .eq("company_id", companyUser.company_id);

  if (!applications || applications.length === 0) {
    return NextResponse.json(
      { error: "Candidate not found in your company" },
      { status: 404 }
    );
  }

  // 1. Anonymise candidate record — null out PII, keep the row for referential integrity
  await admin
    .from("candidates")
    .update({
      full_name: "[Deleted]",
      email: null,
      phone: null,
      linkedin_url: null,
      github_username: null,
      personal_website_url: null,
    })
    .eq("id", candidateId);

  // 2. Clear application form data (resume text, personal info) but keep scores
  for (const app of applications) {
    const { data: appData } = await admin
      .from("applications")
      .select("application_form_data, match_breakdown")
      .eq("id", app.id)
      .single();

    if (appData) {
      // Preserve only scoring data, strip PII
      const sanitisedFormData = {
        interview_scoring: (appData.application_form_data as Record<string, unknown>)?.interview_scoring || null,
        data_deleted_at: new Date().toISOString(),
        data_deleted_by: user.id,
      };

      // Preserve only aggregate scores from match_breakdown, strip detailed text
      const breakdown = appData.match_breakdown as Record<string, unknown> | null;
      const sanitisedBreakdown = breakdown
        ? {
            match_score: breakdown.match_score,
            data_deleted: true,
          }
        : null;

      await admin
        .from("applications")
        .update({
          application_form_data: sanitisedFormData,
          match_breakdown: sanitisedBreakdown,
        })
        .eq("id", app.id);
    }
  }

  // 3. Delete candidate profile (GitHub analysis, etc.)
  await admin
    .from("candidate_profiles")
    .delete()
    .eq("candidate_id", candidateId);

  // 4. Invalidate any active interview tokens
  await admin
    .from("interview_tokens")
    .update({ status: "expired" })
    .in(
      "application_id",
      applications.map((a) => a.id)
    );

  return NextResponse.json({
    success: true,
    message: "Candidate data has been deleted in compliance with the Privacy Act 1988.",
    candidate_id: candidateId,
    applications_affected: applications.length,
  });
}
