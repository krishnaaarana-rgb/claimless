# Claimless — Full Cost Analysis & Pricing Strategy

## Your Costs: Per Candidate (Full Pipeline)

### Stage 1: Profile Verification & Screening

| Service | What It Does | Tokens / Volume | Unit Price | Cost Per Candidate |
|---|---|---|---|---|
| **Claude Sonnet 4.5 (via OpenRouter)** — GitHub Analysis | Analyses top 10 repos, code quality, architecture, skills | ~4,000 input / ~2,000 output | $3/1M input, $15/1M output | **$0.042** |
| **Claude Sonnet 4.5** — Interview Context Generation | Builds briefing doc for the AI interviewer | ~2,000 input / ~800 output | Same | **$0.018** |
| **Claude Sonnet 4.5** — Interview Questions (10) | Generates 10 personalised questions from profile | ~2,500 input / ~3,000 output | Same | **$0.053** |
| **Claude Sonnet 4.5** — ATS Screening | Resume vs job match, scoring, pass/fail | ~5,000 input / ~1,500 output | Same | **$0.038** |
| **GitHub API** | 52 calls per candidate (profile, repos, READMEs, languages, commits, trees) | 52 API calls | Free (authenticated) | **$0.00** |
| **Puppeteer** (website scraping) | Scrape portfolio/personal site | 0-1 page | Runs on Vercel (included) | **$0.00** |
| **Upstash Redis** | Cache GitHub data (24h TTL), queue async jobs | ~5-10 commands | $0.20/100k commands | **<$0.001** |
| **Resend** (email) | Send screening result notification | 1-2 emails | $0.40/1000 emails | **$0.001** |
| | | | **Stage 1 Total** | **~$0.15** |

*Note: If candidate has no GitHub (non-tech role), GitHub Analysis + Context + Questions calls don't happen. Stage 1 drops to ~$0.04.*

### Stage 2: Video Analysis (Optional)

| Service | What It Does | Tokens / Volume | Unit Price | Cost Per Candidate |
|---|---|---|---|---|
| **Claude Sonnet 4.5** — Loom video analysis | Analyse communication, confidence, depth | ~2,000 input / ~800 output | $3/$15 per 1M | **$0.018** |
| | | | **Stage 2 Total** | **~$0.02** |

*Only if Loom analysis is enabled for the job.*

### Stage 3: AI Voice Interview (The Big Cost)

This is where the real money goes. Vapi bundles four services into one call:

