-- ============================================================
-- Multi-recruiter: job assignments, permissions, created_by
-- ============================================================

-- Track who created each job
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Job assignments — which recruiters are assigned to which jobs
CREATE TABLE IF NOT EXISTS job_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(job_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_job_assignments_user ON job_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_job_assignments_job ON job_assignments(job_id);
CREATE INDEX IF NOT EXISTS idx_job_assignments_company ON job_assignments(company_id);

-- RLS for job_assignments
ALTER TABLE job_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view job assignments in their company"
  ON job_assignments FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM company_users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage job assignments"
  ON job_assignments FOR ALL
  USING (company_id IN (
    SELECT company_id FROM company_users
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));
