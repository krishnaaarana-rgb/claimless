import { generateTextWithClaude, analyzeWithClaude } from "@/lib/claude/client";
import type { GitHubAnalysisResult } from "./github-analysis";

export interface GeneratedInterviewQuestion {
  question: string;
  context: string;
  category: "technical" | "architectural" | "verification" | "depth_probe" | "growth";
  follow_up: string;
  what_good_looks_like: string;
}

export async function generateInterviewContext(
  analysis: GitHubAnalysisResult,
  username: string
): Promise<string> {
  const systemPrompt = `You are preparing a briefing document for an elite AI voice interviewer. This interviewer is BETTER than a human — it can cross-reference everything the candidate says against their verified work in real-time.

Write in second person ("You are interviewing..."). Be specific — reference actual repo names, technologies, and decisions. This briefing is injected directly into the interviewer's system prompt.

Structure the briefing as:
1. CANDIDATE SNAPSHOT — who they are in 2-3 sentences
2. VERIFIED STRENGTHS — what the code proves they can do (cite repos)
3. AREAS TO PROBE — gaps between their apparent level and what the code shows
4. VERIFICATION ANCHORS — specific claims in their code you can test verbally (e.g., "they use Redis in repo X — ask about cache invalidation strategies")
5. SUGGESTED QUESTION CHAIN — a 3-question sequence that starts broad and drills deep into their strongest area

Keep it under 800 words. Every sentence must be actionable for the interviewer.`;

  const userPrompt = `Write an interview briefing based on this verified developer profile.

Developer: ${username}
Seniority estimate: ${analysis.seniority_estimate}
Overall score: ${analysis.overall_score}/100

Summary: ${analysis.summary}

Top skills: ${analysis.verified_skills.map((s) => `${s.skill} (${s.proficiency}): ${s.evidence}`).join("\n")}

Key repos: ${analysis.top_repos.map((r) => `${r.name} (${r.stars} stars): ${r.analysis}`).join("\n")}

Architectural decisions found:
${analysis.architectural_decisions.map((d) => `- In ${d.repo}: ${d.decision} — ${d.context} (evidence: ${d.evidence})`).join("\n")}

Frameworks detected: ${analysis.frameworks.map((f) => `${f.name} (${f.proficiency}): ${f.evidence}`).join(", ")}

Languages: ${analysis.languages.map((l) => `${l.name} (${l.percentage}%, ${l.proficiency})`).join(", ")}`;

  return generateTextWithClaude(systemPrompt, userPrompt, {
    maxTokens: 2048,
    temperature: 0.3,
  });
}

export async function generateInterviewQuestions(
  analysis: GitHubAnalysisResult,
  username: string
): Promise<GeneratedInterviewQuestion[]> {
  const systemPrompt = `You are generating interview questions for an elite AI interviewer that is BETTER than a human interviewer. Every question must:

1. Reference something specific from the candidate's verified work
2. Be designed to reveal DEPTH — not just whether they know something, but HOW WELL they know it
3. Include a follow-up that pushes deeper based on likely answers
4. Describe what a GOOD answer looks like vs a RED FLAG answer

You generate questions that a human interviewer would never think to ask because they don't have time to review 15 repos in detail. You do.

Respond with ONLY a JSON array. No markdown, no explanation.`;

  const userPrompt = `Generate 10 interview questions for developer "${username}" based on their verified work.

Their repos: ${analysis.top_repos.map((r) => `${r.name}: ${r.analysis}`).join("\n")}

Their architectural decisions: ${analysis.architectural_decisions.map((d) => `In ${d.repo}: ${d.decision} (${d.context})`).join("\n")}

Their verified skills: ${analysis.verified_skills.map((s) => `${s.skill} (${s.proficiency})`).join(", ")}

Seniority estimate: ${analysis.seniority_estimate}

Generate a JSON array of exactly 10 objects:
[{
  "question": "the actual question to ask",
  "context": "why this question matters — what it reveals",
  "category": "technical|architectural|verification|depth_probe|growth",
  "follow_up": "a follow-up question to push deeper based on their answer",
  "what_good_looks_like": "what a strong candidate would say vs what a weak candidate would say"
}]

QUESTION MIX:
- 3 VERIFICATION questions: Reference specific code/repos and ask them to explain decisions. Tests if they actually wrote it or just copied it. "In your ${analysis.top_repos[0]?.name || 'project'}, I noticed you [specific pattern]. Walk me through why you chose that approach."
- 2 DEPTH PROBE questions: Start with something they clearly know, then escalate to edge cases and tradeoffs they may not have considered. "You use X extensively — what happens when Y? How would you handle Z?"
- 2 ARCHITECTURAL questions: Ask about system design decisions with real constraints. "If ${analysis.top_repos[0]?.name || 'your project'} needed to handle 100x the traffic, what would break first?"
- 2 TECHNICAL questions: Test understanding of tools/frameworks they use. Use the "teach me" approach. "Explain [concept from their stack] as if I'm a junior developer joining your team."
- 1 GROWTH question: How they learn, handle failure, or evolve. "What's something in ${analysis.top_repos[0]?.name || 'your recent work'} you'd do completely differently if you started today?"`;

  return analyzeWithClaude<GeneratedInterviewQuestion[]>(
    systemPrompt,
    userPrompt,
    { maxTokens: 3072, temperature: 0.3 }
  );
}
