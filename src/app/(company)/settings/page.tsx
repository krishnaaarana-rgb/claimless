"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Settings, Mail, FileText, Mic, Send } from "lucide-react";
import { TemplatePicker } from "@/components/template-picker";

interface CompanySettings {
  ats_pass_threshold: number;
  ats_auto_reject: boolean;
  auto_invite_interview: boolean;
  email_acceptance_subject: string;
  email_acceptance_body: string;
  email_rejection_subject: string;
  email_rejection_body: string;
  default_form_fields: Record<string, { enabled: boolean; required: boolean }>;
  brand_accent_color: string;
  brand_logo_url: string | null;
  brand_tagline: string | null;
  stage_names: Record<string, string>;
  interview_duration_minutes: number;
  interview_style: string;
  interview_focus: string;
  interview_custom_instructions: string | null;
  interviewer_name: string | null;
  voice_agent_id: string;
  email_provider: string;
  email_api_key: string | null;
  email_from_address: string | null;
  email_from_name: string | null;
  email_reply_to: string | null;
  email_reply_to_addresses: string[];
  email_delay_minutes: number;
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
  { key: "loom_url", label: "Video Introduction (Loom)" },
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

  // Warn on unsaved changes (browser navigation)
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (Object.keys(draft).length > 0) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [draft]);

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
      const data = await res.json();
      if (res.ok) {
        setSettings(data.settings);
        setDraft({});
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert(`Failed to save: ${data.error || res.status}`);
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
        <h1 className="text-2xl font-bold text-[#37352F]">Settings</h1>
        <div className="h-64 bg-[#F7F6F3] rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#37352F]">Settings</h1>
        <p className="text-[#9B9A97]">No company settings found.</p>
      </div>
    );
  }

  const hasDraft = Object.keys(draft).length > 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#37352F]">Settings</h1>

      {/* Tab Bar */}
      <div className="flex gap-1 border-b border-[#E9E9E7]">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${
                isActive
                  ? "border-[#2383E2] text-[#2383E2]"
                  : "border-transparent text-[#9B9A97] hover:text-[#37352F]"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="w-full">
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
        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-[#E9E9E7]">
          <button
            onClick={handleSave}
            disabled={saving || !hasDraft}
            className="px-5 py-2 rounded-lg text-[13px] font-medium text-white transition-colors disabled:opacity-50"
            style={{ background: "#2383E2" }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {saved && (
            <span className="text-[13px] text-emerald-600 font-medium">
              Saved
            </span>
          )}
          {hasDraft && !saved && (
            <span className="text-[11px] text-[#9B9A97]">Unsaved changes</span>
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
    <h3 className="text-[13px] font-semibold text-[#37352F] mb-3">
      {children}
    </h3>
  );
}

function HelperText({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] text-[#9B9A97] mt-1">{children}</p>;
}

/* ── General ── */
function GeneralTab({ getValue, updateDraft }: TabProps) {
  const threshold = getValue("ats_pass_threshold") ?? 40;
  const autoReject = getValue("ats_auto_reject") ?? true;
  const autoInvite = getValue("auto_invite_interview") ?? false;
  const accentColor = getValue("brand_accent_color") ?? "#2383E2";
  const logoUrl = getValue("brand_logo_url") ?? "";
  const tagline = getValue("brand_tagline") ?? "";
  const stageNames = getValue("stage_names") ?? {};

  return (
    <div className="space-y-8">
      <div>
        <SectionLabel>ATS Screening</SectionLabel>
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#37352F] mb-1.5">
              Pass Threshold
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                value={threshold}
                onChange={(e) =>
                  updateDraft("ats_pass_threshold", Number(e.target.value))
                }
                className="flex-1 accent-[#2383E2]"
              />
              <span
                className="text-[14px] font-semibold text-[#37352F] w-12 text-center tabular-nums"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {threshold}
              </span>
            </div>
            <HelperText>
              Candidates scoring below {threshold} are{" "}
              {autoReject ? "auto-rejected" : "set to pending review"}.
              {threshold <= 10 && " Set to 0 to interview every candidate regardless of screening score."}
            </HelperText>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-[13px] font-medium text-[#37352F]">
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

          {/* Auto-invite to interview */}
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-[13px] font-medium text-[#37352F]">
                Auto-invite to interview
              </label>
              <HelperText>
                Automatically send interview invites when candidates pass screening.
                No manual step required — candidates go straight from apply to interview.
              </HelperText>
            </div>
            <Toggle
              checked={autoInvite}
              onChange={(v) => updateDraft("auto_invite_interview", v)}
            />
          </div>

          {/* Email delay */}
          <div>
            <label className="block text-[13px] font-medium text-[#37352F]">
              Email delay after screening
            </label>
            <HelperText>
              Wait before sending screening result emails. Prevents candidates from
              receiving instant rejections — makes the process feel more considered.
            </HelperText>
            <select
              value={getValue("email_delay_minutes") ?? 60}
              onChange={(e) => updateDraft("email_delay_minutes", Number(e.target.value))}
              className="mt-1.5 rounded-lg border border-[#E9E9E7] px-3 py-2 text-[13px] text-[#37352F] bg-white focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20"
            >
              <option value={0}>Send immediately</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
              <option value={240}>4 hours</option>
              <option value={480}>8 hours</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border-t border-[#E9E9E7] pt-6">
        <SectionLabel>Branding</SectionLabel>
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#37352F] mb-1.5">
              Accent Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={accentColor}
                onChange={(e) =>
                  updateDraft("brand_accent_color", e.target.value)
                }
                className="w-10 h-10 rounded-lg border border-[#E9E9E7] cursor-pointer"
              />
              <input
                type="text"
                value={accentColor}
                onChange={(e) =>
                  updateDraft("brand_accent_color", e.target.value)
                }
                className="w-28 rounded-lg border border-[#E9E9E7] px-3 py-2 text-[13px] text-[#37352F] font-mono"
                placeholder="#2383E2"
              />
              <div
                className="w-20 h-10 rounded-lg"
                style={{ background: accentColor }}
              />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#37352F] mb-1.5">
              Logo
            </label>
            <div className="flex items-center gap-4">
              {logoUrl ? (
                <div className="p-3 bg-[#F7F6F3] rounded-lg border border-[#E9E9E7] inline-flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoUrl} alt="Logo" className="max-h-10 max-w-[160px] object-contain" />
                  <button
                    type="button"
                    onClick={() => updateDraft("brand_logo_url", null)}
                    className="text-[#9B9A97] hover:text-red-500 transition-colors text-[14px]"
                  >
                    &times;
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-[#E9E9E7] text-[13px] text-[#9B9A97] hover:border-[#2383E2] hover:text-[#2383E2] transition-colors cursor-pointer">
                  Upload logo
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 2 * 1024 * 1024) {
                        alert("Logo must be under 2MB");
                        return;
                      }
                      const fd = new FormData();
                      fd.append("file", file);
                      fd.append("bucket", "job-files");
                      fd.append("path", "logos");
                      const res = await fetch("/api/upload", { method: "POST", body: fd });
                      if (res.ok) {
                        const data = await res.json();
                        updateDraft("brand_logo_url", data.url);
                      }
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
            </div>
            <HelperText>PNG, JPG, SVG, or WebP. Max 2MB. Shows on candidate emails and shared pages.</HelperText>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#37352F] mb-1.5">
              Tagline
            </label>
            <input
              type="text"
              value={tagline || ""}
              onChange={(e) =>
                updateDraft("brand_tagline", e.target.value || null)
              }
              className="w-full rounded-lg border border-[#E9E9E7] px-4 py-2.5 text-[14px] text-[#37352F] placeholder:text-[#9B9A97] focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2]"
              placeholder="Your agency's tagline for Client Briefs"
            />
            <HelperText>Shown on shared Client Briefs below your agency name.</HelperText>
          </div>

          {/* Brief Preview */}
          {(logoUrl || tagline) && (
            <div className="mt-2 p-4 bg-white rounded-lg border border-[#E9E9E7]">
              <p className="text-[10px] text-[#9B9A97] uppercase tracking-wider mb-2">Brief header preview</p>
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={logoUrl} alt="Logo" className="h-8 max-w-[120px] object-contain" />
                ) : (
                  <div className="w-3 h-3 rounded-full" style={{ background: accentColor }} />
                )}
                <div>
                  <span className="text-[13px] font-semibold text-[#37352F]">Your Agency</span>
                  {tagline && <p className="text-[11px] text-[#9B9A97]">{tagline}</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-[#E9E9E7] pt-6">
        <SectionLabel>Pipeline Stage Labels</SectionLabel>
        <div className="space-y-3">
          {STAGE_KEYS.map((s) => (
            <div key={s.key} className="flex items-center gap-3">
              <label className="text-[13px] text-[#9B9A97] w-44 shrink-0">
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
                className="flex-1 rounded-lg border border-[#E9E9E7] px-3 py-2 text-[13px] text-[#37352F] focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2]"
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
          <div className="flex items-center gap-3">
            <TemplatePicker
              category="email"
              buttonLabel="Use Template"
              onSelect={(t) => {
                const c = t.content as { subject?: string; body?: string };
                if (c.subject) updateDraft("email_acceptance_subject", c.subject);
                if (c.body) updateDraft("email_acceptance_body", c.body);
              }}
            />
            <button onClick={() => resetTemplate("acceptance")} className="text-[12px] text-[#9B9A97] hover:text-[#2383E2]">
              Reset to default
            </button>
          </div>
        </div>
        <div className="space-y-3">
          <input
            type="text"
            value={getValue("email_acceptance_subject")}
            onChange={(e) => updateDraft("email_acceptance_subject", e.target.value)}
            className="w-full rounded-lg border border-[#E9E9E7] px-4 py-2.5 text-[14px] text-[#37352F] placeholder:text-[#9B9A97] focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2]"
            placeholder="Subject line"
          />
          <textarea
            value={getValue("email_acceptance_body")}
            onChange={(e) => updateDraft("email_acceptance_body", e.target.value)}
            rows={8}
            className="w-full rounded-lg border border-[#E9E9E7] px-4 py-3 text-[14px] text-[#37352F] placeholder:text-[#9B9A97] focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2] resize-none"
          />
          <button onClick={() => setPreview(preview === "acceptance" ? null : "acceptance")} className="text-[12px] text-[#2383E2] hover:text-[#2383E2] font-medium">
            {preview === "acceptance" ? "Hide preview" : "Preview"}
          </button>
          {preview === "acceptance" && (
            <div className="bg-[#F7F6F3] rounded-lg border border-[#E9E9E7] p-4 text-[13px] text-[#37352F]">
              <div className="font-semibold mb-2">{fillTemplate(getValue("email_acceptance_subject"))}</div>
              <div className="whitespace-pre-wrap">{fillTemplate(getValue("email_acceptance_body"))}</div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-[#E9E9E7] pt-6">
        <div className="flex items-center justify-between mb-3">
          <SectionLabel>Rejection Email</SectionLabel>
          <div className="flex items-center gap-3">
            <TemplatePicker
              category="email"
              buttonLabel="Use Template"
              onSelect={(t) => {
                const c = t.content as { subject?: string; body?: string };
                if (c.subject) updateDraft("email_rejection_subject", c.subject);
                if (c.body) updateDraft("email_rejection_body", c.body);
              }}
            />
            <button onClick={() => resetTemplate("rejection")} className="text-[12px] text-[#9B9A97] hover:text-[#2383E2]">
              Reset to default
            </button>
          </div>
        </div>
        <div className="space-y-3">
          <input
            type="text"
            value={getValue("email_rejection_subject")}
            onChange={(e) => updateDraft("email_rejection_subject", e.target.value)}
            className="w-full rounded-lg border border-[#E9E9E7] px-4 py-2.5 text-[14px] text-[#37352F] placeholder:text-[#9B9A97] focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2]"
            placeholder="Subject line"
          />
          <textarea
            value={getValue("email_rejection_body")}
            onChange={(e) => updateDraft("email_rejection_body", e.target.value)}
            rows={8}
            className="w-full rounded-lg border border-[#E9E9E7] px-4 py-3 text-[14px] text-[#37352F] placeholder:text-[#9B9A97] focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2] resize-none"
          />
          <button onClick={() => setPreview(preview === "rejection" ? null : "rejection")} className="text-[12px] text-[#2383E2] hover:text-[#2383E2] font-medium">
            {preview === "rejection" ? "Hide preview" : "Preview"}
          </button>
          {preview === "rejection" && (
            <div className="bg-[#F7F6F3] rounded-lg border border-[#E9E9E7] p-4 text-[13px] text-[#37352F]">
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
            <div key={f.key} className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid #E9E9E7" }}>
              <span className="text-[14px] text-[#37352F]">{f.label}</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-[12px] text-[#9B9A97]">
                  Enabled
                  <Toggle checked={config.enabled} onChange={(v) => updateField(f.key, "enabled", v)} disabled={locked} />
                </label>
                <label className="flex items-center gap-2 text-[12px] text-[#9B9A97]">
                  Required
                  <input
                    type="checkbox"
                    checked={config.required}
                    onChange={(e) => updateField(f.key, "required", e.target.checked)}
                    disabled={locked || !config.enabled}
                    className="w-3.5 h-3.5 rounded border-[#E9E9E7] text-[#2383E2] focus:ring-[#2383E2]/20"
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
        <label className="block text-[13px] font-medium text-[#37352F] mb-1.5">Duration</label>
        <select
          value={getValue("interview_duration_minutes") ?? 15}
          onChange={(e) => updateDraft("interview_duration_minutes", Number(e.target.value))}
          className="w-48 rounded-lg border border-[#E9E9E7] px-3 py-2.5 text-[14px] text-[#37352F] focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2]"
        >
          {DURATION_OPTIONS.map((d) => (
            <option key={d} value={d}>{d} minutes</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-[13px] font-medium text-[#37352F] mb-2">Style</label>
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
        <label className="block text-[13px] font-medium text-[#37352F] mb-2">Focus</label>
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
        <label className="block text-[13px] font-medium text-[#37352F] mb-1.5">Interviewer Name</label>
        <input
          type="text"
          value={getValue("interviewer_name") || ""}
          onChange={(e) => updateDraft("interviewer_name", e.target.value || null)}
          className="w-full rounded-lg border border-[#E9E9E7] px-4 py-2.5 text-[14px] text-[#37352F] placeholder:text-[#9B9A97] focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2]"
          placeholder="e.g., Sarah, Alex — leave blank for default"
        />
        <HelperText>The AI introduces itself with this name. Candidates see it in the interview and transcript.</HelperText>
      </div>
      <div>
        <label className="block text-[13px] font-medium text-[#37352F] mb-2">Voice</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", desc: "Professional, confident", gender: "F", preview: "https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/01a3e33c-6e99-4ee7-8543-ff2216a32186.mp3" },
            { id: "hpp4J3VqNfWAUOO0d1Us", name: "Bella", desc: "Bright, warm", gender: "F", preview: "https://storage.googleapis.com/eleven-public-prod/premade/voices/hpp4J3VqNfWAUOO0d1Us/dab0f5ba-3aa4-48a8-9fad-f138fea1126d.mp3" },
            { id: "cgSgspJ2msm6clMCkdW9", name: "Jessica", desc: "Playful, friendly", gender: "F", preview: "https://storage.googleapis.com/eleven-public-prod/premade/voices/cgSgspJ2msm6clMCkdW9/56a97bf8-b69b-448f-846c-c3a11683d45a.mp3" },
            { id: "cjVigY5qzO86Huf0OWal", name: "Eric", desc: "Smooth, trustworthy", gender: "M", preview: "https://storage.googleapis.com/eleven-public-prod/premade/voices/cjVigY5qzO86Huf0OWal/d098fda0-6456-4030-b3d8-63aa048c9070.mp3" },
            { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger", desc: "Laid-back, casual", gender: "M", preview: "https://storage.googleapis.com/eleven-public-prod/premade/voices/CwhRBWXzGAHq8TQ4Fs17/58ee3ff5-f6f2-4628-93b8-e38eb31806b0.mp3" },
            { id: "iP95p4xoKVk53GoZ742B", name: "Chris", desc: "Charming, down-to-earth", gender: "M", preview: "https://storage.googleapis.com/eleven-public-prod/premade/voices/iP95p4xoKVk53GoZ742B/3f4bde72-cc48-40dd-829f-57fbf906f4d7.mp3" },
          ].map((v) => {
            const selected = (getValue("voice_agent_id") || "EXAVITQu4vr4xnSDxMaL") === v.id;
            return (
              <div
                key={v.id}
                onClick={() => updateDraft("voice_agent_id", v.id)}
                className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                  selected
                    ? "border-[#2383E2] bg-[#2383E2]/5"
                    : "border-[#E9E9E7] hover:border-[#2383E2]/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${v.gender === "F" ? "bg-pink-50 text-pink-600" : "bg-blue-50 text-blue-600"}`}>
                    {v.gender}
                  </span>
                  <span className="text-[13px] font-medium text-[#37352F]">{v.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const existing = document.getElementById("voice-preview") as HTMLAudioElement;
                      if (existing) { existing.pause(); existing.remove(); }
                      const audio = document.createElement("audio");
                      audio.id = "voice-preview";
                      audio.src = v.preview;
                      audio.play();
                      audio.onended = () => audio.remove();
                    }}
                    className="ml-auto text-[10px] px-2 py-0.5 rounded border border-[#E9E9E7] text-[#9B9A97] hover:text-[#2383E2] hover:border-[#2383E2] transition-colors"
                  >
                    &#9654; Preview
                  </button>
                </div>
                <p className="text-[11px] text-[#9B9A97] mt-1">{v.desc}</p>
              </div>
            );
          })}
        </div>
        <HelperText>The voice used for the AI interviewer. Changes apply to new interviews only.</HelperText>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-[13px] font-medium text-[#37352F]">Custom Instructions</label>
          <TemplatePicker
            category="interview_questions"
            buttonLabel="Load Template"
            onSelect={(t) => updateDraft("interview_custom_instructions", typeof t.content === "string" ? t.content : JSON.stringify(t.content))}
          />
        </div>
        <textarea
          value={getValue("interview_custom_instructions") || ""}
          onChange={(e) => updateDraft("interview_custom_instructions", e.target.value || null)}
          rows={4}
          className="w-full rounded-lg border border-[#E9E9E7] px-4 py-3 text-[14px] text-[#37352F] placeholder:text-[#9B9A97] focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2] resize-none"
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
        <label className="block text-[13px] font-medium text-[#37352F] mb-1.5">Provider</label>
        <select
          value={provider}
          onChange={(e) => updateDraft("email_provider", e.target.value)}
          className="w-48 rounded-lg border border-[#E9E9E7] px-3 py-2.5 text-[14px] text-[#37352F] focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2]"
        >
          <option value="none">None (emails disabled)</option>
          <option value="resend">Resend</option>
          <option value="sendgrid">SendGrid</option>
        </select>
      </div>
      {provider !== "none" && (
        <>
          <div>
            <label className="block text-[13px] font-medium text-[#37352F] mb-1.5">API Key</label>
            <input
              type="password"
              value={getValue("email_api_key") || ""}
              onChange={(e) => updateDraft("email_api_key", e.target.value || null)}
              className="w-full rounded-lg border border-[#E9E9E7] px-4 py-2.5 text-[14px] text-[#37352F] placeholder:text-[#9B9A97] focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2]"
              placeholder="re_xxxxxxxx or SG.xxxxxxxx"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#37352F] mb-1.5">From Email</label>
            <input
              type="email"
              value={getValue("email_from_address") || ""}
              onChange={(e) => updateDraft("email_from_address", e.target.value || null)}
              className="w-full rounded-lg border border-[#E9E9E7] px-4 py-2.5 text-[14px] text-[#37352F] placeholder:text-[#9B9A97] focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2]"
              placeholder="noreply@yourcompany.com"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#37352F] mb-1.5">From Name</label>
            <input
              type="text"
              value={getValue("email_from_name") || ""}
              onChange={(e) => updateDraft("email_from_name", e.target.value || null)}
              className="w-full rounded-lg border border-[#E9E9E7] px-4 py-2.5 text-[14px] text-[#37352F] placeholder:text-[#9B9A97] focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2]"
              placeholder="Your Company"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#37352F] mb-1.5">Reply-To Email</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="email"
                  value={getValue("email_reply_to") || ""}
                  onChange={(e) => updateDraft("email_reply_to", e.target.value || null)}
                  className="w-full rounded-lg border border-[#E9E9E7] px-4 py-2.5 text-[14px] text-[#37352F] placeholder:text-[#9B9A97] focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2]"
                  placeholder="hiring@yourcompany.com"
                  list="reply-to-addresses"
                />
                <datalist id="reply-to-addresses">
                  {((getValue("email_reply_to_addresses") as unknown as string[]) || []).map((addr: string) => (
                    <option key={addr} value={addr} />
                  ))}
                </datalist>
              </div>
              <button
                type="button"
                onClick={() => {
                  const current = getValue("email_reply_to") as string;
                  if (!current?.trim()) return;
                  const existing = (getValue("email_reply_to_addresses") as unknown as string[]) || [];
                  if (!existing.includes(current.trim())) {
                    updateDraft("email_reply_to_addresses", [...existing, current.trim()]);
                  }
                }}
                className="px-3 py-2.5 rounded-lg text-[12px] font-medium border border-[#E9E9E7] text-[#9B9A97] hover:text-[#2383E2] hover:border-[#2383E2] transition-colors whitespace-nowrap"
              >
                Save Address
              </button>
            </div>
            <p className="text-[12px] text-[#9B9A97] mt-1.5">
              When candidates reply to emails, responses go here. Save multiple addresses to quickly switch between them.
            </p>
            {((getValue("email_reply_to_addresses") as unknown as string[]) || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {((getValue("email_reply_to_addresses") as unknown as string[]) || []).map((addr: string) => (
                  <button
                    key={addr}
                    type="button"
                    onClick={() => updateDraft("email_reply_to", addr)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                      getValue("email_reply_to") === addr
                        ? "bg-[#2383E2] text-white"
                        : "bg-[#F7F6F3] text-[#37352F] hover:bg-[#EFEFEF]"
                    }`}
                  >
                    {addr}
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        const existing = (getValue("email_reply_to_addresses") as unknown as string[]) || [];
                        updateDraft("email_reply_to_addresses", existing.filter((a: string) => a !== addr));
                        if (getValue("email_reply_to") === addr) updateDraft("email_reply_to", null);
                      }}
                      className="ml-0.5 opacity-60 hover:opacity-100 cursor-pointer"
                    >
                      &times;
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-[#E9E9E7] pt-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleTestEmail}
                disabled={testSending}
                className="px-4 py-2 rounded-lg text-[13px] font-medium border border-[#E9E9E7] text-[#37352F] hover:bg-[#F7F6F3] transition-colors disabled:opacity-50"
              >
                {testSending ? "Sending..." : "Send Test Email"}
              </button>
              {testResult && (
                <span className={`text-[13px] font-medium ${testResult.success ? "text-emerald-600" : "text-red-500"}`}>
                  {testResult.success ? "Test email sent! Check your inbox." : testResult.error}
                </span>
              )}
            </div>
            <p className="text-[12px] text-[#9B9A97] mt-2">
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
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${checked ? "bg-[#2383E2]" : "bg-[#D3D1CB]"}`}
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
          <input type="radio" name={opt.value} checked={value === opt.value} onChange={() => onChange(opt.value)} className="w-3.5 h-3.5 text-[#2383E2] border-[#E9E9E7] focus:ring-[#2383E2]/20" />
          <span className="text-[13px] text-[#37352F]">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}
