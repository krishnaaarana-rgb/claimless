import { analyzeWithClaude } from "../client";

export interface ATSScreeningResult {
  match_score: number;
  pass: boolean;
  summary: string;
  strengths: string[];
  concerns: string[];
  key_qualifications: {
    qualification: string;
    met: boolean;
    evidence: string;
  }[];
  recommendation:
    | "strong_pass"
    | "pass"
    | "borderline"
    | "fail"
    | "strong_fail";
  suggested_interview_topics: string[];
}

export interface ATSScreenInput {
  jobTitle: string;
  jobDescription: string;
  employmentType: string;
  candidateName: string;
  candidateEmail: string;
  resumeText: string | null;
  coverLetter: string | null;
  linkedinUrl: string | null;
  githubUsername: string | null;
  portfolioUrl: string | null;
  websiteContent?: string | null;
  customAnswers: { question: string; answer: string }[];
  threshold?: number;
  industry?: string | null;
  skillRequirements?: { skill: string; category: string; level: string; required: boolean; weight: number }[];
}

const SYSTEM_PROMPT = `You are an ATS screening system. Evaluate this candidate's application against the job description. Base your assessment ONLY on the information provided — do not make assumptions about information not given. If a resume is provided, weight it heavily. If portfolio/website content is provided, consider it as additional evidence of the candidate's work and expertise. If no resume is provided, evaluate based on whatever information IS available but note the limitation. Be fair and look for potential, not just keyword matches.

You MUST output ONLY valid JSON matching this exact schema:
{
  "match_score": <number 0-100>,
  "recommendation": "<one of: strong_pass, pass, borderline, fail, strong_fail>",
  "summary": "<2-3 sentence assessment>",
  "strengths": ["..."],
  "concerns": ["..."],
  "key_qualifications": [{ "qualification": "...", "met": true/false, "evidence": "..." }],
  "suggested_interview_topics": ["..."]
}

Scoring guide:
- 80-100: Exceptional match, exceeds requirements (strong_pass)
- 60-79: Good match, meets most requirements (pass)
- 40-59: Partial match, some gaps but potential (borderline)
- 20-39: Weak match, significant gaps (fail)
- 0-19: Very poor match, fundamentally misaligned (strong_fail)

Output ONLY the JSON object, no other text.`;

function buildUserPrompt(input: ATSScreenInput): string {
  const lines: string[] = [];

  lines.push(`JOB: ${input.jobTitle}`);
  lines.push(`TYPE: ${input.employmentType}`);
  lines.push("");
  lines.push("JOB DESCRIPTION:");
  lines.push(input.jobDescription);
  lines.push("");
  lines.push(`CANDIDATE: ${input.candidateName}`);
  lines.push(`EMAIL: ${input.candidateEmail}`);
  lines.push(`LINKEDIN: ${input.linkedinUrl || "Not provided"}`);
  lines.push(`GITHUB: ${input.githubUsername || "Not provided"}`);
  lines.push(`PORTFOLIO: ${input.portfolioUrl || "Not provided"}`);
  lines.push("");
  lines.push("PORTFOLIO WEBSITE CONTENT:");
  lines.push(input.websiteContent || "Not available (site may require JavaScript to render)");
  lines.push("");
  lines.push("RESUME:");
  lines.push(input.resumeText || "No resume provided");
  lines.push("");
  lines.push("COVER LETTER:");
  lines.push(input.coverLetter || "No cover letter provided");
  lines.push("");
  // Industry and skill requirements context
  if (input.industry) {
    lines.push(`INDUSTRY: ${input.industry}`);
    lines.push("");
  }

  if (input.skillRequirements && input.skillRequirements.length > 0) {
    lines.push("SKILL REQUIREMENTS:");
    const hardSkills = input.skillRequirements.filter(s => s.category === "hard_skill");
    const softSkills = input.skillRequirements.filter(s => s.category === "soft_skill");
    const customSkills = input.skillRequirements.filter(s => s.category === "custom");

    if (hardSkills.length > 0) {
      lines.push("  Hard Skills (domain-specific):");
      for (const s of hardSkills) {
        lines.push(`    - ${s.skill} (${s.level}, ${s.required ? "required" : "nice-to-have"}, weight: ${s.weight}/5)`);
      }
    }
    if (softSkills.length > 0) {
      lines.push("  Soft Skills (behavioral):");
      for (const s of softSkills) {
        lines.push(`    - ${s.skill} (${s.level}, ${s.required ? "required" : "nice-to-have"}, weight: ${s.weight}/5)`);
      }
    }
    if (customSkills.length > 0) {
      lines.push("  Additional Skills:");
      for (const s of customSkills) {
        lines.push(`    - ${s.skill} (${s.level}, ${s.required ? "required" : "nice-to-have"}, weight: ${s.weight}/5)`);
      }
    }
    lines.push("");
    lines.push("Evaluate the candidate against EACH skill requirement above. In your key_qualifications array, include an entry for each skill requirement showing whether the candidate meets the expected level. Weight required skills and higher-weight skills more heavily in your match_score.");
    lines.push("");
  }

  lines.push("CUSTOM QUESTIONS:");
  if (input.customAnswers.length > 0) {
    for (const qa of input.customAnswers) {
      lines.push(`Q: ${qa.question}`);
      lines.push(`A: ${qa.answer}`);
      lines.push("");
    }
  } else {
    lines.push("None");
  }

  const threshold = input.threshold ?? 40;
  lines.push("");
  lines.push(`Evaluate this candidate against the job description. The pass threshold is ${threshold}/100. Return ONLY valid JSON.`);

  return lines.join("\n");
}

export async function screenApplication(
  input: ATSScreenInput
): Promise<ATSScreeningResult> {
  console.log("[ats-screening] screenApplication called:", {
    jobTitle: input.jobTitle,
    candidateName: input.candidateName,
    has_resumeText: !!input.resumeText,
    resumeText_length: input.resumeText?.length ?? 0,
    has_coverLetter: !!input.coverLetter,
    customAnswers_count: input.customAnswers.length,
  });

  const userPrompt = buildUserPrompt(input);
  console.log("[ats-screening] Prompt length:", userPrompt.length, "chars");

  const result = await analyzeWithClaude<ATSScreeningResult>(
    SYSTEM_PROMPT,
    userPrompt,
    { maxTokens: 2048, temperature: 0 }
  );

  // Ensure pass field matches threshold
  const threshold = input.threshold ?? 40;
  result.pass = result.match_score >= threshold;

  console.log("[ats-screening] Result:", {
    match_score: result.match_score,
    pass: result.pass,
    recommendation: result.recommendation,
  });

  return result;
}
