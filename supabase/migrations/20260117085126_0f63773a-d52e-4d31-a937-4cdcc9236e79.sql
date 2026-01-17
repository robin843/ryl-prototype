-- Create table for series likes
CREATE TABLE public.series_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  series_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, series_id)
);

-- Create table for saved series (favorites)
CREATE TABLE public.saved_series (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  series_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, series_id)
);

-- Enable RLS
ALTER TABLE public.series_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_series ENABLE ROW LEVEL SECURITY;

-- RLS Policies for series_likes
CREATE POLICY "Users can view their own series likes" 
ON public.series_likes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own series likes" 
ON public.series_likes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own series likes" 
ON public.series_likes FOR DELETE 
USING (auth.uid() = user_id);

-- Public read for like counts
CREATE POLICY "Anyone can count series likes" 
ON public.series_likes FOR SELECT 
USING (true);

-- RLS Policies for saved_series
CREATE POLICY "Users can view their own saved series" 
ON public.saved_series FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved series" 
ON public.saved_series FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved series" 
ON public.saved_series FOR DELETE 
USING (auth.uid() = user_id);

-- Public read for favorite counts
CREATE POLICY "Anyone can count saved series" 
ON public.saved_series FOR SELECT 
USING (true);