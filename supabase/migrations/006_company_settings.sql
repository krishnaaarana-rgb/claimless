-- Company settings table for configurable options
CREATE TABLE IF NOT EXISTS company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- ATS Settings
  ats_pass_threshold INTEGER NOT NULL DEFAULT 40,
  ats_auto_reject BOOLEAN NOT NULL DEFAULT true,

  -- Email Templates
  email_acceptance_subject TEXT NOT NULL DEFAULT 'Great news about your application at {{company_name}}',
  email_acceptance_body TEXT NOT NULL DEFAULT E'Hi {{candidate_name}},\n\nWe were impressed by your application for {{job_title}}. We''d like to invite you to the next stage of our process \u2014 an AI-powered interview.\n\nYou''ll receive a separate email with instructions shortly.\n\nBest,\n{{company_name}} Team',
  email_rejection_subject TEXT NOT NULL DEFAULT 'Update on your application at {{company_name}}',
  email_rejection_body TEXT NOT NULL DEFAULT E'Hi {{candidate_name}},\n\nThank you for your interest in the {{job_title}} role at {{company_name}}. After careful review, we''ve decided to move forward with other candidates.\n\nWe appreciate the time you took to apply and wish you the best.\n\nBest,\n{{company_name}} Team',

  -- Application Form Defaults
  default_form_fields JSONB NOT NULL DEFAULT '{"full_name": {"enabled": true, "required": true}, "email": {"enabled": true, "required": true}, "phone": {"enabled": true, "required": false}, "resume": {"enabled": true, "required": true}, "linkedin_url": {"enabled": true, "required": false}, "github_username": {"enabled": false, "required": false}, "portfolio_url": {"enabled": true, "required": false}, "cover_letter": {"enabled": false, "required": false}}'::jsonb,

  -- Company Branding
  brand_accent_color TEXT NOT NULL DEFAULT '#D97706',
  brand_logo_url TEXT,

  -- Pipeline Stage Names (customizable labels)
  stage_names JSONB NOT NULL DEFAULT '{"applied": "New", "stage_1_passed": "Passed ATS", "interview_invited": "Interview Invited", "interview_completed": "Interview Done", "hired": "Hired", "rejected": "Rejected", "pending_review": "Pending Review"}'::jsonb,

  -- AI Interview Settings (for future Vapi integration)
  interview_duration_minutes INTEGER NOT NULL DEFAULT 15,
  interview_style TEXT NOT NULL DEFAULT 'conversational',
  interview_focus TEXT NOT NULL DEFAULT 'technical_and_behavioral',
  interview_custom_instructions TEXT,

  -- Email Provider Settings
  email_provider TEXT NOT NULL DEFAULT 'none',
  email_api_key TEXT,
  email_from_address TEXT,
  email_from_name TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(company_id)
);

-- Auto-create settings row when a company is created
CREATE OR REPLACE FUNCTION create_default_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO company_settings (company_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_company_created_settings') THEN
    CREATE TRIGGER on_company_created_settings
      AFTER INSERT ON companies
      FOR EACH ROW
      EXECUTE FUNCTION create_default_settings();
  END IF;
END $$;

-- Create settings for existing companies that don't have them
INSERT INTO company_settings (company_id)
SELECT id FROM companies
WHERE id NOT IN (SELECT company_id FROM company_settings)
ON CONFLICT DO NOTHING;
