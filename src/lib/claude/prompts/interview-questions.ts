import { generateTextWithClaude, analyzeWithClaude } from "@/lib/claude/client";
import type { GitHubAnalysisResult } from "./github-analysis";

export interface GeneratedInterviewQuestion {
  question: string;
  context: string;
  category: "technical" | "architectural" | "product" | "growth";
}

export async function generateInterviewContext(
  analysis: GitHubAnalysisResult,
  username: string
): Promise<string> {
  const systemPrompt = `You are preparing a briefing document for an AI voice interviewer. Write in second person ("You are interviewing a candidate who..."). Be specific — reference actual repo names, actual technologies, actual decisions. This briefing will be injected directly into the interviewer's system prompt.

Keep it under 800 words but make every sentence count. Do not pad with generic statements.`;

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
  const systemPrompt = `You are generating interview questions for a technical voice interview. Every question MUST reference something specific from the candidate's actual verified work. Never ask generic questions.

Respond with ONLY a JSON array. No markdown, no explanation.`;

  const userPrompt = `Generate 10 interview questions for developer "${username}" based on their verified work.

Their repos: ${analysis.top_repos.map((r) => `${r.name}: ${r.analysis}`).join("\n")}

Their architectural decisions: ${analysis.architectural_decisions.map((d) => `In ${d.repo}: ${d.decision} (${d.context})`).join("\n")}

Their verified skills: ${analysis.verified_skills.map((s) => `${s.skill} (${s.proficiency})`).join(", ")}

Generate a JSON array of exactly 10 objects: [{"question": "...", "context": "why this question matters", "category": "technical|architectural|product|growth"}]

Rules:
- 4 deep technical questions referencing specific repos or code patterns
- 3 architectural/decision questions about WHY they made specific choices
- 2 questions about shipped products or project outcomes
- 1 question about their learning/growth pattern
- Every question must name a specific repo, technology choice, or pattern from their actual work
- Questions should probe DEPTH — "walk me through", "what tradeoffs", "why did you choose X over Y"`;

  return analyzeWithClaude<GeneratedInterviewQuestion[]>(
    systemPrompt,
    userPrompt,
    { maxTokens: 2048, temperature: 0.2 }
  );
}
