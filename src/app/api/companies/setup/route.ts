import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: NextRequest) {
  // Get authenticated user via server client (reads cookies)
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { company: companyData, job: jobData } = body;

  if (!companyData?.name) {
    return NextResponse.json(
      { error: "Company name is required" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Generate slug, ensure uniqueness
  let slug = slugify(companyData.name);
  const { data: existingSlug } = await admin
    .from("companies")
    .select("id")
    .eq("slug", slug)
    .single();

  if (existingSlug) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  // Create company
  const { data: company, error: companyError } = await admin
    .from("companies")
    .insert({
      name: companyData.name,
      slug,
      domain: companyData.website || null,
      settings: {
        industry: companyData.industry || null,
        size: companyData.size || null,
      },
      plan: "standard",
      primary_color: "#4ade80",
      secondary_color: "#1e1e2e",
    })
    .select()
    .single();

  if (companyError || !company) {
    return NextResponse.json(
      { error: "Failed to create company", details: companyError?.message },
      { status: 500 }
    );
  }

  // Create company_user linking auth user to company as owner
  const { error: cuError } = await admin.from("company_users").insert({
    company_id: company.id,
    user_id: user.id,
    role: "owner",
    email: user.email!,
    full_name: user.user_metadata?.full_name || null,
  });

  if (cuError) {
    // Cleanup: delete company if user link fails
    await admin.from("companies").delete().eq("id", company.id);
    return NextResponse.json(
      { error: "Failed to link user to company", details: cuError.message },
      { status: 500 }
    );
  }

  // Optionally create first job
  let jobId: string | null = null;
  if (jobData?.title && jobData?.description) {
    const { data: job, error: jobError } = await admin
      .from("jobs")
      .insert({
        company_id: company.id,
        title: jobData.title,
        description: jobData.description,
        department: jobData.department || null,
        location: jobData.location || null,
        employment_type: jobData.employment_type || "full_time",
        stage_config: {
          stage_1_proof_of_work: true,
          stage_2_loom: false,
          stage_3_voice: true,
        },
        voice_interview_config: {
          max_duration_minutes: 30,
          focus_areas: [],
          custom_questions: [],
        },
        application_form_config: jobData.application_form_config || null,
        status: "active",
        published_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (!jobError && job) {
      jobId = job.id;
    }
  }

  return NextResponse.json({
    company_id: company.id,
    company_slug: company.slug,
    job_id: jobId,
  });
}
