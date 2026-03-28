-- Post-interview auto-actions
-- notify_threshold: email recruiter when score >= this (default 65)
-- auto_shortlist_threshold: auto-advance to shortlisted when score >= this (null = disabled)
ALTER TABLE company_settings
  ADD COLUMN IF NOT EXISTS post_interview_notify_threshold INTEGER DEFAULT 65,
  ADD COLUMN IF NOT EXISTS post_interview_auto_shortlist_threshold INTEGER DEFAULT NULL;
