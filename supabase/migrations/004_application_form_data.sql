-- Store the raw form submission data on each application
ALTER TABLE applications ADD COLUMN IF NOT EXISTS application_form_data JSONB DEFAULT '{}';

-- Store resume filename/reference
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS resume_url TEXT;
