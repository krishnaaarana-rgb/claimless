import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getCompanyId(userId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("company_users")
    .select("company_id")
    .eq("user_id", userId)
    .single();
  return data?.company_id ?? null;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companyId = await getCompanyId(user.id);
  if (!companyId) {
    return NextResponse.json({ error: "No company found" }, { status: 404 });
  }

  const admin = createAdminClient();
  const url = request.nextUrl;

  // Parse query params
  const jobId = url.searchParams.get("job_id");
  const statusFilter = url.searchParams.get("status");
  const search = url.searchParams.get("search");
  const sortField = url.searchParams.get("sort") || "created_at";
  const sortOrder = url.searchParams.get("order") || "desc";
  const minScore = url.searchParams.get("min_score");
  const maxScore = url.searchParams.get("max_score");
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const perPage = 20;

  // Build query - get applications with candidate and job data
  let query = admin
    .from("applications")
    .select(
      `
      id,
      candidate_id,
      job_id,
      current_stage,
      match_score,
      match_breakdown,
      application_form_data,
      created_at,
      updated_at,
      notification_sent,
      notification_type,
      candidates (id, full_name, email, github_username, linkedin_url, personal_website_url, phone),
      jobs (id, title, department)
    `,
      { count: "exact" }
    )
    .eq("company_id", companyId);

  // Apply filters
  const jobIds = url.searchParams.get("job_ids");
  if (jobId) {
    query = query.eq("job_id", jobId);
  } else if (jobIds) {
    const ids = jobIds.split(",").filter(Boolean);
    if (ids.length > 0) {
      query = query.in("job_id", ids);
    }
  }

  if (statusFilter) {
    const statuses = statusFilter.split(",").map((s) => s.trim());
    query = query.in("current_stage", statuses);
  }

  if (minScore) {
    query = query.gte("match_score", parseInt(minScore, 10));
  }

  if (maxScore) {
    query = query.lte("match_score", parseInt(maxScore, 10));
  }

  // Sort
  const validSortFields: Record<string, string> = {
    created_at: "created_at",
    updated_at: "updated_at",
    match_score: "match_score",
    ats_score: "match_score",
    current_stage: "current_stage",
  };
  const dbSortField = validSortFields[sortField] || "created_at";
  query = query.order(dbSortField, {
    ascending: sortOrder === "asc",
    nullsFirst: false,
  });

  // Pagination — skip when searching (search is client-side filtered, needs all results)
  if (!search) {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);
  } else {
    query = query.limit(500); // cap for safety
  }

  const { data: apps, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Also fetch email logs and interview tokens for status
  const appIds = (apps || []).map((a) => a.id);

  const [emailRes, tokenRes] = await Promise.all([
    appIds.length > 0
      ? admin
          .from("email_logs")
          .select("application_id, status")
          .in("application_id", appIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    appIds.length > 0
      ? admin
          .from("interview_tokens")
          .select("application_id, status")
          .in("application_id", appIds)
      : Promise.resolve({ data: [] }),
  ]);

  // Build email status map (latest per application)
  const emailStatusMap: Record<string, string> = {};
  for (const log of emailRes.data || []) {
    if (!emailStatusMap[log.application_id]) {
      emailStatusMap[log.application_id] = log.status;
    }
  }

  // Build interview status map
  const interviewStatusMap: Record<string, string> = {};
  for (const token of tokenRes.data || []) {
    interviewStatusMap[token.application_id] = token.status;
  }

  // Transform data
  const candidates = (apps || [])
    .map((app) => {
      const candidate = app.candidates as unknown as {
        id: string;
        full_name: string | null;
        email: string | null;
        github_username: string | null;
        linkedin_url: string | null;
        personal_website_url: string | null;
        phone: string | null;
      } | null;
      const job = app.jobs as unknown as {
        id: string;
        title: string;
        department: string | null;
      } | null;
      const breakdown = app.match_breakdown as {
        summary?: string;
        pass?: boolean;
      } | null;
      const formData = (app as unknown as { application_form_data?: Record<string, unknown> })
        ?.application_form_data as Record<string, unknown> | null;
      const hasResume = !!(formData?.resume_filename || formData?.resume_text);
      const resumePreview = formData?.resume_text
        ? String(formData.resume_text).slice(0, 200)
        : null;

      // Extract interview scoring from application_form_data
      const interviewScoring = formData?.interview_scoring as {
        interview_score?: number;
        overall_score?: number;
        recommendation?: string;
        communication_score?: number;
        technical_score?: number;
      } | null | undefined;
      const interviewScore = interviewScoring?.overall_score ?? interviewScoring?.interview_score ?? null;
      const interviewRecommendation = interviewScoring?.recommendation ?? null;

      return {
        id: candidate?.id || "",
        application_id: app.id,
        name: candidate?.full_name || "Unknown",
        email: candidate?.email || "",
        job_title: job?.title || "",
        job_id: job?.id || "",
        department: job?.department || null,
        ats_score: app.match_score,
        status: app.current_stage,
        ai_summary: breakdown?.summary || null,
        applied_at: app.created_at,
        linkedin_url: candidate?.linkedin_url || null,
        github_username: candidate?.github_username || null,
        portfolio_url: candidate?.personal_website_url || (formData?.portfolio_url as string) || null,
        phone: candidate?.phone || null,
        has_resume: hasResume,
        resume_text_preview: resumePreview,
        email_status: emailStatusMap[app.id] || null,
        interview_status: interviewStatusMap[app.id] || null,
        interview_score: interviewScore,
        interview_recommendation: interviewRecommendation,
      };
    })
    .filter((c) => {
      // Client-side search filter for name/email (Supabase doesn't support OR ilike easily)
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    });

  // When search is active, the client-side filter reduces results below the DB count.
  // Return filtered count so pagination reflects actual matches.
  const filteredTotal = search ? candidates.length : (count ?? candidates.length);

  return NextResponse.json({
    candidates,
    total: filteredTotal,
    page,
    per_page: perPage,
    filters_applied: {
      job_id: jobId,
      status: statusFilter,
      search,
      min_score: minScore,
      max_score: maxScore,
    },
  });
}
