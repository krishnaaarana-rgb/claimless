"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STAGE_ADVANCE_LABEL: Record<string, string> = {
  applied: "Pass ATS",
  pending_review: "Pass ATS",
  stage_1_passed: "Invite to Interview",
  interview_invited: "Complete Interview",
  interview_completed: "Hire",
};

const INVITE_ELIGIBLE_STAGES = ["applied", "pending_review", "stage_1_passed"];

export function ActionButtons({
  applicationId,
  candidateId,
  currentStage,
  hasInterviewToken,
  notificationSent,
  notificationType,
  notificationSentAt,
}: {
  applicationId: string;
  candidateId: string;
  currentStage: string;
  hasInterviewToken: boolean;
  notificationSent?: boolean;
  notificationType?: string | null;
  notificationSentAt?: string | null;
}) {
  const router = useRouter();
  const [advanceLoading, setAdvanceLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [interviewUrl, setInterviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const advanceLabel = STAGE_ADVANCE_LABEL[currentStage] || "Advance";
  const showInviteButton = INVITE_ELIGIBLE_STAGES.includes(currentStage);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleInvite = async () => {
    setInviteLoading(true);
    try {
      const res = await fetch(`/api/candidates/${candidateId}/invite`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || "Failed to send invite");
        return;
      }
      const data = await res.json();
      setInterviewUrl(data.interview_url);

      if (data.already_existed) {
        showToast("Interview link ready");
      } else {
        showToast("Interview invite sent!");
      }
      router.refresh();
    } catch {
      showToast("Failed to send invite");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (interviewUrl) {
      await navigator.clipboard.writeText(interviewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }
    // If no URL yet, fetch it
    setInviteLoading(true);
    try {
      const res = await fetch(`/api/candidates/${candidateId}/invite`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setInterviewUrl(data.interview_url);
        await navigator.clipboard.writeText(data.interview_url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        showToast("Interview link copied!");
      }
    } catch {
      showToast("Failed to get interview link");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleAdvance = async () => {
    setAdvanceLoading(true);
    try {
      await fetch(`/api/dashboard/applications/${applicationId}/advance`, {
        method: "POST",
      });
      await fetch(`/api/dashboard/applications/${applicationId}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "acceptance" }),
      });
      router.refresh();
    } finally {
      setAdvanceLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm("Reject this candidate? A rejection email will be sent.")) {
      return;
    }
    setRejectLoading(true);
    try {
      await fetch(`/api/dashboard/applications/${applicationId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Rejected from candidate detail view" }),
      });
      await fetch(`/api/dashboard/applications/${applicationId}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "rejection" }),
      });
      router.refresh();
    } finally {
      setRejectLoading(false);
    }
  };

  const loading = advanceLoading || rejectLoading || inviteLoading;

  return (
    <div className="flex flex-col items-end gap-2 shrink-0">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-stone-900 text-white text-[13px] px-4 py-2.5 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={handleReject}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-[13px] font-medium border border-stone-200 text-stone-600 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {rejectLoading ? "Rejecting..." : "Reject"}
        </button>

        {/* Invite to Interview button */}
        {showInviteButton && !hasInterviewToken && (
          <button
            onClick={handleInvite}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-[13px] font-medium text-white transition-colors disabled:opacity-50"
            style={{ background: "#7C3AED" }}
          >
            {inviteLoading ? "Sending..." : "Invite to Interview"}
          </button>
        )}

        {/* Copy Interview Link (when token exists) */}
        {hasInterviewToken && (
          <button
            onClick={handleCopyLink}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-[13px] font-medium border border-violet-200 text-violet-600 hover:bg-violet-50 transition-colors disabled:opacity-50"
          >
            {copied ? "Copied!" : inviteLoading ? "Loading..." : "Copy Interview Link"}
          </button>
        )}

        <button
          onClick={handleAdvance}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-[13px] font-medium text-white transition-colors disabled:opacity-50"
          style={{ background: "#D97706" }}
        >
          {advanceLoading ? "Sending..." : `${advanceLabel} \u2192`}
        </button>
      </div>

      {/* Interview URL display */}
      {interviewUrl && (
        <div className="flex items-center gap-2 mt-1">
          <input
            readOnly
            value={interviewUrl}
            className="text-[12px] text-stone-500 bg-stone-50 border border-stone-200 rounded px-2 py-1 w-[280px] truncate"
          />
          <button
            onClick={handleCopyLink}
            className="text-[12px] font-medium text-violet-600 hover:text-violet-700 shrink-0"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}

      {notificationSent && notificationType && (
        <span className="text-[12px] text-stone-400 flex items-center gap-1">
          <span className="text-emerald-500">{"\u2709"}</span>
          {notificationType === "acceptance" ? "Acceptance" : "Rejection"} email
          sent{" "}
          {notificationSentAt ? relativeTime(notificationSentAt) : ""}
        </span>
      )}
    </div>
  );
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
