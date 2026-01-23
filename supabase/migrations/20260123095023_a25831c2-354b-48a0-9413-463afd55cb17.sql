-- Add 'brand' to app_role enum if not exists (it already exists based on types)
-- Create brand_accounts table
CREATE TABLE public.brand_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  industry TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  billing_address JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, active, suspended
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create brand_products table to link products to brands for tracking
CREATE TABLE public.brand_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES public.brand_accounts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.shopable_products(id) ON DELETE CASCADE,
  campaign_name TEXT,
  cpc_rate_cents INTEGER DEFAULT 0, -- Cost per click
  cpa_rate_cents INTEGER DEFAULT 0, -- Cost per acquisition
  revenue_share_percent INTEGER DEFAULT 0, -- Alternative: revenue share
  budget_cents INTEGER, -- Optional campaign budget
  spent_cents INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active', -- active, paused, completed
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(brand_id, product_id)
);

-- Create brand_creator_partnerships table
CREATE TABLE public.brand_creator_partnerships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES public.brand_accounts(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active, paused, ended
  commission_rate_percent INTEGER DEFAULT 10,
  total_revenue_cents INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(brand_id, creator_id)
);

-- Enable RLS
ALTER TABLE public.brand_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_creator_partnerships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for brand_accounts
CREATE POLICY "Brands can view their own account"
  ON public.brand_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Brands can update their own account"
  ON public.brand_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all brand accounts"
  ON public.brand_accounts FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Admins can view all brand accounts"
  ON public.brand_accounts FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update brand accounts"
  ON public.brand_accounts FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for brand_products
CREATE POLICY "Brands can view their own products"
  ON public.brand_products FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM brand_accounts ba
    WHERE ba.id = brand_products.brand_id AND ba.user_id = auth.uid()
  ));

CREATE POLICY "Brands can manage their own products"
  ON public.brand_products FOR ALL
  USING (EXISTS (
    SELECT 1 FROM brand_accounts ba
    WHERE ba.id = brand_products.brand_id AND ba.user_id = auth.uid()
  ));

CREATE POLICY "Service role can manage all brand products"
  ON public.brand_products FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for brand_creator_partnerships
CREATE POLICY "Brands can view their partnerships"
  ON public.brand_creator_partnerships FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM brand_accounts ba
    WHERE ba.id = brand_creator_partnerships.brand_id AND ba.user_id = auth.uid()
  ));

CREATE POLICY "Brands can manage their partnerships"
  ON public.brand_creator_partnerships FOR ALL
  USING (EXISTS (
    SELECT 1 FROM brand_accounts ba
    WHERE ba.id = brand_creator_partnerships.brand_id AND ba.user_id = auth.uid()
  ));

CREATE POLICY "Creators can view their partnerships"
  ON public.brand_creator_partnerships FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Service role can manage all partnerships"
  ON public.brand_creator_partnerships FOR ALL
  USING (auth.role() = 'service_role');

-- Create indexes for performance
CREATE INDEX idx_brand_accounts_user_id ON public.brand_accounts(user_id);
CREATE INDEX idx_brand_accounts_status ON public.brand_accounts(status);
CREATE INDEX idx_brand_products_brand_id ON public.brand_products(brand_id);
CREATE INDEX idx_brand_products_product_id ON public.brand_products(product_id);
CREATE INDEX idx_brand_creator_partnerships_brand_id ON public.brand_creator_partnerships(brand_id);
CREATE INDEX idx_brand_creator_partnerships_creator_id ON public.brand_creator_partnerships(creator_id);