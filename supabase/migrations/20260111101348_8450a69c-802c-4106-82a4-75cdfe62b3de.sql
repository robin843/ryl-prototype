-- Clean up overlapping profiles SELECT policies
-- Keep only one strict policy: Users can view ONLY their own profile, admins can view all

-- Drop redundant policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile or admin can view all" ON public.profiles;

-- Create one comprehensive, secure SELECT policy
CREATE POLICY "Strict profile access - own profile or admin only"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR 
  public.has_role(auth.uid(), 'admin'::app_role)
);