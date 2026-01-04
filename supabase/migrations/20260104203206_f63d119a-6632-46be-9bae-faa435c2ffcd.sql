-- Create series table for producer content
CREATE TABLE public.series (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  genre TEXT,
  cover_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  episode_count INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create episodes table
CREATE TABLE public.episodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  series_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL,
  episode_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  duration TEXT,
  is_premium BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(series_id, episode_number)
);

-- Create shopable_products table for producer products
CREATE TABLE public.shopable_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  name TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'EUR',
  product_url TEXT,
  image_url TEXT,
  stripe_price_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create episode_hotspots table to link products to episodes
CREATE TABLE public.episode_hotspots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  episode_id UUID NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.shopable_products(id) ON DELETE CASCADE,
  position_x NUMERIC NOT NULL CHECK (position_x >= 0 AND position_x <= 100),
  position_y NUMERIC NOT NULL CHECK (position_y >= 0 AND position_y <= 100),
  start_time INTEGER NOT NULL DEFAULT 0,
  end_time INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopable_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episode_hotspots ENABLE ROW LEVEL SECURITY;

-- Series policies
CREATE POLICY "Anyone can view published series"
  ON public.series FOR SELECT
  USING (status = 'published');

CREATE POLICY "Creators can view their own series"
  ON public.series FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can insert their own series"
  ON public.series FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own series"
  ON public.series FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their own series"
  ON public.series FOR DELETE
  USING (auth.uid() = creator_id);

-- Episodes policies
CREATE POLICY "Anyone can view published episodes"
  ON public.episodes FOR SELECT
  USING (status = 'published');

CREATE POLICY "Creators can view their own episodes"
  ON public.episodes FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can insert their own episodes"
  ON public.episodes FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own episodes"
  ON public.episodes FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their own episodes"
  ON public.episodes FOR DELETE
  USING (auth.uid() = creator_id);

-- Shopable products policies
CREATE POLICY "Anyone can view products"
  ON public.shopable_products FOR SELECT
  USING (true);

CREATE POLICY "Creators can insert their own products"
  ON public.shopable_products FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own products"
  ON public.shopable_products FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their own products"
  ON public.shopable_products FOR DELETE
  USING (auth.uid() = creator_id);

-- Episode hotspots policies
CREATE POLICY "Anyone can view hotspots for published episodes"
  ON public.episode_hotspots FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.episodes e 
    WHERE e.id = episode_id AND e.status = 'published'
  ));

CREATE POLICY "Creators can manage hotspots for their episodes"
  ON public.episode_hotspots FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.episodes e 
    WHERE e.id = episode_id AND e.creator_id = auth.uid()
  ));

-- Create storage bucket for media uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true);

-- Storage policies for media bucket
CREATE POLICY "Anyone can view media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

CREATE POLICY "Authenticated users can upload media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add triggers for updated_at
CREATE TRIGGER update_series_updated_at
  BEFORE UPDATE ON public.series
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_episodes_updated_at
  BEFORE UPDATE ON public.episodes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shopable_products_updated_at
  BEFORE UPDATE ON public.shopable_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();