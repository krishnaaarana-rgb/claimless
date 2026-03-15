# Industry Configuration

## Architecture

```
src/lib/industries/skills/          ← Source of truth (per-industry files)
    ├── healthcare.ts               20 hard + 3 soft skills
    ├── finance.ts                  16 hard + 3 soft skills
    ├── sales.ts                    13 hard + 3 soft skills
    ├── legal.ts                     5 hard + 3 soft skills
    ├── technology.ts               28 hard + 3 soft skills
    ├── marketing.ts                12 hard + 4 soft skills
    ├── human_resources.ts          14 hard + 4 soft skills
    ├── education.ts                12 hard + 3 soft skills
    ├── operations.ts               11 hard + 4 soft skills
    ├── design.ts                   11 hard + 3 soft skills
    ├── customer_success.ts         11 hard + 3 soft skills
    ├── data_analytics.ts           12 hard + 3 soft skills
    ├── construction.ts             14 hard + 4 soft skills
    ├── general.ts                   0 hard + 5 soft skills
    └── index.ts                    assembles all → INDUSTRIES_FROM_FILES

src/lib/industry-skills.ts          ← Imports from per-industry files
                                      Exports: INDUSTRIES, helper functions
                                      Re-exports types: IndustryDefinition, etc.

src/lib/industries/index.ts         ← Helper utilities
                                      getIndustry(), getIndustryIds(),
                                      getIndustrySummaries(), PIPELINE_CONNECTIONS
```

## Total: 179 hard skills + 48 soft skills = 227 skills

## How Data Flows Through the Pipeline

```
Company creates job
    ↓ selects industry + picks skills from taxonomy
    ↓ skill_requirements stored on job record
    ↓
Candidate applies
    ↓ resume + project files + links + Loom URL
    ↓
┌─────────────────────────────────────────────────────────┐
│ STAGE 1: ATS SCREENING                                  │
│                                                         │
│ Input:                                                  │
│   • Resume text                                         │
│   • Job description + industry + skill_requirements     │
│   • Portfolio website content (scraped)                  │
│   • Supporting links content (scraped)                   │
│   • Project file text (extracted from PDFs)              │
│   • Today's date (for timeline validation)               │
│                                                         │
│ What it does:                                           │
│   • Evaluates resume against EACH skill requirement     │
│   • Checks timeline consistency, title vs responsibility│
│   • Flags inflated numbers, career progression issues   │
│   • Generates interview brief for the VA                │
│                                                         │
│ Output (stored in match_breakdown):                     │
│   • match_score (0-100)                                 │
│   • strengths[], concerns[], consistency_flags[]        │
│   • key_qualifications[] with met/unmet + evidence      │
│   • suggested_interview_topics[]                        │
│   • interview_brief (text summary for VA)               │
│   • project_file_extracts (text from uploaded PDFs)     │
│                                                         │
│ Triggers:                                               │
│   • Auto-invite (if enabled + score >= threshold)       │
│   • Loom analysis (if loom_url submitted)               │
│   • Email notification (respects delay setting)         │
│   • Webhooks + ATS push                                 │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│ STAGE 2: LOOM ANALYSIS (optional)                       │
│                                                         │
│ Input:                                                  │
│   • Loom video URL → transcript scraped automatically   │
│   • Job title + description for relevance scoring       │
│                                                         │
│ Output (stored in loom_submissions):                    │
│   • communication_clarity_score (0-10)                  │
│   • confidence_score (0-10)                             │
│   • technical_depth_score (0-10)                        │
│   • relevance_score (0-10)                              │
│   • summary, strengths[], concerns[], key_quotes[]      │
│   • loom_context_summary (injected into VA prompt)      │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│ STAGE 3: AI VOICE INTERVIEW (GPT-5 via Vapi)           │
│                                                         │
│ Input (ALL of these are injected into the VA prompt):   │
│   • Resume text                                         │
│   • Screening brief (strengths, concerns, topics)       │
│   • Consistency flags ("probe these naturally")         │
│   • Project file content (extracted PDFs)               │
│   • Loom context summary                                │
│   • GitHub analysis (if tech role)                       │
│   • Industry interview_context (persona, tone, terms)   │
│   • Skill assessment block (per skill: level expected,  │
│     sample questions, rubric)                           │
│   • AU compliance block (anti-discrimination,           │
│     industry-specific regulations)                      │
│   • Today's date                                        │
│                                                         │
│ What the VA does:                                       │
│   Phase 1: Warm up (2 min)                              │
│   Phase 2: Skill testing with mandatory techniques:     │
│     • Live Problem Solving (at least 2x)                │
│     • Depth Pursuit (3 levels deep)                     │
│     • Anti-Coaching Detection                           │
│     • Teach Me technique                                │
│   Phase 3: Failure Mode Test (mandatory)                │
│   Phase 4: Candidate questions                          │
│   Phase 5: Wrap up                                      │
│                                                         │
│ Output:                                                 │
│   • Full transcript stored                              │
│   • Recording URL stored                                │
│   • Prompt stored for audit                             │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│ SCORING (Claude Sonnet 4.6)                             │
│                                                         │
│ Input:                                                  │
│   • Full interview transcript                           │
│   • Resume text                                         │
│   • Screening data (strengths, concerns, flags)         │
│   • Loom context                                        │
│   • Skill rubrics (from industry level_descriptors)     │
│                                                         │
│ Output (stored in application_form_data):               │
│   • overall_score (0-100)                               │
│   • skill_assessments[] with evidence quotes            │
│   • depth_reached per skill (surface→expert)            │
│   • recommendation (strong_hire → strong_no_hire)       │
│   • key_moments[], risk_factors[], follow_up_questions[] │
│   • consistency_analysis                                │
│                                                         │
│ Triggers:                                               │
│   • ATS push with full scored results                   │
│   • Webhooks                                            │
│                                                         │
│ Combined score: 40% ATS + 60% Interview                 │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│ UI: CANDIDATE DETAIL PAGE                               │
│                                                         │
│ Displays:                                               │
│   • Overall / ATS / Interview / Loom score cards        │
│   • Recommendation badge                                │
│   • ATS: strengths, concerns, consistency flags (amber) │
│   • Loom: 4 scores, summary, quotes                    │
│   • Interview: skill table, key moments, risk factors   │
│   • Transcript (viewable + downloadable)                │
│   • Recording (audio player)                            │
│   • Resume + project file downloads                     │
└─────────────────────────────────────────────────────────┘
```

