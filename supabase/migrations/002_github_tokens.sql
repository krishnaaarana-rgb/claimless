-- Store GitHub OAuth tokens for candidates
-- In production, these should be encrypted at rest
ALTER TABLE candidates ADD COLUMN github_access_token TEXT;

-- Index for lookup
CREATE INDEX idx_candidates_github_token ON candidates(github_username) WHERE github_access_token IS NOT NULL;
