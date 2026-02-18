-- When a product is deleted, cascade to related tables
ALTER TABLE public.episode_hotspots
  DROP CONSTRAINT IF EXISTS episode_hotspots_product_id_fkey,
  ADD CONSTRAINT episode_hotspots_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES public.shopable_products(id) ON DELETE CASCADE;

ALTER TABLE public.hotspot_clicks
  DROP CONSTRAINT IF EXISTS hotspot_clicks_product_id_fkey,
  ADD CONSTRAINT hotspot_clicks_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES public.shopable_products(id) ON DELETE SET NULL;

ALTER TABLE public.analytics_events
  DROP CONSTRAINT IF EXISTS analytics_events_product_id_fkey,
  ADD CONSTRAINT analytics_events_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES public.shopable_products(id) ON DELETE SET NULL;

ALTER TABLE public.saved_products
  DROP CONSTRAINT IF EXISTS saved_products_product_id_fkey,
  ADD CONSTRAINT saved_products_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES public.shopable_products(id) ON DELETE CASCADE;

ALTER TABLE public.product_waitlist
  DROP CONSTRAINT IF EXISTS product_waitlist_product_id_fkey,
  ADD CONSTRAINT product_waitlist_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES public.shopable_products(id) ON DELETE CASCADE;

ALTER TABLE public.product_reviews
  DROP CONSTRAINT IF EXISTS product_reviews_product_id_fkey,
  ADD CONSTRAINT product_reviews_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES public.shopable_products(id) ON DELETE CASCADE;

-- When an episode is deleted, cascade to related tables
ALTER TABLE public.episode_hotspots
  DROP CONSTRAINT IF EXISTS episode_hotspots_episode_id_fkey,
  ADD CONSTRAINT episode_hotspots_episode_id_fkey
    FOREIGN KEY (episode_id) REFERENCES public.episodes(id) ON DELETE CASCADE;

ALTER TABLE public.hotspot_clicks
  DROP CONSTRAINT IF EXISTS hotspot_clicks_episode_id_fkey,
  ADD CONSTRAINT hotspot_clicks_episode_id_fkey
    FOREIGN KEY (episode_id) REFERENCES public.episodes(id) ON DELETE CASCADE;

ALTER TABLE public.analytics_events
  DROP CONSTRAINT IF EXISTS analytics_events_episode_id_fkey,
  ADD CONSTRAINT analytics_events_episode_id_fkey
    FOREIGN KEY (episode_id) REFERENCES public.episodes(id) ON DELETE SET NULL;

ALTER TABLE public.comments
  DROP CONSTRAINT IF EXISTS comments_episode_id_fkey,
  ADD CONSTRAINT comments_episode_id_fkey
    FOREIGN KEY (episode_id) REFERENCES public.episodes(id) ON DELETE CASCADE;

ALTER TABLE public.saved_products
  DROP CONSTRAINT IF EXISTS saved_products_episode_id_fkey,
  ADD CONSTRAINT saved_products_episode_id_fkey
    FOREIGN KEY (episode_id) REFERENCES public.episodes(id) ON DELETE SET NULL;

ALTER TABLE public.product_waitlist
  DROP CONSTRAINT IF EXISTS product_waitlist_episode_id_fkey,
  ADD CONSTRAINT product_waitlist_episode_id_fkey
    FOREIGN KEY (episode_id) REFERENCES public.episodes(id) ON DELETE SET NULL;