-- Add attachments JSONB to jobs table for role briefs, org charts, etc.
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]';
