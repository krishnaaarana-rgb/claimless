-- Rolling interview intelligence per job — AI interviewer learns from past interviews
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS interview_intelligence JSONB;
