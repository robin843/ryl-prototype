-- =============================================
-- CREATOR REFERRAL PROGRAM - DATABASE SCHEMA
-- =============================================

-- Table 1: Referral codes for each creator (one unique code per creator)
CREATE TABLE public.creator_referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table 2: Track referral relationships between creators
CREATE TABLE public.creator_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL,
  referred_id UUID NOT NULL UNIQUE,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table 3: Commission transactions from referrals
CREATE TABLE public.referral_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID NOT NULL REFERENCES public.creator_referrals(id) ON DELETE CASCADE,
  purchase_intent_id UUID NOT NULL REFERENCES public.purchase_intents(id) ON DELETE CASCADE,
  sale_amount_cents INTEGER NOT NULL,
  commission_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add referral_code column to producer_applications for tracking during signup
ALTER TABLE public.producer_applications 
ADD COLUMN referral_code TEXT;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.creator_referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_commissions ENABLE ROW LEVEL SECURITY;

-- CREATOR REFERRAL CODES POLICIES
CREATE POLICY "Creators can view their own referral code"
  ON public.creator_referral_codes FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Service role can manage all referral codes"
  ON public.creator_referral_codes FOR ALL
  USING (auth.role() = 'service_role');

-- Anyone can validate a referral code (for join page)
CREATE POLICY "Anyone can validate referral codes"
  ON public.creator_referral_codes FOR SELECT
  USING (true);

-- CREATOR REFERRALS POLICIES
CREATE POLICY "Referrers can view their referrals"
  ON public.creator_referrals FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Referred creators can view their referral"
  ON public.creator_referrals FOR SELECT
  USING (auth.uid() = referred_id);

CREATE POLICY "Service role can manage all referrals"
  ON public.creator_referrals FOR ALL
  USING (auth.role() = 'service_role');

-- REFERRAL COMMISSIONS POLICIES
CREATE POLICY "Referrers can view their commissions"
  ON public.referral_commissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.creator_referrals cr
      WHERE cr.id = referral_commissions.referral_id
      AND cr.referrer_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all commissions"
  ON public.referral_commissions FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_referral_codes_code ON public.creator_referral_codes(code);
CREATE INDEX idx_referral_codes_creator ON public.creator_referral_codes(creator_id);
CREATE INDEX idx_referrals_referrer ON public.creator_referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON public.creator_referrals(referred_id);
CREATE INDEX idx_referrals_status ON public.creator_referrals(status);
CREATE INDEX idx_commissions_referral ON public.referral_commissions(referral_id);
CREATE INDEX idx_commissions_status ON public.referral_commissions(status);