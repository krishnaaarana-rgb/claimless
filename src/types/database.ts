// Core database types — these will be auto-generated from Supabase later
// For now, manual types matching our schema

import type { SkillRequirement } from "@/types/industry-skills";

export interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  domain: string | null;
  plan: "standard" | "premium" | "white_label";
  settings: Record<string, unknown>;
  onboarded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyUser {
  id: string;
  company_id: string;
  user_id: string;
  role: "owner" | "admin" | "member" | "viewer";
  email: string;
  full_name: string | null;
  created_at: string;
}

export interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string;
  requirements: JobRequirement[];
  requirements_raw: string | null;
  requirements_analyzed: Record<string, unknown> | null;
  department: string | null;
  location: string | null;
  salary_range: { min: number; max: number; currency: string } | null;
  employment_type: "full_time" | "contract" | "part_time";
  stage_config: StageConfig;
  voice_interview_config: VoiceInterviewConfig;
  industry: string | null;
  industry_niche: string | null;
  skill_requirements: SkillRequirement[];
  industry_interview_context: string | null;
  status: "draft" | "active" | "paused" | "closed";
  published_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobRequirement {
  skill: string;
  level: "basic" | "intermediate" | "advanced" | "expert";
  required: boolean;
}

export interface StageConfig {
  stage_1_proof_of_work: boolean;
  stage_2_loom: boolean;
  stage_3_voice: boolean;
}

export interface VoiceInterviewConfig {
  max_duration_minutes: number;
  focus_areas: string[];
  custom_questions: string[];
}

export interface Candidate {
  id: string;
  user_id: string | null;
  email: string | null;
  full_name: string | null;
  github_username: string | null;
  personal_website_url: string | null;
  linkedin_url: string | null;
  phone: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface CandidateProfile {
  id: string;
  candidate_id: string;
  overall_score: number | null;
  seniority_estimate: "junior" | "mid" | "senior" | "staff" | null;
  github_data: Record<string, unknown> | null;
  github_analysis: GitHubAnalysis | null;
  architectural_decisions: ArchitecturalDecision[];
  verified_skills: VerifiedSkill[];
  shipped_products: ShippedProduct[];
  website_analysis: WebsiteAnalysis | null;
  interview_context_summary: string | null;
  interview_suggested_questions: InterviewQuestion[];
  scrape_status: "pending" | "scraping" | "analyzing" | "complete" | "failed";
  scrape_error: string | null;
  last_scraped_at: string | null;
  analysis_version: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubAnalysis {
  languages: { name: string; percentage: number; lines_of_code: number }[];
  frameworks: { name: string; evidence: string; proficiency: string }[];
  total_repos: number;
  total_commits: number;
  contribution_frequency: string;
  top_repos: { name: string; description: string; stars: number; analysis: string }[];
}

export interface ArchitecturalDecision {
  repo: string;
  decision: string;
  context: string;
  evidence: string;
}

export interface VerifiedSkill {
  skill: string;
  proficiency: "basic" | "intermediate" | "advanced" | "expert";
  evidence: string;
  repos: string[];
}

export interface ShippedProduct {
  url: string;
  name: string;
  description: string;
  tech_stack_detected: string[];
  analysis: string;
  complexity_score: number;
}

export interface WebsiteAnalysis {
  url: string;
  tech_detected: string[];
  content_summary: string;
  portfolio_items: Record<string, unknown>[];
}

export interface InterviewQuestion {
  question: string;
  context: string;
  category: "technical" | "architectural" | "product" | "growth";
}

export interface Application {
  id: string;
  candidate_id: string;
  job_id: string;
  company_id: string;
  current_stage: "applied" | "screening" | "stage_1_passed" | "stage_1_failed" | "interview_invited" | "interview_completed" | "hired" | "rejected" | "pending_review";
  profile_id: string | null;
  loom_submission_id: string | null;
  voice_interview_id: string | null;
  stage_1_score: number | null;
  stage_2_score: number | null;
  stage_3_score: number | null;
  overall_score: number | null;
  stage_1_passed: boolean | null;
  stage_2_passed: boolean | null;
  stage_3_passed: boolean | null;
  match_score: number | null;
  match_breakdown: Record<string, number> | null;
  status: "active" | "shortlisted" | "rejected" | "hired" | "withdrawn";
  rejected_reason: string | null;
  shortlisted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoomSubmission {
  id: string;
  candidate_id: string;
  application_id: string;
  loom_url: string;
  video_duration_seconds: number | null;
  transcript: string | null;
  analysis: LoomAnalysisResult | null;
  loom_context_summary: string | null;
  status: "pending" | "processing" | "analyzed" | "failed";
  analyzed_at: string | null;
  created_at: string;
}

export interface LoomAnalysisResult {
  communication_clarity_score: number;
  confidence_score: number;
  technical_depth_score: number;
  relevance_score: number;
  overall_score: number;
  summary: string;
  strengths: string[];
  concerns: string[];
  key_quotes: string[];
}

export interface VoiceInterview {
  id: string;
  candidate_id: string;
  application_id: string;
  job_id: string;
  vapi_call_id: string | null;
  vapi_assistant_id: string | null;
  injected_prompt: string;
  injected_context: Record<string, unknown> | null;
  phone_number: string | null;
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  transcript: string | null;
  recording_url: string | null;
  analysis: VoiceInterviewAnalysis | null;
  status: "scheduled" | "in_progress" | "completed" | "failed" | "no_show";
  created_at: string;
  updated_at: string;
}

export interface VoiceInterviewAnalysis {
  technical_depth_score: number;
  problem_solving_score: number;
  communication_score: number;
  cultural_fit_score: number;
  overall_score: number;
  summary: string;
  strengths: string[];
  concerns: string[];
  question_responses: {
    question: string;
    response_summary: string;
    score: number;
    notes: string;
  }[];
  hire_recommendation: "strong_yes" | "yes" | "maybe" | "no" | "strong_no";
  recommendation_reasoning: string;
}

export interface DirectoryListing {
  id: string;
  candidate_id: string;
  profile_id: string;
  skills: string[];
  seniority: string | null;
  location: string | null;
  available: boolean;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface PipelineEvent {
  id: string;
  application_id: string | null;
  company_id: string;
  candidate_id: string | null;
  job_id: string | null;
  event_type: string;
  event_data: Record<string, unknown>;
  created_at: string;
}

export interface WhiteLabelConfig {
  id: string;
  company_id: string;
  custom_domain: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  brand_name: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  font_family: string;
  email_from_name: string | null;
  email_from_address: string | null;
  custom_css: string | null;
  created_at: string;
  updated_at: string;
}
