import { NextRequest, NextResponse } from "next/server";
import { generateCandidateProfile } from "@/lib/claude/prompts/profile-generation";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 120; // Allow up to 2 minutes for scraping + analysis

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { github_username, candidate_id, access_token } = body;

    console.log(`[API /scrape/github] Received request — username: ${github_username}, candidate_id: ${candidate_id}, access_token provided: ${!!access_token}`);

    if (!github_username) {
      return NextResponse.json(
        { error: "github_username is required" },
        { status: 400 }
      );
    }

    // Generate the full profile
    const profile = await generateCandidateProfile(github_username, access_token);

    // If a candidate_id was provided, save to database
    if (candidate_id) {
      const supabase = createAdminClient();

      // Update or create the candidate profile
      const { data: existingProfile } = await supabase
        .from("candidate_profiles")
        .select("id")
        .eq("candidate_id", candidate_id)
        .single();

      if (existingProfile) {
        await supabase
          .from("candidate_profiles")
          .update({
            overall_score: profile.analysis.overall_score,
            seniority_estimate: profile.analysis.seniority_estimate,
            github_data: profile.githubData,
            github_analysis: profile.analysis,
            architectural_decisions: profile.analysis.architectural_decisions,
            verified_skills: profile.analysis.verified_skills,
            interview_context_summary: profile.interviewContextSummary,
            interview_suggested_questions: profile.interviewSuggestedQuestions,
            scrape_status: "complete",
            last_scraped_at: new Date().toISOString(),
          })
          .eq("id", existingProfile.id);
      } else {
        await supabase.from("candidate_profiles").insert({
          candidate_id,
          overall_score: profile.analysis.overall_score,
          seniority_estimate: profile.analysis.seniority_estimate,
          github_data: profile.githubData,
          github_analysis: profile.analysis,
          architectural_decisions: profile.analysis.architectural_decisions,
          verified_skills: profile.analysis.verified_skills,
          interview_context_summary: profile.interviewContextSummary,
          interview_suggested_questions: profile.interviewSuggestedQuestions,
          scrape_status: "complete",
          last_scraped_at: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      profile: {
        overall_score: profile.analysis.overall_score,
        seniority_estimate: profile.analysis.seniority_estimate,
        summary: profile.analysis.summary,
        verified_skills: profile.analysis.verified_skills,
        architectural_decisions: profile.analysis.architectural_decisions,
        top_repos: profile.analysis.top_repos,
        languages: profile.analysis.languages,
        frameworks: profile.analysis.frameworks,
        interview_context_summary: profile.interviewContextSummary,
        interview_questions_count: profile.interviewSuggestedQuestions.length,
      },
    });
  } catch (error) {
    console.error("[API /scrape/github] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
