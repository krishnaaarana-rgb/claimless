import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const { application_id } = await request.json();
  const supabase = createAdminClient();

  // Fetch application with transcript
  const { data: application } = await supabase
    .from("applications")
    .select("*, jobs(*), candidates(*)")
    .eq("id", application_id)
    .single();

  if (!application) {
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 }
    );
  }

  const formData = application.application_form_data as Record<
    string,
    unknown
  > | null;
  const transcript = formData?.interview_transcript as string | undefined;

  if (!transcript) {
    return NextResponse.json(
      { error: "No transcript found" },
      { status: 400 }
    );
  }

  const job = application.jobs as unknown as {
    title: string;
    description: string | null;
  };
  const candidate = application.candidates as unknown as {
    full_name: string | null;
  };

  // Score with Claude via OpenRouter
  const scoringPrompt = `You are an expert interview evaluator. Score this interview transcript for the role of "${job.title}".

JOB DESCRIPTION:
${job.description || "Not provided"}

CANDIDATE: ${candidate.full_name}
ATS SCORE: ${application.match_score || "N/A"}

INTERVIEW TRANSCRIPT:
${transcript}

Evaluate the candidate's interview performance. Return ONLY valid JSON:
{
  "interview_score": 0-100,
  "overall_impression": "2-3 sentence summary of the interview",
  "communication_score": 0-100,
  "technical_score": 0-100,
  "cultural_fit_score": 0-100,
  "confidence_score": 0-100,
  "strengths": ["...", "..."],
  "areas_for_improvement": ["...", "..."],
  "key_moments": [
    { "timestamp_approx": "early/middle/late", "description": "Notable moment in the interview" }
  ],
  "recommendation": "strong_hire | hire | maybe | no_hire | strong_no_hire",
  "recommendation_reasoning": "2-3 sentences explaining the recommendation",
  "follow_up_questions": ["Questions the hiring team should explore further"]
}`;

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [{ role: "user", content: scoringPrompt }],
          temperature: 0.3,
        }),
      }
    );

    const data = await response.json();
    const content =
      (
        data.choices as {
          message: { content: string };
        }[]
      )?.[0]?.message?.content || "";

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[interview-score] Failed to parse scoring response");
      return NextResponse.json(
        { error: "Failed to parse score" },
        { status: 500 }
      );
    }

    const scoring = JSON.parse(jsonMatch[0]);

    // Store scoring results
    await supabase
      .from("applications")
      .update({
        application_form_data: {
          ...(formData || {}),
          interview_scoring: scoring,
          interview_scored_at: new Date().toISOString(),
        },
      })
      .eq("id", application.id);

    console.log(
      "[interview-score] Scored:",
      candidate.full_name,
      scoring.interview_score,
      scoring.recommendation
    );

    return NextResponse.json({ success: true, scoring });
  } catch (error) {
    console.error("[interview-score] Error:", error);
    return NextResponse.json({ error: "Scoring failed" }, { status: 500 });
  }
}
