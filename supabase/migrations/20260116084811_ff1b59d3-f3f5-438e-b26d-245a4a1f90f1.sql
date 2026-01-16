-- Fix the overly permissive product_waitlist INSERT policy
-- Replace WITH CHECK (true) with proper email validation

DROP POLICY IF EXISTS "Anyone can sign up for waitlist" ON public.product_waitlist;

-- Create a more restrictive policy that still allows public signups
-- but requires a valid email format and valid product reference
CREATE POLICY "Public can sign up for waitlist with valid email"
ON public.product_waitlist
FOR INSERT
TO public
WITH CHECK (
  -- Email must be provided and look valid (basic check)
  email IS NOT NULL AND 
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  -- Product must exist
  EXISTS (SELECT 1 FROM public.shopable_products WHERE id = product_id)
);