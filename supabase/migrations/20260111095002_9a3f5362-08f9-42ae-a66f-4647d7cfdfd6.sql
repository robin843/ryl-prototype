-- Stripe Connect: Producer-Felder für Express Accounts
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_account_status TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS stripe_onboarding_completed BOOLEAN DEFAULT false;

-- Index für schnelle Lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_account_id ON public.profiles(stripe_account_id) WHERE stripe_account_id IS NOT NULL;

-- Kommentar für Dokumentation
COMMENT ON COLUMN public.profiles.stripe_account_id IS 'Stripe Connect Express Account ID';
COMMENT ON COLUMN public.profiles.stripe_account_status IS 'Status: none | pending | verified | restricted';
COMMENT ON COLUMN public.profiles.stripe_onboarding_completed IS 'True wenn Stripe Onboarding abgeschlossen';