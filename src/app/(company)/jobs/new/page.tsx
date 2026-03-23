"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import IndustrySkillPicker, { type SkillRequirement } from "@/components/IndustrySkillPicker";
import { TemplatePicker } from "@/components/template-picker";

const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Full-time" },
  { value: "contract", label: "Contract" },
  { value: "part_time", label: "Part-time" },
];

interface FormField {
  key: string;
  label: string;
  enabled: boolean;
  required: boolean;
  locked: boolean;
}

type QuestionType = "short_text" | "long_text" | "number" | "dropdown" | "multiple_choice" | "checkbox" | "date" | "yes_no";

interface CustomQuestion {
  question: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "short_text", label: "Short answer" },
  { value: "long_text", label: "Paragraph" },
  { value: "number", label: "Number" },
  { value: "dropdown", label: "Dropdown" },
  { value: "multiple_choice", label: "Multiple choice" },
  { value: "checkbox", label: "Checkboxes" },
  { value: "date", label: "Date" },
  { value: "yes_no", label: "Yes / No" },
];

const DEFAULT_FIELDS: FormField[] = [
  { key: "full_name", label: "Full name", enabled: true, required: true, locked: true },
  { key: "email", label: "Email", enabled: true, required: true, locked: true },
  { key: "phone", label: "Phone number", enabled: true, required: false, locked: false },
  { key: "resume", label: "Resume/CV upload", enabled: true, required: false, locked: false },
  { key: "linkedin_url", label: "LinkedIn URL", enabled: true, required: false, locked: false },
  { key: "github_username", label: "GitHub username", enabled: false, required: false, locked: false },
  { key: "portfolio_url", label: "Portfolio/Website URL", enabled: false, required: false, locked: false },
  { key: "cover_letter", label: "Cover letter", enabled: false, required: false, locked: false },
];

