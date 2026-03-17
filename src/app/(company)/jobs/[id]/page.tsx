"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";
import {
  Search,
  ChevronUp,
  ChevronDown,
  X,
  ChevronRight,
  Users,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  Mic,
  Trophy,
  ArrowRight,
} from "lucide-react";
import { ShareShortlistButton } from "./share-shortlist-button";

interface JobData {
  id: string;
  title: string;
  description: string;
  department: string | null;
  location: string | null;
  employment_type: string;
  status: string;
  created_at: string;
  applicant_count: number;
  stage_counts: Record<string, number>;
  avg_score: number | null;
  pass_rate: number | null;
  passed_count: number;
  interviewing_count: number;
  avg_interview_score: number | null;
  interview_completion_rate: number | null;
}

interface CandidateRow {
  id: string;
  application_id: string;
  name: string;
  email: string;
  job_title: string;
  ats_score: number | null;
  interview_score: number | null;
  interview_recommendation: string | null;
  status: string;
  ai_summary: string | null;
  applied_at: string;
}

function combinedScore(ats: number | null, iv: number | null): number | null {
  if (ats != null && iv != null) return Math.round(ats * 0.4 + iv * 0.6);
  return iv ?? ats ?? null;
}

function recLabel(rec: string): string {
  switch (rec) {
    case "strong_hire": return "Strong Hire";
    case "hire": return "Hire";
    case "maybe": return "Maybe";
    case "no_hire": return "No Hire";
    case "strong_no_hire": return "Strong No";
    default: return rec;
  }
}

