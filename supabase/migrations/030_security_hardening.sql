-- Fix Supabase Security Advisor errors

-- 1. Enable RLS on tables missing it
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_tokens ENABLE ROW LEVEL SECURITY;

-- 2. RLS policies for team_invites (scoped to company)
CREATE POLICY "team_invites_company_read" ON team_invites
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM company_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "team_invites_admin_write" ON team_invites
  FOR ALL USING (
    company_id IN (
      SELECT cu.company_id FROM company_users cu
      WHERE cu.user_id = auth.uid() AND cu.role IN ('owner', 'admin')
    )
  );

-- 3. RLS policies for company_settings (scoped to company)
CREATE POLICY "company_settings_company_read" ON company_settings
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM company_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "company_settings_admin_write" ON company_settings
  FOR ALL USING (
    company_id IN (
      SELECT cu.company_id FROM company_users cu
      WHERE cu.user_id = auth.uid() AND cu.role IN ('owner', 'admin')
    )
  );

-- 4. RLS policies for email_logs (scoped to company's applications)
CREATE POLICY "email_logs_company_read" ON email_logs
  FOR SELECT USING (
    application_id IN (
      SELECT a.id FROM applications a
      WHERE a.company_id IN (
        SELECT company_id FROM company_users WHERE user_id = auth.uid()
      )
    )
  );

-- email_logs writes are done via service role (admin client), no user-facing write policy needed

-- 5. RLS policies for interview_tokens (scoped to company's applications)
CREATE POLICY "interview_tokens_company_read" ON interview_tokens
  FOR SELECT USING (
    application_id IN (
      SELECT a.id FROM applications a
      WHERE a.company_id IN (
        SELECT company_id FROM company_users WHERE user_id = auth.uid()
      )
    )
  );

-- interview_tokens also need public read for the interview page (candidate accessing their token)
CREATE POLICY "interview_tokens_public_read" ON interview_tokens
  FOR SELECT USING (true);

-- 6. Fix search_path on functions (warnings)
-- IF EXISTS not supported on ALTER FUNCTION in all PG versions, use DO block
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    ALTER FUNCTION update_updated_at_column() SET search_path = public;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_default_settings') THEN
    ALTER FUNCTION create_default_settings() SET search_path = public;
  END IF;
END $$;
