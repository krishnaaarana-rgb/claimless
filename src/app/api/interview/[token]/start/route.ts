import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildIndustryInterviewPrompt } from "@/lib/claude/prompts/industry-interview";
import type { SkillRequirement } from "@/types/industry-skills";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createAdminClient();
  const body = await request.json().catch(() => ({}));
  const preferredName = body.preferred_name;

  // 1. Validate token
  const { data: tokenData } = await supabase
    .from("interview_tokens")
    .select("*, applications(*, candidates(*), jobs(*))")
    .eq("token", token)
    .single();

  if (!tokenData) {
    return NextResponse.json(
      { error: "Invalid interview token" },
      { status: 404 }
    );
  }
  if (tokenData.status === "completed" || tokenData.status === "used") {
    return NextResponse.json(
      { error: "Interview already completed" },
      { status: 400 }
    );
  }
  if (tokenData.status === "expired" || new Date(tokenData.expires_at) < new Date()) {
    return NextResponse.json(
      { error: "Interview link expired" },
      { status: 400 }
    );
  }

  const application = tokenData.applications as unknown as {
    id: string;
    company_id: string;
    match_breakdown: Record<string, unknown> | null;
    application_form_data: Record<string, unknown> | null;
    candidates: {
      id: string;
      full_name: string | null;
      email: string | null;
      github_username: string | null;
    };
    jobs: {
      id: string;
      title: string;
      description: string | null;
      company_id: string;
      industry: string | null;
      industry_niche: string | null;
      skill_requirements: SkillRequirement[] | null;
      industry_interview_context: string | null;
    };
  };

  const candidate = application.candidates;
  const job = application.jobs;

  // 2. If token is already active, allow reconnection with existing assistant
  if (tokenData.status === "active") {
    const existingAssistantId = application.application_form_data?.vapi_assistant_id as string | undefined;
    if (existingAssistantId) {
      const { data: settings } = await supabase
        .from("company_settings")
        .select("interview_duration_minutes")
        .eq("company_id", job.company_id)
        .single();

      return NextResponse.json({
        assistant_id: existingAssistantId,
        public_key: process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY,
        candidate_name: (application.application_form_data?.preferred_name as string) || candidate.full_name || "the candidate",
        job_title: job.title,
        duration_minutes: settings?.interview_duration_minutes || 15,
      });
    }
  }

  // 3. Get ATS screening data for context
  const screeningData = application.match_breakdown || {};
  const interviewTopics =
    (screeningData.suggested_interview_topics as string[]) || [];
  const strengths = (screeningData.strengths as string[]) || [];
  const concerns = (screeningData.concerns as string[]) || [];

  // 3. Get resume text
  const resumeText =
    (application.application_form_data?.resume_text as string) ||
    "No resume provided";

  // 4. Get GitHub profile if connected
  let githubContext = "";
  const ghUser = candidate.github_username;
  const hasValidGithub = ghUser && /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(ghUser) && !ghUser.includes("http") && !ghUser.includes("localhost");
  if (hasValidGithub) {
    const { data: profile } = await supabase
      .from("candidate_profiles")
      .select("github_analysis")
      .eq("candidate_id", candidate.id)
      .single();

    if (profile?.github_analysis) {
      githubContext = `\n\nGITHUB PROFILE:\n${JSON.stringify(profile.github_analysis, null, 2)}`;
    } else {
      githubContext = `\n\nThe candidate's GitHub profile is github.com/${ghUser}. Ask about their open source contributions or notable repos.`;
    }
  }

  // 5. Get company interview settings
  const { data: settings } = await supabase
    .from("company_settings")
    .select(
      "interview_duration_minutes, interview_style, interview_focus, interview_custom_instructions"
    )
    .eq("company_id", job.company_id)
    .single();

  const duration = settings?.interview_duration_minutes || 15;
  const style = settings?.interview_style || "conversational";
  const focus = settings?.interview_focus || "technical_and_behavioral";

  // 6. Build the assistant system prompt
  const candidateName =
    preferredName || candidate.full_name || "the candidate";

  // Build the prompt input — used for both industry and generic paths
  const promptInput = {
    job: {
      title: job.title,
      description: job.description || "No description provided",
      industry: job.industry,
      industry_niche: job.industry_niche,
      skill_requirements: job.skill_requirements || [],
      industry_interview_context: job.industry_interview_context,
    },
    candidate: {
      name: candidateName,
      resume_text: resumeText,
      github_context: githubContext || undefined,
      strengths: strengths.length > 0 ? strengths : undefined,
      concerns: concerns.length > 0 ? concerns : undefined,
      suggested_topics: interviewTopics.length > 0 ? interviewTopics : undefined,
    },
    settings: {
      duration_minutes: duration,
      style,
      focus,
      custom_instructions: settings?.interview_custom_instructions || undefined,
    },
  };

  // Use industry-aware prompt if job has industry set, otherwise fall back to generic
  let systemPrompt: string;

  if (job.industry && job.skill_requirements && job.skill_requirements.length > 0) {
    systemPrompt = buildIndustryInterviewPrompt(promptInput);
  } else {
    // Generic prompt for jobs without industry configuration — still uses advanced techniques
    systemPrompt = `You are an elite AI interviewer for the role of "${job.title}". You are conducting a ${duration}-minute ${style} interview.

YOUR IDENTITY:
- You are a senior hiring expert who genuinely wants to find the right person for this role
- You address the candidate as "${candidateName}"
- You are warm and conversational but intellectually rigorous
- You never reveal the candidate's ATS score or internal assessment
- You sound like a human — use natural reactions ("interesting", "I see", "tell me more about that")

ADVANCED INTERVIEWING TECHNIQUES:
1. DEPTH CALIBRATION — Start mid-level. If they answer well, go deeper. If they struggle, stay at current level.
2. VERIFICATION PROBING — Cross-reference their answers against their resume/background. When claims don't match, explore gently with curiosity.
3. SPECIFICITY ENFORCEMENT — When they give vague answers ("we used best practices", "I collaborated with the team"), always follow up: "Can you give me a specific example?" Specifics reveal real experience.
4. THE "TEACH ME" TECHNIQUE — Ask them to explain a concept as if teaching you. This reveals true understanding.
5. "WE" TO "I" — When they say "we did X", ask "what was YOUR specific role in that?"

INTERVIEW FLOW:
1. Warm greeting (1 min)
2. Background: "Tell me about your journey and what brings you to this role" (2 min)
3. ${focus === "technical_and_behavioral" ? "Mix of technical depth and behavioral questions" : focus} (${duration - 6} min)
4. ${interviewTopics.length > 0 ? "Deep-dive into: " + interviewTopics.join(", ") : "Role-specific questions based on the job description"}
5. ${concerns.length > 0 ? "Gently explore: " + concerns.join(", ") : "General fit assessment"}
6. Candidate questions (2 min)
7. Close: "Thanks so much ${candidateName}, really enjoyed this conversation. We'll be in touch soon."

JOB DESCRIPTION:
${job.description || "No description provided"}

CANDIDATE INTELLIGENCE (internal — use to guide questions, never reveal):
RESUME:
${resumeText}
${githubContext}

${strengths.length > 0 ? `VERIFIED STRENGTHS: ${strengths.join(", ")}` : ""}
${concerns.length > 0 ? `CONCERNS TO PROBE: ${concerns.join(", ")}` : ""}
${interviewTopics.length > 0 ? `SUGGESTED TOPICS: ${interviewTopics.join(", ")}` : ""}

${settings?.interview_custom_instructions ? `ADDITIONAL INSTRUCTIONS:\n${settings.interview_custom_instructions}` : ""}

RULES:
- Ask ONE question at a time
- Wait for the candidate to fully finish before responding
- If nervous, be extra warm: "Take your time" or "That's a great start"
- Listen for RED FLAGS: vague answers, inability to go deeper, contradictions, deflecting to "the team"
- Listen for GREEN FLAGS: specific examples with outcomes, discusses tradeoffs, admits what they don't know
- Target 6-10 main questions with follow-ups based on response quality
- End naturally around the ${duration}-minute mark`;
  }

  // 7. Create Vapi assistant via API
  const name = `IV: ${candidateName} - ${job.title}`.slice(0, 40);

  // Build a contextual first message that references something specific
  const firstMessageContext = strengths.length > 0
    ? ` I had a chance to look over your background and it's really interesting`
    : ``;

  const vapiPayload = {
    name,
    model: {
      provider: "openrouter",
      model: "openai/gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }],
      temperature: 0.7,
    },
    voice: {
      provider: "11labs",
      voiceId: "EXAVITQu4vr4xnSDxMaL",
      stability: 0.5,
      similarityBoost: 0.75,
    },
    firstMessage: `Hi ${candidateName}! Thanks so much for taking the time to chat with us about the ${job.title} role.${firstMessageContext}. Let's keep this super conversational — just a friendly chat about your experience, no trick questions or anything like that. So to kick things off, tell me a bit about yourself and what drew you to this opportunity?`,
    transcriber: {
      provider: "deepgram",
      model: "nova-2",
      language: "en",
    },
    endCallFunctionEnabled: true,
    maxDurationSeconds: (duration + 2) * 60,
    silenceTimeoutSeconds: 30,
    responseDelaySeconds: 0.5,
    serverUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/interview/webhook`,
    serverUrlSecret: process.env.VAPI_API_KEY,
  };

  // Log Vapi request config (excluding full system prompt for brevity)
  console.log("[interview] Creating Vapi assistant:", JSON.stringify({
    name: vapiPayload.name,
    model: { provider: vapiPayload.model.provider, model: vapiPayload.model.model, temperature: vapiPayload.model.temperature, systemPromptLength: systemPrompt.length },
    voice: vapiPayload.voice,
    transcriber: vapiPayload.transcriber,
    maxDurationSeconds: vapiPayload.maxDurationSeconds,
    silenceTimeoutSeconds: vapiPayload.silenceTimeoutSeconds,
    responseDelaySeconds: vapiPayload.responseDelaySeconds,
    serverUrl: vapiPayload.serverUrl,
  }));

  const vapiResponse = await fetch("https://api.vapi.ai/assistant", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(vapiPayload),
  });

  if (!vapiResponse.ok) {
    const errorBody = await vapiResponse.text();
    console.error("[interview] Vapi assistant creation failed:", {
      status: vapiResponse.status,
      statusText: vapiResponse.statusText,
      body: errorBody,
      candidateName,
      jobTitle: job.title,
    });
    return NextResponse.json(
      { error: "Failed to create interview session" },
      { status: 500 }
    );
  }

  const assistant = await vapiResponse.json();
  console.log("[interview] Vapi assistant created:", assistant.id);

  // 8. Mark token as active (interview in progress)
  await supabase
    .from("interview_tokens")
    .update({
      status: "active",
      used_at: new Date().toISOString(),
    })
    .eq("id", tokenData.id);

  // Store the assistant ID and injected prompt for audit trail
  await supabase
    .from("applications")
    .update({
      current_stage: "interview_invited",
      application_form_data: {
        ...application.application_form_data,
        vapi_assistant_id: assistant.id,
        interview_started_at: new Date().toISOString(),
        preferred_name: candidateName,
        injected_prompt: systemPrompt,
        injected_prompt_length: systemPrompt.length,
        interview_model: "openai/gpt-4o-mini",
      },
    })
    .eq("id", application.id);

  // 9. Return to client
  return NextResponse.json({
    assistant_id: assistant.id,
    public_key: process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY,
    candidate_name: candidateName,
    job_title: job.title,
    duration_minutes: duration,
  });
}
