-- Store customizable application form configuration per job
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS application_form_config JSONB DEFAULT '{
  "fields": {
    "full_name": { "enabled": true, "required": true },
    "email": { "enabled": true, "required": true },
    "phone": { "enabled": true, "required": false },
    "resume": { "enabled": true, "required": false },
    "linkedin_url": { "enabled": true, "required": false },
    "github_username": { "enabled": false, "required": false },
    "portfolio_url": { "enabled": false, "required": false },
    "cover_letter": { "enabled": false, "required": false }
  },
  "custom_questions": []
}';
