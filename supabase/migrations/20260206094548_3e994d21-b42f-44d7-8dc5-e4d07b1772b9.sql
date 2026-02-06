
-- Table for series-level retention metrics (materialized/aggregated periodically)
CREATE TABLE public.series_retention_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  series_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE,
  -- Hook Rate: % viewers past second 3
  hook_rate NUMERIC(5,2) DEFAULT 0,
  -- Cliffhanger Score: 1 - drop_off_last_5s_rate  
  cliffhanger_score NUMERIC(5,2) DEFAULT 0,
  -- Binge Velocity: avg seconds between episode completions
  avg_transition_seconds NUMERIC(10,1) DEFAULT 0,
  -- Raw counts for computation
  total_views INTEGER DEFAULT 0,
  past_3s_count INTEGER DEFAULT 0,
  completion_count INTEGER DEFAULT 0,
  drop_off_last_5s_count INTEGER DEFAULT 0,
  transition_count INTEGER DEFAULT 0,
  -- Period
  period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  period_end TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(series_id, episode_id, period_start)
);

ALTER TABLE public.series_retention_metrics ENABLE ROW LEVEL SECURITY;

-- Creators can read their own series metrics
CREATE POLICY "Creators can view own series retention"
  ON public.series_retention_metrics FOR SELECT
  USING (
    series_id IN (
      SELECT id FROM public.series WHERE creator_id = auth.uid()
    )
  );

-- Service role inserts (via edge function / cron)
CREATE POLICY "Service role can manage retention metrics"
  ON public.series_retention_metrics FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin')
  );

-- Index for fast lookups
CREATE INDEX idx_series_retention_series ON public.series_retention_metrics(series_id);
CREATE INDEX idx_series_retention_episode ON public.series_retention_metrics(episode_id);
