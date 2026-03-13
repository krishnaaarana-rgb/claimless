"use client";

import { useState } from "react";

interface ShareShortlistButtonProps {
  applicationIds: string[];
  jobId: string;
  jobTitle: string;
}

export function ShareShortlistButton({ applicationIds, jobId, jobTitle }: ShareShortlistButtonProps) {
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (applicationIds.length < 2) return null;

  const handleShare = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application_ids: applicationIds,
          brief_type: "shortlist",
          job_id: jobId,
          title: `Top Candidates — ${jobTitle}`,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const url = `${window.location.origin}/brief/${data.brief.token}`;
        setShareUrl(url);
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  if (shareUrl) {
    return (
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={shareUrl}
          className="text-[12px] px-2 py-1.5 border border-[#E9E9E7] rounded bg-[#F7F6F3] text-[#37352F] w-56 truncate"
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="text-[12px] px-2.5 py-1.5 rounded border border-[#E9E9E7] text-[#37352F] hover:bg-[#F7F6F3] transition-colors shrink-0"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleShare}
      disabled={loading}
      className="px-4 py-2 rounded-lg text-[13px] font-medium border border-[#E9E9E7] text-[#37352F] hover:bg-[#F7F6F3] transition-colors flex items-center gap-1.5 disabled:opacity-50"
    >
      {loading ? (
        <>
          <span className="w-3 h-3 border border-[#9B9A97] border-t-transparent rounded-full animate-spin" />
          Creating...
        </>
      ) : (
        <>
          <span className="text-[14px]">{"\u2197"}</span>
          Share Shortlist
        </>
      )}
    </button>
  );
}
