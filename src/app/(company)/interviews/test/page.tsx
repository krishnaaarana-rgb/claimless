"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Play, ExternalLink, Copy, Check, Mic } from "lucide-react";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  department: string | null;
  industry: string | null;
  status: string;
}

export default function TestInterviewPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const [jobId, setJobId] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [resumeText, setResumeText] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    interview_url: string;
    token: string;
    job_title: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((d) => {
        const active = (d.jobs || []).filter((j: Job) => j.status === "active");
        setJobs(active);
        if (active.length > 0) setJobId(active[0].id);
        setLoadingJobs(false);
      })
      .catch(() => setLoadingJobs(false));
  }, []);

  const createTestInterview = async () => {
    if (!jobId || !candidateName.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/interview/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: jobId,
          candidate_name: candidateName.trim(),
          resume_text: resumeText.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create test interview");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/interviews"
          className="inline-flex items-center gap-1 text-[12px] text-[#9B9A97] hover:text-[#37352F] mb-3"
        >
          <ArrowLeft size={12} /> Back to Interviews
        </Link>
        <h1 className="text-xl font-semibold text-[#37352F]">Test Interview</h1>
        <p className="text-[13px] text-[#9B9A97] mt-1">
          Create a test interview session to experience the AI voice interview as a candidate.
        </p>
      </div>

      {/* Form */}
      <div className="border border-[#E9E9E7] rounded-lg bg-white p-6 space-y-5">
        {/* Job selection */}
        <div>
          <label className="block text-[12px] font-medium text-[#37352F] mb-1.5">Job</label>
          {loadingJobs ? (
            <div className="text-[13px] text-[#9B9A97]">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="text-[13px] text-[#9B9A97]">
              No active jobs found.{" "}
              <Link href="/jobs/new" className="text-[#2383E2] hover:underline">
                Create one
              </Link>{" "}
              first.
            </div>
          ) : (
            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="w-full px-3 py-2.5 border border-[#E9E9E7] rounded-md text-[13px] text-[#37352F] focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2]"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                  {j.department ? ` · ${j.department}` : ""}
                  {j.industry ? ` · ${j.industry}` : ""}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Candidate name */}
        <div>
          <label className="block text-[12px] font-medium text-[#37352F] mb-1.5">
            Test Candidate Name
          </label>
          <input
            type="text"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            placeholder="e.g. Test User"
            className="w-full px-3 py-2.5 border border-[#E9E9E7] rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2]"
          />
        </div>

        {/* Resume (optional) */}
        <div>
          <label className="block text-[12px] font-medium text-[#37352F] mb-1.5">
            Resume / Background <span className="text-[#9B9A97]">(optional)</span>
          </label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={5}
            placeholder="Paste a sample resume or background to give the AI interviewer context. Leave blank for a generic interview."
            className="w-full px-3 py-2.5 border border-[#E9E9E7] rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2] resize-none"
          />
          <p className="text-[11px] text-[#9B9A97] mt-1">
            The AI will use this to ask personalized questions, just like a real interview.
          </p>
        </div>

        {/* Submit */}
        <button
          onClick={createTestInterview}
          disabled={loading || !jobId || !candidateName.trim()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-[13px] font-medium text-white disabled:opacity-40 transition-colors"
          style={{ background: "#2383E2" }}
        >
          {loading ? (
            "Creating..."
          ) : (
            <>
              <Play size={14} /> Create Test Interview
            </>
          )}
        </button>

        {error && (
          <div className="px-3 py-2 rounded-md bg-red-50 text-[12px] text-red-700">{error}</div>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="mt-6 border border-[#E9E9E7] rounded-lg bg-white p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <Mic size={16} className="text-emerald-600" />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-[#37352F]">Interview Ready</div>
              <div className="text-[12px] text-[#9B9A97]">{result.job_title}</div>
            </div>
          </div>

          {/* Interview URL */}
          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              readOnly
              value={result.interview_url}
              className="flex-1 px-3 py-2 bg-[#F7F6F3] border border-[#E9E9E7] rounded-md text-[12px] font-mono text-[#37352F]"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(result.interview_url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="p-2 rounded-md border border-[#E9E9E7] hover:bg-[#F7F6F3] transition-colors"
            >
              {copied ? (
                <Check size={14} className="text-emerald-600" />
              ) : (
                <Copy size={14} className="text-[#9B9A97]" />
              )}
            </button>
          </div>

          {/* Open button */}
          <a
            href={result.interview_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-[13px] font-medium text-white transition-colors"
            style={{ background: "#37352F" }}
          >
            <ExternalLink size={14} /> Open Interview
          </a>

          <p className="text-[11px] text-[#9B9A97] mt-3 text-center">
            Opens in a new tab. Link expires in 24 hours. The candidate name will be &ldquo;{candidateName}&rdquo;.
          </p>
        </div>
      )}

      {/* How it works */}
      <div className="mt-6 border border-[#E9E9E7] rounded-lg bg-[#F7F6F3] p-5">
        <h3 className="text-[12px] font-semibold text-[#37352F] uppercase tracking-wide mb-2">
          How it works
        </h3>
        <ul className="space-y-1.5 text-[12px] text-[#9B9A97]">
          <li>1. Creates a temporary candidate and application record</li>
          <li>2. Generates a 24-hour interview token</li>
          <li>3. Opens the same interview prep page a real candidate sees</li>
          <li>4. The AI interviewer uses your job description, skills, and industry context</li>
          <li>5. After the interview, scoring runs automatically — check the candidate in your pipeline</li>
        </ul>
      </div>
    </div>
  );
}
