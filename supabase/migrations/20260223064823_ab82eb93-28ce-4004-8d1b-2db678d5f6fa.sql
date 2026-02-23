
-- Create scan_images table for storing scan history
CREATE TABLE public.scan_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  plant_species TEXT,
  disease_name TEXT,
  severity NUMERIC CHECK (severity >= 0 AND severity <= 1),
  confidence NUMERIC CHECK (confidence >= 0 AND confidence <= 1),
  treatments JSONB DEFAULT '[]'::jsonb,
  prevention_steps JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scan_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scans"
ON public.scan_images FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scans"
ON public.scan_images FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scans"
ON public.scan_images FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_scan_images_user_id ON public.scan_images(user_id);
CREATE INDEX idx_scan_images_created_at ON public.scan_images(created_at DESC);

-- Create storage bucket for scan images
INSERT INTO storage.buckets (id, name, public) VALUES ('scan-images', 'scan-images', true);

CREATE POLICY "Users can upload scan images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'scan-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Scan images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'scan-images');

CREATE POLICY "Users can delete their own scan images"
ON storage.objects FOR DELETE
USING (bucket_id = 'scan-images' AND auth.uid()::text = (storage.foldername(name))[1]);
