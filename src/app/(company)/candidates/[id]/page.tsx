import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import type { Candidate, Application } from "@/types/database";
import { ScreenButton } from "./screen-button";
import { ActionButtons } from "./action-buttons";
import { NotesSection } from "./notes-section";

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

function scoreStyle(score: number | null): string {
  if (score == null) return "text-stone-400";
  if (score >= 60) return "text-emerald-600";
  if (score >= 40) return "text-amber-600";
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

  // Fetch email logs for this candidate
  const { data: emailLogs } = candidate.email
    ? await supabase
        .from("email_logs")
        .select("id, email_type, subject, status, created_at")
        .eq("candidate_email", candidate.email)
        .order("created_at", { ascending: false })
    : { data: null };
  const screening = primaryApp?.match_breakdown as ATSScreeningResult | null;
  const formData = (primaryApp as unknown as { application_form_data?: Record<string, unknown> })
    ?.application_form_data as Record<string, unknown> | null;

  // Fetch interview token status
  const { data: interviewToken } = primaryApp
    ? await supabase
        .from("interview_tokens")
        .select("id, status, expires_at, used_at")
        .eq("application_id", primaryApp.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null };

  return (
    <div className="max-w-3xl">
      {/* Back link */}
      <Link
        href="/candidates"
        className="inline-flex items-center text-[13px] text-stone-500 hover:text-amber-600 transition-colors mb-6"
      >
        <span className="mr-1">&larr;</span> Back to Candidates
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h1 className="text-[28px] font-bold text-stone-900 leading-tight">
            {candidate.full_name || "Unknown"}
          </h1>
          <div className="mt-1 space-y-0.5">
            {candidate.email && (
              <div className="text-[14px] text-stone-500">{candidate.email}</div>
            )}
            {primaryApp && (
              <div className="text-[14px] text-stone-500">
                Applied {relativeTime(primaryApp.created_at)} for{" "}
                <span className="text-stone-700 font-medium">
                  {primaryApp.jobs?.title || "Unknown Position"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {(() => {
          if (!primaryApp || primaryApp.current_stage === "rejected" || primaryApp.current_stage === "hired") return null;
          const appData = primaryApp as unknown as Record<string, unknown>;
          return (
            <ActionButtons
              applicationId={primaryApp.id}
              currentStage={primaryApp.current_stage}
              notificationSent={appData.notification_sent as boolean | undefined}
              notificationType={appData.notification_type as string | null | undefined}
              notificationSentAt={appData.notification_sent_at as string | null | undefined}
            />
          );
        })()}
        {/* Notification status for rejected/hired */}
        {(() => {
          if (!primaryApp) return null;
          if (primaryApp.current_stage !== "rejected" && primaryApp.current_stage !== "hired") return null;
          const appData = primaryApp as unknown as Record<string, unknown>;
          if (!appData.notification_sent) return null;
          return (
            <span className="text-[12px] text-stone-400 flex items-center gap-1 shrink-0">
              <span className="text-emerald-500">{"\u2709"}</span>
              {appData.notification_type === "acceptance" ? "Acceptance" : "Rejection"} email sent
            </span>
          );
        })()}
      </div>

      {/* AI Summary */}
      {screening?.summary && (
        <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5 mt-6 mb-2">
          <h2 className="text-[13px] font-semibold text-stone-900 mb-2">
            AI Summary
          </h2>
          <p className="text-[14px] text-stone-700 leading-relaxed">
            {screening.summary}
          </p>
        </div>
      )}

      {/* Interview Status */}
      {interviewToken && (
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-[13px] font-medium text-stone-700">Interview:</span>
          {interviewToken.status === "used" ? (
            <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
              Completed
            </span>
          ) : interviewToken.status === "expired" || new Date(interviewToken.expires_at) < new Date() ? (
            <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
              Expired
            </span>
          ) : (
            <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
              Pending
            </span>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-stone-200 my-8" />

      {/* ATS Assessment */}
      {screening ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold text-stone-900">
              ATS Assessment
            </h2>
            <span
              className={`text-[28px] font-bold tabular-nums ${scoreStyle(screening.match_score)}`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {screening.match_score}
              <span className="text-[14px] text-stone-400 font-normal">/100</span>
            </span>
          </div>

          <div className="border-t border-stone-200 my-6" />

          {/* Summary */}
          <p className="text-[14px] text-stone-600 leading-relaxed mb-8">
            {screening.summary}
          </p>

          {/* Strengths & Concerns grid */}
          {((screening?.strengths?.length ?? 0) > 0 ||
            (screening?.concerns?.length ?? 0) > 0) && (
            <div className="grid grid-cols-2 gap-8 mb-8">
              {(screening?.strengths?.length ?? 0) > 0 && (
                <div>
                  <h3 className="text-[13px] font-semibold text-stone-900 mb-3">
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {screening.strengths.map((s, i) => (
                      <li
                        key={i}
                        className="text-[13px] text-stone-600 flex gap-2"
                      >
                        <span className="text-emerald-500 shrink-0 font-medium">
                          +
                        </span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {(screening?.concerns?.length ?? 0) > 0 && (
                <div>
                  <h3 className="text-[13px] font-semibold text-stone-900 mb-3">
                    Concerns
                  </h3>
                  <ul className="space-y-2">
                    {screening.concerns.map((c, i) => (
                      <li
                        key={i}
                        className="text-[13px] text-stone-600 flex gap-2"
                      >
                        <span className="text-red-500 shrink-0 font-medium">
                          -
                        </span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Key Qualifications */}
          {(screening?.key_qualifications?.length ?? 0) > 0 && (
            <div className="mb-8">
              <h3 className="text-[13px] font-semibold text-stone-900 mb-3">
                Key Qualifications
              </h3>
              <div className="space-y-0">
                {screening.key_qualifications.map((q, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 py-2.5"
                    style={
                      i < screening.key_qualifications.length - 1
                        ? { borderBottom: "1px solid #F5F5F4" }
                        : undefined
                    }
                  >
                    <span className="text-[13px] text-stone-700 flex-1 font-medium">
                      {q.qualification}
                    </span>
                    <span
                      className={`text-[13px] shrink-0 w-6 text-center ${
                        q.met ? "text-emerald-500" : "text-red-500"
                      }`}
                    >
                      {q.met ? "\u2713" : "\u2717"}
                    </span>
                    <span className="text-[13px] text-stone-500 flex-1">
                      {q.evidence}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interview Topics */}
          {(screening?.suggested_interview_topics?.length ?? 0) > 0 && (
            <div className="mb-4">
              <h3 className="text-[13px] font-semibold text-stone-900 mb-3">
                Interview Topics
              </h3>
              <ul className="space-y-1.5">
                {screening.suggested_interview_topics.map((t, i) => (
                  <li
                    key={i}
                    className="text-[14px] text-stone-600 flex items-start gap-2"
                  >
                    <span className="text-stone-400 shrink-0">&bull;</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : primaryApp ? (
        <div className="mb-4">
          <h2 className="text-[16px] font-semibold text-stone-900 mb-3">
            ATS Assessment
          </h2>
          <p className="text-[14px] text-stone-500 mb-4">
            This candidate has not been screened yet.
          </p>
          <ScreenButton applicationId={primaryApp.id} />
        </div>
      ) : null}

      {/* Application Details */}
      <div className="border-t border-stone-200 my-8" />

      <h2 className="text-[16px] font-semibold text-stone-900 mb-4">
        Application Details
      </h2>

      <div className="space-y-0">
        <DetailRow
          label="Resume"
          value={
            (formData?.resume_filename as string) || null
          }
        />
        <DetailRow
          label="LinkedIn"
          value={candidate.linkedin_url || (formData?.linkedin_url as string) || null}
          isLink
        />
        <DetailRow
          label="GitHub"
          value={
            candidate.github_username ||
            (formData?.github_username as string) ||
            null
          }
          prefix="github.com/"
        />
        <DetailRow
          label="Portfolio"
          value={
            candidate.personal_website_url ||
            (formData?.portfolio_url as string) ||
            null
          }
          isLink
        />
        <DetailRow label="Phone" value={candidate.phone || null} />
        <DetailRow
          label="Cover Letter"
          value={(formData?.cover_letter as string) || null}
          multiline
        />
        {/* Custom Question Answers */}
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

      {/* Email History */}
      <div className="border-t border-stone-200 my-8" />

      <h2 className="text-[16px] font-semibold text-stone-900 mb-4">
        Email History
      </h2>

      {emailLogs && emailLogs.length > 0 ? (
        <div className="space-y-0">
          {emailLogs.map((log: { id: string; email_type: string; subject: string; status: string; created_at: string }, i: number) => (
            <div
              key={log.id}
              className="flex items-center gap-4 py-3"
              style={
                i < emailLogs.length - 1
                  ? { borderBottom: "1px solid #F5F5F4" }
                  : undefined
              }
            >
              <span className="text-[13px] text-stone-700 font-medium flex-1">
                {log.email_type === "acceptance"
                  ? "Acceptance sent"
                  : log.email_type === "rejection"
                    ? "Rejection sent"
                    : log.email_type === "interview_invite"
                      ? "Interview invite sent"
                      : "Email sent"}
              </span>
              <span className="text-[12px] text-stone-400 shrink-0">
                {relativeTime(log.created_at)}
              </span>
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
        <p className="text-[13px] text-stone-400">No emails sent yet.</p>
      )}

      {/* Internal Notes */}
      <div className="border-t border-stone-200 my-8" />

      <h2 className="text-[16px] font-semibold text-stone-900 mb-4">
        Internal Notes
      </h2>

      <NotesSection
        candidateId={id}
        applicationId={primaryApp?.id || null}
      />
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
      style={{ borderBottom: "1px solid #F5F5F4" }}
    >
      <span className="text-[13px] text-stone-500 w-40 shrink-0">{label}</span>
      <div className="flex-1 min-w-0">
        {!value ? (
          <span className="text-[14px] text-stone-400">&mdash;</span>
        ) : multiline ? (
          <p className="text-[14px] text-stone-700 whitespace-pre-wrap">
            {value}
          </p>
        ) : isLink ? (
          <a
            href={value.startsWith("http") ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[14px] text-amber-600 hover:text-amber-700 underline underline-offset-2 break-all"
          >
            {value}
          </a>
        ) : prefix ? (
          <span className="text-[14px] text-stone-700">
            <span className="text-stone-400">{prefix}</span>
            {value}
          </span>
        ) : (
          <span className="text-[14px] text-stone-700">{value}</span>
        )}
      </div>
    </div>
  );
}
