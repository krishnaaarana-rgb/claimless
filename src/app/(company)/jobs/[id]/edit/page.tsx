"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import IndustrySkillPicker, { type SkillRequirement } from "@/components/IndustrySkillPicker";
import { use } from "react";

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

const FIELD_LABELS: Record<string, string> = {
  full_name: "Full name",
  email: "Email",
  phone: "Phone number",
  resume: "Resume/CV upload",
  linkedin_url: "LinkedIn URL",
  github_username: "GitHub username",
  portfolio_url: "Portfolio/Website URL",
  cover_letter: "Cover letter",
};

const LOCKED_FIELDS = ["full_name", "email"];

const FIELD_ORDER = [
  "full_name",
  "email",
  "phone",
  "resume",
  "linkedin_url",
  "github_username",
  "portfolio_url",
  "cover_letter",
];

export default function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [isRemote, setIsRemote] = useState(false);
  const [employmentType, setEmploymentType] = useState("full_time");
  const [status, setStatus] = useState("active");
  const [githubRequired, setGithubRequired] = useState(false);
  const [industry, setIndustry] = useState<string | null>(null);
  const [industryNiche, setIndustryNiche] = useState<string | null>(null);
  const [skillRequirements, setSkillRequirements] = useState<SkillRequirement[]>([]);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/jobs/${id}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Job not found");
          setLoading(false);
          return;
        }
        const job = data.job;
        setTitle(job.title || "");
        setDescription(job.description || "");
        setDepartment(job.department || "");
        setLocation(job.location === "Remote" ? "" : job.location || "");
        setIsRemote(job.location === "Remote");
        setEmploymentType(job.employment_type || "full_time");
        setGithubRequired(job.github_required ?? false);
        setStatus(job.status || "active");
        setIndustry(job.industry || null);
        setIndustryNiche(job.industry_niche || null);
        setSkillRequirements(job.skill_requirements || []);

        // Parse form config
        const config = job.application_form_config;
        const fields: FormField[] = FIELD_ORDER.map((key) => ({
          key,
          label: FIELD_LABELS[key],
          enabled: config?.fields?.[key]?.enabled ?? (LOCKED_FIELDS.includes(key)),
          required: config?.fields?.[key]?.required ?? (LOCKED_FIELDS.includes(key)),
          locked: LOCKED_FIELDS.includes(key),
        }));
        setFormFields(fields);
        setCustomQuestions(config?.custom_questions || []);
      } catch {
        setError("Failed to load job");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

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

  const handleSave = async () => {
    setError(null);
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required");
      return;
    }
    setSaving(true);
    try {
      const fieldsConfig: Record<string, { enabled: boolean; required: boolean }> = {};
      for (const f of formFields) {
        fieldsConfig[f.key] = { enabled: f.enabled, required: f.required };
      }

      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          department: department || null,
          location: isRemote ? "Remote" : location || null,
          employment_type: employmentType,
          github_required: githubRequired,
          status,
          application_form_config: {
            fields: fieldsConfig,
            custom_questions: customQuestions.filter((q) => q.question.trim()),
          },
          industry: industry || null,
          industry_niche: industryNiche || null,
          skill_requirements: skillRequirements.length > 0 ? skillRequirements : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl space-y-6">
        <div className="h-8 bg-muted rounded w-48 animate-pulse" />
        <div className="bg-card border border-border rounded-lg p-6 animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/jobs"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back to Jobs
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Edit Job</h1>
        <div className="flex gap-2">
          {["draft", "active", "paused", "closed"].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1 rounded-lg text-xs border capitalize transition-colors ${status === s ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="title">
            Job title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-background border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            Job description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
            className="bg-background border-border resize-none"
          />
        </div>
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
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
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
        <h2 className="text-base font-semibold">Application Form</h2>
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

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.push("/jobs")}>
          Cancel
        </Button>
        <Button
          className="glow-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
