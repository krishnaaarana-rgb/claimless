"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ScreenButton({ applicationId }: { applicationId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleScreen = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/dashboard/applications/${applicationId}/screen`,
        { method: "POST" }
      );
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleScreen}
      disabled={loading}
      className="px-4 py-2 rounded-lg text-[13px] font-medium border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50"
    >
      {loading ? "Screening..." : "Run ATS Screening"}
    </button>
  );
}
