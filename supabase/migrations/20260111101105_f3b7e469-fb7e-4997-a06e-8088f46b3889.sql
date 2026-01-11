-- Fix remaining security issues

-- 4. Fix episodes table: Remove creator_id from public visibility
-- Create a view for public episode data without creator_id
CREATE OR REPLACE VIEW public.public_episodes AS
SELECT 
  id,
  series_id,
  title,
  description,
  episode_number,
  duration,
  thumbnail_url,
  video_url,
  is_premium,
  status,
  views,
  created_at
FROM public.episodes
WHERE status = 'published';

-- Grant access to the view for anon and authenticated
GRANT SELECT ON public.public_episodes TO anon;
GRANT SELECT ON public.public_episodes TO authenticated;

-- 5. Drop existing overly permissive policy on episodes 
DROP POLICY IF EXISTS "Public users can view published episodes" ON public.episodes;
DROP POLICY IF EXISTS "Anyone can view published episodes" ON public.episodes;

-- Create new policy: Only authenticated users can view full episode data (including creator_id)
-- First check if policy exists to avoid error
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'episodes' 
    AND policyname = 'Authenticated users can view published episodes'
  ) THEN
    CREATE POLICY "Authenticated users can view published episodes"
    ON public.episodes
    FOR SELECT
    TO authenticated
    USING (status = 'published');
  END IF;
END
$$;

-- 6. Update profiles table RLS to be more restrictive
-- First check what policies exist and ensure no public scraping is possible
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Users can only view their own profile (unless admin)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can view own profile or admin can view all'
  ) THEN
    CREATE POLICY "Users can view own profile or admin can view all"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
      user_id = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    );
  END IF;
END
$$;