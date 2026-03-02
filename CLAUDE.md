# CLAUDE.md — Claimless Project Context

## What is Claimless
Claimless is an AI-powered recruitment platform that replaces resumes with a proof-of-work based hiring system. Instead of candidates claiming skills, the platform verifies what they have actually built by scraping and analyzing their digital footprint.

## Tech Stack
- Next.js 15 (App Router, Server Components, Server Actions)
- TypeScript (strict mode)
- Tailwind CSS + shadcn/ui
- Supabase (Postgres, Auth, RLS, Edge Functions, Realtime)
- Claude API (Anthropic) for all AI analysis
- Vapi for voice agent interviews
- N8N for workflow orchestration
- Upstash Redis for caching and job queues

## Architecture — The Three Stage Pipeline
1. **Stage 1 — Proof of Work Scraping**: Scrapes GitHub repos, personal websites, shipped products. Claude API analyzes everything and generates a verified candidate profile with scores, verified skills, architectural decisions, and a pre-generated interview context summary.
2. **Stage 2 — Loom Video Analysis (Optional)**: Candidates submit a Loom video. AI analyzes communication clarity, confidence, technical depth. Generates a loom_context_summary for injection into Stage 3.
3. **Stage 3 — Context-Aware Voice Interview**: Vapi voice agent conducts a personalized interview. The system prompt is built by assembling the pre-generated interview_context_summary from Stage 1, loom_context_summary from Stage 2 (if enabled), job requirements, and dynamically generated questions specific to the candidate's verified work. This is the core IP.

## Critical Architecture Decision — Context Injection
The voice agent prompt is NOT built in real-time from raw data. Instead:
- Stage 1 pre-generates `interview_context_summary` (narrative text, max 800 words) and `interview_suggested_questions` (max 10 questions) during profile creation
- Stage 2 pre-generates `loom_context_summary` (max 200 words) during video analysis
- Stage 3 assembles these pre-generated pieces into the Vapi system prompt at call time (fast, no LLM calls needed)
- The full injected prompt is stored in `voice_interviews.injected_prompt` for every interview for audit

## Business Model
B2B SaaS. Two customer types:
1. Companies hiring directly (subscription or per-hire pricing)
2. Recruitment platforms (white label licensing — biggest revenue opportunity)

## Coding Standards
- All API routes go in `src/app/api/`
- All business logic goes in `src/lib/`
- All Claude prompts go in `src/lib/claude/prompts/`
- All Vapi integration code goes in `src/lib/vapi/`
- Use Zod for all API input validation and Claude output schemas
- Use JSONB columns for flexible data, with TypeScript interfaces matching the structure
- Every table has RLS policies scoped to company_id for multi-tenant isolation
- Cache GitHub API responses in Redis (24hr TTL) to manage rate limits
- Never put business logic in N8N — N8N is glue/orchestration only
- Claude analysis outputs must always use structured JSON with defined schemas
- Total Vapi system prompt target: under 2,000 tokens

## File Naming
- Components: PascalCase (e.g., ProfileCard.tsx)
- Utilities/lib: camelCase (e.g., githubAnalysis.ts)
- Types: PascalCase for interfaces, camelCase for files
- API routes: kebab-case directories

## When in Doubt
- This is a B2B product — prioritize the company dashboard experience
- White label support matters — use CSS custom properties for theming, scope all data with company_id
- The voice agent context injection is the core IP — every decision around profile generation should optimize for producing the best possible interview context
- Cash-first mindset — build what's demoable and sellable
