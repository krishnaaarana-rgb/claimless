"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, MoreHorizontal, Copy, Pause, X } from "lucide-react";

interface JobItem {
  id: string;
  title: string;
  status: string;
  department: string | null;
  location: string | null;
  employment_type: string;
  applicant_count: number;
  stage_counts: Record<string, number>;
  avg_score: number | null;
  pass_rate: number | null;
  passed_count: number;
  interviewing_count: number;
  created_at: string;
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 60000);
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff}m ago`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  draft: "bg-stone-100 text-stone-600 border-stone-200",
  paused: "bg-amber-50 text-amber-700 border-amber-200",
  closed: "bg-red-50 text-red-700 border-red-200",
};

const TYPE_LABELS: Record<string, string> = {
  full_time: "Full-time",
  contract: "Contract",
  part_time: "Part-time",
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const copyLink = (jobId: string) => {
    const url = `${window.location.origin}/apply/${jobId}`;
    navigator.clipboard.writeText(url);
    setCopied(jobId);
    setOpenMenu(null);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-stone-900">Jobs</h1>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-stone-200 rounded-xl p-5 animate-pulse"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
            >
              <div className="h-5 bg-stone-100 rounded w-48 mb-3" />
              <div className="h-3 bg-stone-100 rounded w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">Jobs</h1>
        <Link
          href="/jobs/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium text-white transition-colors"
          style={{ background: "#D97706" }}
        >
          <Plus size={14} />
          New Job
        </Link>
      </div>

      {/* Job List */}
      {jobs.length === 0 ? (
        <div
          className="bg-white border border-stone-200 rounded-xl p-12 text-center"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
        >
          <p className="text-[14px] text-stone-500 mb-4">
            No jobs yet. Create your first job to start receiving candidates.
          </p>
          <Link
            href="/jobs/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium text-white"
            style={{ background: "#D97706" }}
          >
            <Plus size={14} />
            New Job
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job, i) => (
            <div
              key={job.id}
              className="bg-white border border-stone-200 rounded-xl p-5 animate-fade-in-up hover:border-stone-300 transition-colors"
              style={{
                animationDelay: `${i * 0.03}s`,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Title + Meta */}
                  <h3 className="text-[16px] font-semibold text-stone-900">
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1 text-[13px] text-stone-500">
                    {job.department && <span>{job.department}</span>}
                    {job.department && job.location && (
                      <span className="text-stone-300">&middot;</span>
                    )}
                    {job.location && <span>{job.location}</span>}
                    {(job.department || job.location) && (
                      <span className="text-stone-300">&middot;</span>
                    )}
                    <span>
                      {TYPE_LABELS[job.employment_type] || job.employment_type}
                    </span>
                  </div>

                  {/* Stats line */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${STATUS_STYLES[job.status] || STATUS_STYLES.draft}`}
                    >
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                    <span className="text-stone-300">&middot;</span>
                    <span className="text-[13px] text-stone-500">
                      {job.applicant_count} applied
                    </span>
                    <span className="text-stone-300">&middot;</span>
                    <span className="text-[13px] text-stone-500">
                      {job.passed_count} passed
                    </span>
                    <span className="text-stone-300">&middot;</span>
                    <span className="text-[13px] text-stone-500">
                      {job.interviewing_count} interviewing
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {job.avg_score != null && (
                      <>
                        <span className="text-[12px] text-stone-400">
                          Avg Score: {job.avg_score}
                        </span>
                        <span className="text-stone-300">&middot;</span>
                      </>
                    )}
                    {job.pass_rate != null && (
                      <>
                        <span className="text-[12px] text-stone-400">
                          Pass Rate: {job.pass_rate}%
                        </span>
                        <span className="text-stone-300">&middot;</span>
                      </>
                    )}
                    <span className="text-[12px] text-stone-400">
                      Created {relativeTime(job.created_at)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {copied === job.id && (
                    <span className="text-[11px] text-emerald-600 font-medium">
                      Copied!
                    </span>
                  )}
                  <Link
                    href={`/jobs/${job.id}`}
                    className="px-3 py-1.5 rounded-lg text-[13px] font-medium border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
                  >
                    View
                  </Link>
                  <Link
                    href={`/jobs/${job.id}/edit`}
                    className="px-3 py-1.5 rounded-lg text-[13px] font-medium border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
                  >
                    Edit
                  </Link>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenMenu(openMenu === job.id ? null : job.id)
                      }
                      className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors"
                    >
                      <MoreHorizontal size={14} />
                    </button>
                    {openMenu === job.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenu(null)}
                        />
                        <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-stone-200 rounded-lg shadow-lg py-1 min-w-[160px]">
                          <button
                            onClick={() => copyLink(job.id)}
                            className="w-full text-left px-3 py-2 text-[13px] text-stone-700 hover:bg-stone-50 flex items-center gap-2 transition-colors"
                          >
                            <Copy size={13} className="text-stone-400" />
                            Copy Link
                          </button>
                          <button
                            onClick={() => setOpenMenu(null)}
                            className="w-full text-left px-3 py-2 text-[13px] text-stone-700 hover:bg-stone-50 flex items-center gap-2 transition-colors"
                          >
                            <Pause size={13} className="text-stone-400" />
                            Pause
                          </button>
                          <button
                            onClick={() => setOpenMenu(null)}
                            className="w-full text-left px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                          >
                            <X size={13} className="text-red-400" />
                            Close
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
