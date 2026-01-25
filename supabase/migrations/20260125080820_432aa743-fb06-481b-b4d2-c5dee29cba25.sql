-- Performance indexes for Feed queries (without CONCURRENTLY for migration compatibility)

-- Index for published episodes sorted by creation date (main feed query)
CREATE INDEX IF NOT EXISTS idx_episodes_published_feed 
ON episodes(status, created_at DESC) 
WHERE status = 'published';

-- Index for user watch history lookup (recent first)
CREATE INDEX IF NOT EXISTS idx_watch_history_user_recent 
ON watch_history(user_id, watched_at DESC);

-- Index for episode hotspots by video and time range (playback performance)
CREATE INDEX IF NOT EXISTS idx_episode_hotspots_playback 
ON episode_hotspots(episode_id, start_time, end_time);

-- Index for analytics events by creator and time (dashboard queries)
CREATE INDEX IF NOT EXISTS idx_analytics_creator_time 
ON analytics_events(creator_id, created_at DESC);

-- Index for saved products by episode (social proof aggregation)
CREATE INDEX IF NOT EXISTS idx_saved_products_episode 
ON saved_products(episode_id);

-- Partial index for content quality scores (feed ranking)
CREATE INDEX IF NOT EXISTS idx_content_quality_active 
ON content_quality_scores(episode_id, cpm_w DESC NULLS LAST) 
WHERE cpm_w IS NOT NULL;