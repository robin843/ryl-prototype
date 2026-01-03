-- Add onboarding fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_step integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamp with time zone;

-- Create interest categories table
CREATE TABLE public.interest_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_de text NOT NULL,
  icon text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on interest_categories
ALTER TABLE public.interest_categories ENABLE ROW LEVEL SECURITY;

-- Everyone can read categories
CREATE POLICY "Anyone can view interest categories"
ON public.interest_categories
FOR SELECT
TO authenticated
USING (true);

-- Create user interests table
CREATE TABLE public.user_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category_id uuid NOT NULL REFERENCES public.interest_categories(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, category_id)
);

-- Enable RLS on user_interests
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;

-- Users can view their own interests
CREATE POLICY "Users can view their own interests"
ON public.user_interests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own interests
CREATE POLICY "Users can insert their own interests"
ON public.user_interests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own interests
CREATE POLICY "Users can delete their own interests"
ON public.user_interests
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Seed interest categories
INSERT INTO public.interest_categories (name, name_de, icon, sort_order) VALUES
('Drama', 'Drama', 'Theater', 1),
('Comedy', 'Komödie', 'Laugh', 2),
('Reality', 'Reality', 'Video', 3),
('Fashion', 'Mode', 'Shirt', 4),
('Beauty', 'Beauty', 'Sparkles', 5),
('Lifestyle', 'Lifestyle', 'Heart', 6),
('Cooking', 'Kochen', 'ChefHat', 7),
('Fitness', 'Fitness', 'Dumbbell', 8),
('Tech', 'Tech', 'Smartphone', 9),
('Music', 'Musik', 'Music', 10);