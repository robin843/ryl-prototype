-- 1. Fix profiles table: Remove public access, allow only authenticated users
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- 2. Fix usage_tracking table: Remove overly permissive FOR ALL policy
DROP POLICY IF EXISTS "Users can manage their own usage" ON public.usage_tracking;

-- Create separate INSERT policy (no DELETE allowed)
CREATE POLICY "Users can insert their own usage"
ON public.usage_tracking
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create separate UPDATE policy
CREATE POLICY "Users can update their own usage"
ON public.usage_tracking
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);