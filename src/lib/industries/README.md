# Industry Configuration

## How Industries Connect to the Pipeline

```
industry-skills.ts (data source)
    │
    ├── ATS Screening (Stage 1)
    │   └── src/lib/claude/prompts/ats-screening.ts
    │       Uses: skill_requirements from job config
    │       Evaluates resume against industry-specific skills
    │
    ├── Loom Analysis (Stage 2)
    │   └── src/lib/claude/prompts/loom-analysis.ts
    │       Uses: job title + description for relevance scoring
    │       Industry-agnostic (evaluates communication, not domain)
    │
    ├── Voice Interview (Stage 3)
    │   └── src/lib/claude/prompts/industry-interview.ts
    │       Uses: industry interview_context (persona, tone, terminology)
    │       Uses: hard_skills + soft_skills with level_descriptors
    │       Uses: sub_niche interview_hints
    │       Uses: AU_INDUSTRY_REGULATIONS for compliance
    │
    └── Scoring (Post-Interview)
        └── src/lib/claude/prompts/industry-interview.ts (buildInterviewScoringPrompt)
            Uses: skill rubrics built from level_descriptors
            Uses: industry label for comparison context
```

## Industries (14)

| Industry | Hard Skills | Soft Skills | Sub-Niches | AU Regulations |
|----------|-----------|------------|-----------|---------------|
| Healthcare | 8 | 3 | 4 | AHPRA, aged care, mental health |
| Finance | 6 | 3 | 4 | ASIC, APRA, AML/CTF |
| Sales | 5 | 3 | 4 | ACL, TGA, ASIC |
| Legal | 5 | 3 | 4 | Law societies, MARA |
| Technology | 6 | 3 | 5 | ASD, Privacy Act, PSPF |
| Marketing | 6 | 4 | 3 | ACMA, AANA, Privacy Act |
| Human Resources | 6 | 4 | 3 | Fair Work, Modern Awards |
| Education | 4 | 3 | 3 | AITSL, NESA, TEQSA |
| Operations | 5 | 4 | 3 | SafeWork, WHS, ISO |
| Design | 5 | 3 | 3 | DDA, WCAG |
| Customer Success | 5 | 3 | 2 | ACL, ACCC, AFCA |
| Data Analytics | 6 | 3 | 3 | Privacy Act, CDR |
| Construction | 6 | 4 | 3 | SafeWork, SWMS, NCC/BCA |
| General | 0 | 5 | 0 | Fair Work (generic) |

## Files

- `src/lib/industry-skills.ts` — All industry definitions (skills, levels, questions, niches)
- `src/lib/claude/prompts/industry-interview.ts` — AU compliance blocks, interview prompt builder, scoring prompt builder
- `src/lib/claude/prompts/ats-screening.ts` — Resume screening with industry skill evaluation
