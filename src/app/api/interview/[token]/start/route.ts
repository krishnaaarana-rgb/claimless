import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

  const systemPrompt = `You are an AI interviewer for the role of "${job.title}" at the company. You are conducting a ${duration}-minute ${style} interview.

YOUR PERSONA:
- Warm, professional, and encouraging
- You address the candidate as "${candidateName}"
- You sound like a senior hiring manager who genuinely wants to learn about the candidate
- You listen carefully and ask thoughtful follow-up questions
- You never reveal the candidate's ATS score or internal assessment
- Keep the conversation natural -- not robotic or scripted

INTERVIEW STRUCTURE:
1. Start with a warm greeting: "Hi ${candidateName}, thanks for taking the time to chat with us today. I'm excited to learn more about you and your experience. Let's keep this conversational -- no trick questions, just a chance to get to know each other."
2. Ask about their background briefly (1-2 minutes)
3. Move into role-specific questions (${focus === "technical_and_behavioral" ? "mix of technical and behavioral" : focus})
4. Ask about ${interviewTopics.length > 0 ? "these specific topics: " + interviewTopics.join(", ") : "their experience related to the job description"}
5. Probe into areas of concern: ${concerns.length > 0 ? concerns.join(", ") : "general fit for the role"}
6. Give them a chance to ask questions about the role
7. End warmly: "Thanks so much ${candidateName}, it was great chatting with you. We'll be in touch soon with next steps."

JOB DESCRIPTION:
${job.description || "No description provided"}

CANDIDATE RESUME:
${resumeText}
${githubContext}

ATS SCREENING CONTEXT (internal -- never share with candidate):
- Strengths identified: ${strengths.join(", ") || "None noted"}
- Concerns to probe: ${concerns.join(", ") || "None noted"}
- Suggested topics: ${interviewTopics.join(", ") || "General role fit"}

${settings?.interview_custom_instructions ? `ADDITIONAL INSTRUCTIONS:\n${settings.interview_custom_instructions}` : ""}

RULES:
- Keep answers focused -- if the candidate goes off-topic, gently redirect
- Ask ONE question at a time, never stack multiple questions
- Wait for the candidate to finish before responding
- If the candidate seems nervous, be extra encouraging
- The interview should last approximately ${duration} minutes
- Ask 5-8 main questions total, with follow-ups as needed
- End the interview naturally when you've covered the key topics`;

  // 7. Create Vapi assistant via API
  const name = `IV: ${candidateName} - ${job.title}`.slice(0, 40);
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
    firstMessage: `Hi ${candidateName}, thanks for taking the time to chat with us today about the ${job.title} role. I'm really looking forward to learning more about you. Let's keep this super conversational -- just think of it as a friendly chat about your experience. So to kick things off, could you tell me a bit about yourself and what drew you to this role?`,
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

  // Store the assistant ID on the application for later reference
  await supabase
    .from("applications")
    .update({
      current_stage: "interview_invited",
      application_form_data: {
        ...application.application_form_data,
        vapi_assistant_id: assistant.id,
        interview_started_at: new Date().toISOString(),
        preferred_name: candidateName,
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
