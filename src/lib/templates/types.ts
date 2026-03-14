export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  industries: string[];
  tags: string[];
  content: string | Record<string, unknown>;
  variables?: string[];
}

export type TemplateCategory =
  | "email"
  | "loom_prompt"
  | "job_description"
  | "interview_questions"
  | "api_payload"
  | "automation_workflow";
