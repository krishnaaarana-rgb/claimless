-- Add email delay setting (minutes before sending screening result emails)
ALTER TABLE company_settings
  ADD COLUMN IF NOT EXISTS email_delay_minutes INTEGER DEFAULT 60;

-- Add scheduled send time to email_logs
ALTER TABLE email_logs
  ADD COLUMN IF NOT EXISTS send_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS scheduled BOOLEAN DEFAULT false;

-- Index for cron job to find pending emails
CREATE INDEX IF NOT EXISTS idx_email_logs_scheduled ON email_logs(scheduled, send_at)
  WHERE scheduled = true AND status = 'pending';
