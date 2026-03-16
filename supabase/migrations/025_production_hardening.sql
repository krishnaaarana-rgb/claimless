-- Prevent duplicate applications (same candidate + same job)
-- The code checks for duplicates but race conditions can bypass it
ALTER TABLE applications
  ADD CONSTRAINT applications_candidate_job_unique
  UNIQUE (candidate_id, job_id);
