
-- Add ip_hash and session_id columns to hotspot_clicks
ALTER TABLE public.hotspot_clicks
  ADD COLUMN IF NOT EXISTS ip_hash TEXT,
  ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Index for dedup queries (unique clicks per user/session/hotspot within time window)
CREATE INDEX IF NOT EXISTS idx_hotspot_clicks_dedup
  ON public.hotspot_clicks (hotspot_id, session_id, created_at DESC);

-- Index for redirect lookup by click_id
CREATE INDEX IF NOT EXISTS idx_hotspot_clicks_id_redirect
  ON public.hotspot_clicks (id)
  INCLUDE (final_redirect_url);