| Service | What It Does | Volume (15-min interview) | Unit Price | Cost Per Candidate |
|---|---|---|---|---|
| **Vapi Platform** | Orchestration, WebRTC, call management | 15 min | $0.05/min | **$0.75** |
| **GPT-5 (via OpenRouter)** | Real-time conversation (the interviewer's brain) — GPT-5 for superior instruction following on mandatory interview phases | ~15 min of back-and-forth, ~15,000-25,000 tokens total | $1.25/$10 per 1M input/output | **$0.08-0.12** |
| **Deepgram Nova-2** (STT) | Transcribes candidate speech to text in real-time | 15 min audio | $0.0059/min | **$0.09** |
| **ElevenLabs** (TTS) | Generates interviewer voice from text | ~3,000-5,000 characters spoken | ~$0.08-0.12/min effective | **$1.20-1.80** |
| **Claude Sonnet 4.5** — Post-interview Scoring | Analyses full transcript with candidate context, scores skills, generates report | ~8,000 input / ~2,000 output | $3/$15 per 1M | **$0.054** |
| **Resend** (email) | Interview completion notification | 1 email | $0.40/1000 | **$0.001** |
| **Supabase Storage** | Resume + project file storage | ~1-10MB per candidate | $0.021/GB/month | **<$0.001** |
| | | | **Stage 3 Total (15 min)** | **~$2.20-2.85** |

### Call Duration Impact on Cost

| Interview Length | Vapi Platform | Deepgram | ElevenLabs | GPT-5 | Stage 3 Total |
|---|---|---|---|---|---|
| 10 min | $0.50 | $0.06 | $0.80-1.20 | $0.05-0.08 | **$1.43-1.86** |
| 15 min (default) | $0.75 | $0.09 | $1.20-1.80 | $0.08-0.12 | **$2.15-2.80** |
| 20 min | $1.00 | $0.12 | $1.60-2.40 | $0.10-0.15 | **$2.85-3.70** |
| 30 min | $1.50 | $0.18 | $2.40-3.60 | $0.15-0.22 | **$4.30-5.55** |

---

## Total Cost Per Candidate — Full Pipeline

### Scenario A: Tech Role (GitHub + 15-min interview)

| Stage | Cost |
|---|---|
| Stage 1: Profile + GitHub + Screening + File Extraction | $0.15 |
| Stage 2: Loom (if enabled) | $0.02 |
| Stage 3: Voice Interview (15 min, GPT-5) + Scoring | $2.15-2.80 |
| **TOTAL** | **$2.32-2.97** |

### Scenario B: Non-Tech Role (No GitHub, 15-min interview)

| Stage | Cost |
|---|---|
| Stage 1: Resume + Project Files Screening | $0.04 |
| Stage 2: Loom (if enabled) | $0.02 |
| Stage 3: Voice Interview (15 min, GPT-5) + Scoring | $2.15-2.80 |
| **TOTAL** | **$2.21-2.86** |

### Scenario C: Screening Only (No Interview)

| Stage | Cost |
|---|---|
| Stage 1: Profile + Screening | $0.04-0.15 |
| **TOTAL** | **$0.04-0.15** |

**Bottom line: your cost per candidate is $2.20-3.00 for the full pipeline. ElevenLabs TTS is still 55-65% of the total cost. GPT-5 is cheaper than GPT-4o ($1.25 vs $2.50 per 1M input) while being significantly smarter — better at following mandatory interview phases, live problem solving, and anti-coaching detection.**

---

## Fixed Monthly Costs (Infrastructure)

| Service | Plan | Monthly Cost |
|---|---|---|
| Supabase | Pro (includes 8GB storage) | $25 |
| Supabase Storage | File storage for resumes + project files | Included in Pro (8GB) |
| Vercel | Pro | $20 |
| Upstash Redis | Pay-as-you-go | $0-10 |
| Sentry | Free tier (5k errors/month) | $0 |
| Domain (claimless.com) | Annual/12 | ~$1 |
| OpenRouter | Pay-as-you-go | $0 (usage-based) |
| Vapi | Pay-as-you-go | $0 (usage-based) |
| **Total Fixed** | | **~$50-60/month** |

At scale, Supabase and Vercel may need upgrades:
- Supabase Team plan: $599/month (when you hit database/storage limits)
- Vercel Enterprise: negotiable (when you hit function execution limits)
- But this only kicks in at 1,000+ candidates/month

---

## Pricing Strategy: What to Charge Agencies

### Approach 1: Per-Candidate Pricing (Simplest)

Best for: agencies testing the product, variable volume, easy to understand.

| Tier | What's Included | Your Cost | Suggested Price | Your Margin |
|---|---|---|---|---|
| **Screen Only** | Resume analysis + ATS score + report | $0.04-0.15 | **$5** | 97-99% |
| **Screen + Interview** | Full pipeline: verification + 15-min AI interview (GPT-5) + scored report | $2.32-2.97 | **$20-25** | 86-90% |
| **Premium** | Full pipeline + 30-min interview + detailed assessment + follow-up Qs | $4.45-5.70 | **$35-45** | 86-87% |

**Why this works:** An agency currently spends $750-1,500 in recruiter time per candidate on phone screens. You're charging $20-25 for a deeper, more consistent assessment. It's a no-brainer ROI.

**Volume discounts:**
- 1-100 candidates/month: full price
- 101-500: 15% discount
- 501-1,000: 25% discount
- 1,000+: custom pricing

### Approach 2: Monthly Subscription (Predictable Revenue)

Best for: mid-size agencies with steady volume, predictable MRR for you.

| Plan | Candidates/Month | Price | Per-Candidate Effective | Your Cost | Monthly Margin |
|---|---|---|---|---|---|
| **Starter** | Up to 50 | **$499/mo** | $9.98 | ~$125-150 | ~$349-374 (70-75%) |
| **Growth** | Up to 200 | **$1,499/mo** | $7.50 | ~$500-600 | ~$899-999 (60-67%) |
| **Scale** | Up to 500 | **$2,999/mo** | $6.00 | ~$1,250-1,500 | ~$1,499-1,749 (50-58%) |
| **Enterprise** | Unlimited | **Custom ($5k-10k)** | Negotiated | Variable | 50%+ target |

**Why this works:** Agencies can budget for a fixed monthly tool cost. The more they use it, the cheaper per candidate. Incentivises adoption.

### Approach 3: Per-Hire Pricing (Aligned with Agency Revenue)

Best for: agencies that want zero risk — they only pay when a placement succeeds.

| Model | Your Cost (15-20 candidates screened per hire) | Suggested Price | Your Margin |
|---|---|---|---|
| **Flat per hire** | $30-60 (all candidates screened for that role) | **$250-500 per successful placement** | 80-88% |
| **% of placement fee** | Same | **3-5% of placement fee** (on a $15k fee, that's $450-750) | 85-92% |

**Why this works:** Agency's risk is zero. They only pay when they make money. But your revenue is lumpy and unpredictable.

### Approach 4: White-Label Licensing (Biggest Revenue)

Best for: large agencies who want to own the platform as their competitive advantage.

| Component | Price |
|---|---|
| **Setup fee** (branding, domain, configuration) | **$5,000-10,000** one-time |
| **Monthly platform licence** | **$2,000-5,000/month** |
| **Per-candidate usage** (pass-through costs + margin) | **$10-15 per candidate** |
| **Annual commitment** | Required (12-month minimum) |

**What they get:**
- Their branding, their domain, their logo on everything
- Custom AI interviewer persona (name, voice, style)
- Direct API access for deep integration
- Priority support and feature requests
- Exclusive territory (optional — charge more for this)

**Revenue math for you:**
- Setup: $5,000
- Monthly: $3,000 × 12 = $36,000/year
- Usage: 200 candidates/month × $12 × 12 = $28,800/year
- **Per white-label client: ~$70,000/year**
- Your cost: ~$600/month usage + $50 infra = ~$7,800/year
- **Margin: ~89%**

---

## Recommended Pricing: The Hybrid Model

Don't pick one approach — offer all of them. Different agencies are at different stages.

| Agency Stage | Offer | Goal |
|---|---|---|
| **Testing / Evaluating** | Per-candidate pricing ($20-25/candidate) | Get them using it, prove value |
| **Committed / Growing** | Monthly subscription ($499-2,999/mo) | Lock in recurring revenue |
| **Strategic Partner** | White-label licence ($2k-5k/mo + usage) | Maximum revenue per client |
| **Enterprise / Large** | Per-hire or % of fee model | Land whale accounts |

**Land & Expand strategy:**
1. Start every agency on per-candidate pricing (low commitment)
2. Once they hit 30-50 candidates/month, pitch the subscription (saves them money)
3. Once they're dependent on the platform, pitch white-label (5-10x revenue)

---

## Unit Economics at Scale

### 100 Candidates/Month (1 Small Agency)

| | Revenue | Cost | Margin |
|---|---|---|---|
| Per-candidate ($22 avg) | $2,200 | $250 | $1,950 (89%) |
| Subscription (Growth) | $1,499 | $250 | $1,249 (83%) |
| Fixed costs | — | $55 | — |
| **Net monthly** | **$1,499-2,200** | **$305** | **$1,194-1,895** |

### 1,000 Candidates/Month (5-10 Agencies)

| | Revenue | Cost | Margin |
|---|---|---|---|
| Blended revenue | $12,000-18,000 | $2,500 | $9,500-15,500 |
| Fixed costs (scaled up) | — | $200 | — |
| **Net monthly** | **$12k-18k** | **$2,700** | **$9.3k-15.3k** |
| **Annual** | **$144k-216k** | **$32k** | **$112k-184k** |

### 5,000 Candidates/Month (20-30 Agencies + 2-3 White-Label)

| | Revenue | Cost | Margin |
|---|---|---|---|
| Subscriptions (20 agencies) | $25,000 | $5,000 | $20,000 |
| White-label (3 clients) | $15,000 + $18,000 usage | $3,750 | $29,250 |
| Per-candidate overflow | $5,000 | $750 | $4,250 |
| Fixed costs | — | $700 | — |
| **Net monthly** | **$63,000** | **$10,200** | **$52,800 (84%)** |
| **Annual** | **$756k** | **$122k** | **$634k** |

---

## Cost Optimisation Levers (As You Scale)

| Optimisation | Impact | When to Do It |
|---|---|---|
| **Switch TTS from ElevenLabs to Deepgram Aura or PlayHT** | Save 40-60% on voice costs (~$0.04/min vs $0.10/min) | When voice quality is comparable |
| **Negotiate Vapi volume pricing** | 20-40% platform fee reduction | At 10,000+ min/month |
| **Switch Claude calls to Haiku for screening** | Save 80% on screening Claude costs ($0.008 vs $0.04) | Screening doesn't need Sonnet quality |
| **Batch GitHub scraping** | Reduce Redis costs, optimise cache | When GitHub users > 500/month |
| **Self-host voice pipeline** | Eliminate Vapi platform fee entirely | When you have engineering capacity + 50k min/month |
| **Switch to Anthropic direct (skip OpenRouter)** | Save OpenRouter's margin (~10-15%) | When volume justifies direct billing |

**Your biggest cost lever is voice (ElevenLabs TTS).** If you can switch to a cheaper TTS provider without quality loss, your per-candidate cost drops from $2.50 to ~$1.50. That's a 40% cost reduction.

---

## Competitor Pricing Reference

| Competitor | What They Do | Price |
|---|---|---|
| **HireVue** | Video interviews + AI assessment | $25,000-75,000/year (enterprise only) |
| **Pymetrics/Harver** | Gamified assessments | $15-50/candidate |
| **Criteria Corp** | Pre-employment testing | $20-35/candidate |
| **Spark Hire** | One-way video interviews | $149-499/month |
| **Sapia.ai** | AI chat interviews | $10-25/candidate |
| **Paradox/Olivia** | AI chatbot screening | $30,000+/year |

**Your advantage:** You're cheaper than enterprise tools, deeper than cheap tools, and the only one doing live voice + proof-of-work verification. At $20-25/candidate you're priced below most competitors while delivering more.
