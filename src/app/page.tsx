import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-white">
      {/* ═══════════════════════════════════════════
          NAV
          ═══════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 border-b border-[#F0F0EE]">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[15px] font-semibold text-[#37352F] tracking-tight">Claimless</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-[13px] text-[#9B9A97]">
            <a href="#how-it-works" className="hover:text-[#37352F] transition-colors">How it works</a>
            <a href="#industries" className="hover:text-[#37352F] transition-colors">Industries</a>
            <a href="#pricing" className="hover:text-[#37352F] transition-colors">Pricing</a>
            <a href="#for-agencies" className="hover:text-[#37352F] transition-colors">For Agencies</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[13px] text-[#9B9A97] hover:text-[#37352F] transition-colors">Log in</Link>
            <Link href="/signup" className="text-[13px] px-4 py-2 bg-[#37352F] text-white rounded-lg font-medium hover:bg-[#2C2B28] transition-colors">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════
          HERO — Split layout, big statement
          ═══════════════════════════════════════════ */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E9E9E7] text-[12px] text-[#9B9A97] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Now onboarding Australian recruitment agencies
          </div>
          <h1 className="text-[48px] md:text-[64px] font-bold text-[#37352F] leading-[1.05] tracking-tight max-w-4xl">
            The best candidates don&apos;t always have the best resumes.
          </h1>
          <p className="text-[18px] text-[#9B9A97] mt-6 max-w-2xl leading-relaxed">
            Claimless verifies what candidates can actually do — then has a real conversation with them. Not keyword matching. Not chatbot screening. A 20-minute voice interview that tests with live scenarios.
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-10">
            <Link href="/signup" className="px-7 py-3.5 bg-[#37352F] text-white rounded-xl text-[15px] font-semibold hover:bg-[#2C2B28] transition-colors">
              Book a Demo
            </Link>
            <a href="#how-it-works" className="px-7 py-3.5 border border-[#E9E9E7] rounded-xl text-[15px] font-medium text-[#37352F] hover:bg-[#F7F6F3] transition-colors">
              See how it works
            </a>
          </div>

          {/* Trust bar */}
          <div className="flex flex-wrap items-center gap-x-10 gap-y-3 mt-16 pt-8 border-t border-[#F0F0EE]">
            <span className="text-[13px] text-[#D3D1CB]">Trusted by</span>
            <span className="text-[14px] font-medium text-[#9B9A97]">Australian recruitment agencies</span>
            <span className="text-[13px] text-[#D3D1CB]">|</span>
            <span className="text-[14px] text-[#9B9A97]">14 industries</span>
            <span className="text-[13px] text-[#D3D1CB]">|</span>
            <span className="text-[14px] text-[#9B9A97]">227 skills assessed</span>
            <span className="text-[13px] text-[#D3D1CB]">|</span>
            <span className="text-[14px] text-[#9B9A97]">AU compliance built-in</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          THE PROBLEM — Dark section, bold contrast
          ═══════════════════════════════════════════ */}
      <section className="bg-[#1C1917] py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <span className="text-[12px] font-semibold text-emerald-400 uppercase tracking-widest">The Problem</span>
          <h2 className="text-[36px] md:text-[44px] font-bold text-white mt-4 leading-tight max-w-3xl">
            Traditional AI screening rejects great candidates. Manual screening can&apos;t keep up.
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mt-14">
            {[
              { stat: "75%", label: "of resumes contain exaggerations", desc: "Keyword-matching ATS can't tell the difference. Your pipeline fills with people who interview well, not work well." },
              { stat: "23hrs", label: "wasted per hire on screening", desc: "Your recruiters spend most of their day on phone screens that lead nowhere. 70-80% don't progress." },
              { stat: "10 days", label: "and top candidates are gone", desc: "While your process takes 30-45 days, the best people accept offers elsewhere." },
            ].map((item) => (
              <div key={item.stat} className="border border-white/10 rounded-2xl p-6">
                <div className="text-[36px] font-bold text-emerald-400">{item.stat}</div>
                <div className="text-[14px] font-semibold text-white mt-1">{item.label}</div>
                <p className="text-[13px] text-white/50 mt-3 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS — 3-stage pipeline
          ═══════════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <span className="text-[12px] font-semibold text-[#2383E2] uppercase tracking-widest">How it works</span>
          <h2 className="text-[36px] md:text-[44px] font-bold text-[#37352F] mt-4 leading-tight">
            Three stages. Zero guesswork.
          </h2>
          <p className="text-[16px] text-[#9B9A97] mt-4 max-w-2xl">
            Every candidate goes through the same rigorous pipeline. The entire process can run without anyone touching it.
          </p>

          <div className="mt-16 space-y-0">
            {/* Stage 1 */}
            <div className="grid md:grid-cols-2 gap-12 items-center py-12 border-b border-[#F0F0EE]">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7F6F3] text-[12px] font-semibold text-[#9B9A97]">Stage 1</div>
                <h3 className="text-[24px] font-bold text-[#37352F] mt-4">Intelligent Screening</h3>
                <p className="text-[14px] text-[#9B9A97] mt-3 leading-relaxed">
                  AI reads the full resume and checks for consistency — timeline logic, career progression, title vs responsibility. Candidates upload project files as proof of work. We scrape portfolio links. No keyword matching.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {["Resume analysis", "Project file extraction", "Portfolio scraping", "Consistency flags", "Skill matching"].map((t) => (
                    <span key={t} className="text-[11px] px-2 py-1 rounded-md bg-[#F7F6F3] text-[#9B9A97]">{t}</span>
                  ))}
                </div>
              </div>
              <div className="bg-[#F7F6F3] rounded-2xl p-8 text-center">
                <div className="text-[48px] font-bold text-[#37352F]">&lt;2 min</div>
                <div className="text-[14px] text-[#9B9A97]">full screening completed</div>
                <div className="text-[12px] text-[#D3D1CB] mt-2">What a recruiter does in 45 minutes, done instantly</div>
              </div>
            </div>

            {/* Stage 2 */}
            <div className="grid md:grid-cols-2 gap-12 items-center py-12 border-b border-[#F0F0EE]">
              <div className="md:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7F6F3] text-[12px] font-semibold text-[#9B9A97]">Stage 2 (Optional)</div>
                <h3 className="text-[24px] font-bold text-[#37352F] mt-4">Video Analysis</h3>
                <p className="text-[14px] text-[#9B9A97] mt-3 leading-relaxed">
                  Candidates submit a short Loom video. AI analyses communication clarity, confidence, technical depth, and relevance. Key quotes extracted. For client-facing roles, this is critical signal.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {["Communication 0-10", "Confidence 0-10", "Technical depth 0-10", "Key quotes"].map((t) => (
                    <span key={t} className="text-[11px] px-2 py-1 rounded-md bg-[#F7F6F3] text-[#9B9A97]">{t}</span>
                  ))}
                </div>
              </div>
              <div className="bg-[#F7F6F3] rounded-2xl p-8 text-center md:order-1">
                <div className="text-[48px] font-bold text-[#37352F]">4</div>
                <div className="text-[14px] text-[#9B9A97]">scores per video assessment</div>
                <div className="text-[12px] text-[#D3D1CB] mt-2">Loom transcript auto-scraped and analysed</div>
              </div>
            </div>

            {/* Stage 3 */}
            <div className="grid md:grid-cols-2 gap-12 items-center py-12">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[12px] font-semibold text-emerald-600">Stage 3 — The Core</div>
                <h3 className="text-[24px] font-bold text-[#37352F] mt-4">AI Voice Interview</h3>
                <p className="text-[14px] text-[#9B9A97] mt-3 leading-relaxed">
                  A 20-minute live voice conversation with an AI that already knows their resume, project files, screening results, and Loom analysis. Mandatory live problem solving, depth pursuit, anti-coaching detection. Not a chatbot — a sharp interviewer.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {["GPT-5 powered", "8 assessment techniques", "Mandatory phases", "Full transcript", "Scored report"].map((t) => (
                    <span key={t} className="text-[11px] px-2 py-1 rounded-md bg-emerald-50 text-emerald-600">{t}</span>
                  ))}
                </div>
              </div>
              <div className="bg-[#37352F] rounded-2xl p-8 text-center">
                <div className="text-[48px] font-bold text-white">20 min</div>
                <div className="text-[14px] text-white/60">live voice interview per candidate</div>
                <div className="text-[12px] text-white/30 mt-2">Deeper than any phone screen. Available 24/7.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          WHAT MAKES IT DIFFERENT — Horizontal cards
          ═══════════════════════════════════════════ */}
      <section className="bg-[#F7F6F3] py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <span className="text-[12px] font-semibold text-[#2383E2] uppercase tracking-widest">Why it&apos;s different</span>
          <h2 className="text-[36px] md:text-[44px] font-bold text-[#37352F] mt-4 leading-tight max-w-3xl">
            We don&apos;t match keywords. We have conversations.
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mt-14">
            {[
              { title: "Live Problem Solving", desc: "\"You're the charge nurse, three patients crash at once — walk me through your first 60 seconds.\" The AI creates real scenarios, not generic questions.", icon: "🎯" },
              { title: "Depth Pursuit", desc: "Goes 3 levels deep on every claim. \"How did you measure that?\" → \"What was the bottleneck?\" → \"After you fixed that, what broke next?\"", icon: "🔍" },
              { title: "Anti-Coaching Detection", desc: "\"Great example — now tell me when the OPPOSITE happened.\" Coached candidates crumble. Real practitioners handle it naturally.", icon: "🛡️" },
              { title: "Failure Mode Testing", desc: "\"What could go wrong with that approach?\" People who've shipped things know the answer. People who only know theory don't.", icon: "⚡" },
              { title: "Consistency Flags", desc: "If screening found a timeline gap or inflated number, the AI probes it naturally during the interview — without revealing it knows.", icon: "🔗" },
              { title: "Humans Stay in the Loop", desc: "Every score has evidence. Every recommendation can be overridden. The recruiter sees the full transcript and makes the call.", icon: "🤝" },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-6 border border-[#E9E9E7]">
                <div className="text-[24px] mb-3">{item.icon}</div>
                <h3 className="text-[16px] font-semibold text-[#37352F]">{item.title}</h3>
                <p className="text-[13px] text-[#9B9A97] mt-2 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          INDUSTRIES — Grid
          ═══════════════════════════════════════════ */}
      <section id="industries" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <span className="text-[12px] font-semibold text-[#2383E2] uppercase tracking-widest">Industries</span>
          <h2 className="text-[36px] md:text-[44px] font-bold text-[#37352F] mt-4 leading-tight">
            14 industries. 227 skills.
          </h2>
          <p className="text-[16px] text-[#9B9A97] mt-4 max-w-2xl">
            Each with domain-specific scenarios, AU regulatory knowledge, and 4-level assessment rubrics.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mt-12">
            {[
              { icon: "🏥", label: "Healthcare", skills: 20 },
              { icon: "💰", label: "Finance", skills: 16 },
              { icon: "💼", label: "Sales", skills: 13 },
              { icon: "⚖️", label: "Legal", skills: 5 },
              { icon: "💻", label: "Technology", skills: 28 },
              { icon: "📢", label: "Marketing", skills: 12 },
              { icon: "👥", label: "HR", skills: 14 },
              { icon: "📚", label: "Education", skills: 12 },
              { icon: "⚙️", label: "Operations", skills: 11 },
              { icon: "🎨", label: "Design", skills: 11 },
              { icon: "🤝", label: "Customer Success", skills: 11 },
              { icon: "📊", label: "Data", skills: 12 },
              { icon: "🏗️", label: "Construction", skills: 14 },
              { icon: "🔧", label: "General", skills: 5 },
            ].map((ind) => (
              <div key={ind.label} className="rounded-xl border border-[#E9E9E7] p-4 text-center hover:border-[#2383E2] hover:shadow-sm transition-all cursor-default">
                <div className="text-[24px]">{ind.icon}</div>
                <div className="text-[12px] font-semibold text-[#37352F] mt-2">{ind.label}</div>
                <div className="text-[11px] text-[#D3D1CB] mt-0.5">{ind.skills} skills</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PRICING — Clean cards
          ═══════════════════════════════════════════ */}
      <section id="pricing" className="bg-[#1C1917] py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <span className="text-[12px] font-semibold text-emerald-400 uppercase tracking-widest">Pricing</span>
          <h2 className="text-[36px] md:text-[44px] font-bold text-white mt-4 leading-tight">
            Simple pricing. No surprises.
          </h2>
          <p className="text-[16px] text-white/50 mt-4 max-w-2xl">
            Pay per candidate or lock in a monthly subscription. Start small, scale as you grow.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-14">
            <div className="rounded-2xl border border-white/10 p-8">
              <div className="text-[14px] font-semibold text-emerald-400">Screen Only</div>
              <div className="text-[36px] font-bold text-white mt-2">$5</div>
              <div className="text-[13px] text-white/40">per candidate</div>
              <ul className="mt-6 space-y-3 text-[13px] text-white/60">
                <li>Resume consistency analysis</li>
                <li>Skill matching + scoring</li>
                <li>Consistency flags</li>
                <li>Interview brief generated</li>
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-emerald-400 p-8 relative">
              <div className="absolute -top-3 left-6 px-3 py-0.5 bg-emerald-400 text-[#1C1917] text-[11px] font-semibold rounded-full">Most Popular</div>
              <div className="text-[14px] font-semibold text-emerald-400">Screen + Interview</div>
              <div className="text-[36px] font-bold text-white mt-2">$20-25</div>
              <div className="text-[13px] text-white/40">per candidate</div>
              <ul className="mt-6 space-y-3 text-[13px] text-white/60">
                <li>Everything in Screen Only</li>
                <li>20-min AI voice interview</li>
                <li>Scored report with evidence</li>
                <li>Full transcript + recording</li>
                <li>ATS integration push</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 p-8">
              <div className="text-[14px] font-semibold text-emerald-400">White Label</div>
              <div className="text-[36px] font-bold text-white mt-2">Custom</div>
              <div className="text-[13px] text-white/40">monthly + usage</div>
              <ul className="mt-6 space-y-3 text-[13px] text-white/60">
                <li>Your brand on everything</li>
                <li>Custom interviewer name</li>
                <li>API + webhook integrations</li>
                <li>JobAdder / Bullhorn / Vincere</li>
                <li>Priority support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FOR AGENCIES — Split with testimonial
          ═══════════════════════════════════════════ */}
      <section id="for-agencies" className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-[12px] font-semibold text-[#2383E2] uppercase tracking-widest">For Agencies</span>
            <h2 className="text-[36px] md:text-[44px] font-bold text-[#37352F] mt-4 leading-tight">
              Your recruiters do what makes money. We handle the rest.
            </h2>
            <div className="space-y-4 mt-8">
              {[
                { from: "15 roles per recruiter", to: "25-35 roles" },
                { from: "30-45 day time-to-fill", to: "15-25 days" },
                { from: "15% interview-to-offer", to: "40-60%" },
                { from: "8-12% bad hire rate", to: "Target <3%" },
              ].map((item) => (
                <div key={item.from} className="flex items-center gap-3 text-[14px]">
                  <span className="text-[#D3D1CB] line-through">{item.from}</span>
                  <span className="text-[#D3D1CB]">→</span>
                  <span className="font-semibold text-emerald-600">{item.to}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#F7F6F3] rounded-2xl p-8">
            <div className="text-[14px] text-[#37352F] leading-relaxed">
              &ldquo;The industry is caught between two failures: keyword-matching AI that rejects good people, and manual screening that can&apos;t keep up with volume. Claimless is the conversation-based alternative — every candidate gets heard.&rdquo;
            </div>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2383E2] flex items-center justify-center text-white text-[12px] font-semibold">CL</div>
              <div>
                <div className="text-[13px] font-semibold text-[#37352F]">Claimless</div>
                <div className="text-[12px] text-[#9B9A97]">AI-Powered Recruitment Platform</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          COMPLIANCE — Clean badges
          ═══════════════════════════════════════════ */}
      <section className="bg-[#F7F6F3] py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-[20px] font-semibold text-[#37352F]">Built for Australian Compliance</h3>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {["Fair Work Act", "Anti-Discrimination", "AHPRA", "ASIC/APRA", "Privacy Act", "AITSL", "Modern Awards", "Full Audit Trail"].map((badge) => (
              <span key={badge} className="px-4 py-2 rounded-full bg-white border border-[#E9E9E7] text-[12px] font-medium text-[#37352F]">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA — Final push
          ═══════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-[36px] md:text-[48px] font-bold text-[#37352F] leading-tight">
            Ready to hire based on proof, not claims?
          </h2>
          <p className="text-[16px] text-[#9B9A97] mt-4">
            Agencies that adopt conversation-based verification now will own the competitive advantage. The ones that wait will be explaining to clients why their candidates aren&apos;t verified.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link href="/signup" className="px-8 py-4 bg-[#37352F] text-white rounded-xl text-[15px] font-semibold hover:bg-[#2C2B28] transition-colors">
              Book a Demo
            </Link>
            <Link href="/login" className="px-8 py-4 border border-[#E9E9E7] rounded-xl text-[15px] font-medium text-[#37352F] hover:bg-[#F7F6F3] transition-colors">
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════ */}
      <footer className="border-t border-[#F0F0EE] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[13px] font-semibold text-[#37352F]">Claimless</span>
          </div>
          <div className="flex items-center gap-6 text-[12px] text-[#9B9A97]">
            <a href="mailto:hello@claimless.com" className="hover:text-[#37352F] transition-colors">hello@claimless.com</a>
            <span>Sydney, Australia</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
