"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Play,
  User,
  Mic,
  TrendingUp,
  CheckCircle,
  Clock,
  Filter,
  X,
} from "lucide-react";

/* ─── Types ─── */
interface InterviewScoring {
  overall_score?: number;
  interview_score?: number;
  overall_impression?: string;
  communication_score?: number;
  technical_score?: number;
  cultural_fit_score?: number;
  confidence_score?: number;
  strengths?: string[];
  areas_for_improvement?: string[];
  recommendation?: string;
  recommendation_reasoning?: string;
  follow_up_questions?: string[];
  hiring_risk_factors?: string[];
  consistency_analysis?: string;
}

interface InterviewRecord {
  application_id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string | null;
  job_id: string;
  job_title: string;
  current_stage: string;
  applied_at: string;
  interview_scoring: InterviewScoring | null;
  interview_transcript: string | null;
  interview_recording_url: string | null;
  interview_started_at: string | null;
  interview_ended_at: string | null;
  interview_summary: string | null;
}

interface JobOption {
  id: string;
  title: string;
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
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function getScore(scoring: InterviewScoring | null): number | null {
  if (!scoring) return null;
  return scoring.overall_score ?? scoring.interview_score ?? null;
}

function scoreColor(score: number | null): string {
  if (score === null) return "text-[#9B9A97]";
  if (score >= 70) return "text-emerald-600";
  if (score >= 40) return "text-amber-600";
  return "text-red-600";
}

function scoreBgColor(score: number | null): string {
  if (score === null) return "bg-[#F7F6F3]";
  if (score >= 70) return "bg-emerald-50";
  if (score >= 40) return "bg-amber-50";
  return "bg-red-50";
}

const RECOMMENDATION_CONFIG: Record<string, { bg: string; text: string; border: string; label: string }> = {
  strong_hire: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "STRONG HIRE" },
  hire: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", label: "HIRE" },
  maybe: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "MAYBE" },
  no_hire: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200", label: "NO HIRE" },
  strong_no_hire: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "STRONG NO HIRE" },
};

/* ─── Score Bar Component ─── */
function ScoreBar({ label, score }: { label: string; score: number | undefined }) {
  if (score === undefined) return null;
  const barColor = score >= 70 ? "bg-emerald-500" : score >= 50 ? "bg-[#2383E2]" : score >= 40 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <span className="text-[12px] text-[#9B9A97] w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-[#F7F6F3] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-[11px] text-[#37352F] font-medium w-7 text-right tabular-nums">{score}</span>
    </div>
  );
}

/* ─── Skeleton Card ─── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg border border-[#E9E9E7] p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="h-4 w-40 bg-[#E9E9E7] rounded mb-2" />
          <div className="h-3 w-28 bg-[#F7F6F3] rounded" />
        </div>
        <div className="h-10 w-14 bg-[#F7F6F3] rounded" />
      </div>
      <div className="h-3 w-20 bg-[#F7F6F3] rounded mb-4" />
      <div className="space-y-2">
        <div className="h-2 w-full bg-[#F7F6F3] rounded" />
        <div className="h-2 w-full bg-[#F7F6F3] rounded" />
        <div className="h-2 w-3/4 bg-[#F7F6F3] rounded" />
      </div>
    </div>
  );
}

/* ─── Stat Card ─── */
function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-lg border border-[#E9E9E7] px-5 py-4">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-[12px] text-[#9B9A97] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-[24px] font-semibold text-[#37352F] tabular-nums">{value}</div>
      {sub && <div className="text-[12px] text-[#9B9A97] mt-0.5">{sub}</div>}
    </div>
  );
}

