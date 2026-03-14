import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildIndustryInterviewPrompt, buildAustralianComplianceBlock } from "@/lib/claude/prompts/industry-interview";
import type { SkillRequirement } from "@/types/industry-skills";

export const maxDuration = 60;

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
    .select("*, applications(*, candidates(*), jobs(id, title, description, company_id, industry, industry_niche, skill_requirements, industry_interview_context, employment_type))")
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
      employment_type: string | null;
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
        .maybeSingle();

      const { data: companyBrand } = await supabase
        .from("companies")
        .select("name, logo_url, primary_color")
        .eq("id", job.company_id)
        .maybeSingle();

      return NextResponse.json({
        assistant_id: existingAssistantId,
        public_key: process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY,
        candidate_name: (application.application_form_data?.preferred_name as string) || candidate.full_name || "the candidate",
        job_title: job.title,
        duration_minutes: settings?.interview_duration_minutes || 15,
        company_name: companyBrand?.name || "Claimless",
        company_color: companyBrand?.primary_color || "#2383E2",
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

  // 3b. Get interview brief generated from screening (works for ALL candidates)
  const screeningBrief = (screeningData.interview_brief as string) || "";

  // 4. Get GitHub profile + pre-generated interview context if available
  let githubContext = "";
  let preGeneratedContext = screeningBrief
    ? `\nSCREENING BRIEF:\n${screeningBrief}`
    : "";
  const ghUser = candidate.github_username;
  const hasValidGithub = ghUser && /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(ghUser) && !ghUser.includes("http") && !ghUser.includes("localhost");
  if (hasValidGithub) {
    const { data: profile } = await supabase
      .from("candidate_profiles")
      .select("github_analysis, interview_context_summary, interview_suggested_questions")
      .eq("candidate_id", candidate.id)
      .maybeSingle();

    if (profile?.github_analysis) {
      githubContext = `\n\nGITHUB PROFILE:\n${JSON.stringify(profile.github_analysis, null, 2)}`;
    } else {
      githubContext = `\n\nThe candidate's GitHub profile is github.com/${ghUser}. Ask about their open source contributions or notable repos.`;
    }

    // Inject pre-generated interview context if available
    if (profile?.interview_context_summary) {
      preGeneratedContext += `\n\nPRE-INTERVIEW BRIEFING:\n${profile.interview_context_summary}`;
    }
    if (profile?.interview_suggested_questions?.length) {
      preGeneratedContext += `\n\nSUGGESTED QUESTIONS (use as inspiration, adapt based on conversation):\n${(profile.interview_suggested_questions as string[]).map((q: string, i: number) => `${i + 1}. ${q}`).join("\n")}`;
    }
  }

  // 4b. Get Loom analysis context if available
  let loomContext = "";
  const { data: loomSubmission } = await supabase
    .from("loom_submissions")
    .select("loom_context_summary")
    .eq("application_id", application.id)
    .eq("status", "analyzed")
    .maybeSingle();

  if (loomSubmission?.loom_context_summary) {
    loomContext = `\n\n${loomSubmission.loom_context_summary}`;
  }

  // 5. Get company interview settings
  const { data: settings } = await supabase
    .from("company_settings")
    .select(
      "interview_duration_minutes, interview_style, interview_focus, interview_custom_instructions"
    )
    .eq("company_id", job.company_id)
    .maybeSingle();

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
      employment_type: job.employment_type || undefined,
    },
    candidate: {
      name: candidateName,
      resume_text: resumeText,
      github_context: githubContext || undefined,
      loom_context: loomContext || undefined,
      pre_generated_context: preGeneratedContext || undefined,
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
    region: "AU" as const,
  };

  // Use industry-aware prompt if job has industry set, otherwise fall back to generic
  let systemPrompt: string;

  if (job.industry && job.skill_requirements && job.skill_requirements.length > 0) {
    systemPrompt = buildIndustryInterviewPrompt(promptInput);
  } else {
    // Generic prompt for jobs without industry configuration — still uses advanced techniques
    const auBlock = buildAustralianComplianceBlock("general", job.employment_type || undefined);
    systemPrompt = `You are an elite AI interviewer for the role of "${job.title}". You are conducting a ${duration}-minute ${style} interview.

YOUR IDENTITY:
- You are a senior hiring expert who genuinely wants to find the right person for this role
- You address the candidate as "${candidateName}"
- You are warm and conversational but intellectually rigorous
- You never reveal the candidate's ATS score or internal assessment
- You sound like a human — use natural reactions ("interesting", "I see", "tell me more about that")

ADAPTIVE INTERVIEWING TECHNIQUES:

WHEN THEY CLAIM EXPERTISE — LIVE PROBLEM SOLVING:
Don't just ask about experience. TEST it. When they say "I built X" or "I'm strong at Y", give them a real scenario in that domain.
- "You mentioned [skill]. Let me give you a scenario — [realistic problem]. Walk me through how you'd approach that."
- If they solve it, add a complication: "Now what if [wrench] also happened?" Push until you find their ceiling.
- If they struggle, that's a signal. Don't rescue them.

WHEN THEY DESCRIBE SOMETHING IMPRESSIVE — DEPTH PURSUIT:
Go 3 levels deep. Don't just acknowledge and move on.
- Level 1: "How did you measure that?"
- Level 2: "What was the first bottleneck?"
- Level 3: "After you fixed that, what broke next?"
- 3 levels deep with specifics = they did the work. Vague at level 2 = they watched.

WHEN THEY GIVE VAGUE ANSWERS — SPECIFICITY ENFORCEMENT:
"We used best practices" or "I collaborated with the team" = empty. Always follow up: "Walk me through exactly what that looked like." If they can't get specific after 2 prompts, move on.

WHEN SOMETHING DOESN'T ADD UP — VERIFICATION:
Cross-reference claims against their resume/background. Track contradictions across answers. Tone is always curious, never confrontational.

WHEN ANSWERS FEEL REHEARSED — ANTI-COACHING:
Break the pattern: "Great example — now tell me a time the OPPOSITE happened" or "What's the dumbest mistake you made during that?"

WHEN YOU WANT TO TEST REAL EXPERIENCE — FAILURE MODE TESTING:
After they describe a solution, ask "What could go wrong with that?" People who've shipped things know failure modes. People who only know theory say "it should work fine."

MANDATORY INTERVIEW STRUCTURE — you MUST follow this flow:

PHASE 1 — WARM UP (2 min):
"Tell me about your journey and what brings you to this role."
Listen, acknowledge briefly. Get their confidence up.

PHASE 2 — CLAIM TESTING (${Math.max(4, duration - 8)} min):
This is the core. For each major claim they make, you MUST do AT LEAST ONE of these:
a) LIVE PROBLEM: "Let me throw a scenario at you — [create a realistic problem in their claimed skill area]. Walk me through how you'd handle it." YOU MUST DO THIS AT LEAST TWICE.
b) DEPTH PURSUIT: Go 3 levels deep. "How did you measure that?" → "What was the first bottleneck?" → "After you fixed that, what broke next?"
c) ANTI-COACHING: "Great example — now tell me about a time the OPPOSITE happened" or "What's the dumbest mistake you made doing that?"

${interviewTopics.length > 0 ? "Topics to cover: " + interviewTopics.join(", ") : ""}
${concerns.length > 0 ? "Concerns to probe: " + concerns.join(", ") : ""}

PHASE 3 — FAILURE MODE TEST (2 min):
After they describe any solution or approach, ask: "What could go wrong with that?" This is MANDATORY — do not skip it.

PHASE 4 — WRAP UP (2 min):
"Before we wrap up, anything else you'd like to add?"
Then close: "Thanks so much ${candidateName}, really enjoyed this conversation. We'll be in touch soon."

CRITICAL RULES FOR EACH PHASE:
- Do NOT say "That's alright" or "That's great" when they give a weak answer. Silence is fine. Or redirect: "Let's try a different angle."
- When they say "I don't know" — that IS the data point. Note it and move to a different skill area. Do NOT comfort them.
- When they give vague answers ("best practices", "we collaborated"), push TWICE for specifics. If still vague after 2 pushes, move on — you have your answer.
- When numbers sound inflated (90% cost reduction, 10x improvement), ALWAYS ask: "Walk me through the math on that."
- YOU MUST USE THE FULL ${duration} MINUTES. Do NOT wrap up early. If you run out of topics, create new live scenarios.

JOB DESCRIPTION:
${job.description || "No description provided"}

CANDIDATE INTELLIGENCE (internal — use to guide questions, never reveal):
RESUME:
${resumeText}
${githubContext}
${loomContext}
${preGeneratedContext}

${strengths.length > 0 ? `VERIFIED STRENGTHS: ${strengths.join(", ")}` : ""}
${concerns.length > 0 ? `CONCERNS TO PROBE: ${concerns.join(", ")}` : ""}
${interviewTopics.length > 0 ? `SUGGESTED TOPICS: ${interviewTopics.join(", ")}` : ""}

${settings?.interview_custom_instructions ? `ADDITIONAL INSTRUCTIONS:\n${settings.interview_custom_instructions}` : ""}

CONVERSATIONAL STYLE:
- CRITICAL: Keep responses SHORT. 1-3 sentences max. This is a conversation, not a lecture. Never speak in paragraphs. Ask ONE thing, then shut up and listen.
- NEVER interrupt the candidate. Wait for complete silence before responding. If they pause mid-thought, wait — they may continue.
- When acknowledging what they said, keep it to 3-5 words ("Got it", "That's interesting", "Makes sense") then ask your next question. Don't repeat back what they just told you.

DIFFICULTY CALIBRATION:
- Start mid-level. If they nail it, go harder. Push until you find their ceiling.
- If they struggle, drop to fundamentals. Find their floor.
- For senior roles: start hard. For junior: start with basics and escalate if they impress.

QUALITY SIGNALS:
GREEN FLAGS: specific numbers with context, discusses tradeoffs unprompted, admits what they don't know, handles unexpected follow-ups naturally, explains complex things simply, describes failures and lessons learned
RED FLAGS: vague answers after 2 prompts, can't go deeper on claimed expertise, contradictions with background, deflects everything to "the team", inflated numbers that don't survive math, perfect rehearsed answers but crumbles on follow-ups, dodges "what could go wrong?", admissions of unethical behavior

When you detect a red flag: probe directly but professionally. "That's a big number — walk me through how you measured that." If they recover with specifics, it was nerves. If not, that's your answer. If they admit to something unethical, note it internally and move on — don't lecture.

RULES:
- Ask ONE question at a time
- Wait for the candidate to fully finish before responding
- If nervous, be extra warm: "Take your time" or "That's a great start"
- Use at least 2-3 Live Problem Solving scenarios — these are your best data points
- For EVERY claimed skill, get a specific example OR test with a live problem
- If they say "we" did something, ask "what was YOUR specific role?"
- Don't let one topic eat the whole interview — if you have signal, move on
- Target 6-10 main questions with follow-ups driven by what they give you
- End naturally around the ${duration}-minute mark
${auBlock}`;
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
      model: "openai/gpt-4o",
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
      endpointing: 500,
    },
    endCallFunctionEnabled: true,
    maxDurationSeconds: (duration + 2) * 60,
    silenceTimeoutSeconds: 30,
    responseDelaySeconds: 1.2,
    backchannelingEnabled: false,
    backgroundDenoisingEnabled: true,
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

  // 9. Fetch company branding
  const { data: companyBrand } = await supabase
    .from("companies")
    .select("name, logo_url, primary_color")
    .eq("id", job.company_id)
    .maybeSingle();

  // 10. Return to client
  return NextResponse.json({
    assistant_id: assistant.id,
    public_key: process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY,
    candidate_name: candidateName,
    job_title: job.title,
    duration_minutes: duration,
    company_name: companyBrand?.name || "Claimless",
    company_color: companyBrand?.primary_color || "#2383E2",
  });
}
