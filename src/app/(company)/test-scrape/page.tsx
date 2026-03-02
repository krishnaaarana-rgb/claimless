"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProfileResult {
  overall_score: number;
  seniority_estimate: string;
  summary: string;
  verified_skills: {
    skill: string;
    proficiency: string;
    evidence: string;
    repos: string[];
  }[];
  architectural_decisions: {
    repo: string;
    decision: string;
    context: string;
    evidence: string;
  }[];
  top_repos: {
    name: string;
    description: string;
    stars: number;
    analysis: string;
    complexity: string;
  }[];
  languages: { name: string; percentage: number; proficiency: string }[];
  frameworks: { name: string; evidence: string; proficiency: string }[];
  interview_context_summary: string;
  interview_questions_count: number;
}

const LOADING_STEPS = [
  "Scraping GitHub...",
  "Analyzing code patterns...",
  "Detecting frameworks...",
  "Evaluating architecture...",
  "Generating interview context...",
];

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative w-36 h-36">
      <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="oklch(0.22 0.01 260)" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={radius} fill="none"
          stroke="oklch(0.72 0.19 150)"
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{score}</span>
        <span className="text-xs text-muted-foreground">/100</span>
      </div>
    </div>
  );
}

function ProficiencyDot({ level }: { level: string }) {
  const color: Record<string, string> = {
    expert: "bg-green-400",
    advanced: "bg-blue-400",
    intermediate: "bg-yellow-400",
    basic: "bg-zinc-500",
  };
  return <span className={`inline-block w-2 h-2 rounded-full ${color[level] || color.basic}`} />;
}

export default function TestScrapePage() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<ProfileResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStep((s) => (s + 1) % LOADING_STEPS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleScrape = useCallback(async () => {
    if (!username.trim()) return;
    setLoading(true);
    setLoadingStep(0);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/scrape/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ github_username: username.trim() }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error || "Failed to scrape profile"); return; }
      setResult(data.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [username]);

  const copyContext = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.interview_context_summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stage 1 — Proof of Work Scraper</h1>
        <p className="mt-1 text-muted-foreground text-sm">Enter a GitHub username to generate a verified candidate profile</p>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="GitHub username (e.g. torvalds)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleScrape()}
          className="max-w-sm bg-card border-border"
        />
        <Button onClick={handleScrape} disabled={loading || !username.trim()} className="glow-primary">
          {loading ? "Analyzing..." : "Generate Profile"}
        </Button>
      </div>

      {loading && (
        <Card className="bg-card border-border">
          <CardContent className="py-10 flex flex-col items-center gap-4">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-2 border-primary/30" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
            </div>
            <div className="text-sm font-medium text-primary">{LOADING_STEPS[loadingStep]}</div>
            <div className="flex gap-1.5">
              {LOADING_STEPS.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i <= loadingStep ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">This typically takes 30–60 seconds</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive/50 bg-card">
          <CardContent className="py-4 text-destructive text-sm">{error}</CardContent>
        </Card>
      )}

      {result && (
        <div className="space-y-6">
          {/* Score + Summary */}
          <Card className="bg-card border-border animate-fade-in-up">
            <CardContent className="pt-6 flex gap-8 items-start">
              <ScoreRing score={result.overall_score} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold">{username}</h2>
                  <Badge className="bg-primary/15 text-primary border-primary/30 hover:bg-primary/15">
                    {result.seniority_estimate}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {result.interview_questions_count} interview questions generated
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Verified Skills */}
          <Card className="bg-card border-border animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
            <CardHeader><CardTitle className="text-base">Verified Skills</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.verified_skills.map((skill, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <ProficiencyDot level={skill.proficiency} />
                      <span className="text-xs text-muted-foreground capitalize">{skill.proficiency}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{skill.skill}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{skill.evidence}</div>
                      <div className="text-xs text-muted-foreground/60 mt-0.5">Repos: {skill.repos.join(", ")}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Architectural Decisions */}
          <Card className="bg-card border-border animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader><CardTitle className="text-base">Architectural Decisions</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.architectural_decisions.map((d, i) => (
                  <div key={i} className="border-l-2 border-primary/30 pl-4">
                    <div className="text-sm font-medium">{d.decision}</div>
                    <div className="text-xs text-primary/70 mt-0.5">{d.repo}</div>
                    <div className="text-xs text-muted-foreground mt-1">{d.context}</div>
                    <div className="text-xs text-muted-foreground/60 mt-0.5">Evidence: {d.evidence}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Repos */}
          <Card className="bg-card border-border animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            <CardHeader><CardTitle className="text-base">Top Repositories</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.top_repos.map((repo, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Badge variant="outline" className="text-[10px] border-border shrink-0">{repo.complexity}</Badge>
                    <div className="min-w-0">
                      <div className="text-sm font-medium">
                        {repo.name} <span className="text-muted-foreground font-normal">({repo.stars} ★)</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{repo.analysis}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Languages & Frameworks row */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-card border-border animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <CardHeader><CardTitle className="text-base">Languages</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.languages.map((lang, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary border border-border text-xs">
                      <ProficiencyDot level={lang.proficiency} />
                      {lang.name} ({lang.percentage}%)
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
              <CardHeader><CardTitle className="text-base">Frameworks & Tools</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.frameworks.map((fw, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <ProficiencyDot level={fw.proficiency} />
                      <span className="font-medium">{fw.name}</span>
                      <span className="text-muted-foreground truncate">{fw.evidence}</span>
                    </div>
                  ))}
                  {result.frameworks.length === 0 && <p className="text-xs text-muted-foreground">No frameworks detected</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interview Context */}
          <Card className="bg-card border-border animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Interview Context (for Vapi Voice Agent)</CardTitle>
                <Button variant="outline" size="sm" onClick={copyContext} className="text-xs h-7 border-border">
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="whitespace-pre-wrap text-xs leading-relaxed p-4 rounded-lg bg-background border border-border overflow-auto max-h-[500px]"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {result.interview_context_summary}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
