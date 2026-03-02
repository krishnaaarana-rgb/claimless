CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  candidate_email TEXT NOT NULL,
  email_type TEXT NOT NULL CHECK (email_type IN ('acceptance', 'rejection', 'interview_invite', 'reminder', 'custom')),
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced', 'delivered', 'opened')),
  resend_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_application ON email_logs(application_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_candidate ON email_logs(candidate_email);
