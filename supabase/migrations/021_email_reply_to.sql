-- Add reply-to email field and saved reply-to addresses
ALTER TABLE company_settings
  ADD COLUMN IF NOT EXISTS email_reply_to TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS email_reply_to_addresses TEXT[] DEFAULT '{}';
