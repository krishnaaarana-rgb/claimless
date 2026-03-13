# Claimless — Development Changelog

Everything built from project inception to current state.

---

## Phase 1: Foundation

### Initial Setup (`60136bd` → `b8eb978`)
- Scaffolded Next.js 15 App Router project with TypeScript
- Built the complete Claimless ATS platform:
  - Supabase integration (Postgres, Auth, RLS, Edge Functions)
  - Multi-tenant architecture with `company_id` scoping
  - Candidate and job management CRUD
  - Application pipeline with stage tracking
  - Company onboarding flow
  - Team management with roles (Owner, Admin, Member, Viewer)
  - Email system with templates (acceptance/rejection)
  - Dashboard with pipeline overview and activity feed
  - Settings page (ATS thresholds, email templates, form config)
  - Public API (`/api/v1/`) with API key auth
  - Webhook system with event subscriptions, signing secrets, delivery logs
  - Application form builder with configurable fields
  - Resume parsing (PDF text extraction via pdf.js)

### Database Fixes (`1b32fef` → `9223fb9`)
- Fixed column name mismatches: `github_url` → `github_username`, `stage` → `current_stage`

---

## Phase 2: Voice Interview System

### Vapi Integration (`5314e01` → `ae2ee7c`)
- Built complete AI voice interview system using Vapi
- Interview token system for secure candidate access
- Interview prep page with camera check, mic test, browser compatibility
- Active interview session page with real-time transcript
- Interview completion page with confirmation
- Webhook handler for Vapi events (call started, ended, transcript)
- Post-interview scoring via Claude API
- Interview invitation flow from dashboard
- GitHub OAuth during interview prep for profile verification
- Switched voice agent model to `gpt-4o-mini` for low-latency responses
- Multiple rounds of fixes:
  - Localhost URL resolution for production
  - Interview token validation and expiry
  - Collapsible sidebar with tooltips
  - Vapi API key configuration
  - Assistant name length limits
  - Server URL configuration

---

## Phase 3: Industry Intelligence

### Industry Skills Taxonomy (`b340e59` → `2780c58`)
- Built comprehensive industry-aware skills system:
  - 10+ industry definitions with hard skills, soft skills, and niches
  - Skill level descriptors (basic → expert) with sample interview questions
  - Skill requirement picker component (`IndustrySkillPicker`)
  - Industry-specific interview context generation
  - Skill rubric builder for post-interview scoring
  - Job creation/edit forms with industry and skill selection
  - Industries API endpoint

---

## Phase 4: Notion-Inspired Redesign

### UI Overhaul (`138680b` → `1c21b99`)
- Complete visual redesign from warm amber/stone theme to Notion-inspired palette:
  - **Font**: DM Sans → Inter (400, 500, 600, 700)
  - **Colors**: `#37352F` text, `#9B9A97` muted, `#E9E9E7` borders, `#F7F6F3` backgrounds, `#2383E2` primary blue
  - **Sidebar**: Dark (`#1A1A1A`) → Light (`#F7F6F3`) with hover-to-expand (56px → 220px)
  - **Cards**: Removed all box shadows, `rounded-xl` → `rounded-lg`
  - **Buttons**: Amber accent → Blue accent throughout
  - **Animations**: Removed card entrance animations for instant feel
  - **Transitions**: 150ms → 100ms for snappier interactions
- Fixed sidebar: widened collapsed state to 56px, fixed icon centering and avatar clipping
- Removed `max-w-[900px]` constraint that was cutting off tables

---

## Phase 5: QA Audit & Security Fixes

### Critical Fixes (`f5356c6`)
- **Auth gaps fixed**: `advance`, `reject`, and `screen` API routes had zero authentication — anyone could modify applications. Added full user verification + `company_id` scoping
- **Data leak fixed**: Dashboard stats route was loading ALL `email_logs` and `interview_tokens` from database, then filtering client-side. Now uses `.in()` filter for database-level scoping
- **Race conditions fixed**:
  - Advance/reject: now checks `response.ok` before firing notification email
  - Sign-out: wrapped in `try/finally` so `router.push` always fires
- **Middleware fix**: Added `/interview/` to public route prefixes so candidates can actually access interview links without login
- **Responsive grids**: Dashboard metrics and job form now use responsive `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`

---

## Phase 6: Voice Interview Polish

### Premium Interview UX (`5ffc89e`)
- **Prep page**: White background, 3:2 camera/checklist layout, dark camera frame (`#18181B`), emerald-filled checkmarks, black CTA with arrow animation
- **Session page**: Immersive dark (`#0A0A0A`), centered camera, CSS-animated speaking indicator (replaced `Math.random` jank), ghost-style controls with near-transparent borders, right-aligned user messages in transcript
- **Complete page**: Solid emerald checkmark, personalized message with candidate/job/company names, "Interview submitted successfully" confirmation pill
- All amber/stone colors replaced with Notion palette across interview pages

