"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Check } from "lucide-react";

interface CompletionData {
  candidate_name: string;
  job_title: string;
  company_name: string;
}

export default function InterviewComplete() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<CompletionData | null>(null);

  useEffect(() => {
    fetch(`/api/interview/${token}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json) {
          setData({
            candidate_name: json.candidate_name || "",
            job_title: json.job_title || "",
            company_name: json.company_name || "",
          });
        }
      })
      .catch(() => {});
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center max-w-md px-6">
        {/* Checkmark */}
        <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-6">
          <Check size={28} strokeWidth={2.5} className="text-white" />
        </div>

        <h1 className="text-[22px] font-bold text-[#37352F] mb-3 tracking-tight">
          You&apos;re all done{data?.candidate_name ? `, ${data.candidate_name}` : ""}!
        </h1>

        <p className="text-[15px] text-[#9B9A97] leading-relaxed mb-8">
          Thank you for taking the time to interview
          {data?.job_title ? ` for ${data.job_title}` : ""}
          {data?.company_name ? ` at ${data.company_name}` : ""}.
          We&apos;ll review your interview and be in touch with next steps.
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F7F6F3] text-[13px] text-[#9B9A97]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Interview submitted successfully
        </div>

        <p className="text-[11px] text-[#D3D1CB] mt-16">
          Powered by Claimless
        </p>
      </div>
    </div>
  );
}
