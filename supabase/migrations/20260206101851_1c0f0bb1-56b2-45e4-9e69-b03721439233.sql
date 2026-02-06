
-- 1. Add fulfillment tracking to purchase_intents
ALTER TABLE public.purchase_intents
ADD COLUMN IF NOT EXISTS fulfillment_status text NOT NULL DEFAULT 'unfulfilled',
ADD COLUMN IF NOT EXISTS tracking_number text,
ADD COLUMN IF NOT EXISTS tracking_url text,
ADD COLUMN IF NOT EXISTS shipped_at timestamptz,
ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES public.brand_accounts(id);

-- 2. Create brand_notifications table
CREATE TABLE IF NOT EXISTS public.brand_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id uuid NOT NULL REFERENCES public.brand_accounts(id) ON DELETE CASCADE,
  type text NOT NULL, -- 'budget_warning', 'partnership_update', 'trending', 'stock_alert', 'refund'
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.brand_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brands can view own notifications"
  ON public.brand_notifications FOR SELECT
  USING (brand_id IN (SELECT id FROM public.brand_accounts WHERE user_id = auth.uid()));

CREATE POLICY "Brands can update own notifications"
  ON public.brand_notifications FOR UPDATE
  USING (brand_id IN (SELECT id FROM public.brand_accounts WHERE user_id = auth.uid()));

-- 3. RLS for fulfillment: brands can update fulfillment on their orders
CREATE POLICY "Brands can update fulfillment status"
  ON public.purchase_intents FOR UPDATE
  USING (brand_id IN (SELECT id FROM public.brand_accounts WHERE user_id = auth.uid()))
  WITH CHECK (brand_id IN (SELECT id FROM public.brand_accounts WHERE user_id = auth.uid()));

-- 4. Create index for brand notifications
CREATE INDEX IF NOT EXISTS idx_brand_notifications_brand_id ON public.brand_notifications(brand_id, is_read, created_at DESC);

-- 5. Create index for fulfillment queries
CREATE INDEX IF NOT EXISTS idx_purchase_intents_brand_fulfillment ON public.purchase_intents(brand_id, fulfillment_status) WHERE brand_id IS NOT NULL;
