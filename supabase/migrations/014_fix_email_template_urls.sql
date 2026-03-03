-- Fix acceptance email templates to include {{interview_link}} variable
-- Previously the template said "You'll receive a separate email with instructions shortly"
-- but never actually included the interview link.

-- Update existing company_settings rows that still have the old default template
UPDATE company_settings
SET email_acceptance_body = E'Hi {{candidate_name}},\n\nWe were impressed by your application for {{job_title}}. We''d like to invite you to the next stage of our process \u2014 an AI-powered interview.\n\nClick the link below to begin your interview when you''re ready:\n{{interview_link}}\n\nThis link will expire in 7 days.\n\nBest,\n{{company_name}} Team',
    updated_at = NOW()
WHERE email_acceptance_body LIKE '%You''ll receive a separate email with instructions shortly%'
  AND email_acceptance_body NOT LIKE '%{{interview_link}}%';

-- Also fix any templates that might contain hardcoded localhost URLs
UPDATE company_settings
SET email_acceptance_body = REPLACE(email_acceptance_body, 'http://localhost:3000', '{{interview_link}}'),
    updated_at = NOW()
WHERE email_acceptance_body LIKE '%http://localhost:3000%';

UPDATE company_settings
SET email_rejection_body = REPLACE(email_rejection_body, 'http://localhost:3000', ''),
    updated_at = NOW()
WHERE email_rejection_body LIKE '%http://localhost:3000%';

UPDATE company_settings
SET email_acceptance_subject = REPLACE(email_acceptance_subject, 'http://localhost:3000', ''),
    updated_at = NOW()
WHERE email_acceptance_subject LIKE '%http://localhost:3000%';

UPDATE company_settings
SET email_rejection_subject = REPLACE(email_rejection_subject, 'http://localhost:3000', ''),
    updated_at = NOW()
WHERE email_rejection_subject LIKE '%http://localhost:3000%';