export default function NewJobPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [isRemote, setIsRemote] = useState(false);
  const [employmentType, setEmploymentType] = useState("full_time");
  const [githubRequired, setGithubRequired] = useState(false);
  const [formFields, setFormFields] = useState<FormField[]>(DEFAULT_FIELDS);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [industry, setIndustry] = useState<string | null>(null);
  const [industryNiche, setIndustryNiche] = useState<string | null>(null);
  const [skillRequirements, setSkillRequirements] = useState<SkillRequirement[]>([]);
  const [jobFiles, setJobFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ id: string; title: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Warn on unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if ((title || description) && !success) e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [title, description, success]);

  const toggleField = (key: string, prop: "enabled" | "required") => {
    setFormFields((prev) =>
      prev.map((f) => {
        if (f.key !== key || f.locked) return f;
        if (prop === "enabled") {
          const enabled = !f.enabled;
          return { ...f, enabled, required: enabled ? f.required : false };
        }
        return { ...f, required: !f.required };
      })
    );
  };

  const addCustomQuestion = () => {
    if (customQuestions.length >= 10) return;
    setCustomQuestions((prev) => [...prev, { question: "", type: "short_text", required: false }]);
  };

  const updateCustomQuestion = (idx: number, updates: Partial<CustomQuestion>) => {
    setCustomQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, ...updates } : q))
    );
  };

  const removeCustomQuestion = (idx: number) => {
    setCustomQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const buildFormConfig = () => {
    const fields: Record<string, { enabled: boolean; required: boolean }> = {};
    for (const f of formFields) {
      fields[f.key] = { enabled: f.enabled, required: f.required };
    }
    return {
      fields,
      custom_questions: customQuestions.filter((q) => q.question.trim()),
    };
  };

  const extractSkills = async (text: string) => {
    if (text.length < 100 || extracting) return;
    setExtracting(true);
    try {
      const res = await fetch("/api/jobs/extract-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: text }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.industry && !industry) setIndustry(data.industry);
        if (data.industry_niche && !industryNiche) setIndustryNiche(data.industry_niche);
        if (data.skills?.length > 0 && skillRequirements.length === 0) {
          setSkillRequirements(data.skills);
        }
        if (data.department && !department) setDepartment(data.department);
        if (data.location && !location) setLocation(data.location);
      }
    } catch {
      // silent — skill extraction is best-effort
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async (status: "active" | "draft") => {
    setError(null);
    if (!title.trim()) {
      setError("Job title is required");
      return;
    }
    if (!description.trim()) {
      setError("Job description is required");
      return;
    }

    setLoading(true);
    try {
      // Upload job files first
      const uploadedFiles: { name: string; path: string; type: string }[] = [];
      for (const f of jobFiles) {
        const fd = new FormData();
        fd.append("file", f);
        fd.append("bucket", "job-files");
        fd.append("path", "briefs");
        const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
        if (uploadRes.ok) {
          const d = await uploadRes.json();
          uploadedFiles.push({ name: f.name, path: d.path, type: f.type });
        }
      }

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          department: department || null,
          location: isRemote ? "Remote" : location || null,
          employment_type: employmentType,
          github_required: githubRequired,
          application_form_config: buildFormConfig(),
          industry: industry || null,
          industry_niche: industryNiche || null,
          skill_requirements: skillRequirements.length > 0 ? skillRequirements : null,
          attachments: uploadedFiles.length > 0 ? uploadedFiles : null,
          status,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create job");
        return;
      }
      if (status === "draft") {
        router.push("/jobs");
      } else {
        setSuccess({ id: data.job.id, title: data.job.title });
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (!success) return;
    navigator.clipboard.writeText(
      `${window.location.origin}/apply/${success.id}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (success) {
    const applyUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/apply/${success.id}`;
    return (
      <div className="max-w-lg mx-auto mt-16 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/15 border-2 border-primary flex items-center justify-center text-2xl text-primary">
          {"\u2713"}
        </div>
        <div>
          <h1 className="text-2xl font-bold">Job Published!</h1>
          <p className="text-sm text-muted-foreground mt-2">
            &ldquo;{success.title}&rdquo; is now live. Share the application
            link with candidates.
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <Label className="text-xs text-muted-foreground">
            Application Link
          </Label>
          <div className="flex gap-2 mt-1.5">
            <Input
              readOnly
              value={applyUrl}
              className="bg-background border-border text-sm"
            />
            <Button onClick={copyLink} variant="outline">
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>
        <div className="flex justify-center gap-3">
          <Link href="/jobs">
            <Button variant="outline">View All Jobs</Button>
          </Link>
          <Link href="/jobs/new">
            <Button className="">Create Another</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/jobs"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back to Jobs
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Job</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill in the details and configure the application form
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="title">
            Job title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            placeholder="Senior Full Stack Engineer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-background border-border"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="description">
              Job description <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={!title.trim() || generating}
                onClick={async () => {
                  setGenerating(true);
                  try {
                    const res = await fetch("/api/jobs/generate-jd", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        title,
                        industry: industry || undefined,
                        skills: skillRequirements.length > 0 ? skillRequirements : undefined,
                        notes: description.trim() || undefined,
                      }),
                    });
                    if (res.ok) {
                      const data = await res.json();
                      setDescription(data.description);
                    }
                  } catch {
                    // silent
                  } finally {
                    setGenerating(false);
                  }
                }}
                className="text-[12px] font-medium text-[#2383E2] hover:text-[#1a6bc4] transition-colors disabled:opacity-40"
              >
                {generating ? "Generating..." : "Generate with AI"}
              </button>
              <TemplatePicker
                category="job_description"
                industry={industry || undefined}
                buttonLabel="Use template"
                onSelect={(t) => {
                  const c = t.content as { title?: string; description?: string; department?: string };
                  if (c.description) setDescription(c.description);
                  if (c.title && !title) setTitle(c.title);
                  if (c.department && !department) setDepartment(c.department);
                }}
              />
            </div>
          </div>
          <Textarea
            id="description"
            placeholder="Paste your full job description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData("text");
              if (pasted.length >= 100) {
                // Let the paste complete first, then extract
                setTimeout(() => extractSkills(pasted), 100);
              }
            }}
            rows={8}
            className="bg-background border-border resize-none"
          />
          <p className="text-[11px] text-muted-foreground">
            {extracting ? (
              <span className="text-[#2383E2] font-medium">Detecting skills from JD...</span>
            ) : (
              "Paste your full job description. Our AI will auto-detect skills, industry, and role details."
            )}
          </p>
        </div>
      </div>

      {/* Role Brief / Attachments */}
      <div className="space-y-2">
        <Label>Attachments <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <p className="text-[12px] text-muted-foreground">
          Upload role briefs, org charts, team structure docs, or any files that help the AI interviewer understand the role better.
        </p>
        {jobFiles.map((f, i) => (
          <div key={i} className="flex items-center gap-2 text-[13px]">
            <span className="flex-1 truncate">{f.name}</span>
            <span className="text-[11px] text-muted-foreground">{(f.size / 1024).toFixed(0)}KB</span>
            <button
              type="button"
              onClick={() => setJobFiles((prev) => prev.filter((_, j) => j !== i))}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              &times;
            </button>
          </div>
        ))}
        {jobFiles.length < 5 && (
          <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer">
            + Add file
            <input
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && file.size <= 10 * 1024 * 1024 && jobFiles.length < 5) {
                  setJobFiles((prev) => [...prev, file]);
                }
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>

      <IndustrySkillPicker
        industry={industry}
        industryNiche={industryNiche}
        skills={skillRequirements}
        onChange={({ industry: ind, industryNiche: niche, skills }) => {
          setIndustry(ind);
          setIndustryNiche(niche);
          setSkillRequirements(skills);
        }}
      />

      <div className="bg-card border border-border rounded-lg p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              placeholder="Engineering"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="San Francisco, CA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isRemote}
              className="bg-background border-border"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsRemote(!isRemote)}
            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isRemote ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`}
          >
            {isRemote && <span className="text-[10px]">{"\u2713"}</span>}
          </button>
          <Label
            className="cursor-pointer"
            onClick={() => setIsRemote(!isRemote)}
          >
            Remote position
          </Label>
        </div>

        <div className="space-y-2">
          <Label>Employment type</Label>
          <div className="flex gap-2">
            {EMPLOYMENT_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setEmploymentType(t.value)}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${employmentType === t.value ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/30"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setGithubRequired(!githubRequired)}
            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${githubRequired ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`}
          >
            {githubRequired && <span className="text-[10px]">{"\u2713"}</span>}
          </button>
          <Label
            className="cursor-pointer"
            onClick={() => setGithubRequired(!githubRequired)}
          >
            Require GitHub for interview
          </Label>
          <span className="text-[11px] text-muted-foreground">
            Candidates must connect GitHub before starting the interview
          </span>
        </div>
      </div>

      {/* Application Form Configuration */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold">Application Form</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure what candidates see when they apply
          </p>
        </div>

        <div className="space-y-3">
          {formFields.map((field) => (
            <div
              key={field.key}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={field.locked}
                  onClick={() => toggleField(field.key, "enabled")}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${field.enabled ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"} ${field.locked ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {field.enabled && (
                    <span className="text-[10px]">{"\u2713"}</span>
                  )}
                </button>
                <span
                  className={`text-sm ${!field.enabled ? "text-muted-foreground" : ""}`}
                >
                  {field.label}
                </span>
              </div>
              {field.enabled && !field.locked && (
                <button
                  type="button"
                  onClick={() => toggleField(field.key, "required")}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${field.required ? "border-primary/30 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}
                >
                  {field.required ? "Required" : "Optional"}
                </button>
              )}
              {field.locked && (
                <span className="text-[10px] px-2 py-0.5 rounded border border-primary/30 bg-primary/10 text-primary">
                  Required
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="pt-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Custom Questions
          </div>
          <div className="space-y-4">
            {customQuestions.map((q, idx) => {
              const hasOptions = q.type === "dropdown" || q.type === "multiple_choice" || q.type === "checkbox";
              const optionIcon = q.type === "multiple_choice" ? "○" : q.type === "checkbox" ? "☐" : "";
              const opts = q.options || [];

              return (
                <div key={idx} className="border border-border rounded-lg bg-white overflow-hidden" style={{ borderLeft: "3px solid #2383E2" }}>
                  {/* Header: question text + type selector */}
                  <div className="flex items-start gap-3 p-4 pb-3">
                    <input
                      type="text"
                      placeholder="Question"
                      value={q.question}
                      onChange={(e) => updateCustomQuestion(idx, { question: e.target.value })}
                      className="flex-1 text-[15px] font-medium text-foreground bg-[#F7F6F3] rounded-md px-3 py-2.5 border-0 focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 placeholder:text-muted-foreground"
                    />
                    <select
                      value={q.type}
                      onChange={(e) => updateCustomQuestion(idx, { type: e.target.value as QuestionType, options: [] })}
                      className="text-[13px] border border-border rounded-lg px-3 py-2.5 bg-white text-foreground shrink-0"
                    >
                      {QUESTION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Placeholder for text/number types */}
                  {(q.type === "short_text" || q.type === "number") && (
                    <div className="px-4 pb-3">
                      <input
                        type="text"
                        placeholder="Placeholder text (optional)"
                        value={q.placeholder || ""}
                        onChange={(e) => updateCustomQuestion(idx, { placeholder: e.target.value })}
                        className="w-full text-[13px] text-muted-foreground border-b border-border/50 pb-2 bg-transparent focus:outline-none focus:border-[#2383E2]"
                      />
                    </div>
                  )}

                  {/* Options list for dropdown/choice/checkbox */}
                  {hasOptions && (
                    <div className="px-4 pb-2">
                      {opts.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
                          {optionIcon && (
                            <span className="text-[16px] text-muted-foreground/50 shrink-0 w-5 text-center">{optionIcon}</span>
                          )}
                          {!optionIcon && (
                            <span className="text-[12px] text-muted-foreground/50 shrink-0 w-5 text-center">{oi + 1}.</span>
                          )}
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const next = [...opts];
                              next[oi] = e.target.value;
                              updateCustomQuestion(idx, { options: next });
                            }}
                            className="flex-1 text-[14px] text-foreground bg-transparent border-0 focus:outline-none"
                            placeholder={`Option ${oi + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => updateCustomQuestion(idx, { options: opts.filter((_, j) => j !== oi) })}
                            className="text-muted-foreground/40 hover:text-destructive transition-colors text-[16px] shrink-0"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => updateCustomQuestion(idx, { options: [...opts, ""] })}
                        className="flex items-center gap-3 py-2 text-[13px] text-muted-foreground hover:text-primary transition-colors"
                      >
                        {optionIcon && <span className="text-[16px] text-muted-foreground/30 w-5 text-center">{optionIcon}</span>}
                        {!optionIcon && <span className="text-[12px] text-muted-foreground/30 w-5 text-center">{opts.length + 1}.</span>}
                        Add option
                      </button>
                    </div>
                  )}

                  {/* Footer: duplicate + delete + required toggle */}
                  <div className="flex items-center justify-end gap-2 px-4 py-2.5 border-t border-border/50 bg-[#FAFAFA]">
                    <button
                      type="button"
                      onClick={() => {
                        const copy = { ...q, question: q.question + " (copy)" };
                        setCustomQuestions((prev) => [...prev.slice(0, idx + 1), copy, ...prev.slice(idx + 1)]);
                      }}
                      className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                      title="Duplicate"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCustomQuestion(idx)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                      title="Delete"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                    <div className="w-px h-5 bg-border mx-1" />
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-[12px] text-muted-foreground">Required</span>
                      <button
                        type="button"
                        onClick={() => updateCustomQuestion(idx, { required: !q.required })}
                        className={`relative w-9 h-5 rounded-full transition-colors ${q.required ? "bg-[#2383E2]" : "bg-border"}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${q.required ? "left-[18px]" : "left-0.5"}`} />
                      </button>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
          {customQuestions.length < 10 && (
            <button
              type="button"
              onClick={addCustomQuestion}
              className="mt-3 text-[13px] text-primary hover:text-primary/80 font-medium transition-colors"
            >
              + Add question
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => handleSubmit("draft")}
          disabled={loading}
        >
          Save as Draft
        </Button>
        <Button
          onClick={() => handleSubmit("active")}
          disabled={loading}
        >
          {loading ? "Creating..." : "Publish Job"}
        </Button>
      </div>
    </div>
  );
}
