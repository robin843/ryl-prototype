-- Drop the authenticated-only policy and replace with public access for published episodes
DROP POLICY IF EXISTS "Authenticated users can view published episodes" ON public.episodes;

CREATE POLICY "Anyone can view published episodes"
  ON public.episodes
  FOR SELECT
  USING (status = 'published');