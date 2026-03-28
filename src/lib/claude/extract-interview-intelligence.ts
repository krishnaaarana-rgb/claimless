import { analyzeWithClaude } from "./client";
import { createAdminClient } from "@/lib/supabase/admin";

interface SkillPattern {
  skill: string;
  effective_probes: string[];
  ineffective_probes: string[];
  common_ceiling: string | null;
  avg_score: number | null;
  assessed_count: number;
}

interface RoleInsights {
  strong_candidate_signals: string[];
  common_red_flags: string[];
  high_signal_topics: string[];
  low_signal_topics: string[];
}

export interface InterviewIntelligence {
  interview_count: number;
  last_updated: string;
  skill_patterns: SkillPattern[];
  role_insights: RoleInsights;
  interviewer_briefing: string;
  version: number;
}

interface ExtractionResult {
  skill_patterns: {
    skill: string;
    effective_probe: string | null;
    ineffective_probe: string | null;
    ceiling_observation: string | null;
    score: number | null;
  }[];
  role_insight: {
    strong_signal: string | null;
    red_flag: string | null;
    high_signal_topic: string | null;
    low_signal_topic: string | null;
  };
}

interface SkillRequirement {
  skill: string;
  level: string;
  required: boolean;
}

const MAX_ITEMS = 5; // Cap arrays at 5 entries

function scrubPII(transcript: string, candidateName: string): string {
  if (!candidateName) return transcript;
  const names = [candidateName, ...candidateName.split(/\s+/)].filter(n => n.length > 2);
  let scrubbed = transcript;
  for (const name of names) {
    scrubbed = scrubbed.replace(new RegExp(name, "gi"), "Candidate");
  }
  return scrubbed;
}

function appendCapped(arr: string[], item: string | null): string[] {
  if (!item) return arr;
  // Deduplicate by checking if something very similar already exists
  const lower = item.toLowerCase();
  if (arr.some(a => a.toLowerCase().includes(lower.slice(0, 30)) || lower.includes(a.toLowerCase().slice(0, 30)))) {
    return arr;
  }
  const result = [...arr, item];
  return result.length > MAX_ITEMS ? result.slice(-MAX_ITEMS) : result;
}

function mergeIntelligence(
  existing: InterviewIntelligence | null,
  extraction: ExtractionResult
): InterviewIntelligence {
  const base: InterviewIntelligence = existing || {
    interview_count: 0,
    last_updated: new Date().toISOString(),
    skill_patterns: [],
    role_insights: {
      strong_candidate_signals: [],
      common_red_flags: [],
      high_signal_topics: [],
      low_signal_topics: [],
    },
    interviewer_briefing: "",
    version: 0,
  };

  // Merge skill patterns
  const skillMap = new Map(base.skill_patterns.map(s => [s.skill.toLowerCase(), { ...s }]));

  for (const sp of extraction.skill_patterns) {
    const key = sp.skill.toLowerCase();
    const existing = skillMap.get(key) || {
      skill: sp.skill,
      effective_probes: [],
      ineffective_probes: [],
      common_ceiling: null,
      avg_score: null,
      assessed_count: 0,
    };

    existing.effective_probes = appendCapped(existing.effective_probes, sp.effective_probe);
    existing.ineffective_probes = appendCapped(existing.ineffective_probes, sp.ineffective_probe);

    if (sp.ceiling_observation) {
      existing.common_ceiling = sp.ceiling_observation;
    }

    if (sp.score !== null && sp.score !== undefined) {
      if (existing.avg_score !== null && existing.assessed_count > 0) {
        existing.avg_score = Math.round(
          (existing.avg_score * existing.assessed_count + sp.score) / (existing.assessed_count + 1)
        );
      } else {
        existing.avg_score = sp.score;
      }
      existing.assessed_count++;
    }

    skillMap.set(key, existing);
  }

  // Merge role insights
  const insights = { ...base.role_insights };
  const ri = extraction.role_insight;
  insights.strong_candidate_signals = appendCapped(insights.strong_candidate_signals, ri.strong_signal);
  insights.common_red_flags = appendCapped(insights.common_red_flags, ri.red_flag);
  insights.high_signal_topics = appendCapped(insights.high_signal_topics, ri.high_signal_topic);
  insights.low_signal_topics = appendCapped(insights.low_signal_topics, ri.low_signal_topic);

  return {
    interview_count: base.interview_count + 1,
    last_updated: new Date().toISOString(),
    skill_patterns: Array.from(skillMap.values()),
    role_insights: insights,
    interviewer_briefing: "", // Will be regenerated
    version: base.version + 1,
  };
}

async function generateBriefing(intelligence: InterviewIntelligence): Promise<string> {
  const prompt = `Compress these interview learnings into a concise briefing (max 200 words) for an AI voice interviewer. Write in second person ("you should", "probe X early"). Focus on actionable advice: which approaches work, which don't, what to watch for. No candidate names or PII. Be specific.

Based on ${intelligence.interview_count} interview${intelligence.interview_count === 1 ? "" : "s"}.
${intelligence.interview_count <= 2 ? "With only 1-2 interviews, frame observations as tentative rather than established patterns." : ""}

SKILL PATTERNS:
${intelligence.skill_patterns.map(s =>
  `${s.skill} (avg: ${s.avg_score ?? "?"}/${100}, assessed ${s.assessed_count}x):` +
  (s.effective_probes.length ? `\n  Works: ${s.effective_probes.join("; ")}` : "") +
  (s.ineffective_probes.length ? `\n  Doesn't work: ${s.ineffective_probes.join("; ")}` : "") +
  (s.common_ceiling ? `\n  Common ceiling: ${s.common_ceiling}` : "")
).join("\n")}

