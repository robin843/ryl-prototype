-- =====================================================
-- FIX 1: Analytics Events - Require authentication
-- =====================================================
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;

CREATE POLICY "Authenticated users can insert analytics events"
ON public.analytics_events
FOR INSERT
TO authenticated
WITH CHECK (
  -- If user_id is provided, it must match the authenticated user
  user_id IS NULL OR user_id = auth.uid()
);

-- =====================================================
-- FIX 2: Subscriptions - Explicit TO authenticated
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;

CREATE POLICY "Users can view their own subscription"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- FIX 3: Media Bucket - Make private, add proper policies
-- =====================================================
-- Make bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'media';

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Anyone can view media" ON storage.objects;

-- Creators can upload to their own folder
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
CREATE POLICY "Authenticated users can upload media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Creators can view their own files
DROP POLICY IF EXISTS "Users can view own media" ON storage.objects;
CREATE POLICY "Users can view own media"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Anyone can view media for published episodes
DROP POLICY IF EXISTS "Public can view published episode media" ON storage.objects;
CREATE POLICY "Public can view published episode media"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'media'
  AND EXISTS (
    SELECT 1 FROM public.video_assets va
    JOIN public.episodes e ON e.video_asset_id = va.id
    WHERE va.storage_path = name
    AND e.status = 'published'
  )
);

-- Creators can delete their own files
DROP POLICY IF EXISTS "Users can delete own media" ON storage.objects;
CREATE POLICY "Users can delete own media"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Creators can update their own files
DROP POLICY IF EXISTS "Users can update own media" ON storage.objects;
CREATE POLICY "Users can update own media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);