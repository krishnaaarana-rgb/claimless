-- ============================================================
-- CLAIMLESS — Full Database Schema
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- COMPANIES & TENANTS
-- ============================================================

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#2563EB',
  secondary_color TEXT DEFAULT '#1E40AF',
  domain TEXT,
  plan TEXT NOT NULL DEFAULT 'standard' CHECK (plan IN ('standard', 'premium', 'white_label')),
  settings JSONB DEFAULT '{}',
  onboarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE company_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

-- ============================================================
-- JOBS
-- ============================================================

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements JSONB NOT NULL DEFAULT '[]',
  requirements_raw TEXT,
  requirements_analyzed JSONB,
  department TEXT,
  location TEXT,
  salary_range JSONB,
  employment_type TEXT DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'contract', 'part_time')),
  stage_config JSONB NOT NULL DEFAULT '{
    "stage_1_proof_of_work": true,
    "stage_2_loom": false,
    "stage_3_voice": true
  }',
  voice_interview_config JSONB DEFAULT '{
    "max_duration_minutes": 20,
    "focus_areas": [],
    "custom_questions": []
  }',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'closed')),
  published_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);

-- ============================================================
-- CANDIDATES
-- ============================================================

CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  email TEXT UNIQUE,
  full_name TEXT,
  github_username TEXT UNIQUE,
  personal_website_url TEXT,
  linkedin_url TEXT,
  phone TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_candidates_github ON candidates(github_username);
CREATE INDEX idx_candidates_email ON candidates(email);

-- ============================================================
-- STAGE 1: PROOF OF WORK PROFILES
-- ============================================================

CREATE TABLE candidate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  seniority_estimate TEXT CHECK (seniority_estimate IN ('junior', 'mid', 'senior', 'staff')),
  github_data JSONB,
  github_analysis JSONB,
  architectural_decisions JSONB DEFAULT '[]',
  verified_skills JSONB DEFAULT '[]',
  shipped_products JSONB DEFAULT '[]',
  website_analysis JSONB,
  interview_context_summary TEXT,
  interview_suggested_questions JSONB DEFAULT '[]',
  scrape_status TEXT DEFAULT 'pending' CHECK (scrape_status IN ('pending', 'scraping', 'analyzing', 'complete', 'failed')),
  scrape_error TEXT,
  last_scraped_at TIMESTAMPTZ,
  analysis_version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_candidate ON candidate_profiles(candidate_id);
CREATE INDEX idx_profiles_status ON candidate_profiles(scrape_status);

-- ============================================================
-- APPLICATIONS (ties candidates to jobs through the pipeline)
-- ============================================================

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  current_stage TEXT NOT NULL DEFAULT 'stage_1' CHECK (current_stage IN ('stage_1', 'stage_2', 'stage_3', 'completed', 'rejected')),
  profile_id UUID REFERENCES candidate_profiles(id),
  loom_submission_id UUID,
  voice_interview_id UUID,
  stage_1_score INTEGER,
  stage_2_score INTEGER,
  stage_3_score INTEGER,
  overall_score INTEGER,
  stage_1_passed BOOLEAN,
  stage_2_passed BOOLEAN,
  stage_3_passed BOOLEAN,
  match_score INTEGER,
  match_breakdown JSONB,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'shortlisted', 'rejected', 'hired', 'withdrawn')),
  rejected_reason TEXT,
  shortlisted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(candidate_id, job_id)
);

CREATE INDEX idx_applications_company ON applications(company_id);
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_candidate ON applications(candidate_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_stage ON applications(current_stage);

-- ============================================================
-- STAGE 2: LOOM VIDEO ANALYSIS
-- ============================================================

CREATE TABLE loom_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  loom_url TEXT NOT NULL,
  video_duration_seconds INTEGER,
  transcript TEXT,
  analysis JSONB,
  loom_context_summary TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'analyzed', 'failed')),
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_loom_candidate ON loom_submissions(candidate_id);
CREATE INDEX idx_loom_application ON loom_submissions(application_id);

-- Add foreign key on applications now that loom_submissions exists
ALTER TABLE applications
  ADD CONSTRAINT fk_applications_loom
  FOREIGN KEY (loom_submission_id) REFERENCES loom_submissions(id);

-- ============================================================
-- STAGE 3: VOICE INTERVIEWS
-- ============================================================

CREATE TABLE voice_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  vapi_call_id TEXT UNIQUE,
  vapi_assistant_id TEXT,
  injected_prompt TEXT NOT NULL,
  injected_context JSONB,
  phone_number TEXT,
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  transcript TEXT,
  recording_url TEXT,
  analysis JSONB,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'failed', 'no_show')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_voice_candidate ON voice_interviews(candidate_id);
CREATE INDEX idx_voice_application ON voice_interviews(application_id);
CREATE INDEX idx_voice_job ON voice_interviews(job_id);
CREATE INDEX idx_voice_status ON voice_interviews(status);

