-- Update status constraint to support full lifecycle
ALTER TABLE interview_tokens DROP CONSTRAINT IF EXISTS interview_tokens_status_check;
ALTER TABLE interview_tokens ADD CONSTRAINT interview_tokens_status_check
  CHECK (status IN ('pending', 'active', 'completed', 'expired', 'used'));

-- Reset any tokens that were incorrectly marked as 'used' back to 'pending'
UPDATE interview_tokens SET status = 'pending' WHERE status = 'used' AND used_at IS NULL;
