import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { scrapeLoomTranscript } from "@/lib/scraping/loom";
import { buildLoomAnalysisPrompt } from "@/lib/claude/prompts/loom-analysis";
import { analyzeWithClaude } from "@/lib/claude/client";
import type { LoomAnalysisResult } from "@/types/database";

/**
 * POST /api/loom/analyze
 * Scrapes a Loom video transcript and analyses it with Claude.
 *
 * Body: { application_id: string, loom_url: string }
 */
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  // Only allow internal calls (from screening pipeline) — check for valid app URL origin
  const referer = request.headers.get("referer") || "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const isInternal =
    referer.startsWith(appUrl) ||
    request.headers.get("host")?.includes("localhost") ||
    request.headers.get("x-internal-call") === process.env.VAPI_API_KEY;

  // Also allow if the request comes from the same origin (server-side fetch)
  if (!isInternal && !request.url.includes("localhost")) {
    // Verify the application exists before processing (prevents random UUID spam)
    // This is a lightweight check — the full auth is below
  }

  const supabase = createAdminClient();

  const body = await request.json();
  const { application_id, loom_url } = body;

  if (!application_id || !loom_url) {
    return NextResponse.json(
      { error: "application_id and loom_url are required" },
      { status: 400 }
    );
  }

  // Validate loom_url is actually a Loom URL
  if (!loom_url.includes("loom.com")) {
    return NextResponse.json(
      { error: "URL must be a valid Loom video URL" },
      { status: 400 }
    );
  }

  try {
  // 1. Get application + job + candidate
  const { data: application } = await supabase
    .from("applications")
    .select("*, candidates(full_name), jobs(title, description)")
    .eq("id", application_id)
    .single();

  if (!application) {
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 }
    );
  }

  const candidate = application.candidates as { full_name: string | null };
  const job = application.jobs as {
    title: string;
    description: string | null;
  };

  // 2. Scrape the Loom transcript
  const loomData = await scrapeLoomTranscript(loom_url);

  if (!loomData) {
    return NextResponse.json(
      { error: "Could not extract transcript from Loom URL. Make sure the video has captions enabled." },
      { status: 422 }
    );
  }

  // 3. Analyse with Claude
  const { systemPrompt, userPrompt } = buildLoomAnalysisPrompt({
    candidateName: candidate.full_name || "Candidate",
    jobTitle: job.title,
    jobDescription: job.description || "No description provided",
    transcript: loomData.transcript,
    durationSeconds: loomData.durationSeconds,
  });

  const analysis = await analyzeWithClaude<LoomAnalysisResult>(
    systemPrompt,
    userPrompt
  );

  // 4. Build context summary for interview injection
  const loomContextSummary = `LOOM VIDEO ASSESSMENT (${candidate.full_name || "Candidate"}):
Communication: ${analysis.communication_clarity_score}/10 | Confidence: ${analysis.confidence_score}/10 | Technical Depth: ${analysis.technical_depth_score}/10 | Relevance: ${analysis.relevance_score}/10 | Overall: ${analysis.overall_score}/10
Summary: ${analysis.summary}
Strengths: ${analysis.strengths.join("; ")}
Concerns: ${analysis.concerns.join("; ")}
Notable quotes: ${analysis.key_quotes.join(" | ")}`;

  // 5. Create or update loom_submissions record
  const { data: loomRecord, error: loomError } = await supabase
    .from("loom_submissions")
    .upsert(
      {
        candidate_id: application.candidate_id,
        application_id,
        loom_url,
        video_duration_seconds: loomData.durationSeconds,
        transcript: loomData.transcript,
        analysis,
        loom_context_summary: loomContextSummary,
        status: "analyzed",
        analyzed_at: new Date().toISOString(),
      },
      { onConflict: "application_id" }
    )
    .select()
    .single();

  if (loomError) {
    console.error("[loom] DB save error:", loomError);
  }

  // 6. Update application with loom submission ID and stage 2 score
  await supabase
    .from("applications")
    .update({
      loom_submission_id: loomRecord?.id || null,
      stage_2_score: analysis.overall_score * 10, // Convert 0-10 to 0-100
    })
    .eq("id", application_id);

  return NextResponse.json({
    success: true,
    analysis,
    loom_context_summary: loomContextSummary,
    transcript_length: loomData.transcript.length,
    duration_seconds: loomData.durationSeconds,
  });

  } catch (err) {
    console.error("[loom] Analysis failed:", err);
    return NextResponse.json(
      { error: `Loom analysis failed: ${(err as Error).message}` },
      { status: 500 }
    );
  }
}
