-- Add industry-aware skills taxonomy columns to the jobs table
-- These support the cross-industry AI interviewer system

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS industry_niche TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS skill_requirements JSONB DEFAULT '[]'::jsonb;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS industry_interview_context TEXT;

-- Index for filtering by industry
CREATE INDEX IF NOT EXISTS idx_jobs_industry ON jobs (industry) WHERE industry IS NOT NULL;

COMMENT ON COLUMN jobs.industry IS 'Industry identifier (e.g. healthcare, finance, technology)';
COMMENT ON COLUMN jobs.industry_niche IS 'Sub-niche within the industry (e.g. nursing, investment_banking)';
COMMENT ON COLUMN jobs.skill_requirements IS 'Array of {skill, category, level, required, weight, assessment_rubric}';
COMMENT ON COLUMN jobs.industry_interview_context IS 'Pre-generated interview context for the AI voice interviewer';