-- Add foreign key on applications now that voice_interviews exists
ALTER TABLE applications
  ADD CONSTRAINT fk_applications_voice
  FOREIGN KEY (voice_interview_id) REFERENCES voice_interviews(id);

-- ============================================================
-- CANDIDATE DIRECTORY
-- ============================================================

CREATE TABLE directory_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  skills TEXT[],
  seniority TEXT,
  location TEXT,
  available BOOLEAN DEFAULT true,
  search_vector TSVECTOR,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_directory_search ON directory_listings USING GIN(search_vector);
CREATE INDEX idx_directory_skills ON directory_listings USING GIN(skills);
CREATE INDEX idx_directory_candidate ON directory_listings(candidate_id);

-- ============================================================
-- AUDIT & ANALYTICS
-- ============================================================

CREATE TABLE pipeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id),
  company_id UUID NOT NULL REFERENCES companies(id),
  candidate_id UUID REFERENCES candidates(id),
  job_id UUID REFERENCES jobs(id),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_company ON pipeline_events(company_id, created_at DESC);
CREATE INDEX idx_events_application ON pipeline_events(application_id, created_at);

-- ============================================================
-- WHITE LABEL CONFIG
-- ============================================================

CREATE TABLE white_label_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
  custom_domain TEXT UNIQUE,
  logo_url TEXT,
  favicon_url TEXT,
  brand_name TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  accent_color TEXT,
  font_family TEXT DEFAULT 'Inter',
  email_from_name TEXT,
  email_from_address TEXT,
  custom_css TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE loom_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE directory_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE white_label_configs ENABLE ROW LEVEL SECURITY;

-- Company users can see their own company
CREATE POLICY "Users can view own company"
  ON companies FOR SELECT
  USING (id IN (SELECT company_id FROM company_users WHERE user_id = auth.uid()));

-- Company users can see their teammates
CREATE POLICY "Users can view company members"
  ON company_users FOR SELECT
  USING (company_id IN (SELECT company_id FROM company_users WHERE user_id = auth.uid()));

-- Company users can see their jobs
CREATE POLICY "Users can view company jobs"
  ON jobs FOR SELECT
  USING (company_id IN (SELECT company_id FROM company_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage company jobs"
  ON jobs FOR ALL
  USING (company_id IN (
    SELECT company_id FROM company_users
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- Company users can see applications for their jobs
CREATE POLICY "Users can view company applications"
  ON applications FOR SELECT
  USING (company_id IN (SELECT company_id FROM company_users WHERE user_id = auth.uid()));

-- Candidates can see their own data
CREATE POLICY "Candidates can view own record"
  ON candidates FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Candidates can update own record"
  ON candidates FOR UPDATE
  USING (user_id = auth.uid());

-- Company users can view candidates who applied to their jobs
CREATE POLICY "Companies can view their candidates"
  ON candidates FOR SELECT
  USING (id IN (
    SELECT candidate_id FROM applications
    WHERE company_id IN (SELECT company_id FROM company_users WHERE user_id = auth.uid())
  ));

-- Profiles visible to the candidate and to companies they applied to
CREATE POLICY "Profiles visible to relevant parties"
  ON candidate_profiles FOR SELECT
  USING (
    candidate_id IN (SELECT id FROM candidates WHERE user_id = auth.uid())
    OR
    candidate_id IN (
      SELECT candidate_id FROM applications
      WHERE company_id IN (SELECT company_id FROM company_users WHERE user_id = auth.uid())
    )
  );

-- Voice interviews visible to company users
CREATE POLICY "Company users can view interviews"
  ON voice_interviews FOR SELECT
  USING (job_id IN (
    SELECT id FROM jobs
    WHERE company_id IN (SELECT company_id FROM company_users WHERE user_id = auth.uid())
  ));

-- Loom submissions visible to company users
CREATE POLICY "Company users can view loom submissions"
  ON loom_submissions FOR SELECT
  USING (application_id IN (
    SELECT id FROM applications
    WHERE company_id IN (SELECT company_id FROM company_users WHERE user_id = auth.uid())
  ));

-- Directory listings are public for authenticated users
CREATE POLICY "Directory is public for authenticated"
  ON directory_listings FOR SELECT
  USING (visible = true AND auth.uid() IS NOT NULL);

-- Pipeline events visible to company
CREATE POLICY "Company users can view events"
  ON pipeline_events FOR SELECT
  USING (company_id IN (SELECT company_id FROM company_users WHERE user_id = auth.uid()));

-- White label config visible to company
CREATE POLICY "Company users can view white label config"
  ON white_label_configs FOR SELECT
  USING (company_id IN (SELECT company_id FROM company_users WHERE user_id = auth.uid()));

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_candidate_profiles_updated_at BEFORE UPDATE ON candidate_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_voice_interviews_updated_at BEFORE UPDATE ON voice_interviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_directory_listings_updated_at BEFORE UPDATE ON directory_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_white_label_configs_updated_at BEFORE UPDATE ON white_label_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
