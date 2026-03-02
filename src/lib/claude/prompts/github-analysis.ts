import { analyzeWithClaude } from "@/lib/claude/client";
import type { ScrapedGitHubData } from "@/lib/scraping/github";

export interface GitHubAnalysisResult {
  languages: { name: string; percentage: number; proficiency: string }[];
  frameworks: { name: string; evidence: string; proficiency: string }[];
  total_repos: number;
  total_commits_sampled: number;
  contribution_frequency: string;
  top_repos: {
    name: string;
    description: string;
    stars: number;
    analysis: string;
    complexity: string;
  }[];
  architectural_decisions: {
    repo: string;
    decision: string;
    context: string;
    evidence: string;
  }[];
  verified_skills: {
    skill: string;
    proficiency: "basic" | "intermediate" | "advanced" | "expert";
    evidence: string;
    repos: string[];
  }[];
  seniority_estimate: "junior" | "mid" | "senior" | "staff";
  overall_score: number;
  summary: string;
}

export async function analyzeGitHubProfile(
  data: ScrapedGitHubData
): Promise<GitHubAnalysisResult> {
  const systemPrompt = `You are an expert technical recruiter and senior software engineer analyzing a developer's GitHub profile. Your job is to evaluate their actual work — not their claims — and produce a thorough, honest assessment.

You must respond with ONLY valid JSON matching the exact schema specified. No markdown, no explanation, no preamble. Just the JSON object.`;

  const repoSummaries = data.repoDetails
    .map(
      (repo) => `
### ${repo.name} (${repo.stars} stars, ${repo.forks} forks)
- Fork: ${repo.is_fork ? "yes" : "no"}
- URL: ${repo.url}
- Primary language: ${repo.language || "unknown"}
- Topics: ${repo.topics.join(", ") || "none"}
- Description: ${repo.description || "no description"}
- Languages used: ${Object.entries(repo.languages).map(([l, b]) => `${l}: ${b} bytes`).join(", ")}
- Directory structure: ${repo.directoryStructure.join(", ")}
- Recent commits: ${repo.recentCommits.map((c) => `"${c.message}" (${c.date})`).join("; ")}
${repo.readme ? `- README (first 3000 chars):\n${repo.readme}` : "- No README"}
${repo.packageJson ? `- package.json dependencies: ${JSON.stringify(Object.keys((repo.packageJson as Record<string, unknown>).dependencies || {}))}` : ""}
${repo.packageJson ? `- package.json devDependencies: ${JSON.stringify(Object.keys((repo.packageJson as Record<string, unknown>).devDependencies || {}))}` : ""}
`
    )
    .join("\n---\n");

  const userPrompt = `Analyze this developer's GitHub profile and produce a verified technical assessment.

## Developer Info
- Username: ${data.user.login}
- Name: ${data.user.name || "not provided"}
- Bio: ${data.user.bio || "not provided"}
- Location: ${data.user.location || "not provided"}
- Public repos: ${data.user.public_repos}
- Account created: ${data.user.created_at}
- Website: ${data.user.blog || "none"}

## Language Breakdown (across top repos)
${data.languageBreakdown.map((l) => `- ${l.name}: ${l.percentage}% (${l.bytes} bytes)`).join("\n")}

## Top Repositories (detailed)
${repoSummaries}

## Your Task
Produce a JSON object with these exact fields:
{
  "languages": [{"name": "string", "percentage": number, "proficiency": "basic|intermediate|advanced|expert"}],
  "frameworks": [{"name": "string", "evidence": "what repo/code shows this", "proficiency": "basic|intermediate|advanced|expert"}],
  "total_repos": number,
  "total_commits_sampled": number,
  "contribution_frequency": "daily|several_times_weekly|weekly|sporadic|inactive",
  "top_repos": [{"name": "string", "description": "string", "stars": number, "analysis": "2-3 sentence technical analysis of what this repo demonstrates", "complexity": "trivial|simple|moderate|complex|highly_complex"}],
  "architectural_decisions": [{"repo": "string", "decision": "what decision was made", "context": "why it matters", "evidence": "specific file/code/pattern that shows this"}],
  "verified_skills": [{"skill": "string", "proficiency": "basic|intermediate|advanced|expert", "evidence": "specific proof from their repos", "repos": ["repo names"]}],
  "seniority_estimate": "junior|mid|senior|staff",
  "overall_score": number (0-100, be honest — most developers score 30-70),
  "summary": "3-4 sentence overall assessment"
}

Rules:
- Only list skills you can VERIFY from the code. If there is no evidence, do not include it.
- Be honest with scoring. A student with tutorial projects is 15-30. A solid mid-level dev is 40-60. Only genuinely impressive, well-architected, production-quality work scores above 70.
- Architectural decisions must reference specific repos and specific patterns you can see in the code structure, dependencies, or README.
- Frameworks must have evidence — seeing React in package.json counts. Just having a .js file does not.
- Forked repos with no modifications should be ignored. Forked repos with significant changes demonstrate the candidate's ability to build on existing code.`;

  return analyzeWithClaude<GitHubAnalysisResult>(systemPrompt, userPrompt, {
    maxTokens: 4096,
    temperature: 0,
  });
}
