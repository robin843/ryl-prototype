-- Drop existing functions first (required to change return type)
DROP FUNCTION IF EXISTS public.get_creator_analytics(UUID, TEXT);
DROP FUNCTION IF EXISTS public.get_top_products(UUID, TEXT);
DROP FUNCTION IF EXISTS public.get_episode_performance(UUID, TEXT);

-- Recreate get_creator_analytics with authorization check
CREATE OR REPLACE FUNCTION public.get_creator_analytics(
  p_creator_id UUID,
  p_timeframe TEXT DEFAULT 'all'
)
RETURNS TABLE (
  total_revenue BIGINT,
  total_views BIGINT,
  total_clicks BIGINT,
  total_purchases BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_start_date TIMESTAMPTZ;
BEGIN
  -- SECURITY: Only allow access to own analytics or admin
  IF p_creator_id != auth.uid() AND NOT public.has_role('admin', auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Cannot access other creators analytics';
  END IF;

  -- Calculate start date based on timeframe
  v_start_date := CASE 
    WHEN p_timeframe = '7d' THEN NOW() - INTERVAL '7 days'
    WHEN p_timeframe = '30d' THEN NOW() - INTERVAL '30 days'
    ELSE '1970-01-01'::TIMESTAMPTZ
  END;

  RETURN QUERY
  SELECT 
    COALESCE(SUM(ae.revenue_cents), 0)::BIGINT as total_revenue,
    COALESCE(SUM(CASE WHEN ae.event_type = 'view' THEN 1 ELSE 0 END), 0)::BIGINT as total_views,
    COALESCE(SUM(CASE WHEN ae.event_type = 'hotspot_click' THEN 1 ELSE 0 END), 0)::BIGINT as total_clicks,
    COALESCE(SUM(CASE WHEN ae.event_type = 'purchase' THEN 1 ELSE 0 END), 0)::BIGINT as total_purchases
  FROM analytics_events ae
  WHERE ae.creator_id = p_creator_id
    AND ae.created_at >= v_start_date;
END;
$$;

-- Recreate get_top_products with authorization check
CREATE OR REPLACE FUNCTION public.get_top_products(
  p_creator_id UUID,
  p_timeframe TEXT DEFAULT 'all'
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  image_url TEXT,
  clicks BIGINT,
  purchases BIGINT,
  revenue BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_start_date TIMESTAMPTZ;
BEGIN
  -- SECURITY: Only allow access to own analytics or admin
  IF p_creator_id != auth.uid() AND NOT public.has_role('admin', auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Cannot access other creators product data';
  END IF;

  -- Calculate start date based on timeframe
  v_start_date := CASE 
    WHEN p_timeframe = '7d' THEN NOW() - INTERVAL '7 days'
    WHEN p_timeframe = '30d' THEN NOW() - INTERVAL '30 days'
    ELSE '1970-01-01'::TIMESTAMPTZ
  END;

  RETURN QUERY
  SELECT 
    sp.id,
    sp.name,
    sp.image_url,
    COALESCE(SUM(CASE WHEN ae.event_type = 'hotspot_click' THEN 1 ELSE 0 END), 0)::BIGINT as clicks,
    COALESCE(SUM(CASE WHEN ae.event_type = 'purchase' THEN 1 ELSE 0 END), 0)::BIGINT as purchases,
    COALESCE(SUM(ae.revenue_cents), 0)::BIGINT as revenue
  FROM shopable_products sp
  LEFT JOIN analytics_events ae ON ae.product_id = sp.id 
    AND ae.created_at >= v_start_date
  WHERE sp.creator_id = p_creator_id
  GROUP BY sp.id, sp.name, sp.image_url
  ORDER BY revenue DESC
  LIMIT 10;
END;
$$;

-- Recreate get_episode_performance with authorization check
CREATE OR REPLACE FUNCTION public.get_episode_performance(
  p_creator_id UUID,
  p_timeframe TEXT DEFAULT 'all'
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  views BIGINT,
  hotspot_clicks BIGINT,
  revenue BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_start_date TIMESTAMPTZ;
BEGIN
  -- SECURITY: Only allow access to own analytics or admin
  IF p_creator_id != auth.uid() AND NOT public.has_role('admin', auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Cannot access other creators episode data';
  END IF;

  -- Calculate start date based on timeframe
  v_start_date := CASE 
    WHEN p_timeframe = '7d' THEN NOW() - INTERVAL '7 days'
    WHEN p_timeframe = '30d' THEN NOW() - INTERVAL '30 days'
    ELSE '1970-01-01'::TIMESTAMPTZ
  END;

  RETURN QUERY
  SELECT 
    e.id,
    e.title,
    COALESCE(SUM(CASE WHEN ae.event_type = 'view' THEN 1 ELSE 0 END), 0)::BIGINT as views,
    COALESCE(SUM(CASE WHEN ae.event_type = 'hotspot_click' THEN 1 ELSE 0 END), 0)::BIGINT as hotspot_clicks,
    COALESCE(SUM(ae.revenue_cents), 0)::BIGINT as revenue
  FROM episodes e
  LEFT JOIN analytics_events ae ON ae.episode_id = e.id 
    AND ae.created_at >= v_start_date
  WHERE e.creator_id = p_creator_id
  GROUP BY e.id, e.title
  ORDER BY views DESC;
END;
$$;