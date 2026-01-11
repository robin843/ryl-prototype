-- Fix Security Definer View issue
-- Change the view to use SECURITY INVOKER (default) instead of SECURITY DEFINER
DROP VIEW IF EXISTS public.public_episodes;

CREATE VIEW public.public_episodes 
WITH (security_invoker = true)
AS
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

-- Re-grant access
GRANT SELECT ON public.public_episodes TO anon;
GRANT SELECT ON public.public_episodes TO authenticated;