"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const PIPELINE_STEPS = [
  "Connecting to GitHub...",
  "Scanning repositories...",
  "Analyzing code quality...",
  "Identifying architectural decisions...",
  "Generating your verified profile...",
];

interface ProfileResult {
  overall_score: number;
  seniority_estimate: string;
  summary: string;
  interview_questions_count: number;
}

function ProcessingContent() {
  const searchParams = useSearchParams();
  const candidateId = searchParams.get("candidate_id");
  const githubUsername = searchParams.get("github_username");

  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<ProfileResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const runPipeline = useCallback(async () => {
    if (!githubUsername || started) return;
    setStarted(true);

    try {
      // Fetch the candidate's GitHub token if we have a candidate_id
      let accessToken: string | undefined;
      if (candidateId) {
        const tokenRes = await fetch(`/api/candidates/token?candidate_id=${candidateId}`);
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          accessToken = tokenData.access_token;
        }
      }

      const response = await fetch("/api/scrape/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          github_username: githubUsername,
          candidate_id: candidateId,
          access_token: accessToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to generate profile");
        return;
      }

      setCurrentStep(PIPELINE_STEPS.length);
      setResult(data.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }, [githubUsername, candidateId, started]);

  useEffect(() => { runPipeline(); }, [runPipeline]);

  // Cycle through steps while processing
  useEffect(() => {
    if (result || error) return;
    const interval = setInterval(() => {
      setCurrentStep((s) => (s < PIPELINE_STEPS.length - 1 ? s + 1 : s));
    }, 5000);
    return () => clearInterval(interval);
  }, [result, error]);

  if (!githubUsername) {
    return (
      <div className="min-h-screen bg-grid flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Missing GitHub username.</p>
          <Link href="/onboard" className="text-primary text-sm mt-2 inline-block">Go back</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-grid overflow-hidden flex flex-col">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <nav className="relative z-10 px-8 py-6 max-w-6xl mx-auto w-full">
        <div className="text-xl font-bold tracking-tight">
          <span className="text-primary">{"\u25CF"}</span> Claimless
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex items-center justify-center px-8 pb-20">
        {!result && !error && (
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight mb-2">Analyzing your work</h1>
              <p className="text-sm text-muted-foreground">
                Sit tight — we&apos;re building your verified profile
              </p>
            </div>

            <div className="space-y-3 text-left">
              {PIPELINE_STEPS.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 transition-all duration-500 ${
                    i < currentStep
                      ? "bg-primary text-primary-foreground"
                      : i === currentStep
                      ? "border-2 border-primary text-primary"
                      : "border border-border text-muted-foreground"
                  }`}>
                    {i < currentStep ? "\u2713" : ""}
                  </div>
                  <span className={`text-sm transition-colors ${
                    i <= currentStep ? "text-foreground" : "text-muted-foreground/50"
                  }`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground mt-8">This typically takes 30–60 seconds</p>
          </div>
        )}

        {error && (
          <div className="max-w-md w-full text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/15 flex items-center justify-center mx-auto mb-4">
              <span className="text-destructive text-lg">{"\u2717"}</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-sm text-muted-foreground mb-6">{error}</p>
            <Link href="/onboard" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
              Try again
            </Link>
          </div>
        )}

        {result && (
          <div className="max-w-md w-full text-center">
            <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4">
              <span className="text-primary text-lg">{"\u2713"}</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Profile complete</h1>
            <p className="text-sm text-muted-foreground mb-8">
              Your verified developer profile is ready
            </p>

            <div className="p-6 rounded-xl border border-border bg-card mb-6">
              <div className="relative w-28 h-28 mx-auto mb-4">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="oklch(0.22 0.01 260)" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="54" fill="none"
                    stroke="oklch(0.72 0.19 150)"
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 54}
                    strokeDashoffset={2 * Math.PI * 54 - (result.overall_score / 100) * 2 * Math.PI * 54}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{result.overall_score}</span>
                  <span className="text-xs text-muted-foreground">/100</span>
                </div>
              </div>

              <div className="inline-flex px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium mb-3">
                {result.seniority_estimate}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
              <p className="text-xs text-muted-foreground mt-3">
                {result.interview_questions_count} personalized interview questions generated
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <Link
                href={`/test-scrape`}
                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
              >
                View Full Profile
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ProcessingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-grid" />}>
      <ProcessingContent />
    </Suspense>
  );
}
