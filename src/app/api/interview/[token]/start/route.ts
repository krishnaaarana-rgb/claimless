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

  // 1. Validate token — atomic claim to prevent race condition
  // First, try to atomically update pending→active (only one request can succeed)
  const { data: claimedTokens } = await supabase
    .from("interview_tokens")
    .update({ status: "active", used_at: new Date().toISOString() })
    .eq("token", token)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .select("id, application_id, status, expires_at");

  // If no rows updated, either token doesn't exist, is already claimed, or expired
  let tokenData;
  let freshClaim = false;
  if (claimedTokens && claimedTokens.length > 0) {
    freshClaim = true;
    // Successfully claimed — fetch full data
    const { data: fullToken } = await supabase
      .from("interview_tokens")
      .select("*, applications(*, candidates(*), jobs(id, title, description, company_id, industry, industry_niche, skill_requirements, industry_interview_context, employment_type, custom_instructions))")
      .eq("id", claimedTokens[0].id)
      .single();
    tokenData = fullToken;
  } else {
    // Claim failed — check why (already active for reconnection, or invalid)
    const { data: existingToken } = await supabase
      .from("interview_tokens")
      .select("*, applications(*, candidates(*), jobs(id, title, description, company_id, industry, industry_niche, skill_requirements, industry_interview_context, employment_type, custom_instructions))")
      .eq("token", token)
      .maybeSingle();

    if (!existingToken) {
      return NextResponse.json({ error: "Invalid interview token" }, { status: 404 });
    }
    if (existingToken.status === "completed" || existingToken.status === "used") {
      return NextResponse.json({ error: "Interview already completed" }, { status: 400 });
    }
    if (new Date(existingToken.expires_at) < new Date()) {
      return NextResponse.json({ error: "Interview link expired" }, { status: 400 });
    }
    // Token is "active" — reconnection case
    tokenData = existingToken;
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
      custom_instructions: string | null;
    };
  };

  const candidate = application.candidates;
  const job = application.jobs;

  // 2. If token was ALREADY active (not freshly claimed) AND interview not yet completed, allow reconnection
  const appStage = (application as unknown as { current_stage: string }).current_stage;
  if (!freshClaim && tokenData.status === "active" && appStage !== "interview_completed") {
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
        duration_minutes: settings?.interview_duration_minutes || 20,
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

  // 3c. Get project file context + consistency flags for interview
  const projectFiles = (application.application_form_data?.project_files as { name: string; path: string; type: string }[]) || [];
  let projectFileContext = "";
  if (projectFiles.length > 0) {
    projectFileContext = `\nPROJECT FILES SUBMITTED: ${projectFiles.map((f) => f.name).join(", ")}. Ask the candidate about these specific files — what they built, why, and what the outcome was.`;

    // Include extracted text from PDF project files (stored during screening)
    const projectFileExtracts = (screeningData.project_file_extracts as string) || "";
    if (projectFileExtracts) {
      projectFileContext += `\n\nPROJECT FILE CONTENT (extracted for your reference — use this to ask specific, detailed questions about their work):\n${projectFileExtracts.slice(0, 3000)}`;
    }
  }

  // 3d. Get custom question answers from application form
  const customAnswers = (application.application_form_data?.custom_answers as { question: string; answer: string }[]) || [];
  let customAnswersContext = "";
  if (customAnswers.length > 0) {
    customAnswersContext = `\n\nAPPLICATION FORM RESPONSES (the candidate answered these when applying — use to ask follow-up questions):`;
    for (const qa of customAnswers) {
      if (qa.answer?.trim()) {
        customAnswersContext += `\nQ: ${qa.question}\nA: ${qa.answer}`;
      }
    }
  }

  // 3e. Get consistency flags from screening (timeline issues, inflated claims)
  const consistencyFlags = (screeningData.consistency_flags as string[]) || [];
  const flagsContext = consistencyFlags.length > 0
    ? `\n\nRESUME CONSISTENCY FLAGS (probe these naturally during the interview — don't reveal you know):\n${consistencyFlags.map((f) => `- ${f}`).join("\n")}`
    : "";

  // 4. Get GitHub profile + pre-generated interview context if available
  let githubContext = "";
  let preGeneratedContext = screeningBrief
    ? `\nSCREENING BRIEF:\n${screeningBrief}`
    : "";
  preGeneratedContext += projectFileContext;
  preGeneratedContext += flagsContext;
  preGeneratedContext += customAnswersContext;
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
      // Try on-demand GitHub scraping if profile doesn't exist yet
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const scrapeRes = await fetch(`${baseUrl}/api/scrape/github`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ github_username: ghUser, candidate_id: candidate.id }),
        });
        if (scrapeRes.ok) {
          const scrapeData = await scrapeRes.json();
          if (scrapeData.analysis) {
            githubContext = `\n\nGITHUB PROFILE (just scraped):\n${JSON.stringify(scrapeData.analysis, null, 2)}`;
          }
        }
      } catch {
        // If scraping fails, fall back to a note
      }

      if (!githubContext) {
        githubContext = `\n\nThe candidate's GitHub profile is github.com/${ghUser}. Ask about their open source contributions or notable repos.`;
      }
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
      "interview_duration_minutes, interview_style, interview_focus, interview_custom_instructions, interviewer_name, voice_agent_id"
    )
    .eq("company_id", job.company_id)
    .maybeSingle();

  const duration = settings?.interview_duration_minutes || 20;
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
      custom_instructions: [job.custom_instructions, settings?.interview_custom_instructions].filter(Boolean).join("\n") || undefined,
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
    const currentDate = new Date().toLocaleDateString("en-AU", { year: "numeric", month: "long", day: "numeric" });
    systemPrompt = `You are an AI interviewer for "${job.title}". ${duration}-minute ${style} interview. Today: ${currentDate}.

You address the candidate as "${candidateName}". You are warm, casual, genuinely curious — like a colleague having coffee.
${(() => {
      const ci = [job.custom_instructions, settings?.interview_custom_instructions].filter(Boolean).join("\n");
      return ci ? `
