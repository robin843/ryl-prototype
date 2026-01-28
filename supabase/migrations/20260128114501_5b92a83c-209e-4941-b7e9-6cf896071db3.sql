-- Add budget tracking to brand_accounts
ALTER TABLE public.brand_accounts
ADD COLUMN IF NOT EXISTS budget_cents BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS commission_rate_percent NUMERIC(5,2) DEFAULT 15.00;

-- Add comments for clarity
COMMENT ON COLUMN public.brand_accounts.budget_cents IS 'Prepaid wallet balance for performance-based charges';
COMMENT ON COLUMN public.brand_accounts.commission_rate_percent IS 'Revenue share percentage (default 15%)';

-- Create brand_transactions table to track all budget changes
CREATE TABLE IF NOT EXISTS public.brand_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.brand_accounts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'commission', 'refund')),
  amount_cents BIGINT NOT NULL,
  description TEXT,
  purchase_intent_id UUID REFERENCES public.purchase_intents(id),
  product_id UUID REFERENCES public.shopable_products(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brand_transactions ENABLE ROW LEVEL SECURITY;

-- Brands can view their own transactions
CREATE POLICY "Brands can view own transactions"
  ON public.brand_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.brand_accounts ba 
      WHERE ba.id = brand_id AND ba.user_id = auth.uid()
    )
  );

-- Brands can insert deposits (system handles commissions via service role)
CREATE POLICY "Brands can insert deposits"
  ON public.brand_transactions
  FOR INSERT
  WITH CHECK (
    type = 'deposit' AND
    EXISTS (
      SELECT 1 FROM public.brand_accounts ba 
      WHERE ba.id = brand_id AND ba.user_id = auth.uid()
    )
  );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_brand_transactions_brand_id ON public.brand_transactions(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_transactions_created_at ON public.brand_transactions(created_at DESC);