# The Recruitment Problem — And How Claimless Solves It

## The Core Problem: Hiring Is Built on Trust, Not Proof

Every hire in every industry starts the same way: a candidate tells you what they can do, and you decide whether to believe them.

Resumes are marketing documents. Interviews are performances. References are curated. The entire hiring pipeline is optimised for candidates who are good at *talking about work* rather than candidates who are good at *doing work*.

This isn't a tech problem. It's an every-industry problem:
- The registered nurse who says they've managed triage in a Level 1 trauma centre — but freezes when you ask how they'd prioritise three simultaneous critical patients
- The financial adviser who claims 8 years of portfolio management — but can't walk through how they'd rebalance during a market correction
- The sales manager who says they "grew revenue 300%" — but can't explain what the pipeline looked like, what their close rate was, or what they did differently from the rep who was there before them
- The project manager who "led a $2M digital transformation" — but when you ask what went wrong and how they recovered, they have nothing

The problem isn't that candidates lie (though many do). The problem is that **the traditional process has no mechanism to verify what anyone says.** You ask, they answer, you hope.

---

## What This Costs You — The Economics of Bad Screening

### Direct Costs

| Cost Factor | Per Hire Impact |
|---|---|
| Recruiter time spent on unqualified candidates | 15-20 hours wasted per hire |
| Phone screens that lead nowhere | 70-80% of screens don't progress |
| Client interview slots burned on bad candidates | Each failed client interview damages trust |
| Bad placements (replacement guarantee) | 30% of annual salary, plus lost fee |
| Time-to-fill delay from screening bottleneck | Every extra week = lost productivity for client |

### Hidden Costs

**Inconsistency tax**: Your best recruiter screens differently from your newest. Monday morning screens are sharper than Friday afternoon. The candidate who gets your tired recruiter at 4pm might be better than the one who got your sharpest screener at 9am — but you'll never know.

**Confidence bias**: Candidates who are articulate and confident get further than candidates who are nervous but brilliant. Traditional phone screens reward performance, not competence. Your pipeline is systematically biased toward people who interview well rather than people who work well.

**The coached candidate problem**: AI interview prep tools (ChatGPT, interview coaches, STAR format generators) have created a new class of candidate who sounds perfect on the phone but can't actually do the job. Traditional screening has no defence against this.

**Speed penalty**: While your team manually screens 200 candidates over 2-3 weeks, the top 5% accept offers elsewhere. The candidates who survive your process are often the ones who were available because nobody else wanted them.

**Scale ceiling**: A recruiter can do 8-10 quality phone screens per day. That's a hard limit. When volume spikes, quality drops. When quality drops, bad candidates get through. When bad candidates get through, clients lose trust.

---

## How Claimless Actually Works — The Three-Stage Pipeline

### Stage 1: Intelligent Profile Verification

When a candidate enters your pipeline (via ATS integration, direct application, or API), Claimless builds a verified profile by analysing everything available about them.

**What we analyse:**

- **Resume deep analysis** — AI reads the full resume and checks for internal consistency: do the dates make sense? Does the career progression follow a logical path? Do the claimed responsibilities match the seniority level? Are there unexplained gaps or overlapping roles? Generates consistency flags for any issues found.
- **Project file analysis** — candidates can upload up to 5 files (PDFs, documents, images) as proof of work. PDFs are text-extracted server-side and analysed by the AI alongside the resume. The content is also injected into the voice interview prompt so the AI can ask specific questions about what the candidate submitted.
- **Code repositories (technical roles)** — for developers, engineers, and data roles, we scrape their GitHub: top 10 repos, code quality, architectural decisions, languages used, commit patterns, test coverage, README quality. This reveals what they've actually built vs. what they claim.
- **Personal website / portfolio** — we scrape and analyse whatever portfolio URL the candidate provides.
- **Candidate-submitted links** — candidates can submit up to 5 supporting links (case studies, published articles, certifications, Dribbble/Behance portfolios, project demos). We scrape and analyse each one, cross-referencing with resume claims.

