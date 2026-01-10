-- RPC 1: get_creator_analytics - Aggregierte KPIs für einen Creator
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
  v_date_filter TIMESTAMPTZ;
BEGIN
  -- Zeitfilter berechnen
  v_date_filter := CASE 
    WHEN p_timeframe = '7d' THEN NOW() - INTERVAL '7 days'
    WHEN p_timeframe = '30d' THEN NOW() - INTERVAL '30 days'
    ELSE '1970-01-01'::TIMESTAMPTZ
  END;

  RETURN QUERY
  SELECT 
    COALESCE(SUM(pi.total_cents) FILTER (WHERE pi.status = 'completed'), 0)::BIGINT AS total_revenue,
    COUNT(DISTINCT pi.id)::BIGINT AS total_views,
    COUNT(DISTINCT pi.id)::BIGINT AS total_clicks,
    COUNT(DISTINCT pi.id) FILTER (WHERE pi.status = 'completed')::BIGINT AS total_purchases
  FROM purchase_intents pi
  JOIN purchase_items pit ON pit.purchase_intent_id = pi.id
  JOIN shopable_products sp ON sp.id = pit.product_id
  WHERE sp.creator_id = p_creator_id
    AND pi.created_at >= v_date_filter;
END;
$$;

-- RPC 2: get_top_products - Top-Produkte nach Umsatz/Klicks
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
  v_date_filter TIMESTAMPTZ;
BEGIN
  v_date_filter := CASE 
    WHEN p_timeframe = '7d' THEN NOW() - INTERVAL '7 days'
    WHEN p_timeframe = '30d' THEN NOW() - INTERVAL '30 days'
    ELSE '1970-01-01'::TIMESTAMPTZ
  END;

  RETURN QUERY
  SELECT 
    sp.id,
    sp.name,
    sp.image_url,
    COUNT(DISTINCT pi.id)::BIGINT AS clicks,
    COUNT(DISTINCT pi.id) FILTER (WHERE pi.status = 'completed')::BIGINT AS purchases,
    COALESCE(SUM(pi.total_cents) FILTER (WHERE pi.status = 'completed'), 0)::BIGINT AS revenue
  FROM shopable_products sp
  LEFT JOIN purchase_items pit ON pit.product_id = sp.id
  LEFT JOIN purchase_intents pi ON pi.id = pit.purchase_intent_id
    AND pi.created_at >= v_date_filter
  WHERE sp.creator_id = p_creator_id
  GROUP BY sp.id, sp.name, sp.image_url
  HAVING COUNT(pi.id) > 0
  ORDER BY revenue DESC, clicks DESC
  LIMIT 5;
END;
$$;

-- RPC 3: get_episode_performance - Episode-Performance nach Umsatz
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
  v_date_filter TIMESTAMPTZ;
BEGIN
  v_date_filter := CASE 
    WHEN p_timeframe = '7d' THEN NOW() - INTERVAL '7 days'
    WHEN p_timeframe = '30d' THEN NOW() - INTERVAL '30 days'
    ELSE '1970-01-01'::TIMESTAMPTZ
  END;

  RETURN QUERY
  SELECT 
    e.id,
    e.title,
    COUNT(DISTINCT pi.id)::BIGINT AS views,
    COUNT(DISTINCT pi.id)::BIGINT AS hotspot_clicks,
    COALESCE(SUM(pi.total_cents) FILTER (WHERE pi.status = 'completed'), 0)::BIGINT AS revenue
  FROM episodes e
  LEFT JOIN purchase_items pit ON (pit.context->>'episodeId')::UUID = e.id
  LEFT JOIN purchase_intents pi ON pi.id = pit.purchase_intent_id
    AND pi.created_at >= v_date_filter
  WHERE e.creator_id = p_creator_id
  GROUP BY e.id, e.title
  HAVING COUNT(pi.id) > 0
  ORDER BY revenue DESC
  LIMIT 10;
END;
$$;