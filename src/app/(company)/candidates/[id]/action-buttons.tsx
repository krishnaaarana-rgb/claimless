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

export function ActionButtons({
  applicationId,
  currentStage,
  notificationSent,
  notificationType,
  notificationSentAt,
}: {
  applicationId: string;
  currentStage: string;
  notificationSent?: boolean;
  notificationType?: string | null;
  notificationSentAt?: string | null;
}) {
  const router = useRouter();
  const [advanceLoading, setAdvanceLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

  const advanceLabel = STAGE_ADVANCE_LABEL[currentStage] || "Advance";

  const handleAdvance = async () => {
    setAdvanceLoading(true);
    try {
      // 1. Advance the stage
      await fetch(`/api/dashboard/applications/${applicationId}/advance`, {
        method: "POST",
      });
      // 2. Send acceptance email
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
      // 1. Reject the application
      await fetch(`/api/dashboard/applications/${applicationId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Rejected from candidate detail view" }),
      });
      // 2. Send rejection email
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

  const loading = advanceLoading || rejectLoading;

  return (
    <div className="flex flex-col items-end gap-2 shrink-0">
      <div className="flex items-center gap-2">
        <button
          onClick={handleReject}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-[13px] font-medium border border-stone-200 text-stone-600 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {rejectLoading ? "Rejecting..." : "Reject"}
        </button>
        <button
          onClick={handleAdvance}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-[13px] font-medium text-white transition-colors disabled:opacity-50"
          style={{ background: "#D97706" }}
        >
          {advanceLoading ? "Sending..." : `${advanceLabel} \u2192`}
        </button>
      </div>
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
