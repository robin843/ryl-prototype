-- Purchase-Core Datenmodell
-- Globale, device-agnostische Kauf-Abstraktion

-- 1. ENUMs für Status-Lifecycle
CREATE TYPE public.purchase_intent_status AS ENUM (
  'created',
  'confirmed',
  'processing',
  'completed',
  'failed',
  'expired',
  'refunded'
);

CREATE TYPE public.payment_execution_status AS ENUM (
  'pending',
  'succeeded',
  'failed'
);

-- 2. Core-Tabelle: purchase_intents
CREATE TABLE public.purchase_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.purchase_intent_status NOT NULL DEFAULT 'created',
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
  idempotency_key VARCHAR(64) UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '15 minutes'),
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Core-Tabelle: purchase_items
CREATE TABLE public.purchase_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_intent_id UUID NOT NULL REFERENCES public.purchase_intents(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.shopable_products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Core-Tabelle: purchase_events (Audit-Trail)
CREATE TABLE public.purchase_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_intent_id UUID NOT NULL REFERENCES public.purchase_intents(id) ON DELETE CASCADE,
  event_type VARCHAR(32) NOT NULL,
  from_status VARCHAR(32),
  to_status VARCHAR(32),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Adapter-Tabelle: payment_executions
CREATE TABLE public.payment_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_intent_id UUID NOT NULL REFERENCES public.purchase_intents(id) ON DELETE CASCADE,
  adapter_type VARCHAR(32) NOT NULL,
  adapter_reference VARCHAR(255),
  status public.payment_execution_status NOT NULL DEFAULT 'pending',
  error_code VARCHAR(64),
  raw_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Adapter-Tabelle: user_payment_methods
CREATE TABLE public.user_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  adapter_type VARCHAR(32) NOT NULL,
  adapter_token TEXT NOT NULL,
  display_hint VARCHAR(32),
  is_default BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Indexes für Performance
CREATE INDEX idx_purchase_intents_user_id ON public.purchase_intents(user_id);
CREATE INDEX idx_purchase_intents_status ON public.purchase_intents(status);
CREATE INDEX idx_purchase_intents_expires_at ON public.purchase_intents(expires_at) WHERE status = 'created';
CREATE INDEX idx_purchase_items_intent_id ON public.purchase_items(purchase_intent_id);
CREATE INDEX idx_purchase_events_intent_id ON public.purchase_events(purchase_intent_id);
CREATE INDEX idx_payment_executions_intent_id ON public.payment_executions(purchase_intent_id);
CREATE INDEX idx_user_payment_methods_user_id ON public.user_payment_methods(user_id);

-- 8. Trigger für updated_at
CREATE TRIGGER update_purchase_intents_updated_at
  BEFORE UPDATE ON public.purchase_intents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 9. RLS aktivieren
ALTER TABLE public.purchase_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_payment_methods ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies: purchase_intents
CREATE POLICY "Users can view own purchase intents"
  ON public.purchase_intents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own purchase intents"
  ON public.purchase_intents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all purchase intents"
  ON public.purchase_intents FOR ALL
  USING (auth.role() = 'service_role');

-- 11. RLS Policies: purchase_items
CREATE POLICY "Users can view own purchase items"
  ON public.purchase_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.purchase_intents pi
    WHERE pi.id = purchase_items.purchase_intent_id
    AND pi.user_id = auth.uid()
  ));

CREATE POLICY "Users can create items for own intents"
  ON public.purchase_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.purchase_intents pi
    WHERE pi.id = purchase_items.purchase_intent_id
    AND pi.user_id = auth.uid()
  ));

CREATE POLICY "Service role can manage all purchase items"
  ON public.purchase_items FOR ALL
  USING (auth.role() = 'service_role');

-- 12. RLS Policies: purchase_events
CREATE POLICY "Users can view own purchase events"
  ON public.purchase_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.purchase_intents pi
    WHERE pi.id = purchase_events.purchase_intent_id
    AND pi.user_id = auth.uid()
  ));

CREATE POLICY "Service role can manage all purchase events"
  ON public.purchase_events FOR ALL
  USING (auth.role() = 'service_role');

-- 13. RLS Policies: payment_executions
CREATE POLICY "Users can view own payment executions"
  ON public.payment_executions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.purchase_intents pi
    WHERE pi.id = payment_executions.purchase_intent_id
    AND pi.user_id = auth.uid()
  ));

CREATE POLICY "Service role can manage all payment executions"
  ON public.payment_executions FOR ALL
  USING (auth.role() = 'service_role');

-- 14. RLS Policies: user_payment_methods
CREATE POLICY "Users can view own payment methods"
  ON public.user_payment_methods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own payment methods"
  ON public.user_payment_methods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment methods"
  ON public.user_payment_methods FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment methods"
  ON public.user_payment_methods FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all payment methods"
  ON public.user_payment_methods FOR ALL
  USING (auth.role() = 'service_role');