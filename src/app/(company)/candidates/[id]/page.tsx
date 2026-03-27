import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import type { Candidate, Application } from "@/types/database";
import { ScreenButton } from "./screen-button";
import { ActionButtons } from "./action-buttons";
import { NotesSection } from "./notes-section";
import { ShareButton } from "./share-button";
import { FileDownloadRow } from "./file-download";
import { TranscriptDownload } from "./transcript-download";

interface ATSScreeningResult {
  match_score: number;
  pass: boolean;
  summary: string;
  strengths: string[];
  concerns: string[];
  key_qualifications: {
    qualification: string;
    met: boolean;
    evidence: string;
  }[];
  recommendation: string;
  suggested_interview_topics: string[];
}

interface InterviewScoring {
  interview_score?: number;
  overall_score?: number;
  overall_impression?: string;
  communication_score?: number;
  technical_score?: number;
  cultural_fit_score?: number;
  confidence_score?: number;
  hard_skill_average?: number;
  soft_skill_average?: number;
  strengths?: string[];
  areas_for_improvement?: string[];
  key_moments?: { timestamp_approx?: string; description: string; impact?: string }[];
  recommendation?: string;
  recommendation_reasoning?: string;
  consistency_analysis?: string;
  follow_up_questions?: string[];
  hiring_risk_factors?: string[];
  comparison_notes?: string;
  skill_assessments?: {
    skill: string;
    category: string;
    expected_level: string;
    assessed_level: string;
    score: number;
    evidence: string;
    notes: string;
    depth_reached?: string;
    red_flags?: string[];
    green_flags?: string[];
  }[];
}

interface ApplicationWithJob extends Application {
  jobs: { title: string; department: string | null; location: string | null } | null;
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

function scoreColor(score: number | null): string {
  if (score == null) return "#9B9A97";
  if (score >= 70) return "#059669";
  if (score >= 40) return "#2383E2";
  return "#DC2626";
}

function scoreColorClass(score: number | null): string {
  if (score == null) return "text-[#9B9A97]";
  if (score >= 70) return "text-emerald-600";
  if (score >= 40) return "text-blue-600";
  return "text-red-600";
}

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [candidateRes, applicationsRes] = await Promise.all([
    supabase.from("candidates").select("*").eq("id", id).single(),
    supabase
      .from("applications")
      .select("*, jobs (title, department, location)")
      .eq("candidate_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!candidateRes.data) notFound();

  const candidate = candidateRes.data as Candidate;
  const applications = (applicationsRes.data || []) as ApplicationWithJob[];
  const primaryApp = applications[0] || null;

  const { data: emailLogs } = candidate.email
    ? await supabase
        .from("email_logs")
        .select("id, email_type, subject, status, created_at")
        .eq("candidate_email", candidate.email)
        .order("created_at", { ascending: false })
    : { data: null };

  // Fetch Loom analysis if available
  const { data: loomData } = primaryApp
    ? await supabase
        .from("loom_submissions")
        .select("*")
        .eq("application_id", primaryApp.id)
        .eq("status", "analyzed")
        .maybeSingle()
    : { data: null };

  const loomAnalysis = loomData?.analysis as {
    communication_clarity_score: number;
    confidence_score: number;
    technical_depth_score: number;
    relevance_score: number;
    overall_score: number;
    summary: string;
    strengths: string[];
    concerns: string[];
    key_quotes: string[];
  } | null;

  const screening = primaryApp?.match_breakdown as (ATSScreeningResult & { consistency_flags?: string[] }) | null;
  const formData = (primaryApp as unknown as { application_form_data?: Record<string, unknown> })
    ?.application_form_data as Record<string, unknown> | null;

  const interviewScoring = formData?.interview_scoring as InterviewScoring | undefined;
  const interviewTranscript = formData?.interview_transcript as string | undefined;
  const interviewRecordingUrl = formData?.interview_recording_url as string | undefined;

  const { data: interviewToken } = primaryApp
    ? await supabase
        .from("interview_tokens")
        .select("id, status, expires_at, used_at")
        .eq("application_id", primaryApp.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null };

  // Compute scores
  const atsScore = screening?.match_score ?? null;
  const ivScore = interviewScoring?.overall_score ?? interviewScoring?.interview_score ?? null;
  const combinedScore = atsScore != null && ivScore != null
    ? Math.round((atsScore * 0.4 + ivScore * 0.6))
    : atsScore ?? ivScore ?? null;
  const recommendation = interviewScoring?.recommendation;

  return (
    <div className="w-full">
      {/* Back */}
      <Link
        href="/candidates"
        className="inline-flex items-center text-[13px] text-[#9B9A97] hover:text-[#37352F] transition-colors mb-6"
      >
        <span className="mr-1">&larr;</span> Candidates
      </Link>

      {/* ═══════════════════════════════════════════════════
          SECTION 1: CANDIDATE HEADER + VERDICT
          ═══════════════════════════════════════════════════ */}
      <div className="flex items-start justify-between gap-6 mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-[28px] font-bold text-[#37352F] leading-tight tracking-tight">
            {candidate.full_name || "Unknown"}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
            {candidate.email && (
              <span className="text-[14px] text-[#9B9A97]">{candidate.email}</span>
            )}
            {candidate.phone && (
              <a href={`tel:${candidate.phone}`} className="text-[14px] text-[#9B9A97] hover:text-[#2383E2] transition-colors">{candidate.phone}</a>
            )}
          </div>
          {primaryApp && (
            <div className="text-[14px] text-[#9B9A97] mt-1">
              Applied {relativeTime(primaryApp.created_at)} for{" "}
              <span className="text-[#37352F] font-medium">
                {primaryApp.jobs?.title || "Unknown Position"}
              </span>
              {primaryApp.jobs?.department && (
                <span className="text-[#9B9A97]"> · {primaryApp.jobs.department}</span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
        {(() => {
          if (!primaryApp || primaryApp.current_stage === "rejected" || primaryApp.current_stage === "hired") return null;
          const appData = primaryApp as unknown as Record<string, unknown>;
          return (
            <ActionButtons
              applicationId={primaryApp.id}
              candidateId={candidate.id}
              currentStage={primaryApp.current_stage}
              hasInterviewToken={!!interviewToken}
              notificationSent={appData.notification_sent as boolean | undefined}
              notificationType={appData.notification_type as string | null | undefined}
              notificationSentAt={appData.notification_sent_at as string | null | undefined}
            />
          );
        })()}
        {(() => {
          if (!primaryApp) return null;
          if (primaryApp.current_stage !== "rejected" && primaryApp.current_stage !== "hired") return null;
          const appData = primaryApp as unknown as Record<string, unknown>;
          if (!appData.notification_sent) return null;
          return (
            <span className="text-[12px] text-[#9B9A97] flex items-center gap-1 shrink-0">
              <span className="text-emerald-500">{"\u2709"}</span>
              {appData.notification_type === "acceptance" ? "Acceptance" : "Rejection"} email sent
            </span>
          );
        })()}
        </div>
      </div>

      {/* Share with Client */}
      {primaryApp && (
        <div className="mb-6">
          <ShareButton applicationId={primaryApp.id} />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          SECTION 2: ASSESSMENT AT A GLANCE
          The "3-second verdict" — what agencies show clients
          ═══════════════════════════════════════════════════ */}
      <div className={`grid grid-cols-1 gap-4 mb-8 ${loomAnalysis ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
        {/* Overall Score */}
        <div className="bg-white border border-[#E9E9E7] rounded-lg p-5 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-semibold text-[#9B9A97] uppercase tracking-wider mb-2">Overall</span>
          <span
            className={`text-[40px] font-bold tabular-nums leading-none ${scoreColorClass(combinedScore)}`}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {combinedScore ?? "—"}
          </span>
          <span className="text-[12px] text-[#9B9A97] mt-1">/100</span>
          {recommendation && (
            <div className="mt-3">
              <RecBadge rec={recommendation} />
            </div>
          )}
        </div>

        {/* ATS Score Card */}
        <div className="bg-white border border-[#E9E9E7] rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-[#9B9A97] uppercase tracking-wider">ATS Screening</span>
            <span
              className={`text-[24px] font-bold tabular-nums ${scoreColorClass(atsScore)}`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {atsScore ?? "—"}
            </span>
          </div>
          {screening ? (
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
          ) : primaryApp ? (
            <div className="mt-1">
              <span className="text-[12px] text-[#9B9A97]">Not screened yet</span>
              <div className="mt-2">
                <ScreenButton applicationId={primaryApp.id} />
              </div>
            </div>
          ) : null}
        </div>

        {/* Interview Score Card */}
        <div className="bg-white border border-[#E9E9E7] rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-[#9B9A97] uppercase tracking-wider">Interview</span>
            <span
              className={`text-[24px] font-bold tabular-nums ${scoreColorClass(ivScore)}`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {ivScore ?? "—"}
            </span>
          </div>
          {interviewScoring ? (
            <ul className="space-y-1">
              {(interviewScoring.strengths || []).slice(0, 2).map((s, i) => (
                <li key={i} className="text-[12px] text-[#9B9A97] flex gap-1.5 leading-snug">
                  <span className="text-emerald-500 shrink-0">+</span>
                  <span className="line-clamp-1">{s}</span>
                </li>
              ))}
              {(interviewScoring.areas_for_improvement || []).slice(0, 1).map((a, i) => (
                <li key={i} className="text-[12px] text-[#9B9A97] flex gap-1.5 leading-snug">
                  <span className="text-red-500 shrink-0">-</span>
                  <span className="line-clamp-1">{a}</span>
                </li>
              ))}
            </ul>
          ) : interviewToken ? (
            <span className="text-[12px] text-[#9B9A97]">
              {interviewToken.status === "active" ? "In progress" :
               interviewToken.status === "expired" || new Date(interviewToken.expires_at) < new Date() ? "Link expired" :
               "Invite sent — awaiting completion"}
            </span>
          ) : (
            <span className="text-[12px] text-[#9B9A97]">Not interviewed yet</span>
          )}
        </div>

        {/* Loom Video Score Card */}
        {loomAnalysis && (
          <div className="bg-white border border-[#E9E9E7] rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-[#9B9A97] uppercase tracking-wider">Video</span>
              <span
                className={`text-[24px] font-bold tabular-nums ${scoreColorClass(loomAnalysis.overall_score * 10)}`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {loomAnalysis.overall_score}
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[#9B9A97]">Communication</span>
                <span className="text-[#37352F] font-medium">{loomAnalysis.communication_clarity_score}/10</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[#9B9A97]">Confidence</span>
                <span className="text-[#37352F] font-medium">{loomAnalysis.confidence_score}/10</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[#9B9A97]">Technical Depth</span>
                <span className="text-[#37352F] font-medium">{loomAnalysis.technical_depth_score}/10</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[#9B9A97]">Relevance</span>
                <span className="text-[#37352F] font-medium">{loomAnalysis.relevance_score}/10</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Summary */}
      {screening?.summary && (
        <div className="bg-[#F7F6F3] border border-[#E9E9E7] rounded-lg p-5 mb-8">
          <h2 className="text-[11px] font-semibold text-[#9B9A97] uppercase tracking-wider mb-2">
            AI Assessment
          </h2>
          <p className="text-[14px] text-[#37352F] leading-relaxed">
            {screening.summary}
          </p>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          SECTION 3: INTERVIEW DEEP-DIVE
          ═══════════════════════════════════════════════════ */}
      {interviewScoring && (
        <>
          <div className="border-t border-[#E9E9E7] my-8" />

          <h2 className="text-[16px] font-semibold text-[#37352F] mb-5">
            Interview Analysis
          </h2>

          {/* Overall impression */}
          {(interviewScoring.overall_impression || interviewScoring.recommendation_reasoning) && (
            <p className="text-[14px] text-[#9B9A97] leading-relaxed mb-6">
              {interviewScoring.overall_impression || interviewScoring.recommendation_reasoning}
            </p>
          )}

          {/* Score Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mb-8">
            {interviewScoring.communication_score != null && (
              <ScoreBar label="Communication" score={interviewScoring.communication_score} />
            )}
            {interviewScoring.technical_score != null && (
              <ScoreBar label="Technical" score={interviewScoring.technical_score} />
            )}
            {interviewScoring.cultural_fit_score != null && (
              <ScoreBar label="Cultural Fit" score={interviewScoring.cultural_fit_score} />
            )}
            {interviewScoring.confidence_score != null && (
              <ScoreBar label="Confidence" score={interviewScoring.confidence_score} />
            )}
            {interviewScoring.hard_skill_average != null && (
              <ScoreBar label="Hard Skills Avg" score={interviewScoring.hard_skill_average} />
            )}
            {interviewScoring.soft_skill_average != null && (
              <ScoreBar label="Soft Skills Avg" score={interviewScoring.soft_skill_average} />
            )}
          </div>

          {/* Skill Assessments (industry jobs) */}
          {interviewScoring.skill_assessments && interviewScoring.skill_assessments.length > 0 && (
            <div className="mb-8">
              <h3 className="text-[13px] font-semibold text-[#37352F] mb-3">Skill Assessment</h3>
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
                    {interviewScoring.skill_assessments.map((sa, i) => (
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
                          <span
                            className={`font-mono font-medium ${scoreColorClass(sa.score)}`}
                          >
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
          {interviewScoring.consistency_analysis && (
            <div className="bg-[#F7F6F3] border border-[#E9E9E7] rounded-lg p-4 mb-6">
              <h3 className="text-[11px] font-semibold text-[#9B9A97] uppercase tracking-wider mb-1.5">
                Consistency Analysis
              </h3>
              <p className="text-[13px] text-[#37352F] leading-relaxed">
                {interviewScoring.consistency_analysis}
              </p>
            </div>
          )}

          {/* Key Moments */}
          {(interviewScoring.key_moments?.length ?? 0) > 0 && (
            <div className="mb-8">
              <h3 className="text-[13px] font-semibold text-[#37352F] mb-3">Key Moments</h3>
              <div className="space-y-2">
                {interviewScoring.key_moments!.map((m, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-l-2 pl-4" style={{
                    borderColor: m.impact === "positive" ? "#059669" : m.impact === "negative" ? "#DC2626" : "#E9E9E7"
                  }}>
                    <span className="text-[12px] text-[#9B9A97] shrink-0 uppercase w-10">{m.timestamp_approx || ""}</span>
                    <span className="text-[13px] text-[#37352F]">{m.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths & Areas for Improvement */}
          {((interviewScoring.strengths?.length ?? 0) > 0 || (interviewScoring.areas_for_improvement?.length ?? 0) > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {(interviewScoring.strengths?.length ?? 0) > 0 && (
                <div>
                  <h3 className="text-[13px] font-semibold text-[#37352F] mb-3">Strengths</h3>
                  <ul className="space-y-2">
                    {interviewScoring.strengths!.map((s, i) => (
                      <li key={i} className="text-[13px] text-[#9B9A97] flex gap-2">
                        <span className="text-emerald-500 shrink-0">+</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {(interviewScoring.areas_for_improvement?.length ?? 0) > 0 && (
                <div>
                  <h3 className="text-[13px] font-semibold text-[#37352F] mb-3">Areas for Improvement</h3>
                  <ul className="space-y-2">
                    {interviewScoring.areas_for_improvement!.map((a, i) => (
                      <li key={i} className="text-[13px] text-[#9B9A97] flex gap-2">
                        <span className="text-blue-500 shrink-0">-</span>
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Hiring Risk Factors */}
          {(interviewScoring.hiring_risk_factors?.length ?? 0) > 0 && (
            <div className="bg-red-50/50 border border-red-100 rounded-lg p-4 mb-6">
              <h3 className="text-[11px] font-semibold text-red-600 uppercase tracking-wider mb-2">
                Risk Factors
              </h3>
              <ul className="space-y-1">
                {interviewScoring.hiring_risk_factors!.map((r, i) => (
                  <li key={i} className="text-[13px] text-red-700/70 flex gap-2">
                    <span className="shrink-0">!</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendation */}
          {interviewScoring.recommendation_reasoning && interviewScoring.overall_impression && (
            <div className="mb-6">
              <h3 className="text-[13px] font-semibold text-[#37352F] mb-2">Recommendation</h3>
              <p className="text-[14px] text-[#9B9A97] leading-relaxed">{interviewScoring.recommendation_reasoning}</p>
            </div>
          )}

          {/* Comparison Notes */}
          {interviewScoring.comparison_notes && (
            <div className="mb-6">
              <h3 className="text-[13px] font-semibold text-[#37352F] mb-2">Industry Comparison</h3>
              <p className="text-[13px] text-[#9B9A97] leading-relaxed">{interviewScoring.comparison_notes}</p>
            </div>
          )}

          {/* Follow-up Questions */}
          {(interviewScoring.follow_up_questions?.length ?? 0) > 0 && (
            <div className="mb-6">
              <h3 className="text-[13px] font-semibold text-[#37352F] mb-3">Follow-up Questions for Next Round</h3>
              <ul className="space-y-1.5">
                {interviewScoring.follow_up_questions!.map((q, i) => (
                  <li key={i} className="text-[13px] text-[#9B9A97] flex items-start gap-2">
                    <span className="text-[#2383E2] shrink-0">{i + 1}.</span>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recording & Transcript */}
          <div className="flex flex-wrap gap-3 mb-2">
            {interviewRecordingUrl && (
              <>
                <a
                  href={interviewRecordingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#2383E2] hover:text-[#1b6ec2] transition-colors"
                >
                  <span>▶</span> Open Recording
                </a>
                <audio
                  src={interviewRecordingUrl}
                  controls
                  preload="none"
                  className="w-full mt-2 rounded-lg"
                />
              </>
            )}
          </div>
          {interviewTranscript && (
            <details className="group">
              <summary className="text-[13px] font-medium text-[#2383E2] hover:text-[#1b6ec2] cursor-pointer transition-colors">
                View Full Transcript
              </summary>
              <div className="mt-3">
                <div className="flex justify-end mb-2">
                  <TranscriptDownload transcript={interviewTranscript} candidateName={candidate.full_name || "candidate"} />
                </div>
                <pre className="p-4 bg-[#F7F6F3] rounded-lg text-[12px] text-[#9B9A97] whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto border border-[#E9E9E7]">
                  {interviewTranscript}
                </pre>
              </div>
            </details>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════
          SECTION 4: ATS ASSESSMENT DETAILS
          ═══════════════════════════════════════════════════ */}
      {screening && (
        <>
          <div className="border-t border-[#E9E9E7] my-8" />

          <h2 className="text-[16px] font-semibold text-[#37352F] mb-5">
            ATS Screening Details
          </h2>

          {/* Strengths & Concerns */}
          {((screening.strengths?.length ?? 0) > 0 || (screening.concerns?.length ?? 0) > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {screening.strengths.length > 0 && (
                <div>
                  <h3 className="text-[13px] font-semibold text-[#37352F] mb-3">Strengths</h3>
                  <ul className="space-y-2">
                    {screening.strengths.map((s, i) => (
                      <li key={i} className="text-[13px] text-[#9B9A97] flex gap-2">
                        <span className="text-emerald-500 shrink-0">+</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {screening.concerns.length > 0 && (
                <div>
                  <h3 className="text-[13px] font-semibold text-[#37352F] mb-3">Concerns</h3>
                  <ul className="space-y-2">
                    {screening.concerns.map((c, i) => (
                      <li key={i} className="text-[13px] text-[#9B9A97] flex gap-2">
                        <span className="text-red-500 shrink-0">-</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Key Qualifications */}
          {(screening.key_qualifications?.length ?? 0) > 0 && (
            <div className="mb-8">
              <h3 className="text-[13px] font-semibold text-[#37352F] mb-3">Key Qualifications</h3>
              <div className="border border-[#E9E9E7] rounded-lg overflow-hidden">
                {screening.key_qualifications.map((q, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 px-4 py-3 border-b border-[#E9E9E7] last:border-0"
                  >
                    <span
                      className={`text-[13px] shrink-0 w-5 text-center font-medium ${
                        q.met ? "text-emerald-500" : "text-red-500"
                      }`}
                    >
                      {q.met ? "\u2713" : "\u2717"}
                    </span>
                    <span className="text-[13px] text-[#37352F] font-medium flex-1">{q.qualification}</span>
                    <span className="text-[12px] text-[#9B9A97] flex-1">{q.evidence}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Consistency Flags */}
          {(screening.consistency_flags?.length ?? 0) > 0 && (
            <div className="mb-8">
              <h3 className="text-[13px] font-semibold text-[#37352F] mb-3">Resume Consistency Flags</h3>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
                {screening.consistency_flags!.map((flag, i) => (
                  <div key={i} className="text-[13px] text-amber-800 flex gap-2">
                    <span className="shrink-0">&#9888;</span>
                    {flag}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interview Topics */}
          {(screening.suggested_interview_topics?.length ?? 0) > 0 && !interviewScoring && (
            <div className="mb-4">
              <h3 className="text-[13px] font-semibold text-[#37352F] mb-3">Suggested Interview Topics</h3>
              <ul className="space-y-1.5">
                {screening.suggested_interview_topics.map((t, i) => (
                  <li key={i} className="text-[13px] text-[#9B9A97] flex items-start gap-2">
                    <span className="text-[#9B9A97] shrink-0">&bull;</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Screen button when no screening exists */}
      {!screening && primaryApp && (
        <>
          <div className="border-t border-[#E9E9E7] my-8" />
          <h2 className="text-[16px] font-semibold text-[#37352F] mb-3">ATS Assessment</h2>
          <p className="text-[14px] text-[#9B9A97] mb-4">This candidate has not been screened yet.</p>
          <ScreenButton applicationId={primaryApp.id} />
        </>
      )}

      {/* ═══════════════════════════════════════════════════
          SECTION 4.5: LOOM VIDEO ANALYSIS
          ═══════════════════════════════════════════════════ */}
      {loomAnalysis && (
        <>
          <div className="border-t border-[#E9E9E7] my-8" />

          <h2 className="text-[16px] font-semibold text-[#37352F] mb-5">
            Video Analysis
          </h2>

          {/* Summary */}
          <div className="bg-[#F7F6F3] border border-[#E9E9E7] rounded-lg p-5 mb-6">
            <p className="text-[14px] text-[#37352F] leading-relaxed">
              {loomAnalysis.summary}
            </p>
          </div>

          {/* Strengths & Concerns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            {loomAnalysis.strengths.length > 0 && (
              <div>
                <h3 className="text-[13px] font-semibold text-[#37352F] mb-3">Strengths</h3>
                <ul className="space-y-2">
                  {loomAnalysis.strengths.map((s, i) => (
                    <li key={i} className="text-[13px] text-[#9B9A97] flex gap-2">
                      <span className="text-emerald-500 shrink-0">+</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {loomAnalysis.concerns.length > 0 && (
              <div>
                <h3 className="text-[13px] font-semibold text-[#37352F] mb-3">Concerns</h3>
                <ul className="space-y-2">
                  {loomAnalysis.concerns.map((c, i) => (
                    <li key={i} className="text-[13px] text-[#9B9A97] flex gap-2">
                      <span className="text-red-500 shrink-0">-</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Key Quotes */}
          {loomAnalysis.key_quotes.length > 0 && (
            <div className="mb-4">
              <h3 className="text-[13px] font-semibold text-[#37352F] mb-3">Notable Quotes</h3>
              <div className="space-y-3">
                {loomAnalysis.key_quotes.map((q, i) => (
                  <blockquote
                    key={i}
                    className="text-[13px] text-[#37352F] italic border-l-2 border-[#2383E2] pl-4 py-1"
                  >
                    &ldquo;{q}&rdquo;
                  </blockquote>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════
          SECTION 5: CANDIDATE BACKGROUND
          ═══════════════════════════════════════════════════ */}
      <div className="border-t border-[#E9E9E7] my-8" />

      <h2 className="text-[16px] font-semibold text-[#37352F] mb-4">Background</h2>

      <div className="space-y-0">
        <DetailRow label="Resume" value={(formData?.resume_filename as string) || null} />
        {typeof formData?.resume_storage_path === "string" && (
          <FileDownloadRow label="Download Resume" bucket="candidate-files" path={formData.resume_storage_path} />
        )}
        {(() => {
          const pfs = formData?.project_files as { name: string; path: string; size: number }[] | undefined;
          if (!pfs || !Array.isArray(pfs) || pfs.length === 0) return null;
          return (
            <div className="flex items-start gap-3 px-0 py-2.5 border-b border-[#F7F6F3]">
              <span className="text-[13px] text-[#9B9A97] w-28 shrink-0">Project Files</span>
              <div className="space-y-1">
                {pfs.map((pf, i) => (
                  <FileDownloadRow key={i} label={pf.name} bucket="candidate-files" path={pf.path} size={pf.size} inline />
                ))}
              </div>
            </div>
          );
        })()}
        <DetailRow label="LinkedIn" value={candidate.linkedin_url || (formData?.linkedin_url as string) || null} isLink />
        <DetailRow label="GitHub" value={candidate.github_username || (formData?.github_username as string) || null} prefix="github.com/" />
        <DetailRow label="Portfolio" value={candidate.personal_website_url || (formData?.portfolio_url as string) || null} isLink />
        <DetailRow label="Phone" value={candidate.phone || null} />
        <DetailRow label="Cover Letter" value={(formData?.cover_letter as string) || null} multiline />
        {(() => {
          const answers = formData?.custom_answers;
          if (!answers || !Array.isArray(answers)) return null;
          return (answers as { question: string; answer: string }[])
            .filter((a) => a.answer?.trim())
            .map((a, i) => (
              <DetailRow key={i} label={a.question} value={a.answer} multiline />
            ));
        })()}
      </div>

      {/* ═══════════════════════════════════════════════════
          SECTION 6: ACTIVITY
          ═══════════════════════════════════════════════════ */}
      <div className="border-t border-[#E9E9E7] my-8" />

      <h2 className="text-[16px] font-semibold text-[#37352F] mb-4">Email History</h2>

      {emailLogs && emailLogs.length > 0 ? (
        <div className="space-y-0">
          {emailLogs.map((log: { id: string; email_type: string; subject: string; status: string; created_at: string }, i: number) => (
            <div
              key={log.id}
              className="flex items-center gap-4 py-3"
              style={i < emailLogs.length - 1 ? { borderBottom: "1px solid #E9E9E7" } : undefined}
            >
              <span className="text-[13px] text-[#37352F] font-medium flex-1">
                {log.email_type === "acceptance" ? "Acceptance sent"
                  : log.email_type === "rejection" ? "Rejection sent"
                  : log.email_type === "interview_invite" ? "Interview invite sent"
                  : "Email sent"}
              </span>
              <span className="text-[12px] text-[#9B9A97] shrink-0">{relativeTime(log.created_at)}</span>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                  log.status === "sent" || log.status === "delivered"
                    ? "bg-emerald-50 text-emerald-600"
                    : log.status === "opened"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-red-50 text-red-600"
                }`}
              >
                {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[13px] text-[#9B9A97]">No emails sent yet.</p>
      )}

      <div className="border-t border-[#E9E9E7] my-8" />

      <h2 className="text-[16px] font-semibold text-[#37352F] mb-4">Internal Notes</h2>

      <NotesSection
        candidateId={id}
        applicationId={primaryApp?.id || null}
      />
    </div>
  );
}

// ────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ────────────────────────────────────────────────────────

function RecBadge({ rec }: { rec: string }) {
  const map: Record<string, { bg: string; text: string; border: string; label: string }> = {
    strong_hire: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "STRONG SHORTLIST" },
    hire: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", label: "SHORTLIST" },
    maybe: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", label: "MAYBE" },
    no_hire: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200", label: "NO" },
    strong_no_hire: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "STRONG NO" },
  };
  const style = map[rec] || map.maybe;
  return (
    <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${style.bg} ${style.text} border ${style.border}`}>
      {style.label}
    </span>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[13px] text-[#9B9A97] w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-[#F7F6F3] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, background: scoreColor(score) }}
        />
      </div>
      <span
        className="text-[13px] font-medium w-8 text-right tabular-nums"
        style={{ fontFamily: "'JetBrains Mono', monospace", color: scoreColor(score) }}
      >
        {score}
      </span>
    </div>
  );
}

function DetailRow({
  label,
  value,
  isLink,
  prefix,
  multiline,
}: {
  label: string;
  value: string | null;
  isLink?: boolean;
  prefix?: string;
  multiline?: boolean;
}) {
  return (
    <div
      className="flex items-start py-3"
      style={{ borderBottom: "1px solid #E9E9E7" }}
    >
      <span className="text-[13px] text-[#9B9A97] w-40 shrink-0">{label}</span>
      <div className="flex-1 min-w-0">
        {!value ? (
          <span className="text-[14px] text-[#9B9A97]">&mdash;</span>
        ) : multiline ? (
          <p className="text-[14px] text-[#37352F] whitespace-pre-wrap">{value}</p>
        ) : isLink ? (
          <a
            href={value.startsWith("http") ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[14px] text-[#2383E2] hover:text-[#1b6ec2] underline underline-offset-2 break-all transition-colors"
          >
            {value}
          </a>
        ) : prefix ? (
          <span className="text-[14px] text-[#37352F]">
            <span className="text-[#9B9A97]">{prefix}</span>{value}
          </span>
        ) : (
          <span className="text-[14px] text-[#37352F]">{value}</span>
        )}
      </div>
    </div>
  );
}
