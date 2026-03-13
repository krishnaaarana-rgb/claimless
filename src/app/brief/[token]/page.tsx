"use client";

import { useState, useEffect, use } from "react";
import {
  RecBadge,
  ScoreBar,
  DetailRow,
  scoreColor,
  scoreColorClass,
  type InterviewScoring,
  type ATSScreeningResult,
} from "@/components/brief/BriefComponents";

interface BriefCandidate {
  application_id: string;
  candidate: {
    full_name: string;
    email: string | null;
    phone: string | null;
    linkedin_url: string | null;
    github_username: string | null;
    portfolio_url: string | null;
  };
  job: {
    title: string;
    department: string | null;
    location: string | null;
  };
  scores: {
    ats: number | null;
    interview: number | null;
    combined: number | null;
  };
  screening: {
    summary: string | null;
    strengths: string[];
    concerns: string[];
    key_qualifications: { qualification: string; met: boolean; evidence: string }[];
  } | null;
  interview: InterviewScoring | null;
  applied_at: string;
}

interface BriefData {
  brief_type: "single" | "shortlist";
  title: string | null;
  note: string | null;
  company: {
    name: string;
    primary_color: string;
  };
  job: { id: string; title: string; department: string | null; location: string | null } | null;
  candidates: BriefCandidate[];
}

export default function PublicBriefPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [data, setData] = useState<BriefData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/briefs/${token}`);
        if (!res.ok) {
          const err = await res.json();
          setError(err.error || "Failed to load brief");
          return;
        }
        const json = await res.json();
        setData(json);
        // Auto-expand single candidate briefs
        if (json.brief_type === "single" && json.candidates.length === 1) {
          setExpandedId(json.candidates[0].application_id);
        }
      } catch {
        setError("Failed to load brief");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#2383E2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-3 max-w-md px-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center text-red-500 text-xl">!</div>
          <h1 className="text-[20px] font-semibold text-[#37352F]">{error}</h1>
          <p className="text-[14px] text-[#9B9A97]">This link may have expired or been removed.</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { company, candidates, brief_type, job } = data;
  const isSingle = brief_type === "single" && candidates.length === 1;
  const singleCandidate = isSingle ? candidates[0] : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Print styles */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-break { page-break-before: always; }
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#E9E9E7]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: company.primary_color }}
              />
              <span className="text-[13px] font-medium text-[#9B9A97]">
                {company.name}
              </span>
            </div>
            <h1 className="text-[24px] font-bold text-[#37352F] leading-tight">
              {data.title || (isSingle
                ? `Candidate Brief — ${singleCandidate?.candidate.full_name}`
                : `Candidate Shortlist${job ? ` — ${job.title}` : ""}`
              )}
            </h1>
            {data.note && (
              <p className="text-[14px] text-[#9B9A97] mt-1">{data.note}</p>
            )}
            {job && (
              <p className="text-[13px] text-[#9B9A97] mt-1">
                {job.title}
                {job.department && <span> · {job.department}</span>}
                {job.location && <span> · {job.location}</span>}
              </p>
            )}
          </div>

          <button
            onClick={() => window.print()}
            className="no-print px-4 py-2 rounded-lg text-[13px] font-medium border border-[#E9E9E7] text-[#37352F] hover:bg-[#F7F6F3] transition-colors"
          >
            Export PDF
          </button>
        </div>

        {/* Shortlist comparison table */}
        {!isSingle && candidates.length > 1 && (
          <div className="mb-10">
            <h2 className="text-[16px] font-semibold text-[#37352F] mb-4">
              Candidate Comparison
            </h2>
            <div className="border border-[#E9E9E7] rounded-lg overflow-hidden overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-[#F7F6F3] border-b border-[#E9E9E7]">
                    <th className="text-left font-medium text-[#9B9A97] px-4 py-3 w-8">#</th>
                    <th className="text-left font-medium text-[#9B9A97] px-4 py-3">Candidate</th>
                    <th className="text-center font-medium text-[#9B9A97] px-3 py-3 w-20">Combined</th>
                    <th className="text-center font-medium text-[#9B9A97] px-3 py-3 w-16">ATS</th>
                    <th className="text-center font-medium text-[#9B9A97] px-3 py-3 w-20">Interview</th>
                    <th className="text-center font-medium text-[#9B9A97] px-3 py-3 w-24">Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c, idx) => {
                    const bestCombined = Math.max(...candidates.map(x => x.scores.combined ?? 0));
                    const isBest = c.scores.combined === bestCombined && bestCombined > 0;
                    return (
                      <tr
                        key={c.application_id}
                        className={`border-b border-[#E9E9E7] last:border-0 cursor-pointer hover:bg-[#F7F6F3]/50 transition-colors ${isBest ? "bg-emerald-50/30" : ""}`}
                        onClick={() => setExpandedId(expandedId === c.application_id ? null : c.application_id)}
                      >
                        <td className="px-4 py-3">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            idx === 0 ? "bg-amber-100 text-amber-700" : idx === 1 ? "bg-gray-100 text-gray-600" : "bg-[#F7F6F3] text-[#9B9A97]"
                          }`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-[#37352F]">{c.candidate.full_name}</div>
                          <div className="text-[11px] text-[#9B9A97]">{c.job.title}</div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span
                            className={`text-[16px] font-bold tabular-nums ${scoreColorClass(c.scores.combined)}`}
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                          >
                            {c.scores.combined ?? "—"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span
                            className={`font-medium tabular-nums ${scoreColorClass(c.scores.ats)}`}
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                          >
                            {c.scores.ats ?? "—"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span
                            className={`font-medium tabular-nums ${scoreColorClass(c.scores.interview)}`}
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                          >
                            {c.scores.interview ?? "—"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          {c.interview?.recommendation ? (
                            <RecBadge rec={c.interview.recommendation as string} />
                          ) : (
                            <span className="text-[#9B9A97]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Candidate detail cards */}
        {candidates.map((c, idx) => {
          const isExpanded = expandedId === c.application_id;
          const showFull = isSingle || isExpanded;

          return (
            <div
              key={c.application_id}
              className={`mb-8 ${idx > 0 ? "print-break" : ""}`}
            >
              {/* Candidate header — clickable in shortlist mode */}
              {!isSingle && (
                <button
                  onClick={() => setExpandedId(isExpanded ? null : c.application_id)}
                  className="w-full text-left flex items-center justify-between py-3 border-b border-[#E9E9E7] mb-4 no-print"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                      idx === 0 ? "bg-amber-100 text-amber-700" : idx === 1 ? "bg-gray-100 text-gray-600" : "bg-[#F7F6F3] text-[#9B9A97]"
                    }`}>
                      {idx + 1}
                    </span>
                    <h2 className="text-[18px] font-semibold text-[#37352F]">
                      {c.candidate.full_name}
                    </h2>
                    {c.interview?.recommendation && (
                      <RecBadge rec={c.interview.recommendation as string} />
                    )}
                  </div>
                  <span className="text-[#9B9A97] text-[12px]">
                    {isExpanded ? "Collapse" : "Expand"}
                  </span>
                </button>
              )}

              {showFull && (
                <CandidateDetail candidate={c} isSingle={isSingle} />
              )}
            </div>
          );
        })}

        {/* Footer */}
        <div className="border-t border-[#E9E9E7] pt-6 mt-10 text-center no-print">
          <p className="text-[12px] text-[#9B9A97]">
            Powered by <span className="font-medium text-[#37352F]">Claimless</span> · AI-Powered Recruitment
          </p>
        </div>
      </div>
    </div>
  );
}

function CandidateDetail({ candidate: c, isSingle }: { candidate: BriefCandidate; isSingle: boolean }) {
  const screening = c.screening as ATSScreeningResult | null;
  const iv = c.interview as InterviewScoring | null;

  return (
    <div>
      {/* Header for single brief */}
      {isSingle && (
        <div className="mb-6">
          <h2 className="text-[24px] font-bold text-[#37352F] leading-tight">
            {c.candidate.full_name}
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 text-[14px] text-[#9B9A97]">
            {c.candidate.email && <span>{c.candidate.email}</span>}
            {c.candidate.phone && <span>{c.candidate.phone}</span>}
          </div>
          <p className="text-[14px] text-[#9B9A97] mt-1">
            {c.job.title}
            {c.job.department && <span> · {c.job.department}</span>}
          </p>
        </div>
      )}

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Overall */}
        <div className="bg-white border border-[#E9E9E7] rounded-lg p-5 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-semibold text-[#9B9A97] uppercase tracking-wider mb-2">Overall</span>
          <span
            className={`text-[40px] font-bold tabular-nums leading-none ${scoreColorClass(c.scores.combined)}`}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {c.scores.combined ?? "—"}
          </span>
          <span className="text-[12px] text-[#9B9A97] mt-1">/100</span>
          {iv?.recommendation && (
            <div className="mt-3">
              <RecBadge rec={iv.recommendation} />
            </div>
          )}
        </div>

        {/* ATS */}
        <div className="bg-white border border-[#E9E9E7] rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-[#9B9A97] uppercase tracking-wider">ATS Screening</span>
            <span
              className={`text-[24px] font-bold tabular-nums ${scoreColorClass(c.scores.ats)}`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {c.scores.ats ?? "—"}
            </span>
          </div>
          {screening && (
            <ul className="space-y-1">
              {screening.strengths.slice(0, 2).map((s, i) => (
                <li key={i} className="text-[12px] text-[#9B9A97] flex gap-1.5 leading-snug">
                  <span className="text-emerald-500 shrink-0">+</span>
                  <span className="line-clamp-1">{s}</span>
                </li>
              ))}
              {screening.concerns.slice(0, 1).map((c, i) => (
                <li key={i} className="text-[12px] text-[#9B9A97] flex gap-1.5 leading-snug">
                  <span className="text-red-500 shrink-0">-</span>
                  <span className="line-clamp-1">{c}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Interview */}
        <div className="bg-white border border-[#E9E9E7] rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-[#9B9A97] uppercase tracking-wider">Interview</span>
            <span
              className={`text-[24px] font-bold tabular-nums ${scoreColorClass(c.scores.interview)}`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {c.scores.interview ?? "—"}
            </span>
          </div>
          {iv && (
            <ul className="space-y-1">
              {(iv.strengths || []).slice(0, 2).map((s, i) => (
                <li key={i} className="text-[12px] text-[#9B9A97] flex gap-1.5 leading-snug">
                  <span className="text-emerald-500 shrink-0">+</span>
                  <span className="line-clamp-1">{s}</span>
                </li>
              ))}
              {(iv.areas_for_improvement || []).slice(0, 1).map((a, i) => (
                <li key={i} className="text-[12px] text-[#9B9A97] flex gap-1.5 leading-snug">
                  <span className="text-red-500 shrink-0">-</span>
                  <span className="line-clamp-1">{a}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* AI Summary */}
      {screening?.summary && (
        <div className="bg-[#F7F6F3] border border-[#E9E9E7] rounded-lg p-5 mb-8">
          <h3 className="text-[11px] font-semibold text-[#9B9A97] uppercase tracking-wider mb-2">
            AI Assessment
          </h3>
          <p className="text-[14px] text-[#37352F] leading-relaxed">
            {screening.summary}
          </p>
        </div>
      )}

      {/* Interview Deep-Dive */}
      {iv && (
        <>
          <div className="border-t border-[#E9E9E7] my-8" />
          <h3 className="text-[16px] font-semibold text-[#37352F] mb-5">Interview Analysis</h3>

          {(iv.overall_impression || iv.recommendation_reasoning) && (
            <p className="text-[14px] text-[#9B9A97] leading-relaxed mb-6">
              {iv.overall_impression || iv.recommendation_reasoning}
            </p>
          )}

          {/* Score Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mb-8">
            {iv.communication_score != null && <ScoreBar label="Communication" score={iv.communication_score} />}
            {iv.technical_score != null && <ScoreBar label="Technical" score={iv.technical_score} />}
            {iv.cultural_fit_score != null && <ScoreBar label="Cultural Fit" score={iv.cultural_fit_score} />}
            {iv.confidence_score != null && <ScoreBar label="Confidence" score={iv.confidence_score} />}
            {iv.hard_skill_average != null && <ScoreBar label="Hard Skills Avg" score={iv.hard_skill_average} />}
            {iv.soft_skill_average != null && <ScoreBar label="Soft Skills Avg" score={iv.soft_skill_average} />}
          </div>

          {/* Skill Assessments */}
          {iv.skill_assessments && (iv.skill_assessments as unknown[]).length > 0 && (
            <div className="mb-8">
              <h4 className="text-[13px] font-semibold text-[#37352F] mb-3">Skill Assessment</h4>
              <div className="border border-[#E9E9E7] rounded-lg overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-[#F7F6F3] border-b border-[#E9E9E7]">
                      <th className="text-left font-medium text-[#9B9A97] px-4 py-2.5">Skill</th>
                      <th className="text-center font-medium text-[#9B9A97] px-3 py-2.5 w-20">Expected</th>
                      <th className="text-center font-medium text-[#9B9A97] px-3 py-2.5 w-20">Assessed</th>
                      <th className="text-center font-medium text-[#9B9A97] px-3 py-2.5 w-16">Score</th>
                      <th className="text-left font-medium text-[#9B9A97] px-4 py-2.5">Evidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(iv.skill_assessments as { skill: string; expected_level: string; assessed_level: string; score: number; evidence: string }[]).map((sa, i) => (
                      <tr key={i} className="border-b border-[#E9E9E7] last:border-0">
                        <td className="px-4 py-2.5 text-[#37352F] font-medium">{sa.skill}</td>
                        <td className="px-3 py-2.5 text-center text-[#9B9A97] capitalize">{sa.expected_level}</td>
                        <td className="px-3 py-2.5 text-center capitalize">
                          <span className={sa.assessed_level === "not_assessed" ? "text-[#9B9A97]" :
                            sa.score >= 70 ? "text-emerald-600 font-medium" :
                            sa.score >= 40 ? "text-blue-600" : "text-red-600"}>
                            {sa.assessed_level === "not_assessed" ? "N/A" : sa.assessed_level}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`font-mono font-medium ${scoreColorClass(sa.score)}`}>
                            {sa.score}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-[#9B9A97] text-[12px] leading-snug max-w-[300px]">
                          {sa.evidence}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Consistency Analysis */}
          {iv.consistency_analysis && (
            <div className="bg-[#F7F6F3] border border-[#E9E9E7] rounded-lg p-4 mb-6">
              <h4 className="text-[11px] font-semibold text-[#9B9A97] uppercase tracking-wider mb-1.5">
                Consistency Analysis
              </h4>
              <p className="text-[13px] text-[#37352F] leading-relaxed">
                {iv.consistency_analysis}
              </p>
            </div>
          )}

          {/* Key Moments */}
          {(iv.key_moments as unknown[] | undefined)?.length ? (
            <div className="mb-8">
              <h4 className="text-[13px] font-semibold text-[#37352F] mb-3">Key Moments</h4>
              <div className="space-y-2">
                {(iv.key_moments as { timestamp_approx?: string; description: string; impact?: string }[]).map((m, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-l-2 pl-4" style={{
                    borderColor: m.impact === "positive" ? "#059669" : m.impact === "negative" ? "#DC2626" : "#E9E9E7"
                  }}>
                    <span className="text-[12px] text-[#9B9A97] shrink-0 uppercase w-10">{m.timestamp_approx || ""}</span>
                    <span className="text-[13px] text-[#37352F]">{m.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Strengths & Improvements */}
          {((iv.strengths as unknown[] | undefined)?.length || (iv.areas_for_improvement as unknown[] | undefined)?.length) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {(iv.strengths as string[] | undefined)?.length ? (
                <div>
                  <h4 className="text-[13px] font-semibold text-[#37352F] mb-3">Strengths</h4>
                  <ul className="space-y-2">
                    {(iv.strengths as string[]).map((s, i) => (
                      <li key={i} className="text-[13px] text-[#9B9A97] flex gap-2">
                        <span className="text-emerald-500 shrink-0">+</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {(iv.areas_for_improvement as string[] | undefined)?.length ? (
                <div>
                  <h4 className="text-[13px] font-semibold text-[#37352F] mb-3">Areas for Improvement</h4>
                  <ul className="space-y-2">
                    {(iv.areas_for_improvement as string[]).map((a, i) => (
                      <li key={i} className="text-[13px] text-[#9B9A97] flex gap-2">
                        <span className="text-blue-500 shrink-0">-</span>{a}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Risk Factors */}
          {(iv.hiring_risk_factors as unknown[] | undefined)?.length ? (
            <div className="bg-red-50/50 border border-red-100 rounded-lg p-4 mb-6">
              <h4 className="text-[11px] font-semibold text-red-600 uppercase tracking-wider mb-2">
                Risk Factors
              </h4>
              <ul className="space-y-1">
                {(iv.hiring_risk_factors as string[]).map((r, i) => (
                  <li key={i} className="text-[13px] text-red-700/70 flex gap-2">
                    <span className="shrink-0">!</span>{r}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Comparison Notes */}
          {iv.comparison_notes && (
            <div className="mb-6">
              <h4 className="text-[13px] font-semibold text-[#37352F] mb-2">Industry Comparison</h4>
              <p className="text-[13px] text-[#9B9A97] leading-relaxed">{iv.comparison_notes as string}</p>
            </div>
          )}

          {/* Follow-up Questions */}
          {(iv.follow_up_questions as unknown[] | undefined)?.length ? (
            <div className="mb-6">
              <h4 className="text-[13px] font-semibold text-[#37352F] mb-3">Suggested Follow-up Questions</h4>
              <ul className="space-y-1.5">
                {(iv.follow_up_questions as string[]).map((q, i) => (
                  <li key={i} className="text-[13px] text-[#9B9A97] flex items-start gap-2">
                    <span className="text-[#2383E2] shrink-0">{i + 1}.</span>{q}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}

      {/* ATS Details */}
      {screening && (
        <>
          <div className="border-t border-[#E9E9E7] my-8" />
          <h3 className="text-[16px] font-semibold text-[#37352F] mb-5">ATS Screening Details</h3>

          {(screening.strengths?.length > 0 || screening.concerns?.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {screening.strengths.length > 0 && (
                <div>
                  <h4 className="text-[13px] font-semibold text-[#37352F] mb-3">Strengths</h4>
                  <ul className="space-y-2">
                    {screening.strengths.map((s, i) => (
                      <li key={i} className="text-[13px] text-[#9B9A97] flex gap-2">
                        <span className="text-emerald-500 shrink-0">+</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {screening.concerns.length > 0 && (
                <div>
                  <h4 className="text-[13px] font-semibold text-[#37352F] mb-3">Concerns</h4>
                  <ul className="space-y-2">
                    {screening.concerns.map((c, i) => (
                      <li key={i} className="text-[13px] text-[#9B9A97] flex gap-2">
                        <span className="text-red-500 shrink-0">-</span>{c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {screening.key_qualifications?.length > 0 && (
            <div className="mb-8">
              <h4 className="text-[13px] font-semibold text-[#37352F] mb-3">Key Qualifications</h4>
              <div className="border border-[#E9E9E7] rounded-lg overflow-hidden">
                {screening.key_qualifications.map((q, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 px-4 py-3 border-b border-[#E9E9E7] last:border-0"
                  >
                    <span className={`text-[13px] shrink-0 w-5 text-center font-medium ${q.met ? "text-emerald-500" : "text-red-500"}`}>
                      {q.met ? "\u2713" : "\u2717"}
                    </span>
                    <span className="text-[13px] text-[#37352F] font-medium flex-1">{q.qualification}</span>
                    <span className="text-[12px] text-[#9B9A97] flex-1">{q.evidence}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Background */}
      <div className="border-t border-[#E9E9E7] my-8" />
      <h3 className="text-[16px] font-semibold text-[#37352F] mb-4">Background</h3>
      <div className="space-y-0">
        <DetailRow label="LinkedIn" value={c.candidate.linkedin_url} isLink />
        <DetailRow label="GitHub" value={c.candidate.github_username} prefix="github.com/" />
        <DetailRow label="Portfolio" value={c.candidate.portfolio_url} isLink />
        <DetailRow label="Phone" value={c.candidate.phone} />
      </div>
    </div>
  );
}