All uploaded files are stored in Supabase Storage with signed download URLs. Recruiters can download resumes and project files from the candidate detail page at any time.

The key insight: **we don't just check IF they have experience. We analyse WHETHER their claimed experience is internally consistent.** The AI catches patterns across the entire resume that a human skimming for 30 seconds would miss. Any consistency flags (timeline gaps, inflated claims, title mismatches) are automatically fed to the voice interviewer to probe during the live conversation.

**Output**: A verified candidate profile with evidence-backed skill scores, consistency flags (fed directly to the AI interviewer), verified strengths, identified concerns, and a pre-generated interview brief that tells the AI interviewer exactly what to probe — including specific questions about uploaded project files.

### Stage 2: Video Communication Analysis (Optional)

Candidates submit a short Loom video responding to role-specific prompts. We automatically scrape the transcript and analyse it with AI:

- **Communication clarity** (0-10) — can they explain complex ideas simply? Is there a logical flow?
- **Confidence and presence** (0-10) — genuine comfort with the material, not performative
- **Technical depth** (0-10) — do they go beyond surface-level? Do they mention specific tools, methods, outcomes?
- **Relevance to role** (0-10) — do they connect their experience to what the job actually needs?

The AI also extracts key quotes from the transcript and flags red signals (negativity about past employers, inflated claims, generic talking points that could apply to any job).

This isn't a beauty contest. It's a communication assessment. For client-facing roles, this matters enormously. For backend technical roles, it's optional.

**Output**: A scored communication assessment with evidence, which is automatically injected into the Stage 3 interview prompt — so the AI interviewer knows how the candidate presented themselves on video and can probe any concerns raised.

### Stage 3: The AI Voice Interview — This Is the Core

This is where Claimless fundamentally changes what "screening" means.

Every candidate has a live voice conversation with an AI interviewer (powered by GPT-4o via Vapi) that is:
- **Fully briefed** on everything from Stage 1 and 2 — resume text, project file content, consistency flags, screening strengths/concerns, Loom video analysis, GitHub data (for tech roles)
- **Armed with consistency flags** — if the screening detected a timeline gap, inflated numbers, or title mismatch, the AI knows and will probe naturally without revealing it detected the issue
- **Trained on the specific industry and role** — it knows healthcare regulations if it's interviewing a nurse, it knows APRA standards if it's interviewing a compliance analyst, it knows sales methodologies if it's interviewing a BDM
- **Structured in mandatory phases** — not optional techniques. The AI MUST use live problem solving (at least twice), depth pursuit, anti-coaching detection, and failure mode testing in every interview. It cannot skip them or wrap up early.
- **Designed to test, not just ask** — this is the critical difference

#### How the AI Interview Catches What Humans Miss

**1. Live Problem Solving**

Traditional interview: *"Tell me about a time you handled a difficult situation."*
Claimless interview: *"You're the charge nurse on a night shift. Three patients deteriorate simultaneously — one with chest pain, one with respiratory distress, one with a GCS drop. Walk me through your first 60 seconds."*

We don't ask about experience. We CREATE the experience in real-time and watch how they think.

This works across every industry:
- **Accounting**: *"Your client calls — they've just received an ATO audit notice for the last 3 financial years. What's your first step?"*
- **Sales**: *"Your biggest account just told you they're evaluating a competitor who came in 30% cheaper. You have one meeting to save it. What's your approach?"*
- **Project Management**: *"You're 3 weeks from launch, your lead developer just resigned, and the client wants to add a major feature. Talk me through how you handle the next 24 hours."*
- **HR**: *"An employee has filed a bullying complaint against their direct manager, who is also your highest performer. Walk me through your process."*

If they can think through it live with nuance and practical knowledge, they've done this before. If they give textbook answers or freeze, that tells you everything.

