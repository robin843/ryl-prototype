-- ==============================================
-- CREATE SECURE PUBLIC VIEWS FOR SENSITIVE TABLES
-- ==============================================

-- 1. Create public_profiles view that excludes sensitive PII
-- This view only exposes public-facing profile information
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker=on) AS
  SELECT 
    id,
    user_id,
    username,
    display_name,
    avatar_url,
    bio,
    company_name,
    created_at
    -- Excludes: birthdate, gender, age_at_signup, stripe_account_id, 
    -- stripe_account_status, stripe_onboarding_completed, total_sales_cents,
    -- onboarding_step, onboarding_completed_at
  FROM public.profiles;

-- Grant select on the view to authenticated users
GRANT SELECT ON public.public_profiles TO authenticated;

-- 2. Create public_subscriptions view that excludes Stripe identifiers
-- This view only exposes subscription status, not payment provider details
CREATE OR REPLACE VIEW public.public_subscriptions
WITH (security_invoker=on) AS
  SELECT 
    id,
    user_id,
    status,
    user_tier,
    producer_tier,
    current_period_start,
    current_period_end,
    created_at,
    updated_at
    -- Excludes: stripe_customer_id, stripe_subscription_id, price_id, product_id
  FROM public.subscriptions;

-- Grant select on the view to authenticated users
GRANT SELECT ON public.public_subscriptions TO authenticated;

-- Add comments explaining the security design
COMMENT ON VIEW public.public_profiles IS 'Secure view of profiles excluding sensitive PII (birthdate, gender, age, Stripe data). Use this view for public-facing profile displays.';
COMMENT ON VIEW public.public_subscriptions IS 'Secure view of subscriptions excluding Stripe customer/subscription IDs. Use this view for UI display purposes.';