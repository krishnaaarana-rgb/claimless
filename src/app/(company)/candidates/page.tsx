"use client";

import { useState, useEffect, useCallback, useRef, useTransition } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronUp,
  ChevronDown,
  X,
  Download,
  MoreHorizontal,
  ExternalLink,
  Mail,
  FileText,
  UserCheck,
  MessageSquare,
  Mic,
  Copy,
  XCircle,
  RefreshCw,
  Clipboard,
} from "lucide-react";
import { useToast } from "@/components/toast";

/* ─── Types ─── */
interface CandidateRow {
  id: string;
  application_id: string;
  name: string;
  email: string;
  job_title: string;
  job_id: string;
  department: string | null;
  ats_score: number | null;
  status: string;
  ai_summary: string | null;
  applied_at: string;
  linkedin_url: string | null;
  github_username: string | null;
  portfolio_url: string | null;
  phone: string | null;
  has_resume: boolean;
  resume_text_preview: string | null;
  email_status: string | null;
  interview_status: string | null;
  interview_score: number | null;
  interview_recommendation: string | null;
}

interface JobOption {
  id: string;
  title: string;
  applicant_count?: number;
}

/* ─── Helpers ─── */
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
    case "screening":
      return "Screening";
    case "stage_1_passed":
      return "Passed";
    case "interview_invited":
      return "Interviewing";
    case "interview_completed":
      return "Interviewed";
    case "hired":
      return "Hired";
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
    case "pending_review":
    case "screening":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    default:
      return "bg-[#F7F6F3] text-[#37352F] border-[#E9E9E7]";
  }
}

function stageDot(stage: string): string {
  switch (stage) {
    case "stage_1_passed": return "bg-emerald-500";
    case "interview_invited": return "bg-blue-500";
    case "interview_completed": return "bg-cyan-500";
    case "hired": return "bg-green-500";
    case "rejected": return "bg-red-500";
    default: return "bg-[#9B9A97]";
  }
}

function stageChangeMessage(stage: string): string {
  switch (stage) {
    case "interview_invited": return "This will send an acceptance email with an interview link.";
    case "rejected": return "This will send a rejection email to the candidate.";
    case "hired": return "This will mark the candidate as hired.";
    case "interview_completed": return "This will mark the interview as completed.";
    default: return "This will update the candidate's stage. No email will be sent.";
  }
}

/* Improvement 3: Score as colored pill */
function scorePill(score: number | null): { text: string; bg: string } {
  if (score == null) return { text: "text-[#9B9A97]", bg: "" };
  if (score >= 70) return { text: "text-[#059669]", bg: "bg-[#ECFDF5]" };
  if (score >= 40) return { text: "text-[#2383E2]", bg: "bg-[#FEF3C7]" };
  return { text: "text-[#DC2626]", bg: "bg-[#FEF2F2]" };
}

/* Fix 1: Resume text cleanup */
function cleanResumeText(text: string): string {
  // Fix spaced-out text like "K R I S H N A" -> "KRISHNA"
  let cleaned = text
    .split("\n")
    .map((line) => {
      // Detect lines where most chars are single-spaced letters
      const singleSpaced = line.match(/^([A-Za-z] ){3,}/);
      if (singleSpaced) {
        return line.replace(/ (?=[A-Za-z](?:\s|$))/g, "");
      }
      return line;
    })
    .join("\n");
  // More aggressive: fix remaining spaced-out sequences
  cleaned = cleaned.replace(
    /\b([A-Z]) ([A-Z]) ([A-Z])(?: ([A-Z]))*/g,
    (match) => match.replace(/ /g, "")
  );
  // Clean up excessive whitespace
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
  return cleaned.trim();
}

/* Fix 1: Detect all-caps section headers for bold display */
function formatResumeLines(text: string): ReactNode[] {
  const cleaned = cleanResumeText(text);
  return cleaned.split("\n").map((line, i) => {
    const isHeader = /^[A-Z][A-Z\s&/,]{2,}$/.test(line.trim()) && line.trim().length > 2;
    if (isHeader) {
      return (
        <div key={i} className="font-bold text-[#37352F] mt-3 mb-1 text-[13px]">
          {line}
        </div>
      );
    }
    return (
      <div key={i} className="text-[12px] text-[#37352F] leading-relaxed">
        {line || "\u00A0"}
      </div>
    );
  });
}

const STATUS_OPTIONS = [
  { value: "applied", label: "New" },
  { value: "stage_1_passed", label: "Passed" },
  { value: "interview_invited", label: "Interviewing" },
  { value: "interview_completed", label: "Interviewed" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
];

const SCORE_OPTIONS = [
  { value: "", label: "All Scores" },
  { value: "70-100", label: "High (70+)" },
  { value: "40-69", label: "Medium (40-69)" },
  { value: "0-39", label: "Low (<40)" },
];

const STAGE_MOVES = [
  { value: "applied", label: "New" },
  { value: "stage_1_passed", label: "Passed ATS" },
  { value: "interview_invited", label: "Interview Invited" },
  { value: "interview_completed", label: "Interviewed" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
];

/* ─── Social Icons (inline SVGs) ─── */
function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

/* ─── Modal Components ─── */
function ModalOverlay({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {children}
    </div>
  );
}

function EmailModal({
  candidate,
  onClose,
  onSent,
}: {
  candidate: CandidateRow;
  onClose: () => void;
  onSent: () => void;
}) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/candidates/${candidate.id}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          message,
          application_id: candidate.application_id,
        }),
      });
      if (res.ok) onSent();
    } catch {
      // handled by toast
    } finally {
      setSending(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg p-6">
        <h3 className="text-[16px] font-semibold text-[#37352F] mb-1">
          Send Email
        </h3>
        <p className="text-[13px] text-[#9B9A97] mb-4">
          To: {candidate.name} ({candidate.email})
        </p>
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-[#E9E9E7] bg-white text-[13px] text-[#37352F] placeholder:text-[#9B9A97] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 mb-3"
        />
        <textarea
          placeholder="Message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 rounded-lg border border-[#E9E9E7] bg-white text-[13px] text-[#37352F] placeholder:text-[#9B9A97] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 mb-4 resize-none"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[13px] font-medium border border-[#E9E9E7] text-[#37352F] hover:bg-[#F7F6F3] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !subject.trim() || !message.trim()}
            className="px-4 py-2 rounded-lg text-[13px] font-medium text-white transition-colors disabled:opacity-50"
            style={{ background: "#2383E2" }}
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

function NoteModal({
  candidate,
  onClose,
  onSaved,
}: {
  candidate: CandidateRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/candidates/${candidate.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          application_id: candidate.application_id,
        }),
      });
      if (res.ok) onSaved();
    } catch {
      // handled by toast
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg p-6">
        <h3 className="text-[16px] font-semibold text-[#37352F] mb-1">
          Add Note
        </h3>
        <p className="text-[13px] text-[#9B9A97] mb-4">
          Internal note for {candidate.name}
        </p>
        <textarea
          placeholder="Write your note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 rounded-lg border border-[#E9E9E7] bg-white text-[13px] text-[#37352F] placeholder:text-[#9B9A97] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 mb-4 resize-none"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[13px] font-medium border border-[#E9E9E7] text-[#37352F] hover:bg-[#F7F6F3] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !content.trim()}
            className="px-4 py-2 rounded-lg text-[13px] font-medium text-white transition-colors disabled:opacity-50"
            style={{ background: "#2383E2" }}
          >
            {saving ? "Saving..." : "Save Note"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

/* Fix 1: Improved Resume Modal */
function ResumeModal({
  candidate,
  onClose,
}: {
  candidate: CandidateRow;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (candidate.resume_text_preview) {
      navigator.clipboard.writeText(
        cleanResumeText(candidate.resume_text_preview)
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[16px] font-semibold text-[#37352F]">
              Resume Preview
            </h3>
            <p className="text-[13px] text-[#9B9A97] mt-0.5">
              {candidate.name}
            </p>
          </div>
          {candidate.resume_text_preview && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border border-[#E9E9E7] text-[#37352F] hover:bg-[#F7F6F3] transition-colors"
            >
              <Clipboard size={12} />
              {copied ? "Copied!" : "Copy"}
            </button>
          )}
        </div>
        <div
          className="bg-[#F7F6F3] border border-[#E9E9E7] rounded-lg p-5 overflow-y-auto"
          style={{ maxHeight: "70vh", fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
        >
          {candidate.resume_text_preview ? (
            <>
              {formatResumeLines(candidate.resume_text_preview)}
              {candidate.resume_text_preview.length >= 200 && (
                <p className="text-[11px] text-[#9B9A97] mt-4 pt-3 border-t border-[#E9E9E7]">
                  Preview truncated. View full profile for complete resume.
                </p>
              )}
            </>
          ) : (
            <p className="text-[13px] text-[#9B9A97]">
              No resume text available. View full profile for details.
            </p>
          )}
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[13px] font-medium border border-[#E9E9E7] text-[#37352F] hover:bg-[#F7F6F3] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

/* ─── Smart Dropdown (opens up when near bottom) ─── */
function StageDropdown({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [openUp, setOpenUp] = useState(false);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.parentElement?.getBoundingClientRect();
      if (rect) {
        const spaceBelow = window.innerHeight - rect.bottom;
        setOpenUp(spaceBelow < 250);
      }
    }
  }, []);

  return (
    <div
      ref={ref}
      className={`absolute left-1/2 -translate-x-1/2 z-20 bg-white border border-[#E9E9E7] rounded-lg shadow-lg py-1 min-w-[170px] ${
        openUp ? "bottom-full mb-1" : "top-full mt-1"
      }`}
    >
      {children}
    </div>
  );
}

/* ─── Main Component ─── */
export default function CandidatesPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<JobOption[]>([]);

  // Tab state (GHL-style: "all" or a job_id)
  const [activeTab, setActiveTab] = useState("all");

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [scoreFilter, setScoreFilter] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  // Bulk selection
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  // Dropdowns & Modals
  const [statusOpen, setStatusOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [stageMenu, setStageMenu] = useState<string | null>(null);
  const [emailModal, setEmailModal] = useState<CandidateRow | null>(null);
  const [noteModal, setNoteModal] = useState<CandidateRow | null>(null);
  const [resumeModal, setResumeModal] = useState<CandidateRow | null>(null);
  const [stagePillMenu, setStagePillMenu] = useState<string | null>(null);
  const [stageConfirm, setStageConfirm] = useState<{ candidate: CandidateRow; targetStage: string } | null>(null);
  const [stageConfirmLoading, setStageConfirmLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [navigatingRow, setNavigatingRow] = useState<string | null>(null);
  const rowClickLock = useRef(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Fetch jobs for tabs
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/jobs");
        const data = await res.json();
        setJobs(
          (data.jobs || []).map(
            (j: { id: string; title: string; applicant_count?: number }) => ({
              id: j.id,
              title: j.title,
              applicant_count: j.applicant_count ?? 0,
            })
          )
        );
      } catch {
        // silent
      }
    })();
  }, []);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (activeTab !== "all") params.set("job_id", activeTab);
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
      setLoading(false);
    }
  }, [search, activeTab, statusFilter, scoreFilter, sortField, sortOrder, page]);

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
      <ChevronUp size={12} className="text-blue-600 ml-1" />
    ) : (
      <ChevronDown size={12} className="text-blue-600 ml-1" />
    );
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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

  const hasFilters = search || statusFilter.length > 0 || scoreFilter;

  const clearFilters = () => {
    setSearch("");
    setStatusFilter([]);
    setScoreFilter("");
    setPage(1);
  };

  const handleBulkReject = async () => {
    if (!confirm(`Reject ${selected.size} candidates? Rejection emails will be sent.`))
      return;
    setBulkLoading(true);
    const count = selected.size;
    for (const appId of selected) {
      try {
        await fetch(`/api/dashboard/applications/${appId}/reject`, { method: "POST" });
        await fetch(`/api/dashboard/applications/${appId}/notify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "rejection" }),
        });
      } catch {
        // continue
      }
    }
    setSelected(new Set());
    setBulkLoading(false);
    toast(`${count} candidates rejected`, "success");
    fetchCandidates();
  };

  const handleBulkAdvance = async () => {
    setBulkLoading(true);
    const count = selected.size;
    for (const appId of selected) {
      try {
        await fetch(`/api/dashboard/applications/${appId}/advance`, { method: "POST" });
        await fetch(`/api/dashboard/applications/${appId}/notify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "acceptance" }),
        });
      } catch {
        // continue
      }
    }
    setSelected(new Set());
    setBulkLoading(false);
    toast(`${count} candidates advanced`, "success");
    fetchCandidates();
  };

  const handleExportCSV = () => {
    const headers = [
      "Name", "Email", "Phone", "Job", "ATS Score", "Interview Score",
      "Interview Recommendation", "Combined Score", "Status", "LinkedIn",
      "GitHub", "Portfolio", "Applied",
    ];
    const rows = candidates.map((c) => {
      const combined = c.ats_score != null && c.interview_score != null
        ? Math.round(c.ats_score * 0.4 + c.interview_score * 0.6)
        : c.interview_score ?? c.ats_score ?? null;
      return [
        c.name, c.email, c.phone || "", c.job_title,
        c.ats_score != null ? String(c.ats_score) : "",
        c.interview_score != null ? String(c.interview_score) : "",
        c.interview_recommendation || "",
        combined != null ? String(combined) : "",
        stageLabel(c.status),
        c.linkedin_url || "", c.github_username ? `github.com/${c.github_username}` : "",
        c.portfolio_url || "", c.applied_at,
      ];
    });
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "candidates.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleMoveStage = async (candidate: CandidateRow, newStage: string) => {
    setOpenMenu(null);
    setStageMenu(null);
    try {
      const res = await fetch(`/api/candidates/${candidate.id}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage, application_id: candidate.application_id }),
      });
      if (res.ok) {
        toast(`${candidate.name} moved to ${stageLabel(newStage)}`, "success");
        fetchCandidates();
      } else {
        toast("Failed to update stage", "error");
      }
    } catch {
      toast("Failed to update stage", "error");
    }
  };

  const handleRescreen = async (candidate: CandidateRow) => {
    setOpenMenu(null);
    try {
      const res = await fetch(
        `/api/dashboard/applications/${candidate.application_id}/screen`,
        { method: "POST" }
      );
      if (res.ok) {
        toast(`Re-screening ${candidate.name}...`, "info");
        fetchCandidates();
      } else {
        toast("Failed to start re-screening", "error");
      }
    } catch {
      toast("Failed to start re-screening", "error");
    }
  };

  const handleReject = async (candidate: CandidateRow) => {
    setOpenMenu(null);
    if (!confirm(`Reject ${candidate.name}? A rejection email will be sent.`)) return;
    try {
      await fetch(`/api/dashboard/applications/${candidate.application_id}/reject`, { method: "POST" });
      await fetch(`/api/dashboard/applications/${candidate.application_id}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "rejection" }),
      });
      toast(`${candidate.name} rejected`, "success");
      fetchCandidates();
    } catch {
      toast("Failed to reject candidate", "error");
    }
  };

  const handleCopyLink = (candidate: CandidateRow) => {
    const url = `${window.location.origin}/candidates/${candidate.id}`;
    navigator.clipboard.writeText(url);
    setOpenMenu(null);
    toast("Profile link copied", "info");
  };

  const handleInviteInterview = async (candidate: CandidateRow) => {
    setOpenMenu(null);
    try {
      const res = await fetch(`/api/candidates/${candidate.id}/invite`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        toast(data.error || "Failed to invite", "error");
        return;
      }
      const data = await res.json();
      await navigator.clipboard.writeText(data.interview_url);
      if (data.already_existed) {
        toast("Interview link copied!", "success");
      } else {
        toast("Interview invite sent and link copied!", "success");
        fetchCandidates();
      }
    } catch {
      toast("Failed to invite to interview", "error");
    }
  };

  /* Improvement 1: Row click handler with startTransition for smoother nav */
  const handleRowClick = (e: React.MouseEvent, candidate: CandidateRow) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("input[type=checkbox]") ||
      target.closest("a") ||
      target.closest("button") ||
      target.closest("[data-no-row-click]")
    ) {
      return;
    }
    if (rowClickLock.current) return;
    rowClickLock.current = true;
    setNavigatingRow(candidate.application_id);
    startTransition(() => {
      router.push(`/candidates/${candidate.id}`);
    });
    setTimeout(() => { rowClickLock.current = false; }, 500);
  };
  void isPending;

  const totalPages = Math.ceil(total / 20);

  // Check if a candidate has any social links
  const hasSocialLinks = (c: CandidateRow) =>
    !!(c.linkedin_url || c.github_username || c.portfolio_url || c.has_resume);

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-[#37352F]">Candidates</h1>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium border border-[#E9E9E7] text-[#37352F] hover:bg-[#F7F6F3] transition-colors"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* ─── GHL-Style Tabs ─── */}
      <div className="border-b border-[#E9E9E7] mb-6 overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          <button
            onClick={() => { setActiveTab("all"); setPage(1); setSelected(new Set()); }}
            className={`relative px-4 py-2.5 text-[13px] font-medium transition-colors whitespace-nowrap ${
              activeTab === "all" ? "text-blue-700" : "text-[#9B9A97] hover:text-[#37352F]"
            }`}
          >
            All Candidates
            <span className={`ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full ${
              activeTab === "all" ? "bg-blue-100 text-blue-700" : "bg-[#F7F6F3] text-[#9B9A97]"
            }`}>
              {activeTab === "all"
                ? total
                : jobs.reduce((sum, j) => sum + (j.applicant_count || 0), 0) || total}
            </span>
            {activeTab === "all" && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-t" />
            )}
          </button>
          {jobs.map((job) => (
            <button
              key={job.id}
              onClick={() => { setActiveTab(job.id); setPage(1); setSelected(new Set()); }}
              className={`relative px-4 py-2.5 text-[13px] font-medium transition-colors whitespace-nowrap ${
                activeTab === job.id ? "text-blue-700" : "text-[#9B9A97] hover:text-[#37352F]"
              }`}
            >
              {job.title}
              <span className={`ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full ${
                activeTab === job.id ? "bg-blue-100 text-blue-700" : "bg-[#F7F6F3] text-[#9B9A97]"
              }`}>
                {job.applicant_count || 0}
              </span>
              {activeTab === job.id && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-t" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Filters Bar ─── */}
      <div className="bg-white border border-[#E9E9E7] rounded-lg p-4 flex items-center gap-3 flex-wrap mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9A97]" />
          <input
            type="text"
            placeholder="Search candidates..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-[#E9E9E7] bg-white text-[13px] text-[#37352F] placeholder:text-[#9B9A97] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Improvement 2: Status filter dropdown with Clear */}
        <div className="relative">
          <button
            onClick={() => setStatusOpen(!statusOpen)}
            className={`px-3 py-2 rounded-lg border bg-white text-[13px] text-[#37352F] focus:outline-none hover:bg-[#F7F6F3] transition-colors ${
              statusFilter.length > 0 ? "border-blue-300 bg-blue-50/50" : "border-[#E9E9E7]"
            }`}
          >
            Status{statusFilter.length > 0 ? ` (${statusFilter.length})` : ""}
          </button>
          {statusOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setStatusOpen(false)} />
              <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-[#E9E9E7] rounded-lg shadow-lg py-1 min-w-[180px]">
                {STATUS_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#F7F6F3] cursor-pointer"
                  >
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
                {statusFilter.length > 0 && (
                  <>
                    <div className="border-t border-[#E9E9E7] my-1" />
                    <button
                      onClick={() => { setStatusFilter([]); setPage(1); }}
                      className="w-full text-left px-3 py-1.5 text-[12px] text-blue-600 hover:bg-[#F7F6F3] font-medium"
                    >
                      Clear
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Score filter */}
        <select
          value={scoreFilter}
          onChange={(e) => { setScoreFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-[#E9E9E7] bg-white text-[13px] text-[#37352F] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          {SCORE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Clear all filters */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-[12px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <X size={12} />
            Clear filters
          </button>
        )}
      </div>

      {/* ─── Table ─── */}
      <div
        className="bg-white border border-[#E9E9E7] rounded-lg overflow-hidden"
      >
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : candidates.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-[14px] text-[#9B9A97]">
              {hasFilters
                ? "No candidates match your filters."
                : "No candidates yet. Share your job posting links to start receiving applications."}
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
                      Candidate
                      <SortIcon field="created_at" />
                    </button>
                  </th>
                  {activeTab === "all" && (
                    <th className="text-left px-4 py-2.5">
                      <span className="text-[11px] font-medium text-[#9B9A97] uppercase tracking-[0.04em]">
                        Job
                      </span>
                    </th>
                  )}
                  <th className="text-center px-4 py-2.5">
                    <button
                      onClick={() => toggleSort("match_score")}
                      className="text-[11px] font-medium text-[#9B9A97] uppercase tracking-[0.04em] flex items-center justify-center hover:text-[#37352F]"
                    >
                      Score
                      <SortIcon field="match_score" />
                    </button>
                  </th>
                  <th className="text-center px-4 py-2.5">
                    <span className="text-[11px] font-medium text-[#9B9A97] uppercase tracking-[0.04em]">
                      Interview
                    </span>
                  </th>
                  <th className="text-center px-4 py-2.5">
                    <span className="text-[11px] font-medium text-[#9B9A97] uppercase tracking-[0.04em]">
                      Status
                    </span>
                  </th>
                  {/* Fix 3: AI Summary column header */}
                  <th className="text-left px-4 py-2.5 hidden xl:table-cell">
                    <span className="text-[11px] font-medium text-[#9B9A97] uppercase tracking-[0.04em]">
                      AI Summary
                    </span>
                  </th>
                  <th className="text-right px-4 py-2.5">
                    <button
                      onClick={() => toggleSort("created_at")}
                      className="text-[11px] font-medium text-[#9B9A97] uppercase tracking-[0.04em] flex items-center justify-end hover:text-[#37352F] ml-auto"
                    >
                      Applied
                      <SortIcon field="created_at" />
                    </button>
                  </th>
                  <th className="w-10 px-2 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => {
                  const sp = scorePill(c.ats_score);
                  return (
                    <tr
                      key={c.application_id}
                      onClick={(e) => handleRowClick(e, c)}
                      className="border-t border-[#E9E9E7] transition-colors group cursor-pointer"
                      style={{ background: navigatingRow === c.application_id ? "#FEF3C7" : "transparent" }}
                      onMouseEnter={(e) => { if (navigatingRow !== c.application_id) e.currentTarget.style.background = "#F7F6F3"; }}
                      onMouseLeave={(e) => { if (navigatingRow !== c.application_id) e.currentTarget.style.background = "transparent"; }}
                    >
                      <td className="w-10 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(c.application_id)}
                          onChange={() => toggleSelect(c.application_id)}
                          className="rounded border-[#E9E9E7]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="text-[14px] font-medium text-[#37352F] hover:underline">
                              {c.name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[11px] text-[#9B9A97] truncate max-w-[180px]">
                                {c.email}
                              </span>
                              {c.phone && (
                                <>
                                  <span className="text-[#D3D1CB]">{"·"}</span>
                                  <span className="text-[11px] text-[#9B9A97]">{c.phone}</span>
                                </>
                              )}
                            </div>
                            {/* Fix 2: Social Icons - only render if candidate has links */}
                            {hasSocialLinks(c) && (
                              <div className="flex items-center mt-1" style={{ gap: "6px" }}>
                                {c.linkedin_url && (
                                  <a
                                    href={c.linkedin_url.startsWith("http") ? c.linkedin_url : `https://${c.linkedin_url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="LinkedIn"
                                    onClick={(e) => e.stopPropagation()}
                                    className="transition-transform duration-150 hover:scale-110"
                                    style={{ color: "#0A66C2" }}
                                  >
                                    <LinkedInIcon />
                                  </a>
                                )}
                                {c.github_username && (
                                  <a
                                    href={`https://github.com/${c.github_username}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="GitHub"
                                    onClick={(e) => e.stopPropagation()}
                                    className="transition-transform duration-150 hover:scale-110"
                                    style={{ color: "#37352F" }}
                                  >
                                    <GitHubIcon />
                                  </a>
                                )}
                                {c.portfolio_url && (
                                  <a
                                    href={c.portfolio_url.startsWith("http") ? c.portfolio_url : `https://${c.portfolio_url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Portfolio"
                                    onClick={(e) => e.stopPropagation()}
                                    className="transition-transform duration-150 hover:scale-110"
                                    style={{ color: "#2383E2" }}
                                  >
                                    <GlobeIcon />
                                  </a>
                                )}
                                {c.has_resume && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setResumeModal(c); }}
                                    title="Resume"
                                    className="transition-transform duration-150 hover:scale-110"
                                    style={{ color: "#059669" }}
                                  >
                                    <FileText size={14} />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      {activeTab === "all" && (
                        <td className="px-4 py-3">
                          <div className="text-[13px] text-[#37352F] truncate max-w-[160px]">
                            {c.job_title}
                          </div>
                          {c.department && (
                            <span className="text-[10px] text-[#9B9A97] bg-[#F7F6F3] px-1.5 py-0.5 rounded mt-0.5 inline-block">
                              {c.department}
                            </span>
                          )}
                        </td>
                      )}
                      {/* Improvement 3: Score as colored pill */}
                      <td className="px-4 py-3 text-center">
                        {c.ats_score != null ? (
                          <span
                            className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[13px] font-semibold tabular-nums ${sp.text} ${sp.bg}`}
                            style={{ fontFamily: "'JetBrains Mono', monospace", minWidth: "42px" }}
                          >
                            {c.ats_score}
                          </span>
                        ) : (
                          <span className="text-[13px] text-[#D3D1CB]">--</span>
                        )}
                      </td>
                      {/* Interview score column */}
                      <td className="px-4 py-3 text-center">
                        {c.interview_score != null ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <span
                              className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[13px] font-semibold tabular-nums ${scorePill(c.interview_score).text} ${scorePill(c.interview_score).bg}`}
                              style={{ fontFamily: "'JetBrains Mono', monospace", minWidth: "42px" }}
                            >
                              {c.interview_score}
                            </span>
                            {c.interview_recommendation && (
                              <span
                                className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full leading-none ${
                                  c.interview_recommendation === "strong_hire"
                                    ? "text-[#059669] bg-[#ECFDF5]"
                                    : c.interview_recommendation === "hire"
                                    ? "text-[#10B981] bg-[#ECFDF5]"
                                    : c.interview_recommendation === "maybe"
                                    ? "text-amber-700 bg-amber-50"
                                    : "text-[#DC2626] bg-[#FEF2F2]"
                                }`}
                              >
                                {c.interview_recommendation.replace(/_/g, " ")}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[13px] text-[#D3D1CB]">&mdash;</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center" data-no-row-click>
                        <div className="relative inline-block">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setStagePillMenu(stagePillMenu === c.application_id ? null : c.application_id);
                            }}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border cursor-pointer transition-all hover:shadow-sm hover:brightness-95 ${stagePill(c.status)}`}
                          >
                            {stageLabel(c.status)}
                            <ChevronDown size={10} className="opacity-0 group-hover:opacity-60 transition-opacity" />
                          </button>
                          {stagePillMenu === c.application_id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setStagePillMenu(null)} />
                              <StageDropdown>
                                {STAGE_MOVES.map((s) => {
                                  const isCurrent = s.value === c.status;
                                  return (
                                    <button
                                      key={s.value}
                                      disabled={isCurrent}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setStagePillMenu(null);
                                        setStageConfirm({ candidate: c, targetStage: s.value });
                                      }}
                                      className={`w-full text-left px-3 py-1.5 text-[13px] flex items-center gap-2 transition-colors ${
                                        isCurrent
                                          ? "text-[#9B9A97] cursor-default bg-[#F7F6F3]"
                                          : "text-[#37352F] hover:bg-[#F7F6F3]"
                                      }`}
                                    >
                                      <span className={`w-2 h-2 rounded-full shrink-0 ${stageDot(s.value)}`} />
                                      {s.label}
                                      {isCurrent && <span className="text-[10px] text-[#9B9A97] ml-auto">current</span>}
                                    </button>
                                  );
                                })}
                              </StageDropdown>
                            </>
                          )}
                        </div>
                      </td>
                      {/* Fix 3: AI Summary column */}
                      <td className="px-4 py-3 hidden xl:table-cell">
                        {c.ai_summary ? (
                          <span
                            className="text-[12px] text-[#9B9A97] block truncate max-w-[200px]"
                            title={c.ai_summary}
                          >
                            {c.ai_summary.length > 50
                              ? c.ai_summary.slice(0, 50) + "..."
                              : c.ai_summary}
                          </span>
                        ) : (
                          <span className="text-[12px] text-[#D3D1CB]">--</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right relative" data-no-row-click>
                        <span className="text-[13px] text-[#9B9A97] group-hover:opacity-0 transition-opacity">
                          {relativeTime(c.applied_at)}
                        </span>
                        {/* Quick-action buttons on hover */}
                        <div className="absolute inset-y-0 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); router.push(`/candidates/${c.id}`); }}
                            title="View Profile"
                            className="p-1.5 rounded-md text-[#9B9A97] hover:text-[#37352F] hover:bg-white transition-colors"
                          >
                            <ExternalLink size={14} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setEmailModal(c); }}
                            title="Send Email"
                            className="p-1.5 rounded-md text-[#9B9A97] hover:text-[#37352F] hover:bg-white transition-colors"
                          >
                            <Mail size={14} />
                          </button>
                        </div>
                      </td>
                      {/* Fix 4: Action Menu - positioned to left */}
                      <td className="px-2 py-3" data-no-row-click>
                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenMenu(openMenu === c.application_id ? null : c.application_id)
                            }
                            className="p-1.5 rounded-lg text-[#9B9A97] hover:bg-[#F7F6F3] hover:text-[#37352F] transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          {openMenu === c.application_id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => { setOpenMenu(null); setStageMenu(null); }}
                              />
                              <div className="absolute right-full top-0 mr-1 z-20 bg-white border border-[#E9E9E7] rounded-lg shadow-lg py-1 min-w-[200px]">
                                <button
                                  onClick={() => { setOpenMenu(null); router.push(`/candidates/${c.id}`); }}
                                  className="w-full text-left px-3 py-2 text-[13px] text-[#37352F] hover:bg-[#F7F6F3] flex items-center gap-2 transition-colors"
                                >
                                  <ExternalLink size={13} className="text-[#9B9A97]" />
                                  View Profile
                                </button>
                                <button
                                  onClick={() => { setOpenMenu(null); setEmailModal(c); }}
                                  className="w-full text-left px-3 py-2 text-[13px] text-[#37352F] hover:bg-[#F7F6F3] flex items-center gap-2 transition-colors"
                                >
                                  <Mail size={13} className="text-[#9B9A97]" />
                                  Send Email
                                </button>
                                <button
                                  onClick={() => handleRescreen(c)}
                                  className="w-full text-left px-3 py-2 text-[13px] text-[#37352F] hover:bg-[#F7F6F3] flex items-center gap-2 transition-colors"
                                >
                                  <RefreshCw size={13} className="text-[#9B9A97]" />
                                  Re-screen
                                </button>
                                {/* Move to Stage sub-menu */}
                                <div className="relative">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setStageMenu(stageMenu === c.application_id ? null : c.application_id);
                                    }}
                                    className="w-full text-left px-3 py-2 text-[13px] text-[#37352F] hover:bg-[#F7F6F3] flex items-center gap-2 transition-colors"
                                  >
                                    <UserCheck size={13} className="text-[#9B9A97]" />
                                    Move to Stage
                                    <ChevronDown size={12} className="text-[#9B9A97] ml-auto" />
                                  </button>
                                  {stageMenu === c.application_id && (
                                    <div className="absolute right-full top-0 mr-1 bg-white border border-[#E9E9E7] rounded-lg shadow-lg py-1 min-w-[160px]">
                                      {STAGE_MOVES.filter((s) => s.value !== c.status).map((s) => (
                                        <button
                                          key={s.value}
                                          onClick={() => handleMoveStage(c, s.value)}
                                          className="w-full text-left px-3 py-1.5 text-[13px] text-[#37352F] hover:bg-[#F7F6F3] transition-colors"
                                        >
                                          {s.label}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={() => { setOpenMenu(null); setNoteModal(c); }}
                                  className="w-full text-left px-3 py-2 text-[13px] text-[#37352F] hover:bg-[#F7F6F3] flex items-center gap-2 transition-colors"
                                >
                                  <MessageSquare size={13} className="text-[#9B9A97]" />
                                  Add Note
                                </button>
                                <button
                                  onClick={() => handleInviteInterview(c)}
                                  className="w-full text-left px-3 py-2 text-[13px] text-[#37352F] hover:bg-[#F7F6F3] flex items-center gap-2 transition-colors"
                                >
                                  <Mic size={13} className="text-[#9B9A97]" />
                                  {c.interview_status ? "Copy Interview Link" : "Invite to Interview"}
                                </button>
                                {c.has_resume && (
                                  <button
                                    onClick={() => { setOpenMenu(null); setResumeModal(c); }}
                                    className="w-full text-left px-3 py-2 text-[13px] text-[#37352F] hover:bg-[#F7F6F3] flex items-center gap-2 transition-colors"
                                  >
                                    <FileText size={13} className="text-[#9B9A97]" />
                                    View Resume
                                  </button>
                                )}
                                <button
                                  onClick={() => handleCopyLink(c)}
                                  className="w-full text-left px-3 py-2 text-[13px] text-[#37352F] hover:bg-[#F7F6F3] flex items-center gap-2 transition-colors"
                                >
                                  <Copy size={13} className="text-[#9B9A97]" />
                                  Copy Profile Link
                                </button>
                                <div className="border-t border-[#E9E9E7] my-1" />
                                {c.status !== "rejected" && (
                                  <button
                                    onClick={() => handleReject(c)}
                                    className="w-full text-left px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                  >
                                    <XCircle size={13} className="text-red-400" />
                                    Reject
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-5 py-3 border-t border-[#E9E9E7] flex items-center justify-between">
              <span className="text-[12px] text-[#9B9A97]">
                Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} of {total} candidates
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded text-[12px] font-medium border border-[#E9E9E7] text-[#37352F] hover:bg-[#F7F6F3] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Prev
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded text-[12px] font-medium transition-colors ${
                        page === pageNum
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "text-[#37352F] hover:bg-[#F7F6F3]"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
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

      {/* ─── Bulk Actions ─── */}
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
          <button
            onClick={() => setSelected(new Set())}
            className="p-1 rounded hover:bg-[#73726E] transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ─── Modals ─── */}
      {emailModal && (
        <EmailModal
          candidate={emailModal}
          onClose={() => setEmailModal(null)}
          onSent={() => { setEmailModal(null); toast("Email sent successfully", "success"); }}
        />
      )}
      {noteModal && (
        <NoteModal
          candidate={noteModal}
          onClose={() => setNoteModal(null)}
          onSaved={() => { setNoteModal(null); toast("Note saved", "success"); }}
        />
      )}
      {resumeModal && (
        <ResumeModal
          candidate={resumeModal}
          onClose={() => setResumeModal(null)}
        />
      )}
      {stageConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-xl border border-[#E9E9E7] max-w-md w-full mx-4 p-6">
            <h3 className="text-[16px] font-semibold text-[#37352F] mb-2">
              Move {stageConfirm.candidate.name} to &ldquo;{STAGE_MOVES.find(s => s.value === stageConfirm.targetStage)?.label || stageConfirm.targetStage}&rdquo;?
            </h3>
            <p className="text-[14px] text-[#9B9A97] mb-6 leading-relaxed">
              {stageChangeMessage(stageConfirm.targetStage)}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setStageConfirm(null)}
                disabled={stageConfirmLoading}
                className="px-4 py-2 rounded-lg text-[13px] font-medium border border-[#E9E9E7] text-[#37352F] hover:bg-[#F7F6F3] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!stageConfirm) return;
                  setStageConfirmLoading(true);
                  const { candidate, targetStage } = stageConfirm;
                  try {
                    // 1. Update stage
                    await fetch(`/api/candidates/${candidate.id}/stage`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ stage: targetStage, application_id: candidate.application_id }),
                    });
                    // 2. Side effects by stage
                    if (targetStage === "interview_invited") {
                      await fetch(`/api/candidates/${candidate.id}/invite`, { method: "POST" });
                    } else if (targetStage === "rejected") {
                      await fetch(`/api/dashboard/applications/${candidate.application_id}/notify`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ type: "rejection" }),
                      });
                    }
                    toast(`${candidate.name} moved to ${stageLabel(targetStage)}`, "success");
                    fetchCandidates();
                  } catch {
                    toast("Failed to update stage", "error");
                  } finally {
                    setStageConfirmLoading(false);
                    setStageConfirm(null);
                  }
                }}
                disabled={stageConfirmLoading}
                className="px-4 py-2 rounded-lg text-[13px] font-medium text-white transition-colors disabled:opacity-50"
                style={{ background: "#2383E2" }}
              >
                {stageConfirmLoading ? "Updating..." : "Confirm & Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
