-- Shareable Client Brief tokens
-- Allows agencies to share candidate assessments with clients via token-based public links

CREATE TABLE IF NOT EXISTS brief_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  application_ids UUID[] NOT NULL,
  brief_type TEXT NOT NULL DEFAULT 'single' CHECK (brief_type IN ('single', 'shortlist')),
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  token TEXT NOT NULL UNIQUE,
  title TEXT,
  note TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days',
  view_count INTEGER NOT NULL DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brief_tokens_token ON brief_tokens(token);
CREATE INDEX IF NOT EXISTS idx_brief_tokens_company ON brief_tokens(company_id);

-- RLS
ALTER TABLE brief_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can manage their briefs"
  ON brief_tokens
  FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM company_users WHERE user_id = auth.uid()
    )
  );

COMMENT ON TABLE brief_tokens IS 'Token-based shareable client briefs for candidate assessments';
COMMENT ON COLUMN brief_tokens.application_ids IS 'Array of application UUIDs included in this brief';
COMMENT ON COLUMN brief_tokens.brief_type IS 'single = one candidate, shortlist = multiple candidates compared';
