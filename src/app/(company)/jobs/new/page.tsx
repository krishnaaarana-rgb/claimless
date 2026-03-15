"use client";

import { useState } from "react";
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

interface CustomQuestion {
  question: string;
  required: boolean;
}

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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ id: string; title: string } | null>(null);
  const [copied, setCopied] = useState(false);

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
    if (customQuestions.length >= 3) return;
    setCustomQuestions((prev) => [...prev, { question: "", required: false }]);
  };

  const updateCustomQuestion = (idx: number, question: string) => {
    setCustomQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, question } : q))
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
            <TemplatePicker
              category="job_description"
              industry={industry || undefined}
              buttonLabel="Start from template"
              onSelect={(t) => {
                const c = t.content as { title?: string; description?: string; department?: string };
                if (c.description) setDescription(c.description);
                if (c.title && !title) setTitle(c.title);
                if (c.department && !department) setDepartment(c.department);
              }}
            />
          </div>
          <Textarea
            id="description"
            placeholder="Paste your full job description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
            className="bg-background border-border resize-none"
          />
          <p className="text-[11px] text-muted-foreground">
            Paste your full job description. Our AI will use this to screen
            candidates and prepare interview questions.
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
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Custom Questions
          </div>
          {customQuestions.map((q, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <Input
                placeholder={`Custom question ${idx + 1}`}
                value={q.question}
                onChange={(e) => updateCustomQuestion(idx, e.target.value)}
                className="bg-background border-border text-sm h-8"
              />
              <button
                type="button"
                onClick={() => removeCustomQuestion(idx)}
                className="text-muted-foreground hover:text-destructive text-sm px-2"
              >
                {"\u2715"}
              </button>
            </div>
          ))}
          {customQuestions.length < 3 && (
            <button
              type="button"
              onClick={addCustomQuestion}
              className="text-xs text-primary hover:underline"
            >
              + Add custom question
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