ROLE INSIGHTS:
${intelligence.role_insights.strong_candidate_signals.length ? `Strong signals: ${intelligence.role_insights.strong_candidate_signals.join("; ")}` : ""}
${intelligence.role_insights.common_red_flags.length ? `Red flags: ${intelligence.role_insights.common_red_flags.join("; ")}` : ""}
${intelligence.role_insights.high_signal_topics.length ? `High-signal topics: ${intelligence.role_insights.high_signal_topics.join("; ")}` : ""}
${intelligence.role_insights.low_signal_topics.length ? `Low-signal topics: ${intelligence.role_insights.low_signal_topics.join("; ")}` : ""}

Return ONLY the briefing text, no JSON, no markdown.`;

  const briefing = await analyzeWithClaude<string>(
    "You write concise interviewer briefings. Return plain text only, no JSON or markdown.",
    prompt,
    { model: "anthropic/claude-haiku-4.5", maxTokens: 400, temperature: 0.3 }
  ).catch(() => null);

  // analyzeWithClaude tries to parse JSON — if it fails, the raw text is what we want
  // Fallback: just use the raw call
  if (typeof briefing === "string") return briefing.slice(0, 800);

  // If JSON parse happened, it won't be a string — fallback to a simple summary
  const fallback = intelligence.skill_patterns
    .filter(s => s.effective_probes.length > 0 || s.common_ceiling)
    .map(s => `${s.skill}: ${s.effective_probes[0] || s.common_ceiling || ""}`)
    .join(". ");
  return fallback.slice(0, 800) || "No actionable patterns yet.";
}

export async function extractAndUpdateIntelligence(
  jobId: string,
  scoring: Record<string, unknown>,
  transcript: string,
  existingIntelligence: InterviewIntelligence | null,
  skillRequirements: SkillRequirement[],
  jobTitle: string,
  candidateName: string
): Promise<void> {
  const scrubbedTranscript = scrubPII(transcript, candidateName);

  // Keep transcript compact — only first 8000 chars to stay within token limits
  const trimmedTranscript = scrubbedTranscript.length > 8000
    ? scrubbedTranscript.slice(0, 8000) + "\n[...truncated]"
    : scrubbedTranscript;

  const extraction = await analyzeWithClaude<ExtractionResult>(
    `You are an interview process analyst. Given a scored interview and transcript, extract PROCESS LEARNINGS — not candidate evaluations. Figure out what interview TECHNIQUES worked and didn't work. Respond with ONLY valid JSON. No PII, no candidate names.`,
    `ROLE: ${jobTitle}
SKILLS: ${skillRequirements.map(s => `${s.skill} (${s.level}${s.required ? ", required" : ""})`).join(", ")}
INTERVIEW # FOR THIS ROLE: ${(existingIntelligence?.interview_count ?? 0) + 1}

SCORING:
${JSON.stringify({
  skill_assessments: scoring.skill_assessments,
  strengths: scoring.strengths,
  areas_for_improvement: scoring.areas_for_improvement,
  key_moments: scoring.key_moments,
  recommendation: scoring.recommendation,
  overall_score: scoring.overall_score,
}, null, 0)}

TRANSCRIPT:
${trimmedTranscript}

Return JSON:
{
  "skill_patterns": [
    {
      "skill": "skill name from the SKILLS list",
      "effective_probe": "question or approach that got deep, genuine signal (null if none stood out)",
      "ineffective_probe": "question or approach that got rehearsed/surface answer or confused the candidate (null if none)",
      "ceiling_observation": "where the candidate hit their knowledge limit — useful pattern to watch for (null if not notable)",
      "score": <the score from scoring results for this skill, or null if not assessed>
    }
  ],
  "role_insight": {
    "strong_signal": "one thing that distinguished this as a strong or weak candidate for THIS role (null if nothing new)",
    "red_flag": "one behavioral or knowledge pattern worth watching for in future candidates (null if nothing new)",
    "high_signal_topic": "a topic or scenario that produced genuine differentiated insight (null if nothing new)",
    "low_signal_topic": "a topic that produced generic or rehearsed answers — avoid spending time here (null if nothing new)"
  }
}`,
    { model: "anthropic/claude-haiku-4.5", maxTokens: 2000, temperature: 0.2 }
  );

  // Merge with existing intelligence
  const merged = mergeIntelligence(existingIntelligence, extraction);

  // Generate human-readable briefing
  merged.interviewer_briefing = await generateBriefing(merged);

  // Write back to DB
  const supabase = createAdminClient();
  await supabase
    .from("jobs")
    .update({ interview_intelligence: merged })
    .eq("id", jobId);

  console.log(
    "[intelligence] Updated for job", jobId.slice(0, 8),
    "| interviews:", merged.interview_count,
    "| version:", merged.version,
    "| skills tracked:", merged.skill_patterns.length
  );
}
