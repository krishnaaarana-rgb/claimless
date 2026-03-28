import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildInterviewScoringPrompt } from "@/lib/claude/prompts/industry-interview";
import { validateInternalRequest } from "@/lib/auth/internal";
import type { SkillRequirement } from "@/types/industry-skills";

export const maxDuration = 120;

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function POST(request: NextRequest) {
  // Authenticate: only allow internal callers
  if (!validateInternalRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { application_id } = body;
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

  // Idempotency guard: if scoring is already in progress, return early
  if (formData?.scoring_in_progress) {
    console.log("[interview-score] Scoring already in progress for:", application_id);
    return NextResponse.json(
      { error: "Scoring already in progress", already_in_progress: true },
      { status: 409 }
    );
  }

  const transcript = formData?.interview_transcript as string | undefined;

  if (!transcript) {
    return NextResponse.json(
      { error: "No transcript found" },
      { status: 400 }
    );
  }

  // Set scoring_in_progress flag before LLM call
  await supabase
    .from("applications")
    .update({
      application_form_data: {
        ...(formData || {}),
        scoring_in_progress: true,
      },
    })
    .eq("id", application.id);

  // Helper to clear the flag on any error path
  const clearScoringFlag = () =>
    supabase
      .from("applications")
      .update({
        application_form_data: {
          ...(formData || {}),
          scoring_in_progress: false,
        },
      })
      .eq("id", application.id);

  const job = application.jobs as unknown as {
    id: string;
    title: string;
    description: string | null;
    industry: string | null;
    industry_niche: string | null;
    skill_requirements: SkillRequirement[] | null;
    industry_interview_context: string | null;
    interview_intelligence: Record<string, unknown> | null;
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
  const resumeText = (formData?.resume_text as string) || "";
  const interviewBrief = (screeningData.interview_brief as string) || "";
  const consistencyFlags = (screeningData.consistency_flags as string[]) || [];

  // Get loom context for scoring (evaluator should see what interviewer saw)
  let loomScoringContext = "";
  const { data: loomForScoring } = await supabase
    .from("loom_submissions")
    .select("loom_context_summary")
    .eq("application_id", application.id)
    .maybeSingle();
  if (loomForScoring?.loom_context_summary) {
    loomScoringContext = loomForScoring.loom_context_summary;
  }

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
          resume_text: resumeText || undefined,
          loom_context: loomScoringContext || undefined,
          pre_generated_context: interviewBrief || undefined,
          strengths: strengths.length > 0 ? strengths : undefined,
          concerns: concerns.length > 0 ? concerns : undefined,
        },
        settings: {
          duration_minutes: 20,
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
${consistencyFlags.length > 0 ? `RESUME CONSISTENCY FLAGS: ${consistencyFlags.join(", ")}` : ""}
${interviewBrief ? `\nSCREENING BRIEF:\n${interviewBrief}` : ""}
${loomScoringContext ? `\nVIDEO ASSESSMENT:\n${loomScoringContext}` : ""}

JOB DESCRIPTION:
${job.description || "Not provided"}

${resumeText ? `CANDIDATE RESUME:\n${resumeText.slice(0, 3000)}\n` : ""}
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
- CRITICAL: Separate KNOWLEDGE from COMMUNICATION. Score WHAT they know, not HOW they say it. Many candidates are non-native English speakers — simpler vocabulary, repeating questions, longer pauses, or formal tone are NOT penalties.
- 85-100: Exceptional. Demonstrated expertise above expectations with concrete examples.
- 70-84: Strong. Specific examples, measurable outcomes, discussed tradeoffs.
- 55-69: Adequate. Correct understanding but limited depth. Would need ramp-up time.
- 40-54: Below expectations. Could not provide concrete examples after multiple prompts.
- Below 40: Does not meet requirements. No demonstrated knowledge of core skills.
- Penalize confident but wrong answers more than humble uncertainty.
- Bonus: concrete project descriptions, unprompted tradeoffs, honest "I don't know".
- Penalty: contradicts themselves, claims without any supporting example, inflated numbers.`;
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
        max_tokens: 8192,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[interview-score] OpenRouter error:", response.status, JSON.stringify(data).slice(0, 300));
      await clearScoringFlag();
      return NextResponse.json({ error: "Scoring API error: " + response.status }, { status: 500 });
    }

    const content =
      (
        data.choices as {
          message: { content: string };
        }[]
      )?.[0]?.message?.content || "";

    console.log("[interview-score] Response length:", content.length, "First 100:", content.slice(0, 100));

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[interview-score] No JSON found in response. Full content:", content.slice(0, 500));
      await clearScoringFlag();
      return NextResponse.json(
        { error: "Failed to parse score" },
        { status: 500 }
      );
    }

    let scoring;
    try {
      scoring = JSON.parse(jsonMatch[0]);
    } catch (firstErr) {
      console.error("[interview-score] First parse failed:", (firstErr as Error).message, "Trying cleanup...");
      // Try fixing common JSON issues from LLM output
      try {
        const fixed = jsonMatch[0]
          .replace(/,\s*([}\]])/g, "$1")        // trailing commas
          .replace(/\u2018|\u2019/g, "'")         // curly single quotes
          .replace(/\u201C|\u201D/g, '"')         // curly double quotes
          .replace(/\u2014/g, "--")               // em dash
          .replace(/\u2013/g, "-");               // en dash
        scoring = JSON.parse(fixed);
      } catch {
        // Last resort: use analyzeWithClaude's robust parser
        try {
          const { analyzeWithClaude } = await import("@/lib/claude/client");
          scoring = await analyzeWithClaude(
            "Fix this broken JSON and return ONLY the corrected JSON. No explanation.",
            jsonMatch[0].slice(0, 8000),
            { model: "openai/gpt-4o-mini", maxTokens: 4096 }
          );
        } catch (innerErr) {
          console.error("[interview-score] All parse attempts failed. Raw:", jsonMatch[0].slice(0, 500));
          await clearScoringFlag();
          return NextResponse.json({ error: "Failed to parse scoring JSON" }, { status: 500 });
        }
      }
    }

    // Validate and clamp scores to 0-100
    const clamp = (v: unknown) => typeof v === "number" ? Math.max(0, Math.min(100, Math.round(v))) : null;
    scoring.overall_score = clamp(scoring.overall_score ?? scoring.interview_score) ?? 50;
    scoring.communication_score = clamp(scoring.communication_score);
    scoring.technical_score = clamp(scoring.technical_score);
    scoring.cultural_fit_score = clamp(scoring.cultural_fit_score);
    scoring.confidence_score = clamp(scoring.confidence_score);
    scoring.hard_skill_average = clamp(scoring.hard_skill_average);
    scoring.soft_skill_average = clamp(scoring.soft_skill_average);

    // Infer recommendation from score if missing
    if (!scoring.recommendation) {
      const s = scoring.overall_score;
      if (s >= 85) scoring.recommendation = "strong_hire";
      else if (s >= 70) scoring.recommendation = "hire";
      else if (s >= 55) scoring.recommendation = "maybe";
      else if (s >= 35) scoring.recommendation = "no_hire";
      else scoring.recommendation = "strong_no_hire";
    }

    // Ensure key arrays exist
    if (!Array.isArray(scoring.strengths)) scoring.strengths = [];
    if (!Array.isArray(scoring.areas_for_improvement)) scoring.areas_for_improvement = [];
    if (!Array.isArray(scoring.skill_assessments)) scoring.skill_assessments = [];

    // Recalculate averages excluding null/not-assessed skills
    const assessed = scoring.skill_assessments.filter(
      (s: { score: number | null; assessed_level?: string }) =>
        s.score !== null && s.score !== undefined && s.assessed_level !== "not_assessed"
    );
    const hardSkills = assessed.filter((s: { category: string }) => s.category === "hard_skill");
    const softSkills = assessed.filter((s: { category: string }) => s.category === "soft_skill" || s.category === "custom");
    const avg = (arr: { score: number }[]) => arr.length ? Math.round(arr.reduce((sum, s) => sum + s.score, 0) / arr.length) : null;
    scoring.hard_skill_average = clamp(avg(hardSkills)) ?? scoring.hard_skill_average;
    scoring.soft_skill_average = clamp(avg(softSkills)) ?? scoring.soft_skill_average;

    // Store scoring results and clear scoring_in_progress flag
    await supabase
      .from("applications")
      .update({
        application_form_data: {
          ...(formData || {}),
          interview_scoring: scoring,
          interview_scored_at: new Date().toISOString(),
          interview_scoring_model: "anthropic/claude-sonnet-4-6",
          scoring_in_progress: false,
        },
      })
      .eq("id", application.id);

    console.log(
      "[interview-score] Scored:",
      candidate.full_name,
      scoring.overall_score || scoring.interview_score,
      scoring.recommendation
    );

    // Extract interview intelligence (non-blocking — learns from each interview)
    try {
      const { extractAndUpdateIntelligence } = await import(
        "@/lib/claude/extract-interview-intelligence"
      );
      extractAndUpdateIntelligence(
        job.id,
        scoring,
        transcript,
        job.interview_intelligence as Parameters<typeof extractAndUpdateIntelligence>[3],
        job.skill_requirements || [],
        job.title,
        candidate.full_name || "Candidate"
      ).catch((err) =>
        console.error("[interview-score] Intelligence extraction failed:", err)
      );
    } catch (err) {
      console.error("[interview-score] Intelligence import failed:", err);
    }

    // Push scored results to ATS integrations (now that scoring is complete)
    const companyId = body.company_id || (application.jobs as unknown as { company_id: string })?.company_id;
    if (companyId) {
      try {
        const { pushResultsToATS } = await import("@/lib/integrations/outbound-push");
        await pushResultsToATS(companyId, application.id, "interview_completed");
      } catch (pushErr) {
        console.error("[interview-score] ATS push failed:", pushErr);
      }
    }

    // Clean up: delete the Vapi assistant ONLY if interview actually ended
    // (has recording/ended_at). Don't delete if this is a re-score of an active interview.
    const vapiAssistantId = formData?.vapi_assistant_id as string | undefined;
    const interviewEnded = !!(formData?.interview_ended_at);
    if (vapiAssistantId && interviewEnded && process.env.VAPI_API_KEY) {
      fetch(`https://api.vapi.ai/assistant/${vapiAssistantId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${process.env.VAPI_API_KEY}` },
      })
        .then((res) => {
          if (res.ok) console.log("[interview-score] Deleted Vapi assistant:", vapiAssistantId);
          else console.warn("[interview-score] Vapi assistant delete failed:", res.status);
        })
        .catch((err) => console.error("[interview-score] Vapi cleanup error:", err));
    }

    return NextResponse.json({ success: true, scoring });
  } catch (error) {
    console.error("[interview-score] Error:", error);
    // Clear scoring_in_progress flag so it can be retried
    await clearScoringFlag();
    return NextResponse.json({ error: "Scoring failed" }, { status: 500 });
  }
}
