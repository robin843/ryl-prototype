-- =====================================================
-- PHASE 1: Database Extensions for Ryl V1 Launch
-- =====================================================

-- 1. Saved Products Table (Wishlist)
CREATE TABLE public.saved_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.shopable_products(id) ON DELETE CASCADE,
  episode_id uuid REFERENCES public.episodes(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.saved_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_products
CREATE POLICY "Users can view own saved products" 
ON public.saved_products FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved products" 
ON public.saved_products FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved products" 
ON public.saved_products FOR DELETE 
USING (auth.uid() = user_id);

-- 2. Analytics Events Table (for Producer Dashboard)
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN ('view', 'hotspot_click', 'product_view', 'purchase', 'save')),
  episode_id uuid REFERENCES public.episodes(id) ON DELETE SET NULL,
  product_id uuid REFERENCES public.shopable_products(id) ON DELETE SET NULL,
  hotspot_id uuid REFERENCES public.episode_hotspots(id) ON DELETE SET NULL,
  user_id uuid,
  creator_id uuid NOT NULL,
  revenue_cents integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics_events
CREATE POLICY "Creators can view own analytics" 
ON public.analytics_events FOR SELECT 
USING (auth.uid() = creator_id);

CREATE POLICY "Anyone can insert analytics events" 
ON public.analytics_events FOR INSERT 
WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_analytics_creator ON public.analytics_events(creator_id);
CREATE INDEX idx_analytics_episode ON public.analytics_events(episode_id);
CREATE INDEX idx_analytics_date ON public.analytics_events(created_at);
CREATE INDEX idx_analytics_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_saved_products_user ON public.saved_products(user_id);

-- 3. Extend profiles table with bio and total_sales
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS total_sales_cents integer DEFAULT 0;