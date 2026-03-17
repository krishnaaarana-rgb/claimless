-- Fix email_logs status constraint to include 'pending' and 'processing'
-- needed for the email delay queue system (migration 024)
ALTER TABLE email_logs DROP CONSTRAINT IF EXISTS email_logs_status_check;
ALTER TABLE email_logs ADD CONSTRAINT email_logs_status_check
  CHECK (status IN ('sent', 'failed', 'bounced', 'delivered', 'opened', 'pending', 'processing'));

-- Also add a body column if it doesn't exist (stores scheduled email payload)
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS body TEXT;

-- Update default stage_names to use "Shortlisted" instead of "Hired"
UPDATE company_settings
  SET stage_names = jsonb_set(stage_names, '{hired}', '"Shortlisted"')
  WHERE stage_names->>'hired' = 'Hired';

ALTER TABLE company_settings
  ALTER COLUMN stage_names SET DEFAULT '{"applied": "New", "stage_1_passed": "Passed ATS", "interview_invited": "Interview Invited", "interview_completed": "Interview Done", "hired": "Shortlisted", "rejected": "Rejected", "pending_review": "Pending Review"}'::jsonb;
