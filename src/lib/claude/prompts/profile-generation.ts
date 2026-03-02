import { scrapeGitHubProfile } from "@/lib/scraping/github";
import { analyzeGitHubProfile } from "./github-analysis";
import {
  generateInterviewContext,
  generateInterviewQuestions,
} from "./interview-questions";
import type { GitHubAnalysisResult } from "./github-analysis";
import type { GeneratedInterviewQuestion } from "./interview-questions";

export interface GeneratedProfile {
  githubData: Record<string, unknown>;
  analysis: GitHubAnalysisResult;
  interviewContextSummary: string;
  interviewSuggestedQuestions: GeneratedInterviewQuestion[];
}

export async function generateCandidateProfile(
  githubUsername: string,
  accessToken?: string
): Promise<GeneratedProfile> {
  console.log(`[Profile Generator] Starting profile generation for: ${githubUsername}`);

  console.log(`[Profile Generator] Step 1/3: Scraping GitHub...`);
  const scrapedData = await scrapeGitHubProfile(githubUsername, accessToken);

  console.log(`[Profile Generator] Step 2/3: Analyzing with Claude...`);
  const analysis = await analyzeGitHubProfile(scrapedData);

  console.log(`[Profile Generator] Step 3/3: Generating interview context and questions...`);
  const [interviewContextSummary, interviewSuggestedQuestions] =
    await Promise.all([
      generateInterviewContext(analysis, githubUsername),
      generateInterviewQuestions(analysis, githubUsername),
    ]);

  console.log(`[Profile Generator] Profile complete. Score: ${analysis.overall_score}/100, Seniority: ${analysis.seniority_estimate}`);

  return {
    githubData: scrapedData as unknown as Record<string, unknown>,
    analysis,
    interviewContextSummary,
    interviewSuggestedQuestions,
  };
}
