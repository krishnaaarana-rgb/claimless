"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

interface CompletionData {
  candidate_name: string;
  job_title: string;
  duration_minutes: number;
}

export default function InterviewComplete() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<CompletionData | null>(null);

  useEffect(() => {
    // Fetch interview data to get candidate name and job title
    fetch(`/api/interview/${token}`)
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((json) => {
        if (json) {
          setData({
            candidate_name: json.candidate_name || "there",
            job_title: json.job_title || "",
            duration_minutes: json.interview_duration || 0,
          });
        }
      })
      .catch(() => {
        // Gracefully handle -- still show completion page
      });
  }, [token]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#FAFAF9" }}
    >
      <div className="text-center max-w-md px-6">
        {/* Green checkmark */}
        <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-emerald-500" />
        </div>

        <h1 className="text-[24px] font-bold text-stone-900 mb-3">
          Interview Complete!
        </h1>

        <p className="text-[15px] text-stone-600 leading-relaxed mb-6">
          Thank you for your time
          {data?.candidate_name ? `, ${data.candidate_name}` : ""}.
          {"\n"}We&apos;ll review your interview and be in touch with next
          steps.
        </p>

        {data?.job_title && (
          <p className="text-[13px] text-stone-400 mb-2">
            {data.job_title}
          </p>
        )}

        <p className="text-[12px] text-stone-400 mt-10">
          Powered by Claimless
        </p>
      </div>
    </div>
  );
}
