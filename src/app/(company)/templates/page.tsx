"use client";

import { useState, useEffect } from "react";
import { FileText, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/components/toast";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  industries: string[];
  tags: string[];
  variables?: string[];
  content: string | Record<string, unknown>;
}

const CATEGORY_LABELS: Record<string, { label: string; description: string }> = {
  email: { label: "Email Templates", description: "Ready-made emails for every stage of the hiring pipeline" },
  loom_prompt: { label: "Loom Video Prompts", description: "Industry-specific prompts for candidate video introductions" },
  job_description: { label: "Job Descriptions", description: "Pre-written JDs you can customize for any role" },
  interview_questions: { label: "Interview Instructions", description: "Custom instructions for the AI interviewer by industry" },
  api_payload: { label: "API & Webhook Reference", description: "Sample payloads, cURL commands, and webhook event docs" },
  automation_workflow: { label: "Automation Workflows", description: "Pre-built workflows for N8N, Zapier, and Make.com" },
};

const CATEGORY_ORDER = ["email", "loom_prompt", "job_description", "interview_questions", "automation_workflow", "api_payload"];

function formatContent(content: string | Record<string, unknown>): string {
  if (typeof content === "string") return content;
  // For objects, format nicely
  if ("subject" in content && "body" in content) {
    return `Subject: ${content.subject}\n\n${content.body}`;
  }
  if ("description" in content && typeof content.description === "string") {
    return content.description;
  }
  return JSON.stringify(content, null, 2);
}

export default function TemplatesPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("email");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [industryFilter, setIndustryFilter] = useState("");

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = templates
    .filter((t) => t.category === activeCategory)
    .filter((t) => !industryFilter || t.industries.length === 0 || t.industries.includes(industryFilter));

  const allIndustries = [...new Set(templates.flatMap((t) => t.industries))].sort();

  const copyContent = (template: Template) => {
    const text = formatContent(template.content);
    navigator.clipboard.writeText(text);
    setCopiedId(template.id);
    toast("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="w-full">
        <h1 className="text-2xl font-bold text-[#37352F] mb-6">Templates</h1>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-[#E9E9E7] rounded-lg p-5 animate-pulse">
              <div className="h-5 bg-[#F7F6F3] rounded w-48 mb-3" />
              <div className="h-3 bg-[#F7F6F3] rounded w-96" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#37352F]">Templates</h1>
        <p className="text-[14px] text-[#9B9A97] mt-1">
          Ready-to-use templates for emails, job descriptions, interview instructions, automation workflows, and API integration.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-[#E9E9E7] mb-6 overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {CATEGORY_ORDER.map((cat) => {
            const count = templates.filter((t) => t.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setExpandedId(null); }}
                className={`relative px-4 py-2.5 text-[13px] font-medium transition-colors whitespace-nowrap ${
                  activeCategory === cat ? "text-[#2383E2]" : "text-[#9B9A97] hover:text-[#37352F]"
                }`}
              >
                {CATEGORY_LABELS[cat]?.label || cat}
                <span className={`ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full ${
                  activeCategory === cat ? "bg-blue-100 text-[#2383E2]" : "bg-[#F7F6F3] text-[#9B9A97]"
                }`}>
                  {count}
                </span>
                {activeCategory === cat && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2383E2] rounded-t" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Description + Industry Filter */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] text-[#9B9A97]">
          {CATEGORY_LABELS[activeCategory]?.description}
        </p>
        {allIndustries.length > 0 && (
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="text-[12px] border border-[#E9E9E7] rounded-lg px-3 py-1.5 text-[#37352F] bg-white focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20"
          >
            <option value="">All industries</option>
            {allIndustries.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        )}
      </div>

      {/* Template Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white border border-[#E9E9E7] rounded-lg p-8 text-center">
            <FileText size={24} className="mx-auto text-[#D3D1CB] mb-3" />
            <p className="text-[14px] text-[#9B9A97]">No templates found for this filter</p>
          </div>
        ) : (
          filtered.map((t) => {
            const isExpanded = expandedId === t.id;
            const isCopied = copiedId === t.id;
            const contentText = formatContent(t.content);
            const isJson = typeof t.content === "object" && !("subject" in t.content) && !("description" in (t.content as Record<string, unknown>));

            return (
              <div
                key={t.id}
                className="bg-white border border-[#E9E9E7] rounded-lg overflow-hidden transition-all"
              >
                {/* Header */}
                <div
                  className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-[#FAFAFA] transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : t.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[14px] font-medium text-[#37352F]">{t.name}</h3>
                      {t.industries.map((ind) => (
                        <span key={ind} className="text-[10px] px-1.5 py-0.5 rounded bg-[#DBEAFE] text-[#1D4ED8]">
                          {ind}
                        </span>
                      ))}
                    </div>
                    <p className="text-[12px] text-[#9B9A97] mt-0.5">{t.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); copyContent(t); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                        isCopied
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          : "border border-[#E9E9E7] text-[#37352F] hover:bg-[#F7F6F3]"
                      }`}
                    >
                      {isCopied ? <Check size={12} /> : <Copy size={12} />}
                      {isCopied ? "Copied" : "Copy"}
                    </button>
                    {isExpanded ? <ChevronUp size={14} className="text-[#9B9A97]" /> : <ChevronDown size={14} className="text-[#9B9A97]" />}
                  </div>
                </div>

                {/* Content */}
                {isExpanded && (
                  <div className="px-5 pb-4 border-t border-[#E9E9E7]">
                    {/* Variables */}
                    {t.variables && t.variables.length > 0 && (
                      <div className="mt-3 mb-3">
                        <span className="text-[11px] font-semibold text-[#9B9A97] uppercase tracking-wide">Variables: </span>
                        {t.variables.map((v) => (
                          <code key={v} className="text-[11px] bg-[#F7F6F3] text-[#2383E2] px-1.5 py-0.5 rounded mr-1.5">
                            {`{{${v}}}`}
                          </code>
                        ))}
                      </div>
                    )}

                    {/* Tags */}
                    {t.tags.length > 0 && (
                      <div className="mb-3 flex gap-1">
                        {t.tags.map((tag) => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-[#F7F6F3] text-[#9B9A97]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Content preview */}
                    <div className={`mt-2 rounded-lg border border-[#E9E9E7] overflow-hidden ${isJson ? "bg-[#1E1E1E]" : "bg-[#F7F6F3]"}`}>
                      <pre className={`p-4 text-[13px] leading-relaxed whitespace-pre-wrap overflow-x-auto max-h-[500px] overflow-y-auto ${
                        isJson ? "text-[#D4D4D4] font-mono text-[12px]" : "text-[#37352F]"
                      }`}>
                        {isJson ? JSON.stringify(t.content, null, 2) : contentText}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
