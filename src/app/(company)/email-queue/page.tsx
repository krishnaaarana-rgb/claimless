"use client";

import { useState, useEffect } from "react";
import { Mail, Clock, CheckCircle, XCircle, RefreshCw, Send } from "lucide-react";

interface EmailLog {
  id: string;
  application_id: string;
  candidate_email: string;
  email_type: string;
  subject: string;
  status: string;
  scheduled: boolean;
  send_at: string | null;
  error_message: string | null;
  created_at: string;
}

interface Stats {
  pending: number;
  processing: number;
  sent: number;
  failed: number;
  scheduled: number;
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  if (diffMs < 0) {
    // Future
    const mins = Math.ceil(-diffMs / 60000);
    if (mins < 60) return `in ${mins}m`;
    const hrs = Math.ceil(mins / 60);
    if (hrs < 24) return `in ${hrs}h`;
    return `in ${Math.ceil(hrs / 24)}d`;
  }
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function statusColor(status: string): string {
  switch (status) {
    case "sent":
    case "delivered":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "processing":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "failed":
    case "bounced":
      return "bg-red-50 text-red-600 border-red-200";
    case "opened":
      return "bg-violet-50 text-violet-700 border-violet-200";
    default:
      return "bg-[#F7F6F3] text-[#9B9A97] border-[#E9E9E7]";
  }
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "sent":
    case "delivered":
      return <CheckCircle size={13} className="text-emerald-500" />;
    case "pending":
      return <Clock size={13} className="text-amber-500" />;
    case "processing":
      return <Send size={13} className="text-blue-500" />;
    case "failed":
    case "bounced":
      return <XCircle size={13} className="text-red-500" />;
    default:
      return <Mail size={13} className="text-[#9B9A97]" />;
  }
}

export default function EmailQueuePage() {
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [stats, setStats] = useState<Stats>({ pending: 0, processing: 0, sent: 0, failed: 0, scheduled: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/dashboard/email-queue");
      if (res.ok) {
        const data = await res.json();
        setEmails(data.emails);
        setStats(data.stats);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const filtered = filter === "all"
    ? emails
    : filter === "scheduled"
    ? emails.filter((e) => e.scheduled && e.status === "pending")
    : emails.filter((e) => e.status === filter);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-[22px] font-semibold text-[#37352F]">Email Queue</h1>
        <div className="h-64 bg-[#F7F6F3] rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-[#37352F]">Email Queue</h1>
          <p className="text-[13px] text-[#9B9A97] mt-0.5">
            {emails.length} total emails &middot; auto-refreshes every 30s
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchData(); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border border-[#E9E9E7] text-[#37352F] hover:bg-[#F7F6F3] transition-colors"
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Scheduled", value: stats.scheduled, icon: Clock, color: "text-amber-500" },
          { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-500" },
          { label: "Sent", value: stats.sent, icon: CheckCircle, color: "text-emerald-500" },
          { label: "Failed", value: stats.failed, icon: XCircle, color: "text-red-500" },
          { label: "Processing", value: stats.processing, icon: Send, color: "text-blue-500" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white border border-[#E9E9E7] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={14} className={stat.color} />
                <span className="text-[12px] text-[#9B9A97]">{stat.label}</span>
              </div>
              <span className="text-[20px] font-bold text-[#37352F]">{stat.value}</span>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-1.5">
        {[
          { value: "all", label: "All" },
          { value: "scheduled", label: "Scheduled" },
          { value: "pending", label: "Pending" },
          { value: "sent", label: "Sent" },
          { value: "failed", label: "Failed" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors ${
              filter === f.value
                ? "bg-[#2383E2] text-white border-[#2383E2]"
                : "bg-white text-[#9B9A97] border-[#E9E9E7] hover:text-[#37352F] hover:border-[#D3D1CB]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Email List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[#E9E9E7] rounded-lg p-8 text-center">
          <Mail size={24} className="mx-auto text-[#D3D1CB] mb-2" />
          <p className="text-[14px] text-[#9B9A97]">No emails match this filter</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E9E9E7] rounded-lg overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[#F7F6F3] border-b border-[#E9E9E7]">
                <th className="text-left font-medium text-[#9B9A97] px-4 py-2.5">Recipient</th>
                <th className="text-left font-medium text-[#9B9A97] px-4 py-2.5">Type</th>
                <th className="text-left font-medium text-[#9B9A97] px-4 py-2.5">Subject</th>
                <th className="text-center font-medium text-[#9B9A97] px-3 py-2.5 w-24">Status</th>
                <th className="text-right font-medium text-[#9B9A97] px-4 py-2.5 w-28">
                  {filter === "scheduled" ? "Sends at" : "Time"}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((email) => (
                <tr key={email.id} className="border-b border-[#E9E9E7] last:border-0 hover:bg-[#FAFAF9]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StatusIcon status={email.status} />
                      <span className="text-[#37352F] font-medium truncate max-w-[200px]">
                        {email.candidate_email}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                      email.email_type === "acceptance"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : email.email_type === "rejection"
                        ? "bg-red-50 text-red-600 border-red-200"
                        : "bg-[#F7F6F3] text-[#9B9A97] border-[#E9E9E7]"
                    }`}>
                      {email.email_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#9B9A97] truncate max-w-[250px]">
                    {email.subject}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${statusColor(email.status)}`}>
                      {email.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-[#9B9A97] text-[12px]">
                    {email.scheduled && email.status === "pending" && email.send_at
                      ? relativeTime(email.send_at)
                      : relativeTime(email.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Failed emails hint */}
      {stats.failed > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-[13px] text-red-700">
          {stats.failed} email{stats.failed > 1 ? "s" : ""} failed to send. Check your email provider settings and API key.
        </div>
      )}
    </div>
  );
}
