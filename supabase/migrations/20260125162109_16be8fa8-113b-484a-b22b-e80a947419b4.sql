-- Enable RLS (already enabled, but safe)
ALTER TABLE public.brand_accounts ENABLE ROW LEVEL SECURITY;

-- Recreate minimal, safe policies for brand account self-service
DROP POLICY IF EXISTS "Brand accounts: select own" ON public.brand_accounts;
DROP POLICY IF EXISTS "Brand accounts: insert own" ON public.brand_accounts;
DROP POLICY IF EXISTS "Brand accounts: update own pending" ON public.brand_accounts;
DROP POLICY IF EXISTS "Brand accounts: admin select" ON public.brand_accounts;
DROP POLICY IF EXISTS "Brand accounts: admin update" ON public.brand_accounts;

-- Owners can see their own brand account
CREATE POLICY "Brand accounts: select own"
ON public.brand_accounts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Owners can create their own brand account
CREATE POLICY "Brand accounts: insert own"
ON public.brand_accounts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Owners can update their brand account only while it's pending (and cannot change status away from pending)
CREATE POLICY "Brand accounts: update own pending"
ON public.brand_accounts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Admins can review/manage all brand accounts
CREATE POLICY "Brand accounts: admin select"
ON public.brand_accounts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Brand accounts: admin update"
ON public.brand_accounts
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
