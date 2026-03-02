"use client";

import { useState, useEffect, useCallback } from "react";
import { Settings, Mail, FileText, Mic, Send } from "lucide-react";

interface CompanySettings {
  ats_pass_threshold: number;
  ats_auto_reject: boolean;
  email_acceptance_subject: string;
  email_acceptance_body: string;
  email_rejection_subject: string;
  email_rejection_body: string;
  default_form_fields: Record<string, { enabled: boolean; required: boolean }>;
  brand_accent_color: string;
  brand_logo_url: string | null;
  stage_names: Record<string, string>;
  interview_duration_minutes: number;
  interview_style: string;
  interview_focus: string;
  interview_custom_instructions: string | null;
  email_provider: string;
  email_api_key: string | null;
  email_from_address: string | null;
  email_from_name: string | null;
}

const TABS = [
  { id: "general", label: "General", icon: Settings },
  { id: "email-templates", label: "Email Templates", icon: Mail },
  { id: "application-form", label: "Application Form", icon: FileText },
  { id: "ai-interview", label: "AI Interview", icon: Mic },
  { id: "email-provider", label: "Email Provider", icon: Send },
] as const;

type TabId = (typeof TABS)[number]["id"];

const FORM_FIELDS = [
  { key: "full_name", label: "Full Name", locked: true },
  { key: "email", label: "Email", locked: true },
  { key: "phone", label: "Phone" },
  { key: "resume", label: "Resume/CV" },
  { key: "linkedin_url", label: "LinkedIn URL" },
  { key: "github_username", label: "GitHub Username" },
  { key: "portfolio_url", label: "Portfolio URL" },
  { key: "cover_letter", label: "Cover Letter" },
];

const STAGE_KEYS = [
  { key: "applied", label: "Applied stage" },
  { key: "stage_1_passed", label: "ATS passed stage" },
  { key: "interview_invited", label: "Interview invited stage" },
  { key: "interview_completed", label: "Interview completed stage" },
  { key: "hired", label: "Hired stage" },
  { key: "rejected", label: "Rejected stage" },
  { key: "pending_review", label: "Pending review stage" },
];

const DURATION_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

