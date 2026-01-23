-- Fix the user_referrals RLS policies to be more restrictive
DROP POLICY IF EXISTS "System can insert referrals" ON public.user_referrals;
DROP POLICY IF EXISTS "System can update referrals" ON public.user_referrals;

-- More restrictive insert policy
CREATE POLICY "Referrals can be created for referred user"
ON public.user_referrals FOR INSERT
WITH CHECK (auth.uid() = referred_id);

-- Update only by service role (handled in edge function)
CREATE POLICY "Referrals updated via service role"
ON public.user_referrals FOR UPDATE
USING (auth.uid() = referrer_id OR auth.uid() = referred_id);