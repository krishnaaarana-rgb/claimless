"use client";

import { useState, useEffect } from "react";
import type { Template, TemplateCategory } from "@/lib/templates/types";

interface TemplatePickerProps {
  category: TemplateCategory;
  industry?: string;
  onSelect: (template: Template) => void;
  buttonLabel?: string;
  className?: string;
}

export function TemplatePicker({
  category,
  industry,
  onSelect,
  buttonLabel = "Use Template",
  className = "",
}: TemplatePickerProps) {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const params = new URLSearchParams({ category });
    if (industry) params.set("industry", industry);
    fetch(`/api/templates?${params}`)
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, category, industry]);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-[12px] font-medium text-[#2383E2] hover:text-[#1a6bc4] transition-colors"
      >
        {buttonLabel}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-[#E9E9E7] rounded-lg shadow-xl w-[380px] max-h-[400px] overflow-hidden">
            <div className="px-3 py-2 border-b border-[#E9E9E7]">
              <span className="text-[12px] font-semibold text-[#37352F] uppercase tracking-wide">
                Templates
              </span>
            </div>
            <div className="overflow-y-auto max-h-[350px]">
              {loading ? (
                <div className="px-3 py-6 text-center text-[12px] text-[#9B9A97]">
                  Loading...
                </div>
              ) : templates.length === 0 ? (
                <div className="px-3 py-6 text-center text-[12px] text-[#9B9A97]">
                  No templates found
                </div>
              ) : (
                templates.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      onSelect(t);
                      setOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 hover:bg-[#F7F6F3] transition-colors border-b border-[#E9E9E7] last:border-0"
                  >
                    <div className="text-[13px] font-medium text-[#37352F]">
                      {t.name}
                    </div>
                    <div className="text-[11px] text-[#9B9A97] mt-0.5 line-clamp-2">
                      {t.description}
                    </div>
                    {t.industries.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {t.industries.map((ind) => (
                          <span
                            key={ind}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-[#F7F6F3] text-[#9B9A97]"
                          >
                            {ind}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