---

## Phase 7: AI Interview Intelligence

### Superhuman Interviewer (`f71798d`)
- Upgraded the AI interviewer to be **better than a human** with 7 advanced techniques:
  1. **Depth Calibration** — Adapts question difficulty based on candidate responses in real-time
  2. **Verification Probing** — Cross-references answers against resume/GitHub data
  3. **Multi-Angle Assessment** — Tests important skills from multiple angles (explain → scenario → tradeoffs)
  4. **Inconsistency Detection** — Catches contradictions between answers and background
  5. **"Teach Me" Technique** — Asks candidates to explain concepts as if teaching, revealing true understanding
  6. **Scenario Escalation** — Starts with realistic scenarios, adds complications to test under complexity
  7. **Specificity Enforcement** — Always follows up vague answers ("we used best practices") with "give me a specific example"

- **Enhanced skill assessment blocks** with weight-based prioritization and 2 sample questions per skill
- **Better candidate context section** with structured usage instructions for the AI
- **Upgraded scoring prompt** with:
  - Per-skill evidence requirements (exact quotes from transcript)
  - `depth_reached` tracking (surface → working → deep → expert)
  - `consistency_analysis` between claims and demonstrated knowledge
  - `hiring_risk_factors` identification
  - `comparison_notes` against industry-level expectations
  - Calibrated scoring (85+ reserved for exceptional, penalizes confident-but-wrong)
- **Model configuration**: `gpt-4o-mini` for real-time voice (latency), `claude-sonnet-4-6` for post-interview scoring (quality)
- **Audit trail**: Every interview stores `injected_prompt`, `injected_prompt_length`, `interview_model`, and `interview_scoring_model`

---

## Phase 8: Agency-Grade Features

### Interviews Dashboard (`eadb1f5`)
- Built full **Interviews page** (was a stub):
  - Stats row: completed count, avg score, hire rate, pending review
  - Filter bar: search, job, recommendation, score range
  - Interview cards with score, recommendation badge, strengths, score bars
  - Expandable details with transcript preview
- **Interview scores in candidate list**: Added "Interview" column between Score and Status with color-coded score pill and recommendation badge
- **Conversion metrics on dashboard**: Replaced basic email stats with Conversion Rate, Avg Interview Score, Interview Completion Rate, Avg Days to Hire

### Premium Candidate Detail (`0016731`)
- Full rewrite as **"Client Brief"** — the page agencies show clients to justify 20k AUD placements:
  - **3-card assessment grid**: Overall (combined 40% ATS + 60% interview), ATS Score, Interview Score
  - **Interview deep-dive**: 2-column score bars, skill assessment table (for industry jobs), consistency analysis box
  - **Key moments** with impact-colored borders (green/red/neutral)
  - **Risk factors** callout in amber
  - **Comparison notes** against industry expectations
  - **Follow-up questions** numbered list
  - Handles both old scoring format (`interview_score`) and new enhanced format (`overall_score`, `skill_assessments[]`, etc.)

### Job Detail Enhancements (`cf9151a`)
- **6-card metric row**: Added Avg Interview Score and IV Completion Rate
- **Pipeline funnel visualization**: Bar chart showing Applied → Passed → Interviewing → Interviewed → Hired
- **Top Candidates shortlist**: Ranked top 5 by combined score (40% ATS + 60% interview) with score breakdown, recommendation badge, and quick navigation
- **Interview column** in candidates table with score and recommendation
- **Job API enhanced** to compute and return `avg_interview_score` and `interview_completion_rate`

### Candidate Comparison View (`1788374`)
- New `/jobs/[id]/compare` page:
  - Side-by-side comparison of top 8 candidates ranked by combined score
  - Rows: Combined Score, ATS Score, Interview Score, Recommendation, AI Assessment, Profile links
  - **Best-in-category highlighting** with emerald background
  - "Compare Top N" button appears in job detail header when 2+ candidates are scored
- **Enhanced CSV export**: Now includes Interview Score, Interview Recommendation, Combined Score columns with proper CSV quoting

### Interviews Page Polish (`cf9151a` continued)
- Expanded interview cards now show:
  - Consistency analysis
  - Risk factors (amber callout)
  - Areas for improvement
  - Suggested follow-up questions
  - Transcript preview

---

## Phase 9: Design Consistency & Cleanup

### Navigation & Cleanup (`03f5f6b` → `33cdb90`)
- **Added Interviews to sidebar navigation** under Overview section (was completely missing)
- **Removed all `glow-primary` remnants** from: landing page, login, signup, onboarding, test-scrape (6 files)
- **Removed all stale `animate-fade-in-up`** references from: test-scrape, onboarding, processing, job creation (4 files — keyframes were already removed but class references remained)
- **Migrated apply page** from stone/amber palette to Notion equivalents:
  - `text-stone-*` → `text-[#37352F]` / `text-[#9B9A97]`
  - `border-stone-200` → `border-[#E9E9E7]`
  - `bg-stone-*` → `bg-[#F7F6F3]`
  - `focus:ring-amber-500` → `focus:ring-[#2383E2]`
  - Submit button now uses company brand color with `#2383E2` fallback (was hardcoded `#D97706`)
