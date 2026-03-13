-- Add agency tagline for Client Brief branding
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS brand_tagline TEXT;

COMMENT ON COLUMN company_settings.brand_tagline IS 'Agency tagline shown on shared Client Briefs';
