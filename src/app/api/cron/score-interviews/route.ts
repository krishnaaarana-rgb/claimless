import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 300;

/**
 * GET /api/cron/score-interviews
 * Finds completed interviews that haven't been scored yet and triggers scoring.
 * Runs every 2 minutes via Vercel Cron as a safety net — the webhook also
 * attempts scoring inline, but Vapi's webhook timeout can kill it.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Find interview_completed applications without scoring
  // Only look at interviews completed in the last 24 hours to avoid re-scoring old ones
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: applications } = await supabase
    .from("applications")
    .select("id, application_form_data, jobs(company_id)")
    .eq("current_stage", "interview_completed")
    .gt("updated_at", cutoff)
    .limit(10);

  if (!applications || applications.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  // Filter to only unscored ones with transcripts
  const unscored = applications.filter((app) => {
    const fd = app.application_form_data as Record<string, unknown> | null;
    return fd?.interview_transcript && !fd?.interview_scoring;
  });

  if (unscored.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  console.log(`[cron/score-interviews] Found ${unscored.length} unscored interviews`);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  let scored = 0;
  let failed = 0;

  for (const app of unscored) {
    const companyId = (app.jobs as unknown as { company_id: string })?.company_id;
    try {
      const res = await fetch(`${baseUrl}/api/interview/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application_id: app.id,
          company_id: companyId,
        }),
      });

      if (res.ok) {
        scored++;
        console.log(`[cron/score-interviews] Scored: ${app.id}`);
      } else {
        failed++;
        const err = await res.text().catch(() => "unknown");
        console.error(`[cron/score-interviews] Failed ${app.id}:`, err);
      }
    } catch (err) {
      failed++;
      console.error(`[cron/score-interviews] Error ${app.id}:`, err);
    }
  }

  console.log(`[cron/score-interviews] Done: ${scored} scored, ${failed} failed`);
  return NextResponse.json({ processed: unscored.length, scored, failed });
}
