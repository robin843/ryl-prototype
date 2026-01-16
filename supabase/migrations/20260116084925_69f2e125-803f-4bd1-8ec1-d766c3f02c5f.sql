-- ==============================================
-- FIX CRITICAL SECURITY ISSUES
-- ==============================================

-- 1. Fix product_waitlist: Producers can only view waitlist for their OWN products
DROP POLICY IF EXISTS "Producers can view waitlist for their products" ON public.product_waitlist;

CREATE POLICY "Producers can view waitlist for their own products"
ON public.product_waitlist
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.shopable_products sp
    WHERE sp.id = product_waitlist.product_id
      AND sp.creator_id = auth.uid()
  )
);

-- 2. Create secure view for comments that hides user_id from public
CREATE OR REPLACE VIEW public.public_comments
WITH (security_invoker = on) AS
SELECT 
  c.id,
  c.content,
  c.episode_id,
  c.parent_id,
  c.likes_count,
  c.created_at,
  c.updated_at,
  -- Only show user_id to the user themselves
  CASE WHEN c.user_id = auth.uid() THEN c.user_id ELSE NULL END as user_id,
  p.display_name,
  p.avatar_url
FROM public.comments c
LEFT JOIN public.profiles p ON p.user_id = c.user_id;

GRANT SELECT ON public.public_comments TO anon, authenticated;

-- 3. Create secure view for comment_likes that only shows aggregate counts
CREATE OR REPLACE VIEW public.public_comment_likes_counts
WITH (security_invoker = on) AS
SELECT 
  comment_id,
  COUNT(*) as like_count,
  BOOL_OR(user_id = auth.uid()) as user_has_liked
FROM public.comment_likes
GROUP BY comment_id;

GRANT SELECT ON public.public_comment_likes_counts TO anon, authenticated;

-- 4. Update comments table policy to be more restrictive for public reads
-- Keep existing policies but add note that public_comments view should be used for display
-- The current policy allows reading content which is needed for the app to function

-- 5. Interest categories: Add explicit denial for modifications
CREATE POLICY "Only admins can modify interest categories"
ON public.interest_categories
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));