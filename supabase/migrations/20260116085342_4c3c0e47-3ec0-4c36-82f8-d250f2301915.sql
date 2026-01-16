-- ==============================================
-- FIX REMAINING CRITICAL SECURITY ISSUES
-- ==============================================

-- 1. Fix comments: Change public read policy to authenticated-only
DROP POLICY IF EXISTS "Anyone can read comments" ON public.comments;

CREATE POLICY "Authenticated users can read comments"
ON public.comments
FOR SELECT
TO authenticated
USING (true);

-- 2. Fix comment_likes: Change public read policy to authenticated-only
DROP POLICY IF EXISTS "Anyone can read comment likes" ON public.comment_likes;

CREATE POLICY "Authenticated users can read comment likes"
ON public.comment_likes
FOR SELECT
TO authenticated
USING (true);