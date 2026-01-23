-- =====================================================
-- RYL ENGAGEMENT ENGINE - DATABASE FOUNDATION
-- =====================================================

-- 1. Link series to interest categories
ALTER TABLE series ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES interest_categories(id);
CREATE INDEX IF NOT EXISTS idx_series_category ON series(category_id);

-- 2. User Content Scores - Affinity per category
CREATE TABLE IF NOT EXISTS user_content_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES interest_categories(id) ON DELETE CASCADE,
  affinity_score NUMERIC(5,2) DEFAULT 0 CHECK (affinity_score >= -100 AND affinity_score <= 100),
  purchase_signals INTEGER DEFAULT 0,
  engagement_signals INTEGER DEFAULT 0,
  regret_signals INTEGER DEFAULT 0,
  last_interaction TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, category_id)
);

-- 3. Content Quality Scores - Episode metrics
CREATE TABLE IF NOT EXISTS content_quality_scores (
  episode_id UUID PRIMARY KEY REFERENCES episodes(id) ON DELETE CASCADE,
  view_count INTEGER DEFAULT 0,
  completion_rate NUMERIC(5,4) DEFAULT 0,
  conversion_rate NUMERIC(5,4) DEFAULT 0,
  avg_watch_percent NUMERIC(5,2) DEFAULT 0,
  hotspot_ctr NUMERIC(5,4) DEFAULT 0,
  cpm_w NUMERIC(8,4) DEFAULT 0,
  freshness_score NUMERIC(3,2) DEFAULT 1.0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Creator Quality Scores (CQS) - Creator performance metrics
CREATE TABLE IF NOT EXISTS creator_quality_scores (
  creator_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  cpm_w_avg NUMERIC(8,4) DEFAULT 0,
  return_rate NUMERIC(5,4) DEFAULT 0,
  viewer_retention_30d NUMERIC(5,4) DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  quality_tier TEXT DEFAULT 'standard' CHECK (quality_tier IN ('new', 'standard', 'featured', 'premium', 'flagged')),
  featured_boost NUMERIC(3,2) DEFAULT 1.0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. User Streaks - Progression system
CREATE TABLE IF NOT EXISTS user_streaks (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  total_watch_days INTEGER DEFAULT 0,
  streak_rewards_claimed JSONB DEFAULT '[]',
  last_commerce_reward_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Purchase Returns - Regret signal tracking
CREATE TABLE IF NOT EXISTS purchase_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_intent_id UUID REFERENCES purchase_intents(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  product_id UUID REFERENCES shopable_products(id) ON DELETE SET NULL,
  creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason TEXT,
  refund_amount_cents INTEGER,
  stripe_refund_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- user_content_scores RLS
ALTER TABLE user_content_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own content scores"
  ON user_content_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all content scores"
  ON user_content_scores FOR ALL
  USING (auth.role() = 'service_role');

-- content_quality_scores RLS (public read for feed ranking)
ALTER TABLE content_quality_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view content quality scores"
  ON content_quality_scores FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage content quality scores"
  ON content_quality_scores FOR ALL
  USING (auth.role() = 'service_role');

-- creator_quality_scores RLS
ALTER TABLE creator_quality_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can view own quality score"
  ON creator_quality_scores FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Anyone can view creator quality for feed"
  ON creator_quality_scores FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage creator quality scores"
  ON creator_quality_scores FOR ALL
  USING (auth.role() = 'service_role');

-- user_streaks RLS
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streaks"
  ON user_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
  ON user_streaks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks"
  ON user_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all streaks"
  ON user_streaks FOR ALL
  USING (auth.role() = 'service_role');

-- purchase_returns RLS
ALTER TABLE purchase_returns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own returns"
  ON purchase_returns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Creators can view returns on their products"
  ON purchase_returns FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Service role can manage all returns"
  ON purchase_returns FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_content_scores_user ON user_content_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_user_content_scores_category ON user_content_scores(category_id);
CREATE INDEX IF NOT EXISTS idx_content_quality_freshness ON content_quality_scores(freshness_score DESC);
CREATE INDEX IF NOT EXISTS idx_creator_quality_tier ON creator_quality_scores(quality_tier);
CREATE INDEX IF NOT EXISTS idx_user_streaks_active ON user_streaks(last_active_date DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_returns_creator ON purchase_returns(creator_id);
CREATE INDEX IF NOT EXISTS idx_purchase_returns_created ON purchase_returns(created_at DESC);