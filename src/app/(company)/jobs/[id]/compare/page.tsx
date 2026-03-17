"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";
import { ArrowLeft, Trophy, Minus, Check, X as XIcon } from "lucide-react";

/* ─── Types ─── */
interface CandidateData {
  id: string;
  application_id: string;
  name: string;
  email: string;
  ats_score: number | null;
  interview_score: number | null;
  interview_recommendation: string | null;
  status: string;
  ai_summary: string | null;
  applied_at: string;
  github_username: string | null;
  linkedin_url: string | null;
  has_resume: boolean;
}

/* ─── Helpers ─── */
function combinedScore(ats: number | null, iv: number | null): number | null {
  if (ats != null && iv != null) return Math.round(ats * 0.4 + iv * 0.6);
  return iv ?? ats ?? null;
}

function recLabel(rec: string): string {
  switch (rec) {
    case "strong_hire": return "Strong Hire";
    case "hire": return "Hire";
    case "maybe": return "Maybe";
    case "no_hire": return "No Hire";
    case "strong_no_hire": return "Strong No";
    default: return rec;
  }
}

function recColor(rec: string): string {
  switch (rec) {
    case "strong_hire": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "hire": return "bg-green-50 text-green-700 border-green-200";
    case "maybe": return "bg-amber-50 text-amber-700 border-amber-200";
    case "no_hire": return "bg-red-50 text-red-600 border-red-200";
    case "strong_no_hire": return "bg-red-100 text-red-700 border-red-300";
    default: return "bg-[#F7F6F3] text-[#9B9A97] border-[#E9E9E7]";
  }
}

function scoreColor(score: number | null): string {
  if (score == null) return "text-[#9B9A97]";
  if (score >= 70) return "text-emerald-600";
  if (score >= 50) return "text-[#2383E2]";
  return "text-red-600";
}

function stageLabel(stage: string): string {
  switch (stage) {
    case "applied":
    case "pending_review": return "New";
    case "stage_1_passed": return "Passed";
    case "interview_invited": return "Interviewing";
    case "interview_completed": return "Interviewed";
    case "hired": return "Shortlisted";
    case "rejected":
    case "stage_1_failed": return "Rejected";
    default: return stage;
  }
}

function stagePill(stage: string): string {
  switch (stage) {
    case "stage_1_passed": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "interview_invited": return "bg-blue-50 text-blue-700 border-blue-200";
    case "interview_completed": return "bg-cyan-50 text-cyan-700 border-cyan-200";
    case "hired": return "bg-green-50 text-green-700 border-green-200";
    case "rejected":
    case "stage_1_failed": return "bg-red-50 text-red-600 border-red-200";
    default: return "bg-[#F7F6F3] text-[#37352F] border-[#E9E9E7]";
  }
}

function ScoreCell({ score, best }: { score: number | null | undefined; best?: boolean }) {
  if (score == null) return <td className="px-3 py-3 text-center text-[12px] text-[#D3D1CB]">--</td>;
  return (
    <td className={`px-3 py-3 text-center ${best ? "bg-emerald-50/50" : ""}`}>
      <span
        className={`text-[16px] font-bold tabular-nums ${scoreColor(score)}`}
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {score}
      </span>
    </td>
  );
}

