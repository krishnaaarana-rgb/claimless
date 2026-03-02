-- Interview tokens for secure interview access
CREATE TABLE IF NOT EXISTS interview_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_interview_tokens_token ON interview_tokens(token);

-- Add github_required field to jobs for company-level toggle
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS github_required BOOLEAN NOT NULL DEFAULT false;

-- Update default acceptance email template to include interview link
UPDATE company_settings
SET email_acceptance_body = E'Hi {{candidate_name}},\n\nWe were impressed by your application for {{job_title}}. We''d like to invite you to the next stage \u2014 an AI-powered interview.\n\nClick the link below to begin when you''re ready:\n{{interview_link}}\n\nThe interview takes about 15 minutes. You''ll need a camera and microphone. Find a quiet spot and take your time.\n\nBest,\n{{company_name}} Team'
WHERE email_acceptance_body LIKE '%separate email with instructions%';
