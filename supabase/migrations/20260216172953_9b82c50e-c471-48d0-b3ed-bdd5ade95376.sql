
-- Hotspot click tracking for attribution
-- Each click gets a UUID, logged before redirect
CREATE TABLE public.hotspot_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hotspot_id UUID NOT NULL REFERENCES public.episode_hotspots(id) ON DELETE CASCADE,
  episode_id UUID NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL,
  product_id UUID REFERENCES public.shopable_products(id) ON DELETE SET NULL,
  user_id UUID,
  destination_url TEXT NOT NULL,
  final_redirect_url TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'shopable',
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for analytics queries
CREATE INDEX idx_hotspot_clicks_hotspot ON public.hotspot_clicks(hotspot_id);
CREATE INDEX idx_hotspot_clicks_creator ON public.hotspot_clicks(creator_id);
CREATE INDEX idx_hotspot_clicks_episode ON public.hotspot_clicks(episode_id);
CREATE INDEX idx_hotspot_clicks_created ON public.hotspot_clicks(created_at DESC);

-- Enable RLS
ALTER TABLE public.hotspot_clicks ENABLE ROW LEVEL SECURITY;

-- Anyone can insert clicks (anonymous users too)
CREATE POLICY "Anyone can log hotspot clicks"
ON public.hotspot_clicks FOR INSERT
WITH CHECK (true);

-- Creators can view clicks on their content
CREATE POLICY "Creators can view their clicks"
ON public.hotspot_clicks FOR SELECT
USING (auth.uid() = creator_id);

-- Admins can view all clicks
CREATE POLICY "Admins can view all clicks"
ON public.hotspot_clicks FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));
