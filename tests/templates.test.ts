import { describe, it, expect } from "vitest";
import {
  ALL_TEMPLATES,
  getTemplates,
  getTemplate,
  EMAIL_TEMPLATES,
  LOOM_PROMPT_TEMPLATES,
  JOB_DESCRIPTION_TEMPLATES,
  INTERVIEW_QUESTION_TEMPLATES,
  API_WEBHOOK_TEMPLATES,
  AUTOMATION_WORKFLOW_TEMPLATES,
} from "@/lib/templates";

describe("Template Library", () => {
  it("has templates in all categories", () => {
    expect(EMAIL_TEMPLATES.length).toBeGreaterThan(0);
    expect(LOOM_PROMPT_TEMPLATES.length).toBeGreaterThan(0);
    expect(JOB_DESCRIPTION_TEMPLATES.length).toBeGreaterThan(0);
    expect(INTERVIEW_QUESTION_TEMPLATES.length).toBeGreaterThan(0);
    expect(API_WEBHOOK_TEMPLATES.length).toBeGreaterThan(0);
    expect(AUTOMATION_WORKFLOW_TEMPLATES.length).toBeGreaterThan(0);
  });

  it("has unique IDs across all templates", () => {
    const ids = ALL_TEMPLATES.map((t) => t.id);
    const unique = new Set(ids);
    expect(ids.length).toBe(unique.size);
  });

  it("all templates have required fields", () => {
    for (const t of ALL_TEMPLATES) {
      expect(t.id).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(t.description).toBeTruthy();
      expect(t.category).toBeTruthy();
      expect(Array.isArray(t.industries)).toBe(true);
      expect(Array.isArray(t.tags)).toBe(true);
      expect(t.content).toBeTruthy();
    }
  });

  it("getTemplates filters by category", () => {
    const emails = getTemplates("email");
    expect(emails.every((t) => t.category === "email")).toBe(true);
    expect(emails.length).toBe(EMAIL_TEMPLATES.length);
  });

  it("getTemplates filters by industry", () => {
    const healthcare = getTemplates(undefined, "healthcare");
    for (const t of healthcare) {
      expect(
        t.industries.length === 0 || t.industries.includes("healthcare")
      ).toBe(true);
    }
  });

  it("getTemplate returns correct template by ID", () => {
    const t = getTemplate("email_screening_pass");
    expect(t).toBeDefined();
    expect(t!.name).toContain("Screening Pass");
  });

  it("getTemplate returns undefined for missing ID", () => {
    expect(getTemplate("nonexistent")).toBeUndefined();
  });

  it("email templates have subject and body", () => {
    for (const t of EMAIL_TEMPLATES) {
      const content = t.content as { subject?: string; body?: string };
      expect(content.subject).toBeTruthy();
      expect(content.body).toBeTruthy();
    }
  });

  it("email templates have variables defined", () => {
    for (const t of EMAIL_TEMPLATES) {
      expect(t.variables).toBeDefined();
      expect(t.variables!.length).toBeGreaterThan(0);
    }
  });

  it("loom prompts are strings", () => {
    for (const t of LOOM_PROMPT_TEMPLATES) {
      expect(typeof t.content).toBe("string");
      expect((t.content as string).length).toBeGreaterThan(20);
    }
  });

  it("job descriptions have title and description", () => {
    for (const t of JOB_DESCRIPTION_TEMPLATES) {
      const content = t.content as { title?: string; description?: string };
      expect(content.title).toBeTruthy();
      expect(content.description).toBeTruthy();
    }
  });
});
