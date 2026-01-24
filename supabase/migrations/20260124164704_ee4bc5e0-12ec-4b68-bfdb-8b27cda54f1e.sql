-- Add streaming columns to video_assets table for Cloudflare Stream integration
ALTER TABLE video_assets ADD COLUMN IF NOT EXISTS stream_id TEXT;
ALTER TABLE video_assets ADD COLUMN IF NOT EXISTS stream_status TEXT DEFAULT 'pending';
ALTER TABLE video_assets ADD COLUMN IF NOT EXISTS hls_url TEXT;
ALTER TABLE video_assets ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE video_assets ADD COLUMN IF NOT EXISTS duration_ms INTEGER;

-- Add index for efficient stream status queries
CREATE INDEX IF NOT EXISTS idx_video_assets_stream_status ON video_assets(stream_status);

-- Add HLS URL to episodes table for fast access
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS hls_url TEXT;

-- Comment for documentation
COMMENT ON COLUMN video_assets.stream_id IS 'Cloudflare Stream video ID';
COMMENT ON COLUMN video_assets.stream_status IS 'pending, processing, ready, error';
COMMENT ON COLUMN video_assets.hls_url IS 'Cloudflare Stream HLS manifest URL';
COMMENT ON COLUMN video_assets.duration_ms IS 'Video duration in milliseconds';