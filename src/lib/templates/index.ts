export { EMAIL_TEMPLATES } from "./email/templates";
export { LOOM_PROMPT_TEMPLATES } from "./loom-prompts/templates";
export { JOB_DESCRIPTION_TEMPLATES } from "./job-descriptions/templates";
export { INTERVIEW_QUESTION_TEMPLATES } from "./interview-questions/templates";
export { API_WEBHOOK_TEMPLATES } from "./api-webhooks/templates";
export { AUTOMATION_WORKFLOW_TEMPLATES } from "./automation-workflows/templates";
export type { Template, TemplateCategory } from "./types";

import { EMAIL_TEMPLATES } from "./email/templates";
import { LOOM_PROMPT_TEMPLATES } from "./loom-prompts/templates";
import { JOB_DESCRIPTION_TEMPLATES } from "./job-descriptions/templates";
import { INTERVIEW_QUESTION_TEMPLATES } from "./interview-questions/templates";
import { API_WEBHOOK_TEMPLATES } from "./api-webhooks/templates";
import { AUTOMATION_WORKFLOW_TEMPLATES } from "./automation-workflows/templates";
import type { Template, TemplateCategory } from "./types";

export const ALL_TEMPLATES: Template[] = [
  ...EMAIL_TEMPLATES,
  ...LOOM_PROMPT_TEMPLATES,
  ...JOB_DESCRIPTION_TEMPLATES,
  ...INTERVIEW_QUESTION_TEMPLATES,
  ...API_WEBHOOK_TEMPLATES,
  ...AUTOMATION_WORKFLOW_TEMPLATES,
];

export function getTemplates(category?: TemplateCategory, industry?: string): Template[] {
  let result = ALL_TEMPLATES;
  if (category) result = result.filter((t) => t.category === category);
  if (industry) result = result.filter((t) => t.industries.length === 0 || t.industries.includes(industry));
  return result;
}

export function getTemplate(id: string): Template | undefined {
  return ALL_TEMPLATES.find((t) => t.id === id);
}