**2. Depth Pursuit — The 3-Level Test**

When a candidate describes an achievement, we go three levels deep:

- **Level 1**: "How did you measure that?" — tests whether they had real metrics or are guessing
- **Level 2**: "What was the biggest obstacle you hit?" — tests whether they were actually in the trenches
- **Level 3**: "After you solved that, what was the next thing that broke?" — tests real-world experience, because anyone who's actually delivered anything knows that fixing one thing always surfaces another

Candidates who did the work sail through all three levels with specific details. Candidates who watched someone else do it — or inflated their contribution — get vague at level 2 and have nothing for level 3.

**3. Inconsistency Detection with Perfect Memory**

The AI remembers every word from the entire conversation AND has the candidate's verified profile loaded. It catches things humans can't:

- Candidate says "I managed a team of 12" at minute 4, then describes only individual contributor work for the next 20 minutes
- Candidate claims "extensive experience with Agile" but every example they give is waterfall
- Candidate says they "led the client relationship" but can't describe a single difficult client conversation
- Timeline claims that don't match their resume or public profile

When it detects an inconsistency, it doesn't accuse — it explores: *"You mentioned earlier that you managed 12 people. I'd love to hear more about that — what was the hardest part of people management for you?"* The response reveals whether they genuinely managed or just said they did.

**4. Anti-Coaching Detection**

The AI breaks rehearsed patterns that coaching tools can't prepare candidates for:

- *"Great example — now tell me about a time the OPPOSITE happened"*
- *"What's something in that project you'd do completely differently?"*
- *"What was the dumbest mistake you made during that?"*
- *"If I called your previous manager right now, what would they say was your biggest area for improvement?"*

Genuine candidates handle these naturally. Coached candidates stall — they've prepared the success story but not the failure story, the opposite scenario, or the honest self-assessment.

**5. Difficulty Calibration**

The AI doesn't ask the same questions to a graduate and a director. It actively calibrates:

- Start at the expected level for the role
- If they nail it → escalate to expert-level scenarios. Push until we find their ceiling.
- If they struggle → drop to fundamentals. Find their floor.
- The goal is to MAP their range, not just pass/fail at one level

A candidate might interview for a senior role but demonstrate mid-level competency. That's not a rejection — it's precise information. Maybe they're right for a different role. Maybe they need 6 months. Traditional screening can't give you this granularity.

**6. Failure Mode Testing**

After a candidate describes how they'd solve a problem, the AI asks: *"What could go wrong with that approach?"*

People who've actually shipped things, managed real projects, or handled real situations know the failure modes. They say things like *"the risk is if X happens, which we actually hit in production once"* or *"the biggest failure point is Y, which is why we built in Z."*

People who only know theory say *"it should work fine"* or give textbook risks they memorised.

This single question is one of the strongest signals of real-world experience across any industry.

**7. The "Teach Me" Technique**

For any skill the candidate claims, the AI asks: *"How would you explain [concept] to someone who just joined the team?"*

People who truly understand something explain it simply and add nuance — "the basic idea is X, but what most people miss is Y." People who memorised a definition ramble, use jargon to cover gaps, or deflect. This separates genuine expertise from surface knowledge in 30 seconds.

**8. Specificity Enforcement**

When a candidate gives vague answers — "we used best practices", "I collaborated with the team", "we implemented a solution" — the AI always follows up: *"Walk me through exactly what that looked like day-to-day"* or *"Give me a specific example."*

If they can't get specific after two prompts, the AI moves on. That's the answer — they don't have one.

#### Interview Output

After the conversation, the AI produces:

- **Overall score** (0-100) calibrated against role expectations
- **Skill-by-skill assessment** with evidence from the transcript — not vibes, actual quotes
- **Depth reached** per skill — did they demonstrate surface, working, deep, or expert knowledge?
- **Red flags** with specific examples from the conversation
- **Green flags** with specific examples
- **Hire/No-hire recommendation** with reasoning
- **Risk factors** for the hiring team
- **Follow-up questions** for a potential next round
- **Full transcript** with timestamps for audit

