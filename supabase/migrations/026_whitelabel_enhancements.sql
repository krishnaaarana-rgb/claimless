-- Custom interviewer name per company
ALTER TABLE company_settings
  ADD COLUMN IF NOT EXISTS interviewer_name TEXT DEFAULT NULL;

-- Custom subdomain per company (e.g., "acme" → acme.claimless.com)
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS subdomain TEXT DEFAULT NULL;

-- Unique constraint on subdomain
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_subdomain
  ON companies(subdomain) WHERE subdomain IS NOT NULL;
