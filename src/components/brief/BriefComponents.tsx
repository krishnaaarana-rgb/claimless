/**
 * Shared components used by both the internal candidate detail page
 * and the public shareable client brief.
 */

export interface ATSScreeningResult {
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

export interface InterviewScoring {
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

export function scoreColor(score: number | null): string {
  if (score == null) return "#9B9A97";
  if (score >= 70) return "#059669";
  if (score >= 40) return "#2383E2";
  return "#DC2626";
}

export function scoreColorClass(score: number | null): string {
  if (score == null) return "text-[#9B9A97]";
  if (score >= 70) return "text-emerald-600";
  if (score >= 40) return "text-blue-600";
  return "text-red-600";
}

export function RecBadge({ rec }: { rec: string }) {
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

export function ScoreBar({ label, score }: { label: string; score: number }) {
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

export function DetailRow({
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
