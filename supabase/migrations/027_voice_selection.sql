-- Voice agent selection per company
ALTER TABLE company_settings
  ADD COLUMN IF NOT EXISTS voice_agent_id TEXT DEFAULT 'EXAVITQu4vr4xnSDxMaL';