/* ─── Page ─── */
export default function CompareCandidatesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: jobId } = use(params);
  const router = useRouter();

  const [jobTitle, setJobTitle] = useState("");
  const [candidates, setCandidates] = useState<(CandidateData & { combined: number | null })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch job info and candidates in parallel
      const [jobRes, candidatesRes] = await Promise.all([
        fetch(`/api/jobs/${jobId}`),
        fetch(`/api/candidates?job_id=${jobId}&sort=match_score&order=desc&page=1`),
      ]);

      if (jobRes.ok) {
        const jobData = await jobRes.json();
        setJobTitle(jobData.job?.title || "");
      }

      if (candidatesRes.ok) {
        const data = await candidatesRes.json();
        const allCandidates = (data.candidates || []) as CandidateData[];

        // Rank by combined score, take top 8 that have scores
        const ranked = allCandidates
          .map((c) => ({ ...c, combined: combinedScore(c.ats_score, c.interview_score) }))
          .filter((c) => c.combined != null && c.combined > 0)
          .sort((a, b) => (b.combined ?? 0) - (a.combined ?? 0))
          .slice(0, 8);

        setCandidates(ranked);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-48 bg-[#F7F6F3] rounded animate-pulse" />
        <div className="h-96 bg-[#F7F6F3] rounded-lg animate-pulse" />
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="space-y-6">
        <Link
          href={`/jobs/${jobId}`}
          className="inline-flex items-center text-[13px] text-[#9B9A97] hover:text-[#2383E2] transition-colors"
        >
          <ArrowLeft size={14} className="mr-1" /> Back to {jobTitle || "Job"}
        </Link>
        <div className="bg-white border border-[#E9E9E7] rounded-lg p-16 text-center">
          <Trophy size={32} className="text-[#D3D1CB] mx-auto mb-4" />
          <h2 className="text-[16px] font-semibold text-[#37352F] mb-2">No candidates to compare</h2>
          <p className="text-[14px] text-[#9B9A97] max-w-md mx-auto">
            Candidates will appear here once they have been screened. Go back to the job and screen some applicants.
          </p>
        </div>
      </div>
    );
  }

  // Find best scores for highlighting
  const bestCombined = Math.max(...candidates.map((c) => c.combined ?? 0));
  const bestAts = Math.max(...candidates.map((c) => c.ats_score ?? 0));
  const bestIv = Math.max(...candidates.map((c) => c.interview_score ?? 0));

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href={`/jobs/${jobId}`}
        className="inline-flex items-center text-[13px] text-[#9B9A97] hover:text-[#2383E2] transition-colors"
      >
        <ArrowLeft size={14} className="mr-1" /> Back to {jobTitle || "Job"}
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-[22px] font-bold text-[#37352F]">Candidate Comparison</h1>
        <p className="text-[13px] text-[#9B9A97] mt-0.5">
          {jobTitle} &middot; Top {candidates.length} candidates ranked by combined score
        </p>
      </div>

      {/* Comparison Table */}
      <div className="bg-white border border-[#E9E9E7] rounded-lg overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-[#E9E9E7]">
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[#9B9A97] uppercase tracking-wide w-36 sticky left-0 bg-white z-10">Metric</th>
              {candidates.map((c, idx) => (
                <th key={c.application_id} className="px-3 py-3 text-center min-w-[120px]">
                  <button
                    onClick={() => router.push(`/candidates/${c.id}`)}
                    className="hover:underline"
                  >
                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                      {idx === 0 && <Trophy size={12} className="text-amber-500" />}
                      <span className="text-[13px] font-semibold text-[#37352F]">{c.name}</span>
                    </div>
                  </button>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium border ${stagePill(c.status)}`}>
                    {stageLabel(c.status)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Combined Score */}
            <tr className="bg-[#F7F6F3]/60 border-b border-[#E9E9E7]">
              <td className="px-4 py-3 text-[12px] font-semibold text-[#37352F] sticky left-0 bg-[#F7F6F3]/60 z-10">
                Combined Score
              </td>
              {candidates.map((c) => (
                <ScoreCell key={c.application_id} score={c.combined} best={c.combined === bestCombined && bestCombined > 0} />
              ))}
            </tr>

            {/* ATS Score */}
            <tr className="border-b border-[#E9E9E7]">
              <td className="px-4 py-3 text-[12px] text-[#9B9A97] sticky left-0 bg-white z-10">ATS Score</td>
              {candidates.map((c) => (
                <ScoreCell key={c.application_id} score={c.ats_score} best={c.ats_score === bestAts && bestAts > 0} />
              ))}
            </tr>

            {/* Interview Score */}
            <tr className="border-b border-[#E9E9E7]">
              <td className="px-4 py-3 text-[12px] text-[#9B9A97] sticky left-0 bg-white z-10">Interview Score</td>
              {candidates.map((c) => (
                <ScoreCell key={c.application_id} score={c.interview_score} best={c.interview_score === bestIv && bestIv > 0} />
              ))}
            </tr>

            {/* Recommendation */}
            <tr className="border-b border-[#E9E9E7]">
              <td className="px-4 py-3 text-[12px] text-[#9B9A97] sticky left-0 bg-white z-10">Recommendation</td>
              {candidates.map((c) => (
                <td key={c.application_id} className="px-3 py-3 text-center">
                  {c.interview_recommendation ? (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${recColor(c.interview_recommendation)}`}>
                      {recLabel(c.interview_recommendation)}
                    </span>
                  ) : (
                    <span className="text-[12px] text-[#D3D1CB]">--</span>
                  )}
                </td>
              ))}
            </tr>

            {/* AI Summary */}
            <tr className="bg-[#F7F6F3]/60 border-b border-[#E9E9E7]">
              <td className="px-4 py-2 text-[11px] font-semibold text-[#37352F] uppercase tracking-wide sticky left-0 bg-[#F7F6F3]/60 z-10">
                AI Assessment
              </td>
              {candidates.map((c) => (
                <td key={c.application_id} className="px-3 py-2"></td>
              ))}
            </tr>
            <tr className="border-b border-[#E9E9E7]">
              <td className="px-4 py-3 sticky left-0 bg-white z-10"></td>
              {candidates.map((c) => (
                <td key={c.application_id} className="px-3 py-3 align-top">
                  {c.ai_summary ? (
                    <p className="text-[12px] text-[#37352F] leading-relaxed line-clamp-4">{c.ai_summary}</p>
                  ) : (
                    <span className="text-[12px] text-[#D3D1CB]">Not screened yet</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Links */}
            <tr className="border-b border-[#E9E9E7]">
              <td className="px-4 py-3 text-[12px] text-[#9B9A97] sticky left-0 bg-white z-10">Profiles</td>
              {candidates.map((c) => (
                <td key={c.application_id} className="px-3 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {c.github_username && (
                      <a
                        href={`https://github.com/${c.github_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#2383E2] hover:underline"
                      >
                        GitHub
                      </a>
                    )}
                    {c.linkedin_url && (
                      <a
                        href={c.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#2383E2] hover:underline"
                      >
                        LinkedIn
                      </a>
                    )}
                    {!c.github_username && !c.linkedin_url && (
                      <span className="text-[12px] text-[#D3D1CB]">--</span>
                    )}
                  </div>
                </td>
              ))}
            </tr>

            {/* View Profile CTAs */}
            <tr>
              <td className="px-4 py-4 sticky left-0 bg-white z-10"></td>
              {candidates.map((c) => (
                <td key={c.application_id} className="px-3 py-4 text-center">
                  <button
                    onClick={() => router.push(`/candidates/${c.id}`)}
                    className="px-3 py-1.5 text-[12px] font-medium text-[#2383E2] bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    Full Profile
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[11px] text-[#9B9A97]">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-emerald-50 border border-emerald-200" />
          Best in category
        </span>
        <span>Combined = 40% ATS + 60% Interview</span>
      </div>
    </div>
  );
}
