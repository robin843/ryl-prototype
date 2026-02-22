
-- Phase 1: ShopableEngine Schema Extension

-- 1. Add fps to episodes
ALTER TABLE public.episodes
  ADD COLUMN IF NOT EXISTS fps NUMERIC NOT NULL DEFAULT 30;

-- 2. Add frame-based fields to episode_hotspots
ALTER TABLE public.episode_hotspots
  ADD COLUMN IF NOT EXISTS start_frame INTEGER,
  ADD COLUMN IF NOT EXISTS end_frame INTEGER,
  ADD COLUMN IF NOT EXISTS width NUMERIC NOT NULL DEFAULT 0.08,
  ADD COLUMN IF NOT EXISTS height NUMERIC NOT NULL DEFAULT 0.08,
  ADD COLUMN IF NOT EXISTS keyframes JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS animation_type TEXT NOT NULL DEFAULT 'static';

-- 3. Create hotspot_variants table for A/B testing
CREATE TABLE IF NOT EXISTS public.hotspot_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hotspot_id UUID NOT NULL REFERENCES public.episode_hotspots(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL DEFAULT 'control',
  position_x NUMERIC NOT NULL,
  position_y NUMERIC NOT NULL,
  weight NUMERIC NOT NULL DEFAULT 0.5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hotspot_variants ENABLE ROW LEVEL SECURITY;

-- Variants are readable for published episodes
CREATE POLICY "Anyone can view variants for published episodes"
  ON public.hotspot_variants FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM episode_hotspots eh
    JOIN episodes e ON e.id = eh.episode_id
    WHERE eh.id = hotspot_variants.hotspot_id
      AND e.status = 'published'
  ));

-- Creators can manage variants for their episodes
CREATE POLICY "Creators can manage their own hotspot variants"
  ON public.hotspot_variants FOR ALL
  USING (EXISTS (
    SELECT 1 FROM episode_hotspots eh
    JOIN episodes e ON e.id = eh.episode_id
    WHERE eh.id = hotspot_variants.hotspot_id
      AND e.creator_id = auth.uid()
  ));

-- Index for fast variant lookups
CREATE INDEX IF NOT EXISTS idx_hotspot_variants_hotspot_id ON public.hotspot_variants(hotspot_id);
