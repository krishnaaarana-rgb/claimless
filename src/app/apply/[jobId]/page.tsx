"use client";

import { useState, useEffect, use } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

async function extractPDFText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text +=
      content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ") + "\n";
  }
  return text
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

interface JobData {
  id: string;
  title: string;
  description: string;
  department: string | null;
  location: string | null;
  employment_type: string;
  application_form_config: {
    fields: Record<string, { enabled: boolean; required: boolean }>;
    custom_questions: { question: string; required: boolean }[];
  } | null;
}

interface CompanyData {
  name: string;
  logo_url: string | null;
  primary_color: string;
}

const TYPE_LABELS: Record<string, string> = {
  full_time: "Full-time",
  contract: "Contract",
  part_time: "Part-time",
};

const FIELD_CONFIG: {
  key: string;
  label: string;
  type: string;
  placeholder: string;
}[] = [
  { key: "full_name", label: "Full name", type: "text", placeholder: "Jane Smith" },
  { key: "email", label: "Email", type: "email", placeholder: "jane@example.com" },
  { key: "phone", label: "Phone number", type: "tel", placeholder: "+1 (555) 000-0000" },
  { key: "resume", label: "Resume/CV", type: "file", placeholder: "" },
  {
    key: "linkedin_url",
    label: "LinkedIn URL",
    type: "url",
    placeholder: "https://linkedin.com/in/your-profile",
  },
  {
    key: "github_username",
    label: "GitHub username",
    type: "text",
    placeholder: "your-username",
  },
  {
    key: "portfolio_url",
    label: "Portfolio/Website URL",
    type: "url",
    placeholder: "https://your-website.com",
  },
  {
    key: "cover_letter",
    label: "Cover letter",
    type: "textarea",
    placeholder: "Tell us why you're interested in this role...",
  },
];

