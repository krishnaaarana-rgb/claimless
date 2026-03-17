"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  TrendingUp,
  Briefcase,
  BarChart3,
  Mic,
  ArrowRight,
  Plus,
  ExternalLink,
  Clock,
} from "lucide-react";

interface StatsData {
  total_candidates: number;
  candidates_trend: string;
  pass_rate: number;
  active_jobs: number;
  avg_score: number;
  avg_interview_score: number;
  conversion_rate: number;
  recent_activity: ActivityItem[];
}

interface ActivityItem {
  type: string;
  candidate: string;
  candidate_id: string;
  job: string;
  detail: string;
  time: string;
}

interface JobRow {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  status: string;
  created_at: string;
  applicant_count: number;
  stage_counts: Record<string, number>;
  avg_score: number | null;
  pass_rate: number | null;
  passed_count: number;
  interviewing_count: number;
  avg_interview_score?: number | null;
  interview_completion_rate?: number | null;
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

function activityIcon(type: string) {
  switch (type) {
    case "email":
      return <span className="text-blue-500 text-[14px]">{"\u2709"}</span>;
    case "interview":
      return <Mic size={14} className="text-blue-500" />;
    case "rejection":
      return <span className="text-red-500 text-[14px]">{"\u2716"}</span>;
    default:
      return <span className="text-emerald-500 text-[14px]">{"\u25CF"}</span>;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, jobsRes] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/jobs"),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (jobsRes.ok) {
        const data = await jobsRes.json();
        setJobs(data.jobs || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-[#F7F6F3] rounded w-32 animate-pulse" />
          <div className="h-9 bg-[#F7F6F3] rounded w-28 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white border border-[#E9E9E7] rounded-lg p-4 animate-pulse">
              <div className="h-3 bg-[#F7F6F3] rounded w-16 mb-3" />
              <div className="h-7 bg-[#F7F6F3] rounded w-12" />
            </div>
          ))}
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-[#E9E9E7] rounded-lg p-5 animate-pulse">
            <div className="h-5 bg-[#F7F6F3] rounded w-48 mb-3" />
            <div className="h-3 bg-[#F7F6F3] rounded w-32" />
          </div>
        ))}
      </div>
    );
  }

  const isEmpty = (stats?.total_candidates ?? 0) === 0 && (stats?.active_jobs ?? 0) === 0;

  if (isEmpty) {
    return (
      <div className="space-y-6">
        <h1 className="text-[22px] font-bold text-[#37352F]">Dashboard</h1>
        <div className="bg-white border border-[#E9E9E7] rounded-lg p-16 text-center">
          <Briefcase size={48} className="text-[#D3D1CB] mx-auto mb-6" />
          <h2 className="text-[20px] font-bold text-[#37352F] mb-2">Welcome to Claimless</h2>
          <p className="text-[14px] text-[#9B9A97] mb-6 max-w-md mx-auto">
            Create your first job posting to start receiving applications.
          </p>
          <button
            onClick={() => router.push("/jobs/new")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[14px] font-medium text-white transition-colors"
            style={{ background: "#2383E2" }}
          >
            <Plus size={16} />
            Create Job
          </button>
        </div>
      </div>
    );
  }

  const activeJobs = jobs.filter((j) => j.status === "active");
  const draftJobs = jobs.filter((j) => j.status === "draft");

  const summaryMetrics = [
    { label: "Candidates", value: stats?.total_candidates ?? 0, icon: Users, trend: stats?.candidates_trend },
    { label: "Active Jobs", value: stats?.active_jobs ?? 0, icon: Briefcase },
    { label: "Pass Rate", value: `${stats?.pass_rate ?? 0}%`, icon: TrendingUp },
    { label: "Avg ATS", value: stats?.avg_score ?? "—", icon: BarChart3 },
    { label: "Avg Interview", value: stats?.avg_interview_score ? `${stats.avg_interview_score}` : "—", icon: Mic },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-[#37352F]">Dashboard</h1>
        <Link
          href="/jobs/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium text-white bg-[#2383E2] hover:bg-[#1b6ec2] transition-colors"
        >
          <Plus size={14} />
          New Job
        </Link>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {summaryMetrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-white border border-[#E9E9E7] rounded-lg px-4 py-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-[#9B9A97] uppercase tracking-wider">{m.label}</span>
                <Icon size={13} className="text-[#D3D1CB]" />
              </div>
              <div className="text-[24px] font-bold text-[#37352F] leading-none">{m.value}</div>
              {m.trend && <div className="text-[11px] text-emerald-600 mt-1">{m.trend}</div>}
            </div>
          );
        })}
      </div>

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <div>
          <h2 className="text-[14px] font-semibold text-[#9B9A97] uppercase tracking-wider mb-3">
            Active Roles ({activeJobs.length})
          </h2>
          <div className="space-y-3">
            {activeJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}

      {/* Draft Jobs */}
      {draftJobs.length > 0 && (
        <div>
          <h2 className="text-[14px] font-semibold text-[#9B9A97] uppercase tracking-wider mb-3">
            Drafts ({draftJobs.length})
          </h2>
          <div className="space-y-3">
            {draftJobs.map((job) => (
              <DraftCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {stats?.recent_activity && stats.recent_activity.length > 0 && (
        <div className="bg-white border border-[#E9E9E7] rounded-lg p-5">
          <h2 className="text-[14px] font-semibold text-[#37352F] mb-4">Recent Activity</h2>
          <div className="space-y-0 max-h-[280px] overflow-y-auto">
            {stats.recent_activity.map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  if (item.candidate_id) router.push(`/candidates/${item.candidate_id}`);
                }}
                className="w-full text-left flex items-start gap-3 py-2.5 hover:bg-[#F7F6F3] rounded-lg px-2 -mx-2 transition-colors"
                style={i < stats.recent_activity.length - 1 ? { borderBottom: "1px solid #E9E9E7" } : undefined}
              >
                <div className="mt-0.5 shrink-0">{activityIcon(item.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-[#37352F]">
                    <span className="font-medium">{item.candidate}</span>{" "}
                    <span className="text-[#9B9A97]">{item.detail}</span>
                  </div>
                  <div className="text-[11px] text-[#9B9A97] mt-0.5">
                    {item.job} &middot; {item.time}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────
// Job Card — the core of the new dashboard
// ────────────────────────────────────────

function JobCard({ job }: { job: JobRow }) {
  const router = useRouter();

  const applied = (job.stage_counts.applied || 0) + (job.stage_counts.pending_review || 0);
  const passed = job.stage_counts.stage_1_passed || 0;
  const interviewing = job.stage_counts.interview_invited || 0;
  const interviewed = job.stage_counts.interview_completed || 0;
  const hired = job.stage_counts.hired || 0;
  const rejected = (job.stage_counts.rejected || 0) + (job.stage_counts.stage_1_failed || 0);

  // Determine primary action
  const readyToShare = interviewed > 0;
  const needsInterviews = passed > 0 && interviewing === 0 && interviewed === 0;
  const hasNew = applied > 0;

  return (
    <div className="bg-white border border-[#E9E9E7] rounded-lg overflow-hidden hover:border-[#D3D1CB] transition-colors">
      <div className="px-5 py-4 flex items-center gap-4">
        {/* Job info */}
        <button
          onClick={() => router.push(`/jobs/${job.id}`)}
          className="flex-1 min-w-0 text-left"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold text-[#37352F] truncate">{job.title}</h3>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 text-[12px] text-[#9B9A97]">
            {job.department && <span>{job.department}</span>}
            {job.department && job.location && <span className="text-[#D3D1CB]">&middot;</span>}
            {job.location && <span>{job.location}</span>}
            {(job.department || job.location) && <span className="text-[#D3D1CB]">&middot;</span>}
            <span>{relativeTime(job.created_at)}</span>
          </div>
        </button>

        {/* Pipeline mini-counts */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <PipelinePill label="New" count={applied} color="#9B9A97" />
          <PipelinePill label="Passed" count={passed} color="#059669" />
          <PipelinePill label="Interview" count={interviewing + interviewed} color="#2383E2" />
          <PipelinePill label="Shortlisted" count={hired} color="#16A34A" />
          {rejected > 0 && <PipelinePill label="Rejected" count={rejected} color="#DC2626" />}
        </div>

        {/* Action button */}
        <div className="shrink-0">
          {readyToShare ? (
            <Link
              href={`/jobs/${job.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-[#2383E2] text-white hover:bg-[#1b6ec2] transition-colors"
            >
              <ExternalLink size={12} />
              Review & Share
            </Link>
          ) : needsInterviews ? (
            <Link
              href={`/jobs/${job.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border border-[#2383E2] text-[#2383E2] hover:bg-blue-50 transition-colors"
            >
              <Mic size={12} />
              Send Invites
            </Link>
          ) : hasNew ? (
            <Link
              href={`/jobs/${job.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border border-[#E9E9E7] text-[#37352F] hover:bg-[#F7F6F3] transition-colors"
            >
              Review
              <ArrowRight size={12} />
            </Link>
          ) : (
            <Link
              href={`/jobs/${job.id}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] text-[#9B9A97] hover:bg-[#F7F6F3] transition-colors"
            >
              View
              <ArrowRight size={12} />
            </Link>
          )}
        </div>
      </div>

      {/* Mobile pipeline counts */}
      <div className="sm:hidden px-5 pb-3 flex items-center gap-3">
        <PipelinePill label="New" count={applied} color="#9B9A97" />
        <PipelinePill label="Passed" count={passed} color="#059669" />
        <PipelinePill label="IV" count={interviewing + interviewed} color="#2383E2" />
        <PipelinePill label="Shortlisted" count={hired} color="#16A34A" />
      </div>
    </div>
  );
}

function PipelinePill({ label, count, color }: { label: string; count: number; color: string }) {
  if (count === 0) {
    return (
      <div className="text-center">
        <div className="text-[14px] font-medium text-[#D3D1CB] tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          —
        </div>
        <div className="text-[9px] text-[#D3D1CB] uppercase tracking-wide">{label}</div>
      </div>
    );
  }
  return (
    <div className="text-center">
      <div
        className="text-[14px] font-bold tabular-nums"
        style={{ fontFamily: "'JetBrains Mono', monospace", color }}
      >
        {count}
      </div>
      <div className="text-[9px] uppercase tracking-wide" style={{ color }}>{label}</div>
    </div>
  );
}

function DraftCard({ job }: { job: JobRow }) {
  return (
    <Link
      href={`/jobs/${job.id}/edit`}
      className="block bg-white border border-dashed border-[#E9E9E7] rounded-lg px-5 py-3.5 hover:border-[#D3D1CB] transition-colors"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[14px] font-medium text-[#9B9A97]">{job.title}</h3>
          <div className="text-[12px] text-[#D3D1CB] mt-0.5 flex items-center gap-1">
            <Clock size={11} />
            Draft · {relativeTime(job.created_at)}
          </div>
        </div>
        <span className="text-[12px] text-[#2383E2] font-medium">Continue editing</span>
      </div>
    </Link>
  );
}
