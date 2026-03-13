"use client";

import { useState } from "react";

export function ShareButton({ applicationId }: { applicationId: string }) {
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application_ids: [applicationId],
          brief_type: "single",
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
      <div className="flex items-center gap-2 w-full">
        <input
          readOnly
          value={shareUrl}
          className="text-[12px] px-3 py-1.5 border border-[#E9E9E7] rounded-lg bg-[#F7F6F3] text-[#37352F] flex-1 min-w-0"
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="text-[12px] px-3 py-1.5 rounded-lg border border-[#E9E9E7] text-[#37352F] hover:bg-[#F7F6F3] transition-colors shrink-0"
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
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium border border-[#E9E9E7] text-[#37352F] hover:bg-[#F7F6F3] transition-colors disabled:opacity-50"
    >
      {loading ? (
        <>
          <span className="w-3 h-3 border border-[#9B9A97] border-t-transparent rounded-full animate-spin" />
          Creating...
        </>
      ) : (
        <>
          <span className="text-[14px]">{"\u2197"}</span>
          Share with Client
        </>
      )}
    </button>
  );
}