---

## The Quality Difference — Small Things That Add Up

Traditional screening misses the small signals that predict job success. Here's what Claimless catches:

### Signals Most Screeners Miss

| Signal | What It Means | How Claimless Catches It |
|---|---|---|
| Candidate consistently says "we" instead of "I" | May have been carried by the team | AI specifically probes: "What was YOUR role in that?" |
| Perfect STAR answers to every question | Likely coached, not experienced | Anti-coaching follow-ups break the pattern |
| Confident delivery with vague specifics | Good interviewer, uncertain practitioner | Depth pursuit forces specifics — 3 levels deep |
| Claims don't match timeline | Possible exaggeration or fabrication | Profile verification + real-time cross-referencing |
| Can describe WHAT but not WHY | Surface knowledge, not understanding | "Teach Me" technique reveals whether they understand or memorised |
| Avoids discussing failures or mistakes | Lacks self-awareness or real experience | Direct asks for failures, opposite scenarios |
| Gives different numbers for the same metric | Fabricating or uncertain about real results | Perfect recall catches contradictions across 30 minutes |
| Strong on theory, weak on practice | Academic knowledge without application | Live scenario testing reveals the gap instantly |
| Over-credits themselves | Inflating role in team achievements | Cross-referencing multiple answers reveals true contribution level |

### Consistency Across Scale

The biggest quality advantage isn't any single technique — it's that Claimless applies ALL of them to EVERY candidate, EVERY time.

Your 1st candidate of the day gets the same assessment techniques as your 500th. The nervous introvert gets probed just as deeply as the charismatic storyteller. The Friday afternoon candidate gets the same rigour as the Monday morning one.

No human team can do this. Not because they're bad — because they're human.

---

## Speed — Why Faster Actually Means Better Here

Conventional wisdom: fast screening = sloppy screening.

Claimless flips this. Our screening is both faster AND deeper because:

| Traditional Process | Claimless Process |
|---|---|
| Recruiter reads resume (5-10 min) | AI analyses full profile in < 2 min |
| Schedule phone screen (2-5 days of back-and-forth) | Auto-invite: candidate gets interview link immediately when screening passes |
| Conduct 30-min phone screen | 15-30 min AI interview with deeper probing than a human screen |
| Write up notes (10-15 min) | Scored assessment generated instantly with evidence |
| Discuss with team, decide next steps | Report ready for recruiter + client immediately |
| **Total: 5-10 business days per candidate** | **Total: same day, often within hours** |

With auto-invite enabled, there's zero human bottleneck between application and interview. Candidate applies → AI screens → passes → interview link sent automatically → candidate interviews when it suits them → scored report lands in the recruiter's dashboard. The entire pipeline can run without anyone touching it.

For agencies, this means:
- **Candidates don't drop out** of your pipeline because they accepted another offer while waiting for your phone screen
- **Clients see speed** as a competitive advantage — you're sending verified candidates in days, not weeks
- **Volume spikes don't break you** — Black Friday for recruiters (January/February hiring surge) doesn't mean quality drops

---

## Cost Perspective — The Real Numbers

### What It Costs Today (Per Hire, Industry Averages)

| Cost Component | Typical Cost |
|---|---|
| Recruiter salary (allocated per hire) | $2,500 - $4,000 |
| Job board / sourcing spend | $500 - $2,000 |
| Phone screening time (15-20 screens per hire) | $750 - $1,500 (time cost) |
| Client interviews with wrong candidates | $500 - $1,000 (client time, trust cost) |
| Bad hire / replacement guarantee trigger | $15,000 - $30,000 (when it happens) |
| **Total cost per hire** | **$4,250 - $8,500** |
| **Total cost including 10% bad hire rate** | **$5,750 - $11,500** |

