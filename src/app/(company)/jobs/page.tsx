"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, MoreHorizontal, Copy, Pause, X } from "lucide-react";

interface AssignedUser {
  user_id: string;
  name: string;
}

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
  assigned_to: AssignedUser[];
  created_by_name: string | null;
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
  draft: "bg-[#F7F6F3] text-[#37352F] border-[#E9E9E7]",
  paused: "bg-blue-50 text-blue-700 border-blue-200",
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
        <h1 className="text-2xl font-bold text-[#37352F]">Jobs</h1>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-[#E9E9E7] rounded-lg p-5 animate-pulse"
            >
              <div className="h-5 bg-[#F7F6F3] rounded w-48 mb-3" />
              <div className="h-3 bg-[#F7F6F3] rounded w-32" />
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
        <h1 className="text-2xl font-bold text-[#37352F]">Jobs</h1>
        <Link
          href="/jobs/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium text-white transition-colors"
          style={{ background: "#2383E2" }}
        >
          <Plus size={14} />
          New Job
        </Link>
      </div>

      {/* Job List */}
      {jobs.length === 0 ? (
        <div
          className="bg-white border border-[#E9E9E7] rounded-lg p-12 text-center"
        >
          <p className="text-[14px] text-[#9B9A97] mb-4">
            No jobs yet. Create your first job to start receiving candidates.
          </p>
          <Link
            href="/jobs/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium text-white"
            style={{ background: "#2383E2" }}
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
              className="bg-white border border-[#E9E9E7] rounded-lg p-5 hover:border-[#E9E9E7] transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Title + Meta */}
                  <h3 className="text-[16px] font-semibold text-[#37352F]">
                    {job.title}
                  </h3>
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
                  </div>

                  {/* Stats line */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${STATUS_STYLES[job.status] || STATUS_STYLES.draft}`}
                    >
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                    <span className="text-[#D3D1CB]">&middot;</span>
                    <span className="text-[13px] text-[#9B9A97]">
                      {job.applicant_count} applied
                    </span>
                    <span className="text-[#D3D1CB]">&middot;</span>
                    <span className="text-[13px] text-[#9B9A97]">
                      {job.passed_count} passed
                    </span>
                    <span className="text-[#D3D1CB]">&middot;</span>
                    <span className="text-[13px] text-[#9B9A97]">
                      {job.interviewing_count} interviewing
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {job.avg_score != null && (
                      <>
                        <span className="text-[12px] text-[#9B9A97]">
                          Avg Score: {job.avg_score}
                        </span>
                        <span className="text-[#D3D1CB]">&middot;</span>
                      </>
                    )}
                    {job.pass_rate != null && (
                      <>
                        <span className="text-[12px] text-[#9B9A97]">
                          Pass Rate: {job.pass_rate}%
                        </span>
                        <span className="text-[#D3D1CB]">&middot;</span>
                      </>
                    )}
                    <span className="text-[12px] text-[#9B9A97]">
                      Created {relativeTime(job.created_at)}
                      {job.created_by_name && ` by ${job.created_by_name}`}
                    </span>
                  </div>

                  {/* Assigned recruiters */}
                  {job.assigned_to && job.assigned_to.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[11px] text-[#9B9A97] uppercase tracking-wider font-medium">Assigned:</span>
                      <div className="flex items-center gap-1">
                        {job.assigned_to.map((u) => (
                          <span
                            key={u.user_id}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#DBEAFE] text-[#1D4ED8] border border-blue-200"
                          >
                            {u.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
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
                    className="px-3 py-1.5 rounded-lg text-[13px] font-medium border border-[#E9E9E7] text-[#37352F] hover:bg-[#F7F6F3] transition-colors"
                  >
                    View
                  </Link>
                  <Link
                    href={`/jobs/${job.id}/edit`}
                    className="px-3 py-1.5 rounded-lg text-[13px] font-medium border border-[#E9E9E7] text-[#37352F] hover:bg-[#F7F6F3] transition-colors"
                  >
                    Edit
                  </Link>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenMenu(openMenu === job.id ? null : job.id)
                      }
                      className="p-1.5 rounded-lg border border-[#E9E9E7] text-[#9B9A97] hover:bg-[#F7F6F3] transition-colors"
                    >
                      <MoreHorizontal size={14} />
                    </button>
                    {openMenu === job.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenu(null)}
                        />
                        <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-[#E9E9E7] rounded-lg shadow-lg py-1 min-w-[160px]">
                          <button
                            onClick={() => copyLink(job.id)}
                            className="w-full text-left px-3 py-2 text-[13px] text-[#37352F] hover:bg-[#F7F6F3] flex items-center gap-2 transition-colors"
                          >
                            <Copy size={13} className="text-[#9B9A97]" />
                            Copy Link
                          </button>
                          <button
                            onClick={async () => {
                              setOpenMenu(null);
                              const newStatus = job.status === "paused" ? "active" : "paused";
                              await fetch(`/api/jobs/${job.id}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ status: newStatus }),
                              });
                              fetchJobs();
                            }}
                            className="w-full text-left px-3 py-2 text-[13px] text-[#37352F] hover:bg-[#F7F6F3] flex items-center gap-2 transition-colors"
                          >
                            <Pause size={13} className="text-[#9B9A97]" />
                            {job.status === "paused" ? "Resume" : "Pause"}
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm(`Close "${job.title}"? This will stop accepting new applications.`)) return;
                              setOpenMenu(null);
                              await fetch(`/api/jobs/${job.id}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ status: "closed" }),
                              });
                              fetchJobs();
                            }}
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
