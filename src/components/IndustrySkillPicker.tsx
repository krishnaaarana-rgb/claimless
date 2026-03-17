"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  X,
  Plus,
  Search,
  ChevronDown,
  GripVertical,
  Check,
  Sparkles,
  Zap,
} from "lucide-react";

// ────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────

export interface SkillRequirement {
  skill: string;
  category: "hard_skill" | "soft_skill" | "custom";
  level: "basic" | "intermediate" | "advanced" | "expert";
  required: boolean;
  weight: number;
}

interface IndustryOption {
  id: string;
  label: string;
  icon: string;
}

interface SubNiche {
  id: string;
  label: string;
}

interface SkillOption {
  name: string;
  description: string;
  category: "hard_skill" | "soft_skill";
}

interface IndustryData {
  industry: IndustryOption;
  sub_niches: SubNiche[];
  hard_skills: SkillOption[];
  soft_skills: SkillOption[];
  niche_skills: string[];
}

export interface IndustrySkillPickerProps {
  industry: string | null;
  industryNiche: string | null;
  skills: SkillRequirement[];
  onChange: (data: {
    industry: string | null;
    industryNiche: string | null;
    skills: SkillRequirement[];
  }) => void;
}

// ────────────────────────────────────────────────────────
// CONSTANTS
// ────────────────────────────────────────────────────────

const LEVELS: { value: SkillRequirement["level"]; label: string; color: string }[] = [
  { value: "basic", label: "Basic", color: "#A8A29E" },
  { value: "intermediate", label: "Intermediate", color: "#2383E2" },
  { value: "advanced", label: "Advanced", color: "#2563EB" },
  { value: "expert", label: "Expert", color: "#7C3AED" },
];

// ────────────────────────────────────────────────────────
// MAIN COMPONENT
// ────────────────────────────────────────────────────────