### What It Costs With Claimless

| Cost Component | With Claimless |
|---|---|
| Recruiter salary (allocated per hire — handling 2x roles) | $1,250 - $2,000 |
| Sourcing (unchanged) | $500 - $2,000 |
| Screening time | $0 (automated) |
| Client interviews with wrong candidates | Near zero (pre-verified) |
| Bad hire rate | Target <3% (vs. industry 10%) |
| Claimless platform cost | Per-hire or subscription based |
| **Net saving per hire** | **40-60% reduction in cost-per-hire** |

### The Revenue Side

Cost savings are good. Revenue growth is better.

- Recruiter handling 15 roles → now handles 25-30 → **60-100% more placements per head**
- Faster time-to-fill → clients prefer you → **higher win rate on new business**
- Verified candidates → fewer replacements → **higher net fee retention**
- White-label platform → client stickiness → **lower churn, higher lifetime value**

---

## Why This Works Across Every Industry

Claimless is not a "tech hiring tool." The AI interviewer is loaded with domain knowledge, terminology, red flags, and skill rubrics for 13 industries. It generates role-specific scenarios on the fly based on this knowledge — not from a static question bank.

| Industry | Domain Knowledge Loaded | The Kind of Scenario It Generates |
|---|---|---|
| Healthcare | AHPRA, clinical governance, triage protocols, patient safety, aged care standards | Multi-patient triage prioritisation, clinical decision-making under pressure, adverse event response |
| Finance | APRA, ASIC, AML/CTF, Basel III, responsible lending, financial planning standards | Client risk conversations, regulatory compliance dilemmas, portfolio rebalancing under market stress |
| Legal | Practising certificates, conflicts of interest, professional conduct, jurisdictional nuances | Ethical conflicts, evidence handling, multi-party representation challenges |
| Construction & Trades | WHS/SafeWork, SWMS, white cards, chain of responsibility, NCC/BCA | Site safety incidents, subcontractor disputes, programme recovery under pressure |
| Sales | Pipeline management, consultative selling, negotiation frameworks, territory planning | Account retention under competitive threat, quota recovery plans, deal strategy |
| HR & People | Fair Work Act, Modern Awards, NES, enterprise bargaining, WHS, unfair dismissal | Complex redundancy scenarios, protected attribute situations, performance management |
| Marketing | Campaign strategy, attribution modelling, brand management, ACMA/TGA compliance | Crisis communication, negative sentiment response, budget reallocation decisions |
| Education | AITSL standards, curriculum frameworks, WWCC, differentiated learning, NAPLAN | Classroom management with diverse needs, disengaged parent engagement, learning difficulty identification |
| Customer Service | Consumer law, escalation frameworks, NPS/CSAT, complaint resolution, ombudsman | Escalation handling without authority, partially valid complaints, social media threat response |
| Operations | Supply chain risk, ISO frameworks, continuous improvement, vendor management | Supply disruption recovery, capacity planning under constraint, quality failure response |
| Design | Accessibility (DDA/WCAG), UX research, design systems, stakeholder management | Design trade-off decisions, accessibility vs deadline conflicts, user research methodology |
| Data & Analytics | Privacy Act/APPs, CDR framework, data governance, statistical methodology | Data breach response, methodology trade-offs, stakeholder communication of findings |
| Technology | ASD Essential Eight, PSPF, cloud architecture, system design, DevOps | System failure diagnosis, architecture trade-offs, scaling under load, security incident response |

Each industry has specific hard skills, soft skills, sample questions, and level descriptors (basic → expert) that the AI uses to calibrate question difficulty and evaluate responses. The scenarios aren't scripted — they're generated from the AI's domain knowledge combined with the candidate's specific background, making every interview unique.

Your recruiter's edge is DEPTH in their specific niche + relationships. The AI's edge is consistent, testable, unbiased assessment at scale.

They're not competing. They're complementary.
