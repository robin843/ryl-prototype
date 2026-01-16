-- 1. Drop the overly permissive policy that exposes all profile data
DROP POLICY IF EXISTS "Anyone can check if username exists" ON public.profiles;

-- 2. Create a secure view for username availability checks (only exposes username)
CREATE OR REPLACE VIEW public.public_usernames
WITH (security_invoker = on) AS
SELECT username
FROM public.profiles
WHERE username IS NOT NULL;

-- Grant access to the view for anon and authenticated users
GRANT SELECT ON public.public_usernames TO anon, authenticated;