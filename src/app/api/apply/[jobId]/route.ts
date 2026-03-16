import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const supabase = createAdminClient();

  const { data: job, error } = await supabase
    .from("jobs")
    .select("id, title, description, department, location, employment_type, application_form_config, status, company_id, companies(name, logo_url, primary_color)")
    .eq("id", jobId)
    .single();

  if (error || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (job.status !== "active") {
    return NextResponse.json(
      { error: "This position is no longer accepting applications", closed: true },
      { status: 410 }
    );
  }

  const company = job.companies as unknown as {
    name: string;
    logo_url: string | null;
    primary_color: string;
  } | null;

  // Fetch branding from company_settings (overrides companies table defaults)
  const { data: branding } = await supabase
    .from("company_settings")
    .select("brand_accent_color, brand_logo_url")
    .eq("company_id", job.company_id)
    .maybeSingle();

  return NextResponse.json({
    job: {
      id: job.id,
      title: job.title,
      description: job.description,
      department: job.department,
      location: job.location,
      employment_type: job.employment_type,
      application_form_config: job.application_form_config,
    },
    company: {
      name: company?.name ?? "Company",
      logo_url: branding?.brand_logo_url || company?.logo_url || null,
      primary_color: branding?.brand_accent_color || company?.primary_color || "#2383E2",
    },
  });
}