export default function SettingsPage() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [draft, setDraft] = useState<Partial<CompanySettings>>({});

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateDraft = <K extends keyof CompanySettings>(
    key: K,
    value: CompanySettings[K]
  ) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const getValue = <K extends keyof CompanySettings>(
    key: K
  ): CompanySettings[K] => {
    return (draft[key] as CompanySettings[K]) ?? (settings?.[key] as CompanySettings[K]);
  };

  const handleSave = async () => {
    if (Object.keys(draft).length === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setDraft({});
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-stone-900">Settings</h1>
        <div className="h-64 bg-stone-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-stone-900">Settings</h1>
        <p className="text-stone-500">No company settings found.</p>
      </div>
    );
  }

  const hasDraft = Object.keys(draft).length > 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-900">Settings</h1>

      {/* Tab Bar */}
      <div className="flex gap-1 border-b border-stone-200">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${
                isActive
                  ? "border-amber-600 text-amber-700"
                  : "border-transparent text-stone-500 hover:text-stone-700"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="max-w-2xl">
        {activeTab === "general" && (
          <GeneralTab getValue={getValue} updateDraft={updateDraft} />
        )}
        {activeTab === "email-templates" && (
          <EmailTemplatesTab getValue={getValue} updateDraft={updateDraft} />
        )}
        {activeTab === "application-form" && (
          <ApplicationFormTab getValue={getValue} updateDraft={updateDraft} />
        )}
        {activeTab === "ai-interview" && (
          <AIInterviewTab getValue={getValue} updateDraft={updateDraft} />
        )}
        {activeTab === "email-provider" && (
          <EmailProviderTab getValue={getValue} updateDraft={updateDraft} />
        )}

        {/* Save Button */}
        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-stone-200">
          <button
            onClick={handleSave}
            disabled={saving || !hasDraft}
            className="px-5 py-2 rounded-lg text-[13px] font-medium text-white transition-colors disabled:opacity-50"
            style={{ background: "#D97706" }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {saved && (
            <span className="text-[13px] text-emerald-600 font-medium">
              Saved
            </span>
          )}
          {hasDraft && !saved && (
            <span className="text-[11px] text-stone-400">Unsaved changes</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/* Tab Components                                         */
/* ═══════════════════════════════════════════════════════ */

interface TabProps {
  getValue: <K extends keyof CompanySettings>(key: K) => CompanySettings[K];
  updateDraft: <K extends keyof CompanySettings>(
    key: K,
    value: CompanySettings[K]
  ) => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[13px] font-semibold text-stone-900 mb-3">
      {children}
    </h3>
  );
}

function HelperText({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] text-stone-400 mt-1">{children}</p>;
}

/* ── General ── */
function GeneralTab({ getValue, updateDraft }: TabProps) {
  const threshold = getValue("ats_pass_threshold") ?? 40;
  const autoReject = getValue("ats_auto_reject") ?? true;
  const accentColor = getValue("brand_accent_color") ?? "#D97706";
  const logoUrl = getValue("brand_logo_url") ?? "";
  const stageNames = getValue("stage_names") ?? {};

  return (
    <div className="space-y-8">
      <div>
        <SectionLabel>ATS Screening</SectionLabel>
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-stone-700 mb-1.5">
              Pass Threshold
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={100}
                value={threshold}
                onChange={(e) =>
                  updateDraft("ats_pass_threshold", Number(e.target.value))
                }
                className="flex-1 accent-amber-600"
              />
              <span
                className="text-[14px] font-semibold text-stone-900 w-12 text-center tabular-nums"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {threshold}
              </span>
            </div>
            <HelperText>
              Candidates scoring below {threshold} are{" "}
              {autoReject ? "auto-rejected" : "set to pending review"}.
            </HelperText>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-[13px] font-medium text-stone-700">
                Auto-reject below threshold
              </label>
              <HelperText>
                If off, low-scoring candidates go to Pending Review instead.
              </HelperText>
            </div>
            <Toggle
              checked={autoReject}
              onChange={(v) => updateDraft("ats_auto_reject", v)}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-stone-200 pt-6">
        <SectionLabel>Branding</SectionLabel>
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-stone-700 mb-1.5">
              Accent Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={accentColor}
                onChange={(e) =>
                  updateDraft("brand_accent_color", e.target.value)
                }
                className="w-10 h-10 rounded-lg border border-stone-200 cursor-pointer"
              />
              <input
                type="text"
                value={accentColor}
                onChange={(e) =>
                  updateDraft("brand_accent_color", e.target.value)
                }
                className="w-28 rounded-lg border border-stone-200 px-3 py-2 text-[13px] text-stone-700 font-mono"
                placeholder="#D97706"
              />
              <div
                className="w-20 h-10 rounded-lg"
                style={{ background: accentColor }}
              />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-stone-700 mb-1.5">
              Logo URL
            </label>
            <input
              type="text"
              value={logoUrl || ""}
              onChange={(e) =>
                updateDraft("brand_logo_url", e.target.value || null)
              }
              className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-[14px] text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              placeholder="https://your-cdn.com/logo.png"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-stone-200 pt-6">
        <SectionLabel>Pipeline Stage Labels</SectionLabel>
        <div className="space-y-3">
          {STAGE_KEYS.map((s) => (
            <div key={s.key} className="flex items-center gap-3">
              <label className="text-[13px] text-stone-500 w-44 shrink-0">
                {s.label}
              </label>
              <input
                type="text"
                value={
                  (stageNames as Record<string, string>)[s.key] || ""
                }
                onChange={(e) =>
                  updateDraft("stage_names", {
                    ...(stageNames as Record<string, string>),
                    [s.key]: e.target.value,
                  })
                }
                className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-[13px] text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Email Templates ── */
function EmailTemplatesTab({ getValue, updateDraft }: TabProps) {
  const [preview, setPreview] = useState<"acceptance" | "rejection" | null>(null);

  const fillTemplate = (text: string) =>
    text
      .replace(/\{\{candidate_name\}\}/g, "Jane Smith")
      .replace(/\{\{job_title\}\}/g, "Senior Engineer")
      .replace(/\{\{company_name\}\}/g, "Acme Corp")
      .replace(/\{\{interview_link\}\}/g, "https://example.com/interview/abc");

  const resetTemplate = (type: "acceptance" | "rejection") => {
    if (type === "acceptance") {
      updateDraft("email_acceptance_subject", "Great news about your application at {{company_name}}");
      updateDraft("email_acceptance_body", "Hi {{candidate_name}},\n\nWe were impressed by your application for {{job_title}}. We'd like to invite you to the next stage of our process.\n\nYou'll receive a separate email with instructions shortly.\n\nBest,\n{{company_name}} Team");
    } else {
      updateDraft("email_rejection_subject", "Update on your application at {{company_name}}");
      updateDraft("email_rejection_body", "Hi {{candidate_name}},\n\nThank you for your interest in the {{job_title}} role at {{company_name}}. After careful review, we've decided to move forward with other candidates.\n\nWe appreciate the time you took to apply and wish you the best.\n\nBest,\n{{company_name}} Team");
    }
  };

  return (
    <div className="space-y-8">
      <HelperText>
        Available variables: {"{{candidate_name}}"}, {"{{job_title}}"},{" "}
        {"{{company_name}}"}, {"{{interview_link}}"}
      </HelperText>

      <div>
        <div className="flex items-center justify-between mb-3">
          <SectionLabel>Acceptance Email</SectionLabel>
          <button onClick={() => resetTemplate("acceptance")} className="text-[12px] text-stone-400 hover:text-amber-600">
            Reset to default
          </button>
        </div>
        <div className="space-y-3">
          <input
            type="text"
            value={getValue("email_acceptance_subject")}
            onChange={(e) => updateDraft("email_acceptance_subject", e.target.value)}
            className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-[14px] text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            placeholder="Subject line"
          />
          <textarea
            value={getValue("email_acceptance_body")}
            onChange={(e) => updateDraft("email_acceptance_body", e.target.value)}
            rows={8}
            className="w-full rounded-lg border border-stone-200 px-4 py-3 text-[14px] text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
          />
          <button onClick={() => setPreview(preview === "acceptance" ? null : "acceptance")} className="text-[12px] text-amber-600 hover:text-amber-700 font-medium">
            {preview === "acceptance" ? "Hide preview" : "Preview"}
          </button>
          {preview === "acceptance" && (
            <div className="bg-stone-50 rounded-lg border border-stone-200 p-4 text-[13px] text-stone-700">
              <div className="font-semibold mb-2">{fillTemplate(getValue("email_acceptance_subject"))}</div>
              <div className="whitespace-pre-wrap">{fillTemplate(getValue("email_acceptance_body"))}</div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-stone-200 pt-6">
        <div className="flex items-center justify-between mb-3">
          <SectionLabel>Rejection Email</SectionLabel>
          <button onClick={() => resetTemplate("rejection")} className="text-[12px] text-stone-400 hover:text-amber-600">
            Reset to default
          </button>
        </div>
        <div className="space-y-3">
          <input
            type="text"
            value={getValue("email_rejection_subject")}
            onChange={(e) => updateDraft("email_rejection_subject", e.target.value)}
            className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-[14px] text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            placeholder="Subject line"
          />
          <textarea
            value={getValue("email_rejection_body")}
            onChange={(e) => updateDraft("email_rejection_body", e.target.value)}
            rows={8}
            className="w-full rounded-lg border border-stone-200 px-4 py-3 text-[14px] text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
          />
          <button onClick={() => setPreview(preview === "rejection" ? null : "rejection")} className="text-[12px] text-amber-600 hover:text-amber-700 font-medium">
            {preview === "rejection" ? "Hide preview" : "Preview"}
          </button>
          {preview === "rejection" && (
            <div className="bg-stone-50 rounded-lg border border-stone-200 p-4 text-[13px] text-stone-700">
              <div className="font-semibold mb-2">{fillTemplate(getValue("email_rejection_subject"))}</div>
              <div className="whitespace-pre-wrap">{fillTemplate(getValue("email_rejection_body"))}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Application Form ── */
function ApplicationFormTab({ getValue, updateDraft }: TabProps) {
  const fields = getValue("default_form_fields") ?? {};

  const updateField = (key: string, prop: "enabled" | "required", value: boolean) => {
    const current = { ...(fields as Record<string, { enabled: boolean; required: boolean }>) };
    current[key] = { ...(current[key] || { enabled: false, required: false }), [prop]: value };
    updateDraft("default_form_fields", current);
  };

  return (
    <div className="space-y-4">
      <HelperText>These are defaults for new jobs. You can customize per job when creating.</HelperText>
      <div className="space-y-0">
        {FORM_FIELDS.map((f) => {
          const config = (fields as Record<string, { enabled: boolean; required: boolean }>)[f.key] || { enabled: false, required: false };
          const locked = "locked" in f && f.locked;
          return (
            <div key={f.key} className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid #F5F5F4" }}>
              <span className="text-[14px] text-stone-700">{f.label}</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-[12px] text-stone-500">
                  Enabled
                  <Toggle checked={config.enabled} onChange={(v) => updateField(f.key, "enabled", v)} disabled={locked} />
                </label>
                <label className="flex items-center gap-2 text-[12px] text-stone-500">
                  Required
                  <input
                    type="checkbox"
                    checked={config.required}
                    onChange={(e) => updateField(f.key, "required", e.target.checked)}
                    disabled={locked || !config.enabled}
                    className="w-3.5 h-3.5 rounded border-stone-300 text-amber-600 focus:ring-amber-500/20"
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── AI Interview ── */
function AIInterviewTab({ getValue, updateDraft }: TabProps) {
  return (
    <div className="space-y-6">
      <HelperText>These settings will be used when we launch AI voice interviews.</HelperText>
      <div>
        <label className="block text-[13px] font-medium text-stone-700 mb-1.5">Duration</label>
        <select
          value={getValue("interview_duration_minutes") ?? 15}
          onChange={(e) => updateDraft("interview_duration_minutes", Number(e.target.value))}
          className="w-48 rounded-lg border border-stone-200 px-3 py-2.5 text-[14px] text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
        >
          {DURATION_OPTIONS.map((d) => (
            <option key={d} value={d}>{d} minutes</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-[13px] font-medium text-stone-700 mb-2">Style</label>
        <RadioGroup
          value={getValue("interview_style") ?? "conversational"}
          options={[
            { value: "conversational", label: "Conversational" },
            { value: "structured", label: "Structured" },
            { value: "technical_deep_dive", label: "Technical Deep-dive" },
          ]}
          onChange={(v) => updateDraft("interview_style", v)}
        />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-stone-700 mb-2">Focus</label>
        <RadioGroup
          value={getValue("interview_focus") ?? "technical_and_behavioral"}
          options={[
            { value: "technical_only", label: "Technical only" },
            { value: "behavioral_only", label: "Behavioral only" },
            { value: "technical_and_behavioral", label: "Both" },
          ]}
          onChange={(v) => updateDraft("interview_focus", v)}
        />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-stone-700 mb-1.5">Custom Instructions</label>
        <textarea
          value={getValue("interview_custom_instructions") || ""}
          onChange={(e) => updateDraft("interview_custom_instructions", e.target.value || null)}
          rows={4}
          className="w-full rounded-lg border border-stone-200 px-4 py-3 text-[14px] text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
          placeholder="Additional instructions for the AI interviewer..."
        />
      </div>
    </div>
  );
}

/* ── Email Provider ── */
function EmailProviderTab({ getValue, updateDraft }: TabProps) {
  const provider = getValue("email_provider") ?? "none";
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);

  const handleTestEmail = async () => {
    setTestSending(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/settings/test-email", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setTestResult({ success: true });
      } else {
        setTestResult({ success: false, error: data.error || "Failed to send" });
      }
    } catch {
      setTestResult({ success: false, error: "Network error" });
    } finally {
      setTestSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-[13px] font-medium text-stone-700 mb-1.5">Provider</label>
        <select
          value={provider}
          onChange={(e) => updateDraft("email_provider", e.target.value)}
          className="w-48 rounded-lg border border-stone-200 px-3 py-2.5 text-[14px] text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
        >
          <option value="none">None (emails disabled)</option>
          <option value="resend">Resend</option>
          <option value="sendgrid">SendGrid</option>
        </select>
      </div>
      {provider !== "none" && (
        <>
          <div>
            <label className="block text-[13px] font-medium text-stone-700 mb-1.5">API Key</label>
            <input
              type="password"
              value={getValue("email_api_key") || ""}
              onChange={(e) => updateDraft("email_api_key", e.target.value || null)}
              className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-[14px] text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              placeholder="re_xxxxxxxx or SG.xxxxxxxx"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-stone-700 mb-1.5">From Email</label>
            <input
              type="email"
              value={getValue("email_from_address") || ""}
              onChange={(e) => updateDraft("email_from_address", e.target.value || null)}
              className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-[14px] text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              placeholder="noreply@yourcompany.com"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-stone-700 mb-1.5">From Name</label>
            <input
              type="text"
              value={getValue("email_from_name") || ""}
              onChange={(e) => updateDraft("email_from_name", e.target.value || null)}
              className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-[14px] text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              placeholder="Your Company"
            />
          </div>
          <div className="border-t border-stone-200 pt-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleTestEmail}
                disabled={testSending}
                className="px-4 py-2 rounded-lg text-[13px] font-medium border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50"
              >
                {testSending ? "Sending..." : "Send Test Email"}
              </button>
              {testResult && (
                <span className={`text-[13px] font-medium ${testResult.success ? "text-emerald-600" : "text-red-500"}`}>
                  {testResult.success ? "Test email sent! Check your inbox." : testResult.error}
                </span>
              )}
            </div>
            <p className="text-[12px] text-stone-400 mt-2">
              Sends a test email to your account email address. Save your settings first.
            </p>
          </div>
        </>
      )}
      <HelperText>Configure your email provider to enable automatic candidate notifications.</HelperText>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/* Shared UI                                               */
/* ═══════════════════════════════════════════════════════ */

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${checked ? "bg-amber-600" : "bg-stone-300"}`}
    >
      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${checked ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
    </button>
  );
}

function RadioGroup({ value, options, onChange }: { value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-4">
      {options.map((opt) => (
        <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
          <input type="radio" name={opt.value} checked={value === opt.value} onChange={() => onChange(opt.value)} className="w-3.5 h-3.5 text-amber-600 border-stone-300 focus:ring-amber-500/20" />
          <span className="text-[13px] text-stone-700">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}
