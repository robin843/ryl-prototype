-- Create a view for episode social stats (purchases today, saves, trending)
CREATE OR REPLACE VIEW public.episode_social_stats AS
SELECT 
  e.id as episode_id,
  
  -- Käufe heute (purchases in last 24 hours)
  COALESCE(
    (SELECT COUNT(*) FROM analytics_events ae 
     WHERE ae.episode_id = e.id 
     AND ae.event_type = 'purchase'
     AND ae.created_at > now() - interval '24 hours'), 
    0
  )::integer as purchases_today,
  
  -- Saves insgesamt (über episode_hotspots → product_id → saved_products)
  COALESCE(
    (SELECT COUNT(DISTINCT sp.id) FROM saved_products sp
     JOIN episode_hotspots eh ON eh.product_id = sp.product_id
     WHERE eh.episode_id = e.id),
    0
  )::integer as saves_count,
  
  -- Trending: > 10 views in 1h AND at least 1 purchase today
  (
    (SELECT COUNT(*) FROM analytics_events ae 
     WHERE ae.episode_id = e.id 
     AND ae.event_type = 'video_view'
     AND ae.created_at > now() - interval '1 hour') > 10
    AND
    (SELECT COUNT(*) FROM analytics_events ae 
     WHERE ae.episode_id = e.id 
     AND ae.event_type = 'purchase'
     AND ae.created_at > now() - interval '24 hours') >= 1
  ) as is_trending

FROM episodes e
WHERE e.status = 'published';

-- Grant access to the view
GRANT SELECT ON public.episode_social_stats TO authenticated;
GRANT SELECT ON public.episode_social_stats TO anon;
GRANT SELECT ON public.episode_social_stats TO service_role;