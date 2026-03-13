import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildInterviewScoringPrompt } from "@/lib/claude/prompts/industry-interview";
import type { SkillRequirement } from "@/types/industry-skills";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function POST(request: NextRequest) {
  const { application_id } = await request.json();
  const supabase = createAdminClient();

  // Fetch application with transcript, job details, and candidate
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
    industry: string | null;
    industry_niche: string | null;
    skill_requirements: SkillRequirement[] | null;
    industry_interview_context: string | null;
  };
  const candidate = application.candidates as unknown as {
    full_name: string | null;
  };

  // Build scoring prompts — use industry-aware rubrics if available
  let scoringSystemPrompt: string;
  let scoringUserPrompt: string;

  const screeningData = (application.match_breakdown || {}) as Record<string, unknown>;
  const strengths = (screeningData.strengths as string[]) || [];
  const concerns = (screeningData.concerns as string[]) || [];

  if (job.industry && job.skill_requirements && job.skill_requirements.length > 0) {
    // Industry-aware rubric scoring
    const { systemPrompt, userPrompt } = buildInterviewScoringPrompt(
      {
        job: {
          title: job.title,
          description: job.description || "",
          industry: job.industry,
          industry_niche: job.industry_niche,
          skill_requirements: job.skill_requirements,
          industry_interview_context: job.industry_interview_context,
        },
        candidate: {
          name: candidate.full_name || "Candidate",
          strengths: strengths.length > 0 ? strengths : undefined,
          concerns: concerns.length > 0 ? concerns : undefined,
        },
        settings: {
          duration_minutes: 15,
          style: "conversational",
          focus: "technical_and_behavioral",
        },
      },
      transcript
    );
    scoringSystemPrompt = systemPrompt;
    scoringUserPrompt = userPrompt;
  } else {
    // Generic scoring fallback
    scoringSystemPrompt = `You are an expert interview evaluator. You evaluate with rigor — every score needs evidence from the transcript. You detect the difference between confident delivery and actual substance. You must respond with ONLY valid JSON. No markdown, no explanation.`;

    scoringUserPrompt = `Evaluate this interview for the role of "${job.title}".

CANDIDATE: ${candidate.full_name}
ATS SCORE: ${application.match_score || "N/A"}
${strengths.length > 0 ? `PRE-INTERVIEW STRENGTHS: ${strengths.join(", ")}` : ""}
${concerns.length > 0 ? `PRE-INTERVIEW CONCERNS: ${concerns.join(", ")}` : ""}

JOB DESCRIPTION:
${job.description || "Not provided"}

INTERVIEW TRANSCRIPT:
${transcript}

Produce a JSON object:
{
  "overall_score": <0-100>,
  "overall_impression": "3-4 sentence assessment with specific evidence from the transcript",
  "communication_score": <0-100>,
  "technical_score": <0-100>,
  "cultural_fit_score": <0-100>,
  "confidence_score": <0-100>,
  "strengths": ["specific things demonstrated well, with evidence from what they said"],
  "areas_for_improvement": ["specific gaps, with what they said or failed to say"],
  "consistency_analysis": "Did claims align with demonstrated knowledge? Note gaps between confidence and substance.",
  "key_moments": [
    { "timestamp_approx": "early/middle/late", "description": "moment that influenced assessment", "impact": "positive|negative|neutral" }
  ],
  "recommendation": "strong_hire|hire|maybe|no_hire|strong_no_hire",
  "recommendation_reasoning": "3-4 sentences. Be specific about what tipped the decision.",
  "follow_up_questions": ["specific questions for a potential next round based on gaps identified"],
  "hiring_risk_factors": ["risks the hiring team should be aware of"]
}

SCORING CALIBRATION:
- 85-100: Exceptional. Gave specific, deep answers that showed expertise above expectations.
- 70-84: Strong. Met expectations with concrete examples and clear outcomes.
- 55-69: Adequate. Correct but generic answers. Would need ramp-up time.
- 40-54: Below expectations. Struggled with core concepts. Significant gaps.
- Below 40: Does not meet requirements.
- Penalize confident but wrong answers more than humble uncertainty.`;
  }

  try {
    // Use Claude via OpenRouter for higher quality evaluation
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Claimless",
      },
      body: JSON.stringify({
        model: "anthropic/claude-sonnet-4-6",
        messages: [
          { role: "system", content: scoringSystemPrompt },
          { role: "user", content: scoringUserPrompt },
        ],
        temperature: 0.2,
        max_tokens: 4096,
      }),
    });

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
          interview_scoring_model: "anthropic/claude-sonnet-4-6",
        },
      })
      .eq("id", application.id);

    console.log(
      "[interview-score] Scored:",
      candidate.full_name,
      scoring.overall_score || scoring.interview_score,
      scoring.recommendation
    );

    return NextResponse.json({ success: true, scoring });
  } catch (error) {
    console.error("[interview-score] Error:", error);
    return NextResponse.json({ error: "Scoring failed" }, { status: 500 });
  }
}