function recColor(rec: string): string {
  switch (rec) {
    case "strong_hire": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "hire": return "bg-green-50 text-green-700 border-green-200";
    case "maybe": return "bg-amber-50 text-amber-700 border-amber-200";
    case "no_hire": return "bg-red-50 text-red-600 border-red-200";
    case "strong_no_hire": return "bg-red-100 text-red-700 border-red-300";
    default: return "bg-[#F7F6F3] text-[#9B9A97] border-[#E9E9E7]";
  }
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function stageLabel(stage: string): string {
  switch (stage) {
    case "applied":
    case "pending_review":
      return "New";
    case "stage_1_passed":
      return "Passed";
    case "interview_invited":
      return "Interviewing";
    case "interview_completed":
      return "Interviewed";
    case "hired":
      return "Shortlisted";
    case "rejected":
    case "stage_1_failed":
      return "Rejected";
    default:
      return "New";
  }
}

function stagePill(stage: string): string {
  switch (stage) {
    case "stage_1_passed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "interview_invited":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "interview_completed":
      return "bg-cyan-50 text-cyan-700 border-cyan-200";
    case "hired":
      return "bg-green-50 text-green-700 border-green-200";
    case "rejected":
    case "stage_1_failed":
      return "bg-red-50 text-red-600 border-red-200";
    default:
      return "bg-[#F7F6F3] text-[#37352F] border-[#E9E9E7]";
  }
}

function scoreColor(score: number | null): string {
  if (score == null) return "text-[#9B9A97]";
  if (score >= 60) return "text-emerald-600";
  if (score >= 40) return "text-[#2383E2]";
  return "text-red-600";
}

const TYPE_LABELS: Record<string, string> = {
  full_time: "Full-time",
  contract: "Contract",
  part_time: "Part-time",
};

const STATUS_OPTIONS = [
  { value: "applied", label: "New" },
  { value: "stage_1_passed", label: "Passed" },
  { value: "interview_invited", label: "Interviewing" },
  { value: "interview_completed", label: "Interviewed" },
  { value: "hired", label: "Shortlisted" },
  { value: "rejected", label: "Rejected" },
];

const SCORE_OPTIONS = [
  { value: "", label: "All Scores" },
  { value: "60-100", label: "High (60+)" },
  { value: "40-59", label: "Medium (40-59)" },
  { value: "0-39", label: "Low (<40)" },
];

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [job, setJob] = useState<JobData | null>(null);
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [descExpanded, setDescExpanded] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [scoreFilter, setScoreFilter] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  // Bulk
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const [statusOpen, setStatusOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Fetch job data
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/jobs/${id}`);
        const data = await res.json();
        if (res.ok) setJob(data.job);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Fetch candidates for this job
  const fetchCandidates = useCallback(async () => {
    setTableLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("job_id", id);
      if (search) params.set("search", search);
      if (statusFilter.length > 0)
        params.set("status", statusFilter.join(","));
      if (scoreFilter) {
        const [min, max] = scoreFilter.split("-");
        if (min) params.set("min_score", min);
        if (max) params.set("max_score", max);
      }
      params.set("sort", sortField);
      params.set("order", sortOrder);
      params.set("page", String(page));

      const res = await fetch(`/api/candidates?${params.toString()}`);
      const data = await res.json();
      setCandidates(data.candidates || []);
      setTotal(data.total ?? 0);
    } catch {
      // silent
    } finally {
      setTableLoading(false);
    }
  }, [id, search, statusFilter, scoreFilter, sortField, sortOrder, page]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
    }, 300);
  };

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field)
      return (
        <span className="text-[#D3D1CB] ml-1 inline-flex flex-col leading-none">
          <ChevronUp size={10} />
          <ChevronDown size={10} className="-mt-0.5" />
        </span>
      );
    return sortOrder === "asc" ? (
      <ChevronUp size={12} className="text-[#2383E2] ml-1" />
    ) : (
      <ChevronDown size={12} className="text-[#2383E2] ml-1" />
    );
  };

  const toggleSelect = (appId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) next.delete(appId);
      else next.add(appId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === candidates.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(candidates.map((c) => c.application_id)));
    }
  };

  const handleBulkReject = async () => {
    if (!confirm(`Reject ${selected.size} candidates?`)) return;
    setBulkLoading(true);
    for (const appId of selected) {
      try {
        await fetch(`/api/dashboard/applications/${appId}/reject`, { method: "POST" });
        await fetch(`/api/dashboard/applications/${appId}/notify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "rejection" }),
        });
      } catch { /* continue */ }
    }
    setSelected(new Set());
    setBulkLoading(false);
    fetchCandidates();
  };

  const handleBulkAdvance = async () => {
    setBulkLoading(true);
    for (const appId of selected) {
      try {
        await fetch(`/api/dashboard/applications/${appId}/advance`, { method: "POST" });
        await fetch(`/api/dashboard/applications/${appId}/notify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "acceptance" }),
        });
      } catch { /* continue */ }
    }
    setSelected(new Set());
    setBulkLoading(false);
    fetchCandidates();
  };

  const hasFilters = search || statusFilter.length > 0 || scoreFilter;
  const totalPages = Math.ceil(total / 20);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-[#F7F6F3] rounded w-48 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border border-[#E9E9E7] rounded-lg p-4 animate-pulse">
              <div className="h-3 bg-[#F7F6F3] rounded w-20 mb-3" />
              <div className="h-6 bg-[#F7F6F3] rounded w-12" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-16 text-[#9B9A97]">Job not found</div>
    );
  }

  const metrics = [
    { label: "Applicants", value: job.applicant_count, icon: Users },
    { label: "Pass Rate", value: job.pass_rate != null ? `${job.pass_rate}%` : "--", icon: TrendingUp },
    { label: "Avg ATS Score", value: job.avg_score ?? "--", icon: BarChart3 },
    { label: "Passed ATS", value: job.passed_count, icon: CheckCircle2 },
    { label: "Avg Interview", value: job.avg_interview_score ?? "--", icon: Mic },
    { label: "IV Completion", value: job.interview_completion_rate != null ? `${job.interview_completion_rate}%` : "--", icon: CheckCircle2 },
  ];

  // Build shortlist — top 5 candidates ranked by combined score
  const shortlist = candidates
    .map((c) => ({ ...c, combined: combinedScore(c.ats_score, c.interview_score) }))
    .filter((c) => c.combined != null && c.combined > 0)
    .sort((a, b) => (b.combined ?? 0) - (a.combined ?? 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/jobs"
        className="inline-flex items-center text-[13px] text-[#9B9A97] hover:text-[#2383E2] transition-colors"
      >
        <span className="mr-1">&larr;</span> Back to Jobs
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#37352F] leading-tight">
            {job.title}
          </h1>
          <div className="flex items-center gap-1.5 mt-1 text-[13px] text-[#9B9A97]">
            {job.department && <span>{job.department}</span>}
            {job.department && job.location && (
              <span className="text-[#D3D1CB]">&middot;</span>
            )}
            {job.location && <span>{job.location}</span>}
            {(job.department || job.location) && (
              <span className="text-[#D3D1CB]">&middot;</span>
            )}
            <span>
              {TYPE_LABELS[job.employment_type] || job.employment_type}
            </span>
            <span className="text-[#D3D1CB]">&middot;</span>
            <span className="capitalize">{job.status}</span>
          </div>
          <div className="text-[12px] text-[#9B9A97] mt-1">
            Created {relativeTime(job.created_at)} &middot;{" "}
            {job.applicant_count} applicant
            {job.applicant_count !== 1 ? "s" : ""}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {shortlist.length >= 2 && (
            <>
              <ShareShortlistButton
                applicationIds={shortlist.map(c => c.application_id)}
                jobId={id}
                jobTitle={job.title}
              />
              <Link
                href={`/jobs/${id}/compare`}
                className="px-4 py-2 rounded-lg text-[13px] font-medium bg-[#2383E2] text-white hover:bg-[#1b6ec2] transition-colors flex items-center gap-1.5"
              >
                <Trophy size={14} />
                Compare Top {shortlist.length}
              </Link>
            </>
          )}
          <Link
            href={`/jobs/${id}/edit`}
            className="px-4 py-2 rounded-lg text-[13px] font-medium border border-[#E9E9E7] text-[#37352F] hover:bg-[#F7F6F3] transition-colors"
          >
            Edit Job
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="bg-white border border-[#E9E9E7] rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] text-[#9B9A97]">
                  {metric.label}
                </span>
                <Icon size={14} className="text-[#D3D1CB]" />
              </div>
              <div className="text-[24px] font-bold text-[#37352F] leading-none">
                {metric.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pipeline Funnel */}
      {job.applicant_count > 0 && (() => {
        const stages = [
          { key: "applied", label: "Applied", count: (job.stage_counts.applied || 0) + (job.stage_counts.pending_review || 0) },
          { key: "passed", label: "Passed ATS", count: job.stage_counts.stage_1_passed || 0 },
          { key: "interviewing", label: "Interviewing", count: (job.stage_counts.interview_invited || 0) },
          { key: "interviewed", label: "Interviewed", count: job.stage_counts.interview_completed || 0 },
          { key: "hired", label: "Shortlisted", count: job.stage_counts.hired || 0 },
        ];
        const maxCount = Math.max(...stages.map(s => s.count), 1);
        return (
          <div className="bg-white border border-[#E9E9E7] rounded-lg p-5">
            <h3 className="text-[13px] font-semibold text-[#37352F] mb-4">Pipeline</h3>
            <div className="flex items-end gap-2 h-16">
              {stages.map((stage) => {
                const pct = Math.max((stage.count / maxCount) * 100, 4);
                return (
                  <div key={stage.key} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[11px] font-medium text-[#37352F] tabular-nums">{stage.count}</span>
                    <div
                      className="w-full rounded-sm bg-[#2383E2]/15 transition-all"
                      style={{ height: `${pct}%`, minHeight: "3px" }}
                    />
                    <span className="text-[10px] text-[#9B9A97] text-center leading-tight">{stage.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Shortlist — Top Candidates */}
      {shortlist.length > 0 && (
        <div className="bg-white border border-[#E9E9E7] rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E9E9E7] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy size={15} className="text-amber-500" />
              <h3 className="text-[14px] font-semibold text-[#37352F]">Top Candidates</h3>
              <span className="text-[11px] text-[#9B9A97]">Ranked by combined ATS + Interview score</span>
            </div>
          </div>
          <div className="divide-y divide-[#E9E9E7]">
            {shortlist.map((c, idx) => (
              <button
                key={c.application_id}
                onClick={() => router.push(`/candidates/${c.id}`)}
                className="w-full px-5 py-3.5 flex items-center gap-4 hover:bg-[#F7F6F3]/50 transition-colors text-left"
              >
                {/* Rank */}
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                  idx === 0 ? "bg-amber-100 text-amber-700" : idx === 1 ? "bg-gray-100 text-gray-600" : idx === 2 ? "bg-orange-50 text-orange-600" : "bg-[#F7F6F3] text-[#9B9A97]"
                }`}>
                  {idx + 1}
                </span>

                {/* Name & email */}
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-[#37352F] truncate">{c.name}</div>
                  <div className="text-[11px] text-[#9B9A97] truncate">{c.email}</div>
                </div>

                {/* Combined score */}
                <div className="text-center shrink-0 w-16">
                  <div className={`text-[18px] font-bold tabular-nums ${
                    (c.combined ?? 0) >= 70 ? "text-emerald-600" : (c.combined ?? 0) >= 50 ? "text-[#2383E2]" : "text-[#37352F]"
                  }`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {c.combined}
                  </div>
                  <div className="text-[9px] text-[#9B9A97] uppercase tracking-wide">Combined</div>
                </div>

                {/* ATS score */}
                <div className="text-center shrink-0 w-12">
                  <div className="text-[13px] font-medium text-[#9B9A97] tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {c.ats_score ?? "--"}
                  </div>
                  <div className="text-[9px] text-[#D3D1CB] uppercase tracking-wide">ATS</div>
                </div>

                {/* Interview score */}
                <div className="text-center shrink-0 w-12">
                  <div className="text-[13px] font-medium text-[#9B9A97] tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {c.interview_score ?? "--"}
                  </div>
                  <div className="text-[9px] text-[#D3D1CB] uppercase tracking-wide">IV</div>
                </div>

                {/* Recommendation */}
                {c.interview_recommendation && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border shrink-0 ${recColor(c.interview_recommendation)}`}>
                    {recLabel(c.interview_recommendation)}
                  </span>
                )}

                {/* Status */}
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border shrink-0 ${stagePill(c.status)}`}>
                  {stageLabel(c.status)}
                </span>

                <ArrowRight size={14} className="text-[#D3D1CB] shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Candidates section header */}
      <h2 className="text-[16px] font-semibold text-[#37352F]">All Candidates</h2>

      {/* Filters */}
      <div className="bg-white border border-[#E9E9E7] rounded-lg p-4 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9A97]"
          />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-[#E9E9E7] bg-white text-[13px] text-[#37352F] placeholder:text-[#9B9A97] focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2]"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setStatusOpen(!statusOpen)}
            className="px-3 py-2 rounded-lg border border-[#E9E9E7] bg-white text-[13px] text-[#37352F] hover:bg-[#F7F6F3] transition-colors"
          >
            Status{statusFilter.length > 0 ? ` (${statusFilter.length})` : ""}
          </button>
          {statusOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setStatusOpen(false)} />
              <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-[#E9E9E7] rounded-lg shadow-lg py-1 min-w-[180px]">
                {STATUS_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#F7F6F3] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={statusFilter.includes(opt.value)}
                      onChange={() => {
                        setStatusFilter((prev) =>
                          prev.includes(opt.value)
                            ? prev.filter((s) => s !== opt.value)
                            : [...prev, opt.value]
                        );
                        setPage(1);
                      }}
                      className="rounded border-[#E9E9E7]"
                    />
                    <span className="text-[13px] text-[#37352F]">{opt.label}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        <select
          value={scoreFilter}
          onChange={(e) => { setScoreFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-[#E9E9E7] bg-white text-[13px] text-[#37352F] focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2]"
        >
          {SCORE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={() => { setSearch(""); setStatusFilter([]); setScoreFilter(""); setPage(1); }}
            className="text-[12px] text-[#2383E2] hover:text-[#2383E2] font-medium flex items-center gap-1"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div
        className="bg-white border border-[#E9E9E7] rounded-lg overflow-hidden"
      >
        {tableLoading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-[#2383E2] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : candidates.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-[14px] text-[#9B9A97]">
              {hasFilters ? "No candidates match your filters." : "No candidates for this job yet."}
            </p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="bg-[#F7F6F3]/80">
                  <th className="w-10 px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={candidates.length > 0 && selected.size === candidates.length}
                      onChange={toggleSelectAll}
                      className="rounded border-[#E9E9E7]"
                    />
                  </th>
                  <th className="text-left px-4 py-2.5">
                    <button
                      onClick={() => toggleSort("created_at")}
                      className="text-[11px] font-medium text-[#9B9A97] uppercase tracking-[0.04em] flex items-center hover:text-[#37352F]"
                    >
                      Name <SortIcon field="created_at" />
                    </button>
                  </th>
                  <th className="text-center px-4 py-2.5">
                    <button
                      onClick={() => toggleSort("match_score")}
                      className="text-[11px] font-medium text-[#9B9A97] uppercase tracking-[0.04em] flex items-center justify-center hover:text-[#37352F]"
                    >
                      ATS <SortIcon field="match_score" />
                    </button>
                  </th>
                  <th className="text-center px-4 py-2.5">
                    <span className="text-[11px] font-medium text-[#9B9A97] uppercase tracking-[0.04em]">Interview</span>
                  </th>
                  <th className="text-center px-4 py-2.5">
                    <span className="text-[11px] font-medium text-[#9B9A97] uppercase tracking-[0.04em]">Status</span>
                  </th>
                  <th className="text-left px-4 py-2.5 hidden xl:table-cell">
                    <span className="text-[11px] font-medium text-[#9B9A97] uppercase tracking-[0.04em]">AI Summary</span>
                  </th>
                  <th className="text-right px-4 py-2.5">
                    <button
                      onClick={() => toggleSort("created_at")}
                      className="text-[11px] font-medium text-[#9B9A97] uppercase tracking-[0.04em] flex items-center justify-end hover:text-[#37352F] ml-auto"
                    >
                      Applied <SortIcon field="created_at" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr key={c.application_id} className="border-t border-[#E9E9E7] hover:bg-[#F7F6F3]/50 transition-colors">
                    <td className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(c.application_id)}
                        onChange={() => toggleSelect(c.application_id)}
                        className="rounded border-[#E9E9E7]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => router.push(`/candidates/${c.id}`)} className="text-left hover:underline">
                        <div className="text-[14px] font-medium text-[#37352F]">{c.name}</div>
                        <div className="text-[11px] text-[#9B9A97] mt-0.5">{c.email}</div>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-[14px] font-medium tabular-nums ${scoreColor(c.ats_score)}`}
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {c.ats_score != null ? c.ats_score : "--"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.interview_score != null ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <span
                            className={`text-[14px] font-medium tabular-nums ${scoreColor(c.interview_score)}`}
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                          >
                            {c.interview_score}
                          </span>
                          {c.interview_recommendation && (
                            <span className={`inline-flex items-center px-1.5 py-0 rounded-full text-[9px] font-medium border ${recColor(c.interview_recommendation)}`}>
                              {recLabel(c.interview_recommendation)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[12px] text-[#D3D1CB]">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${stagePill(c.status)}`}>
                        {stageLabel(c.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      {c.ai_summary ? (
                        <span className="text-[12px] text-[#9B9A97] block truncate max-w-[200px]" title={c.ai_summary}>
                          {c.ai_summary.length > 60 ? c.ai_summary.slice(0, 60) + "..." : c.ai_summary}
                        </span>
                      ) : (
                        <span className="text-[12px] text-[#D3D1CB]">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[13px] text-[#9B9A97]">{relativeTime(c.applied_at)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-5 py-3 border-t border-[#E9E9E7] flex items-center justify-between">
              <span className="text-[12px] text-[#9B9A97]">
                Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} of {total}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded text-[12px] font-medium border border-[#E9E9E7] text-[#37352F] hover:bg-[#F7F6F3] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Prev
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded text-[12px] font-medium transition-colors ${page === i + 1 ? "bg-blue-50 text-[#2383E2] border border-blue-200" : "text-[#37352F] hover:bg-[#F7F6F3]"}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1 rounded text-[12px] font-medium border border-[#E9E9E7] text-[#37352F] hover:bg-[#F7F6F3] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Job Description (collapsible) */}
      <div className="bg-white border border-[#E9E9E7] rounded-lg overflow-hidden">
        <button
          onClick={() => setDescExpanded(!descExpanded)}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#F7F6F3] transition-colors"
        >
          <h3 className="text-[14px] font-semibold text-[#37352F]">
            Job Description
          </h3>
          <ChevronRight
            size={16}
            className={`text-[#9B9A97] transition-transform ${descExpanded ? "rotate-90" : ""}`}
          />
        </button>
        {descExpanded && (
          <div className="px-5 pb-5 border-t border-[#E9E9E7] pt-4">
            <p className="text-[14px] text-[#37352F] whitespace-pre-wrap leading-relaxed">
              {job.description}
            </p>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#37352F] text-white rounded-lg px-6 py-3 flex items-center gap-4 shadow-xl">
          <span className="text-[13px] font-medium">{selected.size} selected</span>
          <div className="w-px h-5 bg-[#73726E]" />
          <button
            onClick={handleBulkReject}
            disabled={bulkLoading}
            className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            Reject
          </button>
          <button
            onClick={handleBulkAdvance}
            disabled={bulkLoading}
            className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            Advance
          </button>
          <button onClick={() => setSelected(new Set())} className="p-1 rounded hover:bg-[#73726E] transition-colors">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
