-- Per-job custom instructions for the AI voice interviewer
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS custom_instructions TEXT;
