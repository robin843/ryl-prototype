-- Create promo_codes table for creator discount codes
CREATE TABLE public.promo_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  discount_percent INTEGER CHECK (discount_percent >= 1 AND discount_percent <= 50),
  discount_amount_cents INTEGER CHECK (discount_amount_cents >= 100),
  usage_limit INTEGER DEFAULT NULL,
  used_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'expired')),
  campaign_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT discount_type_check CHECK (
    (discount_percent IS NOT NULL AND discount_amount_cents IS NULL) OR
    (discount_percent IS NULL AND discount_amount_cents IS NOT NULL)
  ),
  CONSTRAINT unique_active_code UNIQUE (code)
);

-- Create index for fast code lookups
CREATE INDEX idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX idx_promo_codes_creator_id ON public.promo_codes(creator_id);

-- Enable RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Creators can view their own promo codes
CREATE POLICY "Creators can view own promo codes"
  ON public.promo_codes
  FOR SELECT
  USING (auth.uid() = creator_id);

-- Creators can create promo codes
CREATE POLICY "Creators can create promo codes"
  ON public.promo_codes
  FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- Creators can update their own promo codes
CREATE POLICY "Creators can update own promo codes"
  ON public.promo_codes
  FOR UPDATE
  USING (auth.uid() = creator_id);

-- Creators can delete their own promo codes
CREATE POLICY "Creators can delete own promo codes"
  ON public.promo_codes
  FOR DELETE
  USING (auth.uid() = creator_id);

-- Public can validate codes (for checkout)
CREATE POLICY "Anyone can validate active codes"
  ON public.promo_codes
  FOR SELECT
  USING (status = 'active' AND (expires_at IS NULL OR expires_at > now()));

-- Add updated_at trigger
CREATE TRIGGER update_promo_codes_updated_at
  BEFORE UPDATE ON public.promo_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create promo_code_usages table to track individual uses
CREATE TABLE public.promo_code_usages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  promo_code_id UUID NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  purchase_intent_id UUID REFERENCES public.purchase_intents(id),
  user_id UUID REFERENCES auth.users(id),
  discount_applied_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promo_code_usages ENABLE ROW LEVEL SECURITY;

-- Creators can view usages of their codes
CREATE POLICY "Creators can view own code usages"
  ON public.promo_code_usages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.promo_codes pc 
      WHERE pc.id = promo_code_id AND pc.creator_id = auth.uid()
    )
  );

-- System can insert usages (via service role in edge function)
CREATE POLICY "Authenticated users can log code usage"
  ON public.promo_code_usages
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);