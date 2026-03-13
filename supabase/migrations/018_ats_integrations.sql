-- ============================================================
-- 018: ATS Integration Layer
-- Stores ATS connection configs and tracks inbound/outbound sync
-- ============================================================

-- ATS integration connections per company
CREATE TABLE IF NOT EXISTS ats_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('jobadder', 'bullhorn', 'vincere', 'generic')),
  name TEXT NOT NULL DEFAULT 'ATS Integration',
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Outbound push config: where to send results back
  callback_url TEXT,
  callback_secret TEXT,
  callback_events TEXT[] NOT NULL DEFAULT '{"screening_completed","interview_completed"}',

  -- Provider-specific credentials (for outbound push to their API)
  provider_api_key TEXT,
  provider_api_url TEXT,

  -- Field mapping overrides (JSONB) — null = use default adapter
  field_mapping JSONB,

  -- Stats
  last_inbound_at TIMESTAMPTZ,
  last_outbound_at TIMESTAMPTZ,
  inbound_count INTEGER NOT NULL DEFAULT 0,
  outbound_count INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Track every inbound/outbound sync for audit
CREATE TABLE IF NOT EXISTS ats_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES ats_integrations(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  external_id TEXT,  -- candidate/application ID in the external ATS
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'skipped')),
  payload JSONB,
  response JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_ats_integrations_company ON ats_integrations(company_id);
CREATE INDEX idx_ats_sync_log_integration ON ats_sync_log(integration_id);
CREATE INDEX idx_ats_sync_log_company ON ats_sync_log(company_id);
CREATE INDEX idx_ats_sync_log_application ON ats_sync_log(application_id);

-- RLS
ALTER TABLE ats_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ats_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can manage their integrations"
  ON ats_integrations FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM company_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Company members can view sync logs"
  ON ats_sync_log FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM company_users WHERE user_id = auth.uid()
    )
  );
