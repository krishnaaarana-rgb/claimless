-- Migrate old stage values to new ones before adding constraint
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_current_stage_check;

UPDATE applications SET current_stage = 'stage_1_passed' WHERE current_stage = 'stage_1';
UPDATE applications SET current_stage = 'interview_invited' WHERE current_stage = 'stage_2';
UPDATE applications SET current_stage = 'interview_completed' WHERE current_stage = 'stage_3';
UPDATE applications SET current_stage = 'hired' WHERE current_stage = 'completed';

ALTER TABLE applications ADD CONSTRAINT applications_current_stage_check
  CHECK (current_stage IN ('applied', 'screening', 'stage_1_passed', 'stage_1_failed', 'interview_invited', 'interview_completed', 'hired', 'rejected', 'pending_review'));
