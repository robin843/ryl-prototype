-- Add revenue_tier enum and column to profiles
CREATE TYPE public.revenue_tier AS ENUM ('starter', 'pro', 'expert', 'elite');

-- Add revenue_tier column with default 'starter'
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS revenue_tier public.revenue_tier DEFAULT 'starter';

-- Create function to calculate tier based on total_sales_cents
CREATE OR REPLACE FUNCTION public.calculate_revenue_tier(sales_cents bigint)
RETURNS public.revenue_tier
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Elite: 50,000+ EUR
  IF sales_cents >= 5000000 THEN
    RETURN 'elite'::public.revenue_tier;
  -- Expert: 10,000 - 49,999 EUR
  ELSIF sales_cents >= 1000000 THEN
    RETURN 'expert'::public.revenue_tier;
  -- Pro: 1,000 - 9,999 EUR
  ELSIF sales_cents >= 100000 THEN
    RETURN 'pro'::public.revenue_tier;
  -- Starter: 0 - 999 EUR
  ELSE
    RETURN 'starter'::public.revenue_tier;
  END IF;
END;
$$;

-- Create function to update tier automatically when total_sales_cents changes
CREATE OR REPLACE FUNCTION public.update_revenue_tier()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only update if total_sales_cents changed
  IF OLD.total_sales_cents IS DISTINCT FROM NEW.total_sales_cents THEN
    NEW.revenue_tier := calculate_revenue_tier(COALESCE(NEW.total_sales_cents, 0));
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-update tier
DROP TRIGGER IF EXISTS trigger_update_revenue_tier ON public.profiles;
CREATE TRIGGER trigger_update_revenue_tier
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_revenue_tier();

-- Backfill existing profiles with correct tier
UPDATE public.profiles 
SET revenue_tier = calculate_revenue_tier(COALESCE(total_sales_cents, 0))
WHERE user_id IN (
  SELECT DISTINCT creator_id FROM public.series
);