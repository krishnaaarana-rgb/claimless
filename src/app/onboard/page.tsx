"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const GITHUB_AUTH_URL = `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&scope=repo,read:user&redirect_uri=${typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")}/auth/github/callback`;

const STEPS = [
  { title: "Connect GitHub", desc: "We read your public repos and contribution history" },
  { title: "AI Analysis", desc: "Claude analyzes your code quality, architecture, and shipped products" },
  { title: "Verified Profile", desc: "You get a proof-of-work profile with verified skills and scores" },
  { title: "Voice Interview", desc: "An AI interviewer asks questions specific to YOUR actual work" },
];

const WHAT_WE_ANALYZE = [
  "Repository architecture & code structure",
  "Framework and language proficiency",
  "Architectural decisions & design patterns",
  "Shipped products & deployment evidence",
  "Contribution frequency & consistency",
  "Code quality signals from real commits",
];

function OnboardContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    github_denied: "GitHub authorization was denied. Please try again.",
    token_failed: "Failed to connect to GitHub. Please try again.",
    save_failed: "Something went wrong saving your profile. Please try again.",
    server_error: "An unexpected error occurred. Please try again.",
  };

  return (
    <div className="relative min-h-screen bg-grid overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="text-primary">{"\u25CF"}</span> Claimless
        </Link>
      </nav>

      <main className="relative z-10 max-w-3xl mx-auto px-8 pt-16 pb-20">
        {error && (
          <div className="mb-8 px-4 py-3 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-sm">
            {errorMessages[error] || "An error occurred. Please try again."}
          </div>
        )}

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          For candidates
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-4">
          Prove what you&apos;ve built.
          <br />
          <span className="text-primary">Skip the r&eacute;sum&eacute;.</span>
        </h1>

        <p className="text-base text-muted-foreground max-w-lg mb-10 leading-relaxed">
          Connect your GitHub and we&apos;ll generate a verified profile based on your actual code,
          shipped products, and architectural decisions. No self-reported skills. No keyword stuffing.
          Just proof.
        </p>

        <a
          href={GITHUB_AUTH_URL}
          className="inline-flex items-center gap-3 px-6 py-3.5 bg-foreground text-background rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Connect GitHub
        </a>

        {/* How it works */}
        <div className="mt-20">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">How it works</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {STEPS.map((step, i) => (
              <div key={i} className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center font-mono">{i + 1}</span>
                  <span className="text-sm font-medium">{step.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What we analyze */}
        <div className="mt-16">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">What we analyze</h2>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
            {WHAT_WE_ANALYZE.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground py-1.5">
                <span className="text-primary text-xs">{"\u2713"}</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Trust section */}
        <div className="mt-16 p-5 rounded-lg border border-border bg-card/50">
          <h3 className="text-sm font-medium mb-2">Your code stays yours</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We never modify your repositories, push code, or share your private repos with anyone.
            We only read public repository data and analyze it locally. Your GitHub token is used
            solely to access your profile and public repos during the analysis, and companies only
            see the verified profile — never your raw code.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function OnboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-grid" />}>
      <OnboardContent />
    </Suspense>
  );
}
