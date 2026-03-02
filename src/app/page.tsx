import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-grid overflow-hidden">
      {/* Gradient orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="text-xl font-bold tracking-tight">
          <span className="text-primary">●</span> Claimless
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-8 pt-32 pb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Now in private beta
        </div>

        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
          Stop reading
          <br />
          r&eacute;sum&eacute;s.
          <br />
          <span className="text-primary">Start verifying work.</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed">
          Claimless scrapes what candidates have actually built — their GitHub,
          shipped products, and real code — then interviews them with an AI that
          already knows their work. You only see candidates who are verified and
          interviewed.
        </p>

        <div className="flex items-center gap-4">
          <Link
            href="/signup"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 glow-primary"
          >
            Request Access
          </Link>
          <Link
            href="/onboard"
            className="px-6 py-3 border border-border rounded-lg text-sm font-medium hover:bg-secondary"
          >
            I&apos;m a candidate →
          </Link>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-3 mt-20">
          {[
            "GitHub Analysis",
            "Shipped Product Detection",
            "AI Voice Interviews",
            "Context-Aware Questions",
            "Verified Skill Scoring",
            "White Label Ready",
          ].map((feature) => (
            <div
              key={feature}
              className="px-3 py-1.5 rounded-lg bg-secondary text-xs text-muted-foreground border border-border"
            >
              {feature}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-20 pt-10 border-t border-border">
          <div>
            <div className="text-3xl font-bold text-primary">3</div>
            <div className="text-sm text-muted-foreground mt-1">
              Verification layers
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold">0</div>
            <div className="text-sm text-muted-foreground mt-1">
              R&eacute;sum&eacute;s required
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold">100%</div>
            <div className="text-sm text-muted-foreground mt-1">
              Proof-based hiring
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