PRIMARY FOCUS — THESE INSTRUCTIONS OVERRIDE EVERYTHING ELSE:
The hiring manager has given you specific instructions for this interview. These take PRIORITY over the default skill list. Shape your questions, scenarios, and focus areas around these instructions FIRST.

${ci}

Every question you ask should be filtered through this lens.
` : "";
    })()}
ABSOLUTE RULES — VOICE INTERVIEW:
- MAX 2 sentences per response. ONE question at a time.
- NEVER stack 2 or 3 questions in one response. Ask one, wait, then ask the next. This is the #1 rule.
- NEVER read code, SQL, schemas aloud. NEVER give answers.

HOW TO HAVE A REAL CONVERSATION:
- FOLLOW THE INTERESTING THREAD. When they mention something cool, DIG INTO THAT. Don't say "nice" and jump to your next question.
- REACT LIKE A REAL PERSON. "Oh wait, that's actually really cool — how did that work?" Not just "gotcha."
- USE SCENARIOS, NOT ABSTRACT QUESTIONS. "It's 2am, you get paged — users report stale data. What do you do?" NOT "How would you handle caching?"
- DON'T BE A CHECKLIST. Weave skills into the conversation naturally using THEIR projects.
- USE THEIR OWN PROJECTS as the testing ground. "You mentioned that portal — how did you handle X in that?" > "How would you handle X in general?"

INTERVIEW FLOW:
1. WARM UP (2 min): Get them talking. Find what excites them.
2. DEEP CONVERSATION (${Math.max(4, duration - 6)} min): Go deep on 3-4 topics using their real experience.
${interviewTopics.length > 0 ? "   Topics: " + interviewTopics.join(", ") : ""}
${concerns.length > 0 ? "   Concerns to probe: " + concerns.join(", ") : ""}
   At least 2 real scenarios tied to the role. Follow interesting threads.
3. WRAP UP — Around the ${duration - 3}-minute mark, start wrapping: "We're coming up on time..." Ask if they have questions. Close warmly. NEVER let the system timer cut the call — YOU end it.

TECHNIQUES:
- SCENARIO: "You push a deploy and 30 users report X. What's your first move?"
- DEPTH: 3 levels deep. "How'd you measure that?" → "What broke?" → "What would you change?"
- FOLLOW THE THREAD: Chase interesting things they say.
- CHALLENGE: "That's interesting but what could go wrong?"

JOB DESCRIPTION:
${job.description || "No description provided"}

CANDIDATE INTELLIGENCE (internal — never reveal):
${resumeText}
${githubContext}
${loomContext}
${preGeneratedContext}
${strengths.length > 0 ? `STRENGTHS: ${strengths.join(", ")}` : ""}
${concerns.length > 0 ? `CONCERNS: ${concerns.join(", ")}` : ""}

RULES:
- MAXIMUM 2 SENTENCES PER RESPONSE. Most important rule.
- ONE question at a time. Wait for them to finish.
- NEVER read code/SQL/schemas aloud. NEVER give answers.
- If they say "we", ask "what was YOUR role?"
- 6-10 questions total. Deep, not wide.
- Use full ${duration} minutes.
${auBlock}`;
  }

  // 7. Create Vapi assistant via API
  const name = `IV: ${candidateName} - ${job.title}`.slice(0, 40);

  // Build a contextual first message that references something specific
  const interviewerName = settings?.interviewer_name || null;
  const firstMessageContext = strengths.length > 0
    ? ` I had a chance to look over your background and it's really interesting`
    : ``;

  const vapiPayload = {
    name,
    model: {
      provider: "openrouter",
      model: "openai/gpt-5",
      messages: [{ role: "system", content: systemPrompt }],
      temperature: 0.7,
    },
    voice: {
      provider: "11labs",
      voiceId: settings?.voice_agent_id || "EXAVITQu4vr4xnSDxMaL",
      model: "eleven_turbo_v2_5",  // Optimized for low-latency streaming
      stability: 0.5,        // Higher = more consistent audio, fewer dropouts
      similarityBoost: 0.65,
      style: 0,              // Disable style exaggeration — reduces audio artifacts
      optimizeStreamingLatency: 3,  // 0-4, higher = faster but lower quality
    },
    firstMessage: interviewerName
      ? `Hey ${candidateName}! I'm ${interviewerName}. Thanks for jumping on.${firstMessageContext} So tell me, what's your story and what got you excited about this role?`
      : `Hey ${candidateName}! Thanks for jumping on.${firstMessageContext} So tell me, what's your story and what got you excited about this role?`,
    transcriber: {
      provider: "deepgram",
      model: "nova-2",
      language: "en",
      endpointing: 800,     // Wait longer before deciding candidate is done speaking — people pause to think
    },
    endCallFunctionEnabled: true,
    maxDurationSeconds: Math.min((duration + 5) * 60, 40 * 60),  // 5 min buffer for graceful wrap-up
    silenceTimeoutSeconds: 60,   // Give candidates time to think — 30s was too aggressive
    responseDelaySeconds: 1.2,   // Wait a bit longer before responding — lets them finish thinking
    backchannelingEnabled: false,  // Disabled — was causing audio interruptions mid-sentence
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
        interview_model: "openai/gpt-5",
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
    interviewer_name: interviewerName,
  });
}
