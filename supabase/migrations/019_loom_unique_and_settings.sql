-- Add UNIQUE constraint on loom_submissions.application_id for upsert support
ALTER TABLE loom_submissions
  ADD CONSTRAINT loom_submissions_application_id_key UNIQUE (application_id);

-- Add auto_invite_interview setting to company_settings
ALTER TABLE company_settings
  ADD COLUMN IF NOT EXISTS auto_invite_interview BOOLEAN DEFAULT false;

-- Add loom_url field to default application form config for existing jobs
UPDATE jobs
SET application_form_config = jsonb_set(
  application_form_config,
  '{fields,loom_url}',
  '{"enabled": false, "required": false}'
)
WHERE application_form_config IS NOT NULL
  AND NOT (application_form_config->'fields' ? 'loom_url');

-- Update the column default for new jobs
ALTER TABLE jobs ALTER COLUMN application_form_config SET DEFAULT '{
  "fields": {
    "full_name": { "enabled": true, "required": true },
    "email": { "enabled": true, "required": true },
    "phone": { "enabled": true, "required": false },
    "resume": { "enabled": true, "required": false },
    "linkedin_url": { "enabled": true, "required": false },
    "github_username": { "enabled": false, "required": false },
    "portfolio_url": { "enabled": false, "required": false },
    "loom_url": { "enabled": false, "required": false },
    "cover_letter": { "enabled": false, "required": false }
  },
  "custom_questions": []
}';