- **Settings default accent** changed from `#D97706` (amber) to `#2383E2` (Notion blue)

---

## Phase 10: Shareable Client Brief

### Public Brief System (`016_brief_tokens`)
- **Database**: New `brief_tokens` table with token-based access, 30-day expiry, view count tracking, RLS policies
- **Token types**: `single` (one candidate) and `shortlist` (multi-candidate comparison)
- **Middleware**: Added `/brief/` to public route prefixes for unauthenticated access
- **API**:
  - `POST /api/briefs` — create a shareable brief token (validates company ownership)
  - `GET /api/briefs` — list briefs for current company
  - `GET /api/briefs/[token]` — public endpoint for viewing a shared brief (increments view count)
- **Public brief page** (`/brief/[token]`):
  - Single candidate: Full assessment with scores, AI analysis, interview deep-dive, skill assessments, risk factors, background
  - Shortlist: Comparison table with scores + recommendation, expandable candidate details
  - Company branding (name + primary color)
  - PDF export via `window.print()` with CSS `@media print` styles
  - Error and expiry handling
- **Share buttons**:
  - "Share with Client" button on candidate detail page (creates single brief, copies link)
  - "Share Shortlist" button on job detail page (creates shortlist brief from top candidates)
- **Shared components**: Extracted `RecBadge`, `ScoreBar`, `DetailRow`, score utilities into `src/components/brief/BriefComponents.tsx`

---

## Architecture Summary

### Tech Stack
- **Frontend**: Next.js 15 (App Router, Server Components, Server Actions), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Postgres, Auth, RLS), Next.js API Routes
- **AI**: Claude API via OpenRouter (`claude-sonnet-4-6` for analysis/scoring), `gpt-4o-mini` for real-time voice
- **Voice**: Vapi (voice agent platform), Deepgram (transcription), ElevenLabs (TTS)
- **Infrastructure**: Upstash Redis (caching), N8N (workflow orchestration)

### Three-Stage Pipeline
1. **ATS Screening**: Resume parsing + Claude analysis → match score, strengths, concerns, interview topics
2. **Voice Interview**: Vapi agent with context-injected system prompt → real-time conversation with 7 AI techniques
3. **Post-Interview Scoring**: Claude evaluation with industry rubrics → per-skill scores, recommendation, risk factors

### Key Design Decisions
- Interview system prompt assembled from pre-generated pieces at call time (no LLM calls needed for prompt building)
- Combined score formula: 40% ATS + 60% Interview (interview weighted higher)
- All data scoped by `company_id` with RLS policies for multi-tenant isolation
- Full audit trail: every interview stores injected prompt, model used, scoring model, timestamps
- Notion-inspired design: `#37352F` text, `#2383E2` blue, `#F7F6F3` backgrounds, Inter font, no shadows

### File Structure
```
src/
├── app/
│   ├── (company)/          # Authenticated dashboard pages
│   │   ├── dashboard/      # Main dashboard with stats + activity
│   │   ├── candidates/     # Candidate list + detail (Client Brief)
│   │   ├── jobs/           # Job list, detail, edit, compare
│   │   ├── interviews/     # Interview dashboard with filters
│   │   ├── settings/       # Company settings (ATS, email, interview)
│   │   ├── team/           # Team management + invites
│   │   └── integrations/   # API keys, webhooks, API docs
│   ├── api/
│   │   ├── briefs/         # Shareable brief token CRUD + public fetch
│   │   ├── candidates/     # Candidate CRUD + notes, email, invite
│   │   ├── dashboard/      # Stats, applications, interviews
│   │   ├── interview/      # Token validation, start, score, webhook
│   │   ├── jobs/           # Job CRUD
│   │   ├── settings/       # API keys, webhooks
│   │   └── v1/             # Public API
│   ├── apply/              # Public application form
│   ├── brief/              # Public shareable client brief (single + shortlist)
│   ├── interview/          # Candidate interview flow (prep, session, complete)
│   └── auth/               # Login, signup, OAuth callbacks
├── lib/
│   ├── claude/prompts/     # All AI prompts (interview, scoring, questions)
│   ├── supabase/           # Client, admin, middleware
│   ├── industry-skills.ts  # Industry taxonomy + skill definitions
│   └── vapi/               # Voice agent integration
├── components/
│   └── brief/              # Shared brief UI components (RecBadge, ScoreBar, etc.)
└── types/                  # TypeScript interfaces
```
