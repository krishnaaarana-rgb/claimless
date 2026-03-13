"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Marketing",
  "Education",
  "Retail",
  "Manufacturing",
  "Other",
];

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];

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

export default function CompanyOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 state
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");

  // Step 2 state
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [isRemote, setIsRemote] = useState(false);
  const [employmentType, setEmploymentType] = useState("full_time");

  // Step 3 state
  const [formFields, setFormFields] = useState<FormField[]>(DEFAULT_FIELDS);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);

  const toggleField = (key: string, prop: "enabled" | "required") => {
    setFormFields((prev) =>
      prev.map((f) => {
        if (f.key !== key || f.locked) return f;
        if (prop === "enabled") {
          const newEnabled = !f.enabled;
          return { ...f, enabled: newEnabled, required: newEnabled ? f.required : false };
        }
        return { ...f, required: !f.required };
      })
    );
  };

  const addCustomQuestion = () => {
    if (customQuestions.length >= 2) return;
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

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    // Build application_form_config
    const fieldsConfig: Record<string, { enabled: boolean; required: boolean }> = {};
    for (const f of formFields) {
      fieldsConfig[f.key] = { enabled: f.enabled, required: f.required };
    }
    const applicationFormConfig = {
      fields: fieldsConfig,
      custom_questions: customQuestions.filter((q) => q.question.trim()),
    };

    const payload: Record<string, unknown> = {
      company: {
        name: companyName,
        website: website || null,
        industry: industry || null,
        size: companySize || null,
      },
    };

    if (jobTitle && jobDescription) {
      payload.job = {
        title: jobTitle,
        description: jobDescription,
        department: department || null,
        location: isRemote ? "Remote" : location || null,
        employment_type: employmentType,
        application_form_config: applicationFormConfig,
      };
    }

    try {
      const res = await fetch("/api/companies/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create company");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-grid">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-2xl font-bold tracking-tight mb-2">
            <span className="text-primary">{"\u25CF"}</span> Claimless
          </div>
          <p className="text-sm text-muted-foreground">Set up your company</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <button
                onClick={() => s < step && setStep(s)}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium transition-colors ${
                  s < step
                    ? "border-primary bg-primary text-primary-foreground cursor-pointer"
                    : s === step
                      ? "border-primary text-primary"
                      : "border-muted text-muted-foreground"
                }`}
              >
                {s < step ? "\u2713" : s}
              </button>
              {s < 3 && (
                <div
                  className={`w-16 h-0.5 ${s < step ? "bg-primary" : "bg-muted"}`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-8 mb-8 text-xs text-muted-foreground">
          <span className={step === 1 ? "text-foreground font-medium" : ""}>
            Company Details
          </span>
          <span className={step === 2 ? "text-foreground font-medium" : ""}>
            First Job
          </span>
          <span className={step === 3 ? "text-foreground font-medium" : ""}>
            Application Form
          </span>
        </div>

        {/* Step Content */}
        <div className="bg-card border border-border rounded-lg p-6 animate-fade-in-up">
          {/* Step 1: Company Details */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold">Company Details</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Tell us about your company
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">
                  Company name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="companyName"
                  placeholder="Acme Inc."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Company website</Label>
                <Input
                  id="website"
                  placeholder="https://acme.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label>Industry</Label>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRIES.map((ind) => (
                    <button
                      key={ind}
                      type="button"
                      onClick={() => setIndustry(ind)}
                      className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                        industry === ind
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Company size</Label>
                <div className="flex gap-2">
                  {COMPANY_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setCompanySize(size)}
                      className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                        companySize === size
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: First Job */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold">Post Your First Job</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Start receiving candidates right away. You can skip this and
                  add jobs later.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job title</Label>
                <Input
                  id="jobTitle"
                  placeholder="Senior Full Stack Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobDescription">Job description</Label>
                <Textarea
                  id="jobDescription"
                  placeholder="Paste your full job description..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={6}
                  className="bg-background border-border resize-none"
                />
                <p className="text-[11px] text-muted-foreground">
                  Paste your full job description — our AI will extract
                  requirements automatically
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    isRemote
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background"
                  }`}
                >
                  {isRemote && (
                    <span className="text-[10px]">{"\u2713"}</span>
                  )}
                </button>
                <Label className="cursor-pointer" onClick={() => setIsRemote(!isRemote)}>
                  Remote position
                </Label>
              </div>

              <div className="space-y-2">
                <Label>Employment type</Label>
                <div className="flex gap-2">
                  {EMPLOYMENT_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setEmploymentType(type.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                        employmentType === type.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Application Form Configuration */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold">Application Form</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose what information candidates must provide when applying
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Fields Configuration */}
                <div className="space-y-3">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Fields
                  </div>
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
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            field.enabled
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background"
                          } ${field.locked ? "opacity-50 cursor-not-allowed" : ""}`}
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
                          className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                            field.required
                              ? "border-primary/30 bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/30"
                          }`}
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

                  {/* Custom Questions */}
                  <div className="pt-3">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Custom Questions
                    </div>
                    {customQuestions.map((q, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <Input
                          placeholder={`Custom question ${idx + 1}`}
                          value={q.question}
                          onChange={(e) =>
                            updateCustomQuestion(idx, e.target.value)
                          }
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
                    {customQuestions.length < 2 && (
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

                {/* Preview */}
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Preview
                  </div>
                  <div className="bg-background border border-border rounded-lg p-4 space-y-3">
                    {formFields
                      .filter((f) => f.enabled)
                      .map((f) => (
                        <div key={f.key} className="space-y-1">
                          <div className="text-[11px] text-muted-foreground">
                            {f.label}
                            {f.required && (
                              <span className="text-destructive ml-0.5">
                                *
                              </span>
                            )}
                          </div>
                          {f.key === "cover_letter" ||
                          f.key === "resume" ? (
                            <div className="h-8 rounded border border-dashed border-border bg-card flex items-center justify-center text-[10px] text-muted-foreground">
                              {f.key === "resume"
                                ? "Upload file"
                                : "Text area"}
                            </div>
                          ) : (
                            <div className="h-7 rounded border border-border bg-card" />
                          )}
                        </div>
                      ))}
                    {customQuestions
                      .filter((q) => q.question.trim())
                      .map((q, i) => (
                        <div key={i} className="space-y-1">
                          <div className="text-[11px] text-muted-foreground">
                            {q.question}
                          </div>
                          <div className="h-7 rounded border border-border bg-card" />
                        </div>
                      ))}
                    {formFields.filter((f) => f.enabled).length === 2 &&
                      customQuestions.filter((q) => q.question.trim())
                        .length === 0 && (
                        <div className="text-[10px] text-muted-foreground text-center py-2">
                          Enable more fields above to see them here
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6 pt-4 border-t border-border">
            <div>
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setError(null);
                    setStep(step - 1);
                  }}
                >
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {step === 2 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setJobTitle("");
                    setJobDescription("");
                    setStep(3);
                  }}
                  className="text-muted-foreground"
                >
                  Skip
                </Button>
              )}
              {step < 3 ? (
                <Button
                  onClick={() => {
                    setError(null);
                    if (step === 1 && !companyName.trim()) {
                      setError("Company name is required");
                      return;
                    }
                    setStep(step + 1);
                  }}
                  className=""
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className=""
                >
                  {loading ? "Setting up..." : "Launch Dashboard"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