export default function IndustrySkillPicker({
  industry,
  industryNiche,
  skills,
  onChange,
}: IndustrySkillPickerProps) {
  // Industry list
  const [industries, setIndustries] = useState<IndustryOption[]>([]);
  const [industryData, setIndustryData] = useState<IndustryData | null>(null);
  const [loadingIndustries, setLoadingIndustries] = useState(true);
  const [loadingSkills, setLoadingSkills] = useState(false);

  // Skill picker state
  const [skillSearch, setSkillSearch] = useState("");
  const [showSkillPanel, setShowSkillPanel] = useState(false);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [customSkillLevel, setCustomSkillLevel] = useState<SkillRequirement["level"]>("intermediate");
  const [activeCategory, setActiveCategory] = useState<"all" | "hard_skill" | "soft_skill">("all");

  // Drag state
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // Refs
  const skillSearchRef = useRef<HTMLInputElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

  const [companyCustomSkills, setCompanyCustomSkills] = useState<string[]>([]);

  // ── Fetch industry list + company's saved custom skills ──
  useEffect(() => {
    fetch("/api/industries")
      .then((r) => r.json())
      .then((d) => setIndustries(d.industries || []))
      .catch(() => {})
      .finally(() => setLoadingIndustries(false));

    // Fetch custom skills used in previous jobs
    fetch("/api/jobs/custom-skills")
      .then((r) => r.json())
      .then((d) => setCompanyCustomSkills(d.skills || []))
      .catch(() => {});
  }, []);

  // ── Fetch skills when industry changes ──
  useEffect(() => {
    if (!industry) {
      setIndustryData(null);
      return;
    }
    setLoadingSkills(true);
    const params = new URLSearchParams({ industry });
    if (industryNiche) params.set("niche", industryNiche);

    fetch(`/api/industries?${params}`)
      .then((r) => r.json())
      .then((d) => setIndustryData(d))
      .catch(() => {})
      .finally(() => setLoadingSkills(false));
  }, [industry, industryNiche]);

  // ── Helpers ──
  const isSkillAdded = useCallback(
    (name: string) => skills.some((s) => s.skill.toLowerCase() === name.toLowerCase()),
    [skills]
  );

  const addSkill = useCallback(
    (name: string, category: SkillRequirement["category"]) => {
      if (isSkillAdded(name)) return;
      onChange({
        industry,
        industryNiche,
        skills: [
          ...skills,
          { skill: name, category, level: "intermediate", required: true, weight: 3 },
        ],
      });
    },
    [skills, industry, industryNiche, onChange, isSkillAdded]
  );

  const removeSkill = useCallback(
    (idx: number) => {
      onChange({
        industry,
        industryNiche,
        skills: skills.filter((_, i) => i !== idx),
      });
    },
    [skills, industry, industryNiche, onChange]
  );

  const updateSkill = useCallback(
    (idx: number, updates: Partial<SkillRequirement>) => {
      onChange({
        industry,
        industryNiche,
        skills: skills.map((s, i) => (i === idx ? { ...s, ...updates } : s)),
      });
    },
    [skills, industry, industryNiche, onChange]
  );

  const handleDragEnd = useCallback(() => {
    if (dragIdx === null || dragOverIdx === null || dragIdx === dragOverIdx) {
      setDragIdx(null);
      setDragOverIdx(null);
      return;
    }
    const reordered = [...skills];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(dragOverIdx, 0, moved);
    onChange({ industry, industryNiche, skills: reordered });
    setDragIdx(null);
    setDragOverIdx(null);
  }, [dragIdx, dragOverIdx, skills, industry, industryNiche, onChange]);

  const handleAddCustom = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "Enter" || !customSkillInput.trim()) return;
      const name = customSkillInput.trim();
      if (isSkillAdded(name)) return;
      onChange({
        industry,
        industryNiche,
        skills: [
          ...skills,
          { skill: name, category: "custom", level: customSkillLevel, required: true, weight: 3 },
        ],
      });
      setCustomSkillInput("");
      setCustomSkillLevel("intermediate");
    },
    [customSkillInput, customSkillLevel, isSkillAdded, skills, industry, industryNiche, onChange]
  );

  // ── Filtered suggestions ──
  const filteredSuggestions = useMemo(() => {
    const industrySkills = industryData ? [
      ...industryData.hard_skills.map((s) => ({ ...s, category: "hard_skill" as const })),
      ...industryData.soft_skills.map((s) => ({ ...s, category: "soft_skill" as const })),
      ...industryData.niche_skills.map((name) => ({
        name,
        description: "",
        category: "hard_skill" as const,
      })),
    ] : [];

    // Add company's previously used custom skills
    const industryNames = new Set(industrySkills.map((s) => s.name.toLowerCase()));
    const customSuggestions = companyCustomSkills
      .filter((name) => !industryNames.has(name.toLowerCase()))
      .map((name) => ({ name, description: "Previously used", category: "custom" as const }));

    const all = [...industrySkills, ...customSuggestions];
    return all
      .filter((s) => {
        if (activeCategory !== "all" && s.category !== activeCategory) return false;
        if (skillSearch && !s.name.toLowerCase().includes(skillSearch.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        const aAdded = isSkillAdded(a.name);
        const bAdded = isSkillAdded(b.name);
        if (aAdded && !bAdded) return 1;
        if (!aAdded && bAdded) return -1;
        return 0;
      });
  }, [industryData, skillSearch, activeCategory, isSkillAdded]);

  // ── Industry select ──
  const selectIndustry = (id: string) => {
    onChange({ industry: id, industryNiche: null, skills: [] });
    setShowSkillPanel(true);
  };

  const selectNiche = (nicheId: string) => {
    onChange({
      industry,
      industryNiche: industryNiche === nicheId ? null : nicheId,
      skills,
    });
  };

  const clearIndustry = () => {
    onChange({ industry: null, industryNiche: null, skills: [] });
    setIndustryData(null);
    setShowSkillPanel(false);
  };

  // ────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* ── INDUSTRY SELECTOR ── */}
      <div>
        <label className="block text-[13px] font-semibold text-[#37352F] mb-2">
          Industry
        </label>
        <p className="text-[12px] text-[#9B9A97] mb-3">
          Select an industry to get tailored skill suggestions and AI interview context
        </p>

        {!industry ? (
          /* Industry Grid */
          loadingIndustries ? (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[52px] rounded-lg bg-[#F7F6F3] animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {industries.map((ind) => (
                <button
                  key={ind.id}
                  type="button"
                  onClick={() => selectIndustry(ind.id)}
                  className="group flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-[#E9E9E7] text-left transition-all duration-150 hover:border-[#E9E9E7] hover:bg-[#F7F6F3] active:scale-[0.98]"
                  style={{ borderColor: "#E7E5E4" }}
                >
                  <span className="text-[16px] shrink-0 group-hover:scale-110 transition-transform duration-150">
                    {ind.icon}
                  </span>
                  <span className="text-[13px] font-medium text-[#37352F] truncate">
                    {ind.label}
                  </span>
                </button>
              ))}
            </div>
          )
        ) : (
          /* Selected industry pill */
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all"
              style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A" }}
            >
              <span>{industryData?.industry?.icon || "🔧"}</span>
              <span>{industryData?.industry?.label || industry}</span>
              <button
                type="button"
                onClick={clearIndustry}
                className="ml-0.5 p-0.5 rounded hover:bg-blue-200/50 transition-colors"
              >
                <X size={12} />
              </button>
            </div>

            {/* Sub-niche pills */}
            {industryData?.sub_niches && industryData.sub_niches.length > 0 && (
              <>
                <span className="text-[11px] text-[#D3D1CB] mx-1">•</span>
                {industryData.sub_niches.map((niche) => (
                  <button
                    key={niche.id}
                    type="button"
                    onClick={() => selectNiche(niche.id)}
                    className={`px-2.5 py-1 rounded-md text-[12px] font-medium border transition-all duration-150 active:scale-[0.97] ${
                      industryNiche === niche.id
                        ? "border-blue-300 bg-blue-50 text-blue-800"
                        : "border-[#E9E9E7] text-[#9B9A97] hover:border-[#E9E9E7] hover:text-[#37352F]"
                    }`}
                  >
                    {niche.label}
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── SKILLS SECTION ── */}
      {industry && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[13px] font-semibold text-[#37352F]">
              Skills to assess
            </label>
            <span className="text-[11px] text-[#9B9A97]">
              {skills.length} skill{skills.length !== 1 ? "s" : ""} added
            </span>
          </div>

          {/* ── Added Skills List ── */}
          {skills.length > 0 && (
            <div className="mb-3 space-y-0 rounded-lg border border-[#E9E9E7] overflow-hidden">
              {skills.map((skill, idx) => (
                <div
                  key={`${skill.skill}-${idx}`}
                  draggable
                  onDragStart={() => setDragIdx(idx)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverIdx(idx);
                  }}
                  onDragEnd={handleDragEnd}
                  className={`group flex items-center gap-2 px-3 py-2 transition-colors ${
                    idx > 0 ? "border-t border-[#E9E9E7]" : ""
                  } ${dragOverIdx === idx ? "bg-blue-50/50" : "bg-white hover:bg-white"}`}
                  style={{ cursor: "grab" }}
                >
                  {/* Drag handle */}
                  <GripVertical
                    size={14}
                    className="text-[#D3D1CB] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  />

                  {/* Category indicator */}
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{
                      background:
                        skill.category === "hard_skill"
                          ? "#2563EB"
                          : skill.category === "soft_skill"
                          ? "#8B5CF6"
                          : "#A8A29E",
                    }}
                    title={
                      skill.category === "hard_skill"
                        ? "Hard skill"
                        : skill.category === "soft_skill"
                        ? "Soft skill"
                        : "Custom"
                    }
                  />

                  {/* Skill name */}
                  <span className="text-[13px] text-[#37352F] font-medium flex-1 truncate">
                    {skill.skill}
                  </span>

                  {/* Level selector */}
                  <LevelPicker
                    value={skill.level}
                    onChange={(level) => updateSkill(idx, { level })}
                  />

                  {/* Required toggle */}
                  <button
                    type="button"
                    onClick={() => updateSkill(idx, { required: !skill.required })}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider transition-all duration-150 ${
                      skill.required
                        ? "bg-red-50 text-red-600 border border-red-200"
                        : "bg-[#F7F6F3] text-[#9B9A97] border border-[#E9E9E7]"
                    }`}
                  >
                    {skill.required ? "Req" : "Nice"}
                  </button>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeSkill(idx)}
                    className="p-1 rounded text-[#D3D1CB] hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── Add Skills Button / Panel ── */}
          {!showSkillPanel ? (
            <button
              type="button"
              onClick={() => {
                setShowSkillPanel(true);
                setTimeout(() => skillSearchRef.current?.focus(), 100);
              }}
              className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg border border-dashed border-[#E9E9E7] text-[13px] text-[#9B9A97] hover:border-[#E9E9E7] hover:text-[#37352F] hover:bg-[#F7F6F3]/50 transition-all duration-150"
            >
              <Plus size={14} />
              Add skills...
            </button>
          ) : (
            <div
              className="rounded-lg border border-[#E9E9E7] overflow-hidden"
              style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
            >
              {/* Search + Filter bar */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-[#E9E9E7] bg-[#F7F6F3]/50">
                <Search size={14} className="text-[#9B9A97] shrink-0" />
                <input
                  ref={skillSearchRef}
                  type="text"
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  placeholder="Search skills..."
                  className="flex-1 text-[13px] text-[#37352F] bg-transparent outline-none placeholder:text-[#D3D1CB]"
                />
                {/* Category filters */}
                <div className="flex gap-1">
                  {(
                    [
                      { key: "all", label: "All" },
                      { key: "hard_skill", label: "Hard" },
                      { key: "soft_skill", label: "Soft" },
                    ] as const
                  ).map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setActiveCategory(cat.key)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        activeCategory === cat.key
                          ? "bg-[#37352F] text-white"
                          : "text-[#9B9A97] hover:text-[#37352F]"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowSkillPanel(false);
                    setSkillSearch("");
                  }}
                  className="p-1 rounded text-[#9B9A97] hover:text-[#37352F] transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Suggestions list */}
              <div className="max-h-[240px] overflow-y-auto">
                {loadingSkills ? (
                  <div className="px-3 py-8 text-center">
                    <div className="w-5 h-5 border-2 border-[#E9E9E7] border-t-blue-500 rounded-full animate-spin mx-auto" />
                  </div>
                ) : filteredSuggestions.length === 0 ? (
                  <div className="px-3 py-6 text-center text-[12px] text-[#9B9A97]">
                    {skillSearch
                      ? "No matching skills. Press Enter below to add a custom one."
                      : "No skills available for this category."}
                  </div>
                ) : (
                  filteredSuggestions.map((s) => {
                    const added = isSkillAdded(s.name);
                    return (
                      <button
                        key={s.name}
                        type="button"
                        disabled={added}
                        onClick={() => addSkill(s.name, s.category)}
                        className={`flex items-center gap-3 w-full px-3 py-2 text-left transition-colors ${
                          added
                            ? "opacity-40 cursor-default"
                            : "hover:bg-[#F7F6F3] active:bg-[#F7F6F3]"
                        }`}
                      >
                        {/* Category dot */}
                        <div
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{
                            background:
                              s.category === "hard_skill"
                                ? "#2563EB"
                                : "#8B5CF6",
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[13px] font-medium text-[#37352F]">
                            {s.name}
                          </span>
                          {s.description && (
                            <p className="text-[11px] text-[#9B9A97] truncate mt-0.5">
                              {s.description}
                            </p>
                          )}
                        </div>
                        {added ? (
                          <Check size={14} className="text-emerald-500 shrink-0" />
                        ) : (
                          <Plus
                            size={14}
                            className="text-[#D3D1CB] shrink-0 group-hover:text-[#9B9A97]"
                          />
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Custom skill input */}
              <div className="flex items-center gap-2 px-3 py-2 border-t border-[#E9E9E7] bg-[#F7F6F3]/30">
                <Sparkles size={13} className="text-[#D3D1CB] shrink-0" />
                <input
                  ref={customInputRef}
                  type="text"
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  onKeyDown={handleAddCustom}
                  placeholder="Type a custom skill and press Enter"
                  className="flex-1 text-[12px] text-[#37352F] bg-transparent outline-none placeholder:text-[#D3D1CB]"
                />
                {customSkillInput.trim() && (
                  <select
                    value={customSkillLevel}
                    onChange={(e) => setCustomSkillLevel(e.target.value as SkillRequirement["level"])}
                    className="text-[10px] border border-[#E9E9E7] rounded px-1 py-0.5 bg-white text-[#37352F]"
                  >
                    <option value="basic">Basic</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                )}
                {customSkillInput.trim() && (
                  <span className="text-[10px] text-[#D3D1CB]">
                    ⏎ Enter
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ── Legend ── */}
          {skills.length > 0 && (
            <div className="flex items-center gap-4 mt-3 px-1">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="text-[11px] text-[#9B9A97]">Hard skill</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                <span className="text-[11px] text-[#9B9A97]">Soft skill</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#9B9A97]" />
                <span className="text-[11px] text-[#9B9A97]">Custom</span>
              </div>
              <div className="flex-1" />
              <span className="text-[11px] text-[#D3D1CB]">
                Drag to reorder priority
              </span>
            </div>
          )}

          {/* ── AI Context Preview ── */}
          {skills.length >= 3 && (
            <div
              className="mt-4 rounded-lg px-3.5 py-3 transition-all duration-300"
              style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}
            >
              <div className="flex items-start gap-2">
                <Zap size={14} className="text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[12px] font-medium text-blue-800">
                    AI Interview Context Active
                  </p>
                  <p className="text-[11px] text-blue-600 mt-0.5 leading-relaxed">
                    The AI interviewer will use {industryData?.industry?.label} domain expertise to assess{" "}
                    {skills.filter((s) => s.category === "hard_skill").length} hard skill
                    {skills.filter((s) => s.category === "hard_skill").length !== 1 ? "s" : ""} and{" "}
                    {skills.filter((s) => s.category === "soft_skill").length} soft skill
                    {skills.filter((s) => s.category === "soft_skill").length !== 1 ? "s" : ""} with
                    industry-specific rubrics and terminology.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────
// LEVEL PICKER — Notion-style inline dropdown
// ────────────────────────────────────────────────────────

function LevelPicker({
  value,
  onChange,
}: {
  value: SkillRequirement["level"];
  onChange: (v: SkillRequirement["level"]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LEVELS.find((l) => l.value === value) || LEVELS[1];

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border transition-all duration-100 hover:border-[#E9E9E7]"
        style={{
          borderColor: open ? current.color : "#E7E5E4",
          color: current.color,
          background: open ? `${current.color}08` : "transparent",
        }}
      >
        {current.label}
        <ChevronDown
          size={10}
          className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          style={{ color: current.color }}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-50 rounded-lg border border-[#E9E9E7] bg-white py-1 min-w-[130px]"
          style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
        >
          {LEVELS.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(level.value);
                setOpen(false);
              }}
              className={`flex items-center gap-2 w-full px-3 py-1.5 text-left text-[12px] transition-colors ${
                value === level.value
                  ? "bg-[#F7F6F3] font-medium"
                  : "hover:bg-[#F7F6F3]"
              }`}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: level.color }}
              />
              <span style={{ color: level.color }}>{level.label}</span>
              {value === level.value && (
                <Check size={12} className="ml-auto text-[#9B9A97]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