/* ─── Main Page ─── */
export default function InterviewsPage() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<string>("all");
  const [selectedRecommendation, setSelectedRecommendation] = useState<string>("all");
  const [scoreMin, setScoreMin] = useState<string>("");
  const [scoreMax, setScoreMax] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Expanded cards
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const fetchInterviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/interviews");
      if (!res.ok) throw new Error("Failed to fetch interviews");
      const data = await res.json();
      setInterviews(data.interviews || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  // Extract unique jobs for filter dropdown
  const jobOptions: JobOption[] = [];
  const seenJobs = new Set<string>();
  for (const iv of interviews) {
    if (!seenJobs.has(iv.job_id)) {
      seenJobs.add(iv.job_id);
      jobOptions.push({ id: iv.job_id, title: iv.job_title });
    }
  }

  // Filter logic
  const filtered = interviews.filter((iv) => {
    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !iv.candidate_name.toLowerCase().includes(q) &&
        !(iv.candidate_email ?? "").toLowerCase().includes(q)
      )
        return false;
    }
    // Job
    if (selectedJob !== "all" && iv.job_id !== selectedJob) return false;
    // Recommendation
    if (selectedRecommendation !== "all") {
      const rec = iv.interview_scoring?.recommendation;
      if (rec !== selectedRecommendation) return false;
    }
    // Score range
    const score = getScore(iv.interview_scoring);
    if (scoreMin && score !== null && score < Number(scoreMin)) return false;
    if (scoreMax && score !== null && score > Number(scoreMax)) return false;
    return true;
  });

  const hasActiveFilters = searchQuery || selectedJob !== "all" || selectedRecommendation !== "all" || scoreMin || scoreMax;

  // Stats — use filtered list when filters are active
  const statsSource = hasActiveFilters ? filtered : interviews;
  const completedInterviews = statsSource.filter((iv) => iv.current_stage === "interview_completed" || iv.current_stage === "hired");
  const scoredInterviews = completedInterviews.filter((iv) => getScore(iv.interview_scoring) !== null);
  const avgScore = scoredInterviews.length > 0
    ? Math.round(scoredInterviews.reduce((sum, iv) => sum + (getScore(iv.interview_scoring) ?? 0), 0) / scoredInterviews.length)
    : 0;
  const hireCount = scoredInterviews.filter((iv) => {
    const rec = iv.interview_scoring?.recommendation;
    return rec === "strong_hire" || rec === "hire";
  }).length;
  const hireRate = scoredInterviews.length > 0 ? Math.round((hireCount / scoredInterviews.length) * 100) : 0;
  const pendingReview = completedInterviews.filter((iv) => !iv.interview_scoring).length;

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedJob("all");
    setSelectedRecommendation("all");
    setScoreMin("");
    setScoreMax("");
  };

  return (
    <div className="space-y-6">

        {/* ─── Header ─── */}
        <div className="flex items-center justify-between mb-0">
          <div>
            <h1 className="text-[22px] font-semibold text-[#37352F]">Interviews</h1>
            <p className="text-[13px] text-[#9B9A97] mt-0.5">
              {hasActiveFilters ? `${filtered.length} matching` : `${interviews.length} total`}{" "}
              {completedInterviews.length !== statsSource.length && (
                <span>({completedInterviews.length} completed)</span>
              )}
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium border transition-colors ${
              showFilters || hasActiveFilters
                ? "bg-[#2383E2] text-white border-[#2383E2]"
                : "bg-white text-[#37352F] border-[#E9E9E7] hover:border-[#9B9A97]"
            }`}
          >
            <Filter size={14} />
            Filters
            {hasActiveFilters && (
              <span className="bg-white/20 text-[11px] rounded-full px-1.5 py-0.5 ml-1">
                {[searchQuery, selectedJob !== "all", selectedRecommendation !== "all", scoreMin, scoreMax].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* ─── Stats Row ─── */}
        {!loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-0">
            <StatCard
              icon={<CheckCircle size={14} className="text-[#2383E2]" />}
              label="Completed"
              value={completedInterviews.length}
              sub={`${statsSource.filter((iv) => iv.current_stage === "interview_invited").length} invited`}
            />
            <StatCard
              icon={<TrendingUp size={14} className="text-emerald-500" />}
              label="Avg Score"
              value={avgScore > 0 ? avgScore : "--"}
              sub={scoredInterviews.length > 0 ? `from ${scoredInterviews.length} scored` : "No scores yet"}
            />
            <StatCard
              icon={<User size={14} className="text-emerald-500" />}
              label="Shortlist Rate"
              value={scoredInterviews.length > 0 ? `${hireRate}%` : "--"}
              sub={hireCount > 0 ? `${hireCount} strong hire / hire` : "None yet"}
            />
            <StatCard
              icon={<Clock size={14} className="text-amber-500" />}
              label="Pending Review"
              value={pendingReview}
              sub={pendingReview > 0 ? "Awaiting scoring" : "All reviewed"}
            />
          </div>
        )}

        {/* ─── Filter Bar ─── */}
        {showFilters && (
          <div className="bg-white rounded-lg border border-[#E9E9E7] p-4 mb-0">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-medium text-[#37352F]">Filter Interviews</span>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-[12px] text-[#9B9A97] hover:text-[#37352F] transition-colors"
                >
                  <X size={12} />
                  Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9A97]" />
                <input
                  type="text"
                  placeholder="Search candidate..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-[13px] text-[#37352F] bg-[#F7F6F3] border border-[#E9E9E7] rounded-md placeholder:text-[#9B9A97] focus:outline-none focus:border-[#2383E2] focus:ring-1 focus:ring-[#2383E2]/20 transition-colors"
                />
              </div>

              {/* Job filter */}
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full px-3 py-2 text-[13px] text-[#37352F] bg-[#F7F6F3] border border-[#E9E9E7] rounded-md focus:outline-none focus:border-[#2383E2] focus:ring-1 focus:ring-[#2383E2]/20 transition-colors appearance-none"
              >
                <option value="all">All Jobs</option>
                {jobOptions.map((j) => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>

              {/* Recommendation filter */}
              <select
                value={selectedRecommendation}
                onChange={(e) => setSelectedRecommendation(e.target.value)}
                className="w-full px-3 py-2 text-[13px] text-[#37352F] bg-[#F7F6F3] border border-[#E9E9E7] rounded-md focus:outline-none focus:border-[#2383E2] focus:ring-1 focus:ring-[#2383E2]/20 transition-colors appearance-none"
              >
                <option value="all">All Recommendations</option>
                <option value="strong_hire">Strong Hire</option>
                <option value="hire">Hire</option>
                <option value="maybe">Maybe</option>
                <option value="no_hire">No Hire</option>
                <option value="strong_no_hire">Strong No Hire</option>
              </select>

              {/* Score range */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={scoreMin}
                  onChange={(e) => setScoreMin(e.target.value)}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 text-[13px] text-[#37352F] bg-[#F7F6F3] border border-[#E9E9E7] rounded-md placeholder:text-[#9B9A97] focus:outline-none focus:border-[#2383E2] focus:ring-1 focus:ring-[#2383E2]/20 transition-colors"
                />
                <span className="text-[#9B9A97] text-[12px] shrink-0">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={scoreMax}
                  onChange={(e) => setScoreMax(e.target.value)}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 text-[13px] text-[#37352F] bg-[#F7F6F3] border border-[#E9E9E7] rounded-md placeholder:text-[#9B9A97] focus:outline-none focus:border-[#2383E2] focus:ring-1 focus:ring-[#2383E2]/20 transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* ─── Loading State ─── */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ─── Error State ─── */}
        {error && (
          <div className="bg-white rounded-lg border border-red-200 p-6 text-center">
            <p className="text-[14px] text-red-600 mb-2">Failed to load interviews</p>
            <p className="text-[13px] text-[#9B9A97] mb-4">{error}</p>
            <button
              onClick={fetchInterviews}
              className="px-4 py-2 text-[13px] font-medium text-[#2383E2] bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {/* ─── Empty State ─── */}
        {!loading && !error && interviews.length === 0 && (
          <div className="bg-white rounded-lg border border-[#E9E9E7] p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-[#F7F6F3] flex items-center justify-center mx-auto mb-4">
              <Mic size={20} className="text-[#9B9A97]" />
            </div>
            <h3 className="text-[16px] font-semibold text-[#37352F] mb-2">No interviews yet</h3>
            <p className="text-[14px] text-[#9B9A97] max-w-md mx-auto mb-0">
              Interviews appear here when candidates are invited to a voice interview.
              Go to the Candidates page to screen applicants and invite them to interview.
            </p>
            <button
              onClick={() => router.push("/candidates")}
              className="px-4 py-2 text-[13px] font-medium text-white bg-[#2383E2] rounded-md hover:bg-[#1b6ec2] transition-colors"
            >
              Go to Candidates
            </button>
          </div>
        )}

        {/* ─── No Results After Filter ─── */}
        {!loading && !error && interviews.length > 0 && filtered.length === 0 && (
          <div className="bg-white rounded-lg border border-[#E9E9E7] p-8 text-center">
            <p className="text-[14px] text-[#9B9A97] mb-3">No interviews match your filters.</p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-[13px] font-medium text-[#2383E2] bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* ─── Interview Cards ─── */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((iv) => {
              const score = getScore(iv.interview_scoring);
              const rec = iv.interview_scoring?.recommendation;
              const recConfig = rec ? RECOMMENDATION_CONFIG[rec] : null;
              const isExpanded = expandedCards.has(iv.application_id);
              const isInvited = iv.current_stage === "interview_invited";
              const strengths = iv.interview_scoring?.strengths ?? [];

              return (
                <div
                  key={iv.application_id}
                  className="bg-white rounded-lg border border-[#E9E9E7] hover:border-[#d4d4d1] transition-colors"
                >
                  <div className="p-5">
                    {/* Top row: name + score */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[15px] font-semibold text-[#37352F] truncate">
                          {iv.candidate_name}
                        </h3>
                        <p className="text-[13px] text-[#9B9A97] truncate">{iv.job_title}</p>
                      </div>
                      {score !== null ? (
                        <div className={`${scoreBgColor(score)} rounded-lg px-3 py-1.5 ml-3 shrink-0 text-center`}>
                          <div className={`text-[22px] font-bold tabular-nums leading-none ${scoreColor(score)}`}>
                            {score}
                          </div>
                          <div className="text-[10px] text-[#9B9A97] mt-0.5">/100</div>
                        </div>
                      ) : isInvited ? (
                        <div className="bg-blue-50 rounded-lg px-3 py-2 ml-3 shrink-0">
                          <span className="text-[11px] font-medium text-[#2383E2] uppercase">Invited</span>
                        </div>
                      ) : (
                        <div className="bg-[#F7F6F3] rounded-lg px-3 py-2 ml-3 shrink-0">
                          <span className="text-[11px] font-medium text-[#9B9A97] uppercase">Pending</span>
                        </div>
                      )}
                    </div>

                    {/* Recommendation badge + date */}
                    <div className="flex items-center gap-2 mb-4">
                      {recConfig && (
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${recConfig.bg} ${recConfig.text} ${recConfig.border}`}>
                          {recConfig.label}
                        </span>
                      )}
                      <span className="text-[12px] text-[#9B9A97]">
                        {iv.interview_ended_at
                          ? relativeTime(iv.interview_ended_at)
                          : relativeTime(iv.applied_at)}
                      </span>
                    </div>

                    {/* Strengths */}
                    {strengths.length > 0 && (
                      <div className="mb-4">
                        <ul className="space-y-1">
                          {strengths.slice(0, 3).map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-[13px] text-[#37352F]">
                              <span className="text-emerald-500 mt-0.5 shrink-0">+</span>
                              <span className="line-clamp-1">{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Score bars */}
                    {iv.interview_scoring && (
                      <div className="space-y-1.5 mb-4">
                        <ScoreBar label="Communication" score={iv.interview_scoring.communication_score} />
                        <ScoreBar label="Technical" score={iv.interview_scoring.technical_score} />
                        <ScoreBar label="Cultural Fit" score={iv.interview_scoring.cultural_fit_score} />
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-3 border-t border-[#E9E9E7]">
                      <button
                        onClick={() => router.push(`/candidates/${iv.candidate_id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#37352F] bg-[#F7F6F3] rounded-md hover:bg-[#E9E9E7] transition-colors"
                      >
                        <User size={12} />
                        View Profile
                      </button>
                      {iv.interview_recording_url && (
                        <a
                          href={iv.interview_recording_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#2383E2] bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                        >
                          <Play size={12} />
                          Play Recording
                        </a>
                      )}
                      {(iv.interview_transcript || iv.interview_scoring) && (
                        <button
                          onClick={() => toggleCard(iv.application_id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-[12px] font-medium text-[#9B9A97] hover:text-[#37352F] ml-auto transition-colors"
                        >
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          {isExpanded ? "Hide" : "Details"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-[#E9E9E7] px-5 py-4 bg-[#FAFAFA] space-y-4">
                      {iv.interview_scoring?.overall_impression && (
                        <div>
                          <p className="text-[12px] font-medium text-[#9B9A97] uppercase tracking-wide mb-1">Overall Impression</p>
                          <p className="text-[13px] text-[#37352F] leading-relaxed">
                            {iv.interview_scoring.overall_impression}
                          </p>
                        </div>
                      )}
                      {iv.interview_scoring?.recommendation_reasoning && (
                        <div>
                          <p className="text-[12px] font-medium text-[#9B9A97] uppercase tracking-wide mb-1">Recommendation Reasoning</p>
                          <p className="text-[13px] text-[#37352F] leading-relaxed">
                            {iv.interview_scoring.recommendation_reasoning}
                          </p>
                        </div>
                      )}
                      {iv.interview_scoring?.consistency_analysis && (
                        <div>
                          <p className="text-[12px] font-medium text-[#9B9A97] uppercase tracking-wide mb-1">Consistency Analysis</p>
                          <p className="text-[13px] text-[#37352F] leading-relaxed">
                            {iv.interview_scoring.consistency_analysis}
                          </p>
                        </div>
                      )}
                      {/* Areas for improvement */}
                      {(iv.interview_scoring?.areas_for_improvement ?? []).length > 0 && (
                        <div>
                          <p className="text-[12px] font-medium text-[#9B9A97] uppercase tracking-wide mb-1">Areas for Improvement</p>
                          <ul className="space-y-1">
                            {iv.interview_scoring!.areas_for_improvement!.map((a, i) => (
                              <li key={i} className="flex items-start gap-2 text-[13px] text-[#37352F]">
                                <span className="text-red-400 mt-0.5 shrink-0">-</span>
                                <span>{a}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {/* Risk factors */}
                      {(iv.interview_scoring?.hiring_risk_factors ?? []).length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-md px-4 py-3">
                          <p className="text-[12px] font-medium text-amber-700 uppercase tracking-wide mb-1">Risk Factors</p>
                          <ul className="space-y-1">
                            {iv.interview_scoring!.hiring_risk_factors!.map((r, i) => (
                              <li key={i} className="text-[13px] text-amber-800">{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {/* Follow-up questions */}
                      {(iv.interview_scoring?.follow_up_questions ?? []).length > 0 && (
                        <div>
                          <p className="text-[12px] font-medium text-[#9B9A97] uppercase tracking-wide mb-1">Suggested Follow-ups</p>
                          <ol className="space-y-1 list-decimal list-inside">
                            {iv.interview_scoring!.follow_up_questions!.map((q, i) => (
                              <li key={i} className="text-[13px] text-[#37352F]">{q}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                      {/* Transcript */}
                      {iv.interview_transcript && (
                        <div>
                          <p className="text-[12px] font-medium text-[#9B9A97] uppercase tracking-wide mb-2">Transcript Preview</p>
                          <pre className="text-[12px] text-[#37352F] leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto font-[inherit]">
                            {iv.interview_transcript.length > 2000
                              ? iv.interview_transcript.slice(0, 2000) + "\n\n... [truncated — view full transcript on candidate profile]"
                              : iv.interview_transcript}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}
