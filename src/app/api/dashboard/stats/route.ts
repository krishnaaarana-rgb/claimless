import { NextResponse } from "next/server";
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

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export async function GET() {
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

  // Run all queries in parallel
  const [appsRes, jobsRes, recentAppsRes] =
    await Promise.all([
      // All applications with candidate + job data
      admin
        .from("applications")
        .select(
          "id, current_stage, match_score, match_breakdown, candidate_id, created_at, updated_at, application_form_data, candidates (id, full_name, email), jobs (id, title)"
        )
        .eq("company_id", companyId),
      // Active jobs count
      admin
        .from("jobs")
        .select("id", { count: "exact", head: true })
        .eq("company_id", companyId)
        .eq("status", "active"),
      // Recent applications with full data for activity feed
      admin
        .from("applications")
        .select(
          "id, current_stage, match_score, match_breakdown, created_at, updated_at, candidates (id, full_name, email), jobs (title)"
        )
        .eq("company_id", companyId)
        .order("updated_at", { ascending: false })
        .limit(20),
    ]);

  const apps = appsRes.data || [];

  // Candidates by stage
  const candidatesByStage: Record<string, number> = {
    applied: 0,
    stage_1_passed: 0,
    interview_invited: 0,
    interview_completed: 0,
    hired: 0,
    rejected: 0,
    pending_review: 0,
  };
  const uniqueCandidateIds = new Set<string>();
  let totalScore = 0;
  let scoreCount = 0;
  let passedCount = 0;
  let screenedCount = 0;
  let interviewScoreTotal = 0;
  let interviewScoreCount = 0;
  let totalDaysToHire = 0;
  let hiredCount = 0;

  for (const app of apps) {
    const stage = app.current_stage || "applied";
    if (stage in candidatesByStage) {
      candidatesByStage[stage]++;
    } else {
      candidatesByStage[stage] = (candidatesByStage[stage] || 0) + 1;
    }
    if (app.candidate_id) uniqueCandidateIds.add(app.candidate_id);

    if (app.match_score != null) {
      totalScore += app.match_score;
      scoreCount++;
      screenedCount++;
      const breakdown = app.match_breakdown as { pass?: boolean } | null;
      if (breakdown?.pass) passedCount++;
    }

    // Extract interview scoring
    const formData = app.application_form_data as Record<string, unknown> | null;
    if (formData) {
      const scoring = formData.interview_scoring as Record<string, unknown> | undefined;
      if (scoring) {
        const score = (scoring.overall_score ?? scoring.interview_score) as number | undefined;
        if (score != null) {
          interviewScoreTotal += score;
          interviewScoreCount++;
        }
      }
    }

    // Calculate days to hire for hired candidates
    if (app.current_stage === "hired" && app.created_at && app.updated_at) {
      const created = new Date(app.created_at).getTime();
      const updated = new Date(app.updated_at).getTime();
      const days = (updated - created) / (1000 * 60 * 60 * 24);
      totalDaysToHire += days;
      hiredCount++;
    }
  }

  // Trend: this week vs last week
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const thisWeekCount = apps.filter(
    (a) => new Date(a.created_at) >= weekStart
  ).length;

  // Email stats - filter by company's application IDs
  const appIds = new Set(apps.map((a) => a.id));
  const appIdArray = Array.from(appIds);

  const { data: companyEmailLogs } = await admin
    .from("email_logs")
    .select("id, status, email_type, candidate_email, created_at, application_id")
    .in("application_id", appIdArray)
    .order("created_at", { ascending: false });

  const companyEmails = companyEmailLogs || [];
  const emailsSent = companyEmails.length;
  const emailsDelivered = companyEmails.filter(
    (e) => e.status === "sent" || e.status === "delivered"
  ).length;

  // Interview stats - filter by company's application IDs
  const { data: companyTokenData } = await admin
    .from("interview_tokens")
    .select("id, status, application_id")
    .in("application_id", appIdArray);

  const companyTokens = companyTokenData || [];
  const interviewsScheduled = companyTokens.length;
  const interviewsCompleted = companyTokens.filter(
    (t) => t.status === "used"
  ).length;

  // Build recent activity feed
  interface ActivityItem {
    type: string;
    candidate: string;
    candidate_id: string;
    job: string;
    detail: string;
    time: string;
  }
  const activity: ActivityItem[] = [];

  const recentApps = recentAppsRes.data || [];
  for (const app of recentApps) {
    const candidate = app.candidates as unknown as {
      id: string;
      full_name: string | null;
    } | null;
    const job = app.jobs as unknown as { title: string } | null;
    const name = candidate?.full_name || "Unknown";
    const jobTitle = job?.title || "Unknown";
    const candidateId = candidate?.id || "";

    const stage = app.current_stage;
    const score = app.match_score;
    const breakdown = app.match_breakdown as { pass?: boolean } | null;

    if (stage === "rejected" && score != null) {
      activity.push({
        type: "rejection",
        candidate: name,
        candidate_id: candidateId,
        job: jobTitle,
        detail: `ATS rejected - ${score}/100`,
        time: relativeTime(app.updated_at),
      });
    } else if (
      stage === "stage_1_passed" ||
      (score != null && breakdown?.pass)
    ) {
      activity.push({
        type: "application",
        candidate: name,
        candidate_id: candidateId,
        job: jobTitle,
        detail: `Scored ${score}/100 - Passed ATS`,
        time: relativeTime(app.updated_at),
      });
    } else if (stage === "interview_completed") {
      activity.push({
        type: "interview",
        candidate: name,
        candidate_id: candidateId,
        job: jobTitle,
        detail: "Interview completed",
        time: relativeTime(app.updated_at),
      });
    } else if (stage === "hired") {
      activity.push({
        type: "application",
        candidate: name,
        candidate_id: candidateId,
        job: jobTitle,
        detail: "Shortlisted",
        time: relativeTime(app.updated_at),
      });
    } else if (stage === "applied" || stage === "pending_review") {
      activity.push({
        type: "application",
        candidate: name,
        candidate_id: candidateId,
        job: jobTitle,
        detail: "New application",
        time: relativeTime(app.created_at),
      });
    }
  }

  // Add recent emails to activity
  for (const email of companyEmails.slice(0, 10)) {
    const matchingApp = apps.find((a) => a.id === email.application_id);
    if (matchingApp) {
      const candidate = matchingApp.candidates as unknown as {
        id: string;
        full_name: string | null;
      } | null;
      const job = matchingApp.jobs as unknown as { title: string } | null;
      activity.push({
        type: "email",
        candidate: candidate?.full_name || "Unknown",
        candidate_id: candidate?.id || "",
        job: job?.title || "Unknown",
        detail: `${email.email_type === "acceptance" ? "Acceptance" : "Rejection"} email ${email.status}`,
        time: relativeTime(email.created_at),
      });
    }
  }

  // Sort activity by time relevance (most recent first) and take top 10
  // Since we built activity from already-sorted queries, just deduplicate and slice
  const seen = new Set<string>();
  const uniqueActivity = activity.filter((a) => {
    const key = `${a.candidate}-${a.type}-${a.detail}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return NextResponse.json({
    total_candidates: uniqueCandidateIds.size,
    candidates_trend: thisWeekCount > 0 ? `+${thisWeekCount} this week` : "No new this week",
    pass_rate: screenedCount > 0 ? Math.round((passedCount / screenedCount) * 100) : 0,
    active_jobs: jobsRes.count ?? 0,
    avg_score: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0,
    candidates_by_stage: candidatesByStage,
    emails_sent: emailsSent,
    emails_delivered: emailsDelivered,
    interviews_scheduled: interviewsScheduled,
    interviews_completed: interviewsCompleted,
    conversion_rate: apps.length > 0 ? Math.round((candidatesByStage.hired / apps.length) * 100 * 10) / 10 : 0,
    interview_completion_rate: interviewsScheduled > 0 ? Math.round((interviewsCompleted / interviewsScheduled) * 100 * 10) / 10 : 0,
    avg_interview_score: interviewScoreCount > 0 ? Math.round(interviewScoreTotal / interviewScoreCount) : 0,
    avg_days_to_hire: hiredCount > 0 ? Math.round(totalDaysToHire / hiredCount) : 0,
    recent_activity: uniqueActivity.slice(0, 10),
  });
}
