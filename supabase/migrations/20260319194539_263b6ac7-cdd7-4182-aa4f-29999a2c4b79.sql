
-- Add segment time boundaries to episodes for timestamp-based episode splitting
ALTER TABLE public.episodes 
  ADD COLUMN IF NOT EXISTS start_time_seconds numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS end_time_seconds numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS source_video_asset_id uuid REFERENCES public.video_assets(id) DEFAULT NULL;

-- Add source video reference to series for bulk uploads
ALTER TABLE public.series 
  ADD COLUMN IF NOT EXISTS source_video_asset_id uuid REFERENCES public.video_assets(id) DEFAULT NULL;
