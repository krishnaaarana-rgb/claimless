"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  TrendingUp,
  Briefcase,
  BarChart3,
  Mail,
  MailCheck,
  Mic,
  CheckCircle2,
} from "lucide-react";

interface StatsData {
  total_candidates: number;
  candidates_trend: string;
  pass_rate: number;
  active_jobs: number;
  avg_score: number;
  candidates_by_stage: Record<string, number>;
  emails_sent: number;
  emails_delivered: number;
  interviews_scheduled: number;
  interviews_completed: number;
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

const PIPELINE_STAGES = [
  { key: "applied", label: "Applied", color: "#9B9A97" },
  { key: "stage_1_passed", label: "Passed", color: "#059669" },
  { key: "interview_invited", label: "Interview", color: "#2383E2" },
  { key: "interview_completed", label: "Done", color: "#0891B2" },
  { key: "hired", label: "Hired", color: "#16A34A" },
  { key: "rejected", label: "Rejected", color: "#DC2626" },
  { key: "pending_review", label: "Pending", color: "#F59E0B" },
];

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
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-[#37352F]">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-white border border-[#E9E9E7] rounded-lg p-5 animate-pulse"
            >
              <div className="h-3 bg-[#F7F6F3] rounded w-20 mb-4" />
              <div className="h-8 bg-[#F7F6F3] rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* Improvement 4: Empty state when no data */
  const isEmpty =
    stats &&
    (stats.total_candidates ?? 0) === 0 &&
    (stats.active_jobs ?? 0) === 0;

  if (isEmpty) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-[#37352F]">Dashboard</h1>
        <div
          className="bg-white border border-[#E9E9E7] rounded-lg p-16 text-center"
        >
          <Briefcase size={48} className="text-[#D3D1CB] mx-auto mb-6" />
          <h2 className="text-[20px] font-bold text-[#37352F] mb-2">
            Welcome to Claimless
          </h2>
          <p className="text-[14px] text-[#9B9A97] mb-6 max-w-md mx-auto">
            Create your first job posting to start receiving applications.
            Candidates will appear here as they apply.
          </p>
          <button
            onClick={() => router.push("/jobs/new")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[14px] font-medium text-white transition-colors"
            style={{ background: "#2383E2" }}
          >
            <Briefcase size={16} />
            Create Job
          </button>
        </div>
      </div>
    );
  }

  const topMetrics = [
    {
      label: "Candidates",
      value: stats?.total_candidates ?? 0,
      icon: Users,
      trend: stats?.candidates_trend,
    },
    {
      label: "Pass Rate",
      value: `${stats?.pass_rate ?? 0}%`,
      icon: TrendingUp,
    },
    {
      label: "Active Jobs",
      value: stats?.active_jobs ?? 0,
      icon: Briefcase,
    },
    {
      label: "Avg Score",
      value: stats?.avg_score ?? 0,
      icon: BarChart3,
    },
  ];

  const bottomMetrics = [
    {
      label: "Emails Sent",
      value: stats?.emails_sent ?? 0,
      icon: Mail,
    },
    {
      label: "Delivered",
      value: stats?.emails_delivered ?? 0,
      icon: MailCheck,
    },
    {
      label: "Interviews",
      value: stats?.interviews_scheduled ?? 0,
      icon: Mic,
    },
    {
      label: "Completed",
      value: stats?.interviews_completed ?? 0,
      icon: CheckCircle2,
    },
  ];

  const stageData = stats?.candidates_by_stage || {};
  const maxStageCount = Math.max(
    ...PIPELINE_STAGES.map((s) => stageData[s.key] || 0),
    1
  );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[#37352F]">Dashboard</h1>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {topMetrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="bg-white border border-[#E9E9E7] rounded-lg p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] text-[#9B9A97]">
                  {metric.label}
                </span>
                <Icon size={16} className="text-[#D3D1CB]" />
              </div>
              <div className="text-[32px] font-bold text-[#37352F] leading-none">
                {metric.value}
              </div>
              {metric.trend && (
                <div className="text-[12px] text-emerald-600 mt-1">
                  {metric.trend}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {bottomMetrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="bg-white border border-[#E9E9E7] rounded-lg p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] text-[#9B9A97]">
                  {metric.label}
                </span>
                <Icon size={16} className="text-[#D3D1CB]" />
              </div>
              <div className="text-[32px] font-bold text-[#37352F] leading-none">
                {metric.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pipeline + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Overview */}
        <div
          className="bg-white border border-[#E9E9E7] rounded-lg p-6"
        >
          <h2 className="text-[15px] font-semibold text-[#37352F] mb-5">
            Pipeline Overview
          </h2>
          <div className="space-y-3">
            {PIPELINE_STAGES.map((stage) => {
              const count = stageData[stage.key] || 0;
              const width =
                maxStageCount > 0
                  ? Math.max((count / maxStageCount) * 100, count > 0 ? 8 : 0)
                  : 0;
              return (
                <div key={stage.key} className="flex items-center gap-3">
                  <span className="text-[12px] text-[#9B9A97] w-[72px] text-right shrink-0">
                    {stage.label}
                  </span>
                  <div className="flex-1 h-5 bg-[#F7F6F3] rounded overflow-hidden">
                    <div
                      className="h-full rounded transition-all duration-500"
                      style={{
                        width: `${width}%`,
                        background: stage.color,
                        minWidth: count > 0 ? "24px" : "0",
                      }}
                    />
                  </div>
                  <span
                    className="text-[13px] font-medium text-[#37352F] w-8 text-right tabular-nums"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div
          className="bg-white border border-[#E9E9E7] rounded-lg p-6"
        >
          <h2 className="text-[15px] font-semibold text-[#37352F] mb-5">
            Recent Activity
          </h2>
          {(!stats?.recent_activity || stats.recent_activity.length === 0) ? (
            <p className="text-[13px] text-[#9B9A97] text-center py-8">
              No activity yet. Candidates will appear here as they apply.
            </p>
          ) : (
            <div className="space-y-0 max-h-[320px] overflow-y-auto">
              {stats.recent_activity.map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (item.candidate_id)
                      router.push(`/candidates/${item.candidate_id}`);
                  }}
                  className="w-full text-left flex items-start gap-3 py-2.5 hover:bg-[#F7F6F3] rounded-lg px-2 -mx-2 transition-colors"
                  style={
                    i < stats.recent_activity.length - 1
                      ? { borderBottom: "1px solid #E9E9E7" }
                      : undefined
                  }
                >
                  <div className="mt-0.5 shrink-0">
                    {activityIcon(item.type)}
                  </div>
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
          )}
        </div>
      </div>
    </div>
  );
}
