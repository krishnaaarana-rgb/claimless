-- Per-job ATS pass threshold (nullable — falls back to company_settings.ats_pass_threshold)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS ats_pass_threshold INTEGER DEFAULT NULL;
