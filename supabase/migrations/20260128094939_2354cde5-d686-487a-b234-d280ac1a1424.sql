-- Add new fields for improved creator application flow
ALTER TABLE public.producer_applications
ADD COLUMN IF NOT EXISTS primary_platform text,
ADD COLUMN IF NOT EXISTS content_categories text[] DEFAULT '{}';

-- Add comment for clarity
COMMENT ON COLUMN public.producer_applications.primary_platform IS 'Primary social platform: tiktok, instagram, youtube, other';
COMMENT ON COLUMN public.producer_applications.content_categories IS 'Content categories: fashion, beauty, lifestyle, food, tech, entertainment';