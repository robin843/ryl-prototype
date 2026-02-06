
-- Add stock management and dynamic pricing columns to brand_products
ALTER TABLE public.brand_products
  ADD COLUMN IF NOT EXISTS stock_level integer,
  ADD COLUMN IF NOT EXISTS stock_warning_threshold integer DEFAULT 50,
  ADD COLUMN IF NOT EXISTS ryl_exclusive_price_cents integer,
  ADD COLUMN IF NOT EXISTS genre_tags text[] DEFAULT '{}';

-- Create a table for brand genre performance cache (computed periodically)
CREATE TABLE IF NOT EXISTS public.brand_genre_performance (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id uuid NOT NULL REFERENCES public.brand_accounts(id) ON DELETE CASCADE,
  genre text NOT NULL,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  revenue_cents integer DEFAULT 0,
  ctr numeric(5,2) DEFAULT 0,
  conversion_rate numeric(5,2) DEFAULT 0,
  avg_order_value_cents integer DEFAULT 0,
  period_start timestamptz NOT NULL DEFAULT now(),
  period_end timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(brand_id, genre, period_start)
);

-- Enable RLS
ALTER TABLE public.brand_genre_performance ENABLE ROW LEVEL SECURITY;

-- Brand can view their own genre performance
CREATE POLICY "Brands can view own genre performance"
  ON public.brand_genre_performance
  FOR SELECT
  USING (
    brand_id IN (
      SELECT id FROM public.brand_accounts WHERE user_id = auth.uid()
    )
  );

-- Create a table for brand attribution tracking (view-through etc.)
CREATE TABLE IF NOT EXISTS public.brand_attribution_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id uuid NOT NULL REFERENCES public.brand_accounts(id) ON DELETE CASCADE,
  user_id uuid,
  product_id uuid REFERENCES public.shopable_products(id),
  episode_id uuid REFERENCES public.episodes(id),
  attribution_type text NOT NULL CHECK (attribution_type IN ('direct_click', 'view_through', 'assisted')),
  touchpoints jsonb DEFAULT '[]',
  revenue_cents integer DEFAULT 0,
  time_to_purchase_seconds integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.brand_attribution_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brands can view own attribution events"
  ON public.brand_attribution_events
  FOR SELECT
  USING (
    brand_id IN (
      SELECT id FROM public.brand_accounts WHERE user_id = auth.uid()
    )
  );

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_brand_genre_performance_brand_id 
  ON public.brand_genre_performance(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_attribution_events_brand_id 
  ON public.brand_attribution_events(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_attribution_events_created_at 
  ON public.brand_attribution_events(created_at);