## How to Add/Edit Skills

**Edit existing skills:** Open the industry file (e.g., `skills/technology.ts`), find the skill, modify it.

**Add a new skill:** Add to the `hard_skills` or `soft_skills` array in the industry file. Each skill needs:
```typescript
{
  name: "Skill Name",
  category: "hard_skill",
  description: "One sentence description",
  sample_questions: [
    "Scenario-based question 1",
    "Scenario-based question 2",
  ],
  level_descriptors: {
    basic: "What basic looks like (concrete)",
    intermediate: "What intermediate looks like",
    advanced: "What advanced looks like",
    expert: "What expert looks like",
  },
}
```

**Add a new industry:**
1. Create `skills/new_industry.ts` — export `newIndustryIndustry: IndustryDefinition`
2. Add import + entry in `src/lib/industry-skills.ts`
3. Add AU compliance block in `src/lib/claude/prompts/industry-interview.ts` if needed

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/industries/skills/*.ts` | Per-industry skill definitions (source of truth) |
| `src/lib/industry-skills.ts` | Assembles all industries, exports INDUSTRIES + helpers |
| `src/lib/claude/prompts/ats-screening.ts` | ATS screening prompt (uses skill_requirements) |
| `src/lib/claude/prompts/industry-interview.ts` | VA interview prompt + scoring prompt + AU compliance |
| `src/lib/claude/prompts/loom-analysis.ts` | Loom video analysis prompt |
| `src/app/api/apply/screen/route.ts` | Screening API (passes industry + skills to Claude) |
| `src/app/api/interview/[token]/start/route.ts` | Interview start (assembles full VA prompt) |
| `src/app/api/interview/score/route.ts` | Post-interview scoring (uses skill rubrics) |
| `src/components/IndustrySkillPicker.tsx` | UI component for selecting industry + skills on job creation |
