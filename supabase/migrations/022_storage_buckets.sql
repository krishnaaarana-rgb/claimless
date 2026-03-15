-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('candidate-files', 'candidate-files', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg']),
  ('job-files', 'job-files', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg'])
ON CONFLICT (id) DO NOTHING;

-- RLS: candidate-files — anyone can upload (public apply form), company members can read
CREATE POLICY "Anyone can upload candidate files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'candidate-files');

CREATE POLICY "Company members can read candidate files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'candidate-files');

-- RLS: job-files — company members can upload and read
CREATE POLICY "Company members can manage job files"
  ON storage.objects FOR ALL
  USING (bucket_id = 'job-files');