export default function ApplyPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);
  const [job, setJob] = useState<JobData | null>(null);
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [closed, setClosed] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [customAnswers, setCustomAnswers] = useState<Record<number, string>>({});
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeParsed, setResumeParsed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [duplicate, setDuplicate] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/apply/${jobId}`);
        const data = await res.json();
        if (res.status === 410) {
          setClosed(true);
          setLoading(false);
          return;
        }
        if (!res.ok) {
          setLoadError(data.error || "Job not found");
          setLoading(false);
          return;
        }
        setJob(data.job);
        setCompany(data.company);
      } catch {
        setLoadError("Failed to load job details");
      } finally {
        setLoading(false);
      }
    })();
  }, [jobId]);

  const isFieldEnabled = (key: string) =>
    job?.application_form_config?.fields?.[key]?.enabled ?? false;

  const isFieldRequired = (key: string) =>
    job?.application_form_config?.fields?.[key]?.required ?? false;

  const updateField = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleResumeChange = async (file: File | null) => {
    setResumeFile(file);
    setResumeParsed(false);
    if (file && file.type === "application/pdf") {
      try {
        const text = await extractPDFText(file);
        if (text.length > 0) {
          setFormValues((prev) => ({ ...prev, _resume_text: text }));
          setResumeParsed(true);
          console.log("[apply-page] PDF text extracted:", text.length, "chars");
        }
      } catch (err) {
        console.error("[apply-page] PDF extraction failed:", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    for (const fc of FIELD_CONFIG) {
      if (isFieldEnabled(fc.key) && isFieldRequired(fc.key)) {
        if (fc.key === "resume") {
          if (!resumeFile) {
            setSubmitError(`${fc.label} is required`);
            return;
          }
        } else if (!formValues[fc.key]?.trim()) {
          setSubmitError(`${fc.label} is required`);
          return;
        }
      }
    }

    setSubmitting(true);

    try {
      const customQs = job?.application_form_config?.custom_questions || [];
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: jobId,
          form_data: {
            full_name: formValues.full_name || "",
            email: formValues.email || "",
            phone: formValues.phone || null,
            linkedin_url: formValues.linkedin_url || null,
            github_username: formValues.github_username || null,
            portfolio_url: formValues.portfolio_url || null,
            cover_letter: formValues.cover_letter || null,
            resume_filename: resumeFile?.name || null,
            resume_text: formValues._resume_text || null,
            custom_answers: customQs.map((q, i) => ({
              question: q.question,
              answer: customAnswers[i] || "",
            })),
          },
        }),
      });

      const data = await res.json();
      if (res.status === 409) {
        setDuplicate(true);
        return;
      }
      if (!res.ok) {
        setSubmitError(data.error || "Failed to submit application");
        return;
      }

      setSubmitted(true);
    } catch {
      setSubmitError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  // Centered message layout
  const CenteredMessage = ({
    children,
  }: {
    children: React.ReactNode;
  }) => (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#FAFAF9" }}>
      <div className="max-w-md w-full text-center">{children}</div>
    </div>
  );

  if (loading) {
    return (
      <CenteredMessage>
        <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin mx-auto" />
      </CenteredMessage>
    );
  }

  if (loadError) {
    return (
      <CenteredMessage>
        <h1 className="text-2xl font-bold text-[#37352F]">Job Not Found</h1>
        <p className="mt-2 text-[#9B9A97]">
          This job posting doesn&apos;t exist or has been removed.
        </p>
      </CenteredMessage>
    );
  }

  if (closed) {
    return (
      <CenteredMessage>
        <h1 className="text-2xl font-bold text-[#37352F]">Position Closed</h1>
        <p className="mt-2 text-[#9B9A97]">
          This position is no longer accepting applications.
        </p>
      </CenteredMessage>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#FAFAF9" }}>
        <div className="max-w-md w-full text-center">
          <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-xl text-white mb-5" style={{ background: "#059669" }}>
            {"\u2713"}
          </div>
          <h1 className="text-2xl font-bold text-[#37352F]">
            Application Submitted!
          </h1>
          <p className="mt-3 text-[14px] text-[#9B9A97] leading-relaxed">
            Thank you for applying for{" "}
            <span className="font-medium text-[#37352F]">{job?.title}</span>
            {company?.name ? (
              <>
                {" "}at{" "}
                <span className="font-medium text-[#37352F]">{company.name}</span>
              </>
            ) : null}
            . We&apos;ll review your application and get back to you soon.
          </p>
        </div>
        <div className="mt-12 text-[11px] text-[#9B9A97]">
          Powered by <span className="font-medium text-[#9B9A97]">Claimless</span>
        </div>
      </div>
    );
  }

  if (duplicate) {
    return (
      <CenteredMessage>
        <h1 className="text-2xl font-bold text-[#37352F]">Already Applied</h1>
        <p className="mt-3 text-[#9B9A97]">
          You&apos;ve already applied for this position. We&apos;ll be in touch.
        </p>
      </CenteredMessage>
    );
  }

  const customQuestions = job?.application_form_config?.custom_questions || [];

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF9" }}>
      <div className="max-w-[640px] mx-auto px-4 py-12">
        {/* Company Header */}
        <div className="text-center mb-8">
          {company?.logo_url ? (
            <img
              src={company.logo_url}
              alt={company.name}
              className="w-10 h-10 rounded-lg mx-auto mb-3 object-contain"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center text-white font-bold text-sm"
              style={{ background: company?.primary_color || "#2383E2" }}
            >
              {company?.name?.[0] || "C"}
            </div>
          )}
          <h1 className="text-xl font-semibold text-[#37352F]">
            {job?.title}
          </h1>
          <div className="text-[14px] text-[#9B9A97] mt-1">
            {company?.name}
          </div>
        </div>

        {/* Job Details Card */}
        <div
          className="bg-white rounded-xl border border-[#E9E9E7] p-6 mb-5"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
        >
          <div className="flex flex-wrap gap-2 mb-4">
            {job?.department && (
              <span className="px-2.5 py-1 rounded-full text-[12px] font-medium bg-[#F7F6F3] text-[#37352F]">
                {job.department}
              </span>
            )}
            {job?.location && (
              <span className="px-2.5 py-1 rounded-full text-[12px] font-medium bg-[#F7F6F3] text-[#37352F]">
                {job.location}
              </span>
            )}
            {job?.employment_type && (
              <span className="px-2.5 py-1 rounded-full text-[12px] font-medium bg-[#F7F6F3] text-[#37352F]">
                {TYPE_LABELS[job.employment_type] || job.employment_type}
              </span>
            )}
          </div>
          <div className="text-[14px] text-[#37352F] leading-relaxed whitespace-pre-line">
            {job?.description}
          </div>
        </div>

        {/* Application Form */}
        <div
          className="bg-white rounded-xl border border-[#E9E9E7] p-6"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
        >
          <h2 className="text-[16px] font-semibold text-[#37352F] mb-6">
            Apply for this position
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {FIELD_CONFIG.map((fc) => {
              if (!isFieldEnabled(fc.key)) return null;
              const required = isFieldRequired(fc.key);

              if (fc.key === "resume") {
                return (
                  <div key={fc.key} className="space-y-1.5">
                    <label className="block text-[13px] font-semibold text-[#37352F]">
                      {fc.label}
                      {required && (
                        <span className="text-amber-600 ml-0.5">*</span>
                      )}
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) =>
                        handleResumeChange(e.target.files?.[0] || null)
                      }
                      className="block w-full text-sm text-[#9B9A97] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-[#E9E9E7] file:text-[13px] file:font-medium file:bg-[#F7F6F3] file:text-[#37352F] hover:file:bg-[#F7F6F3] file:transition-colors"
                    />
                    <p className="text-[12px] text-[#9B9A97]">
                      {resumeFile
                        ? resumeParsed
                          ? "Resume parsed"
                          : "Resume selected"
                        : "PDF recommended for best results"}
                      {resumeFile && " \u2014 PDF recommended for best results"}
                    </p>
                  </div>
                );
              }

              if (fc.type === "textarea") {
                return (
                  <div key={fc.key} className="space-y-1.5">
                    <label className="block text-[13px] font-semibold text-[#37352F]">
                      {fc.label}
                      {required && (
                        <span className="text-amber-600 ml-0.5">*</span>
                      )}
                    </label>
                    <textarea
                      placeholder={fc.placeholder}
                      value={formValues[fc.key] || ""}
                      onChange={(e) => updateField(fc.key, e.target.value)}
                      rows={4}
                      className="w-full rounded-lg border border-[#E9E9E7] bg-white px-4 py-3 text-[14px] text-[#37352F] placeholder:text-[#9B9A97] focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2] resize-none transition-colors"
                    />
                  </div>
                );
              }

              return (
                <div key={fc.key} className="space-y-1.5">
                  <label className="block text-[13px] font-semibold text-[#37352F]">
                    {fc.label}
                    {required && (
                      <span className="text-amber-600 ml-0.5">*</span>
                    )}
                  </label>
                  <input
                    type={fc.type}
                    placeholder={fc.placeholder}
                    value={formValues[fc.key] || ""}
                    onChange={(e) => updateField(fc.key, e.target.value)}
                    className="w-full rounded-lg border border-[#E9E9E7] bg-white px-4 py-3 text-[14px] text-[#37352F] placeholder:text-[#9B9A97] focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2] transition-colors"
                  />
                </div>
              );
            })}

            {/* Custom Questions */}
            {customQuestions.map((q, i) => (
              <div key={i} className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-[#37352F]">
                  {q.question}
                  {q.required && (
                    <span className="text-amber-600 ml-0.5">*</span>
                  )}
                </label>
                <textarea
                  placeholder="Your answer..."
                  value={customAnswers[i] || ""}
                  onChange={(e) =>
                    setCustomAnswers((prev) => ({
                      ...prev,
                      [i]: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full rounded-lg border border-[#E9E9E7] bg-white px-4 py-3 text-[14px] text-[#37352F] placeholder:text-[#9B9A97] focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2] resize-none transition-colors"
                />
              </div>
            ))}

            {submitError && (
              <div className="text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: company?.primary_color || "#2383E2" }}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                "Submit Application"
              )}
            </button>
          </form>
        </div>

        {/* Powered by */}
        <div className="text-center mt-8 text-[11px] text-[#9B9A97]">
          Powered by{" "}
          <span className="font-medium text-[#9B9A97]">Claimless</span>
        </div>
      </div>
    </div>
  );
}
