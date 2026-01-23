-- ===========================================
-- PHASE A: VIRALITY FEATURES
-- ===========================================

-- 1. Story Share Links for viral sharing
CREATE TABLE public.story_share_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  short_code TEXT NOT NULL UNIQUE,
  target_url TEXT NOT NULL,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.shopable_products(id) ON DELETE SET NULL,
  creator_id UUID NOT NULL,
  sharer_id UUID,
  clicks INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_story_share_links_short_code ON public.story_share_links(short_code);
CREATE INDEX idx_story_share_links_creator ON public.story_share_links(creator_id);
CREATE INDEX idx_story_share_links_sharer ON public.story_share_links(sharer_id);

ALTER TABLE public.story_share_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read story share links by short_code"
ON public.story_share_links FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create story share links"
ON public.story_share_links FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Creators can update their own story share links"
ON public.story_share_links FOR UPDATE
USING (auth.uid() = creator_id OR auth.uid() = sharer_id);

-- 2. User Referral Codes (for viewers)
CREATE TABLE public.user_referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_referral_codes_code ON public.user_referral_codes(code);

ALTER TABLE public.user_referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read user referral codes"
ON public.user_referral_codes FOR SELECT
USING (true);

CREATE POLICY "Users can create their own referral code"
ON public.user_referral_codes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. User Referrals tracking
CREATE TABLE public.user_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_id UUID NOT NULL UNIQUE,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'rewarded', 'expired')),
  referrer_reward_cents INTEGER NOT NULL DEFAULT 500,
  referred_reward_cents INTEGER NOT NULL DEFAULT 500,
  rewarded_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_referrals_referrer ON public.user_referrals(referrer_id);
CREATE INDEX idx_user_referrals_referred ON public.user_referrals(referred_id);
CREATE INDEX idx_user_referrals_status ON public.user_referrals(status);

ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referrals as referrer or referred"
ON public.user_referrals FOR SELECT
USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "System can insert referrals"
ON public.user_referrals FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update referrals"
ON public.user_referrals FOR UPDATE
USING (true);

-- 4. Add credits_cents to profiles for reward system
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credits_cents INTEGER NOT NULL DEFAULT 0;

-- ===========================================
-- PHASE B: RETENTION FEATURES
-- ===========================================

-- 5. Creator Follows
CREATE TABLE public.creator_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  creator_id UUID NOT NULL,
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, creator_id)
);

CREATE INDEX idx_creator_follows_follower ON public.creator_follows(follower_id);
CREATE INDEX idx_creator_follows_creator ON public.creator_follows(creator_id);

ALTER TABLE public.creator_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view follow counts"
ON public.creator_follows FOR SELECT
USING (true);

CREATE POLICY "Users can follow creators"
ON public.creator_follows FOR INSERT
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
ON public.creator_follows FOR DELETE
USING (auth.uid() = follower_id);

CREATE POLICY "Users can update their follow preferences"
ON public.creator_follows FOR UPDATE
USING (auth.uid() = follower_id);

-- 6. Notification queue for triggered notifications
CREATE TABLE public.notification_triggers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('new_episode', 'streak_reminder', 'price_drop', 'follow_update')),
  target_user_id UUID,
  target_creator_id UUID,
  reference_id UUID,
  payload JSONB NOT NULL DEFAULT '{}',
  processed BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_notification_triggers_unprocessed ON public.notification_triggers(processed) WHERE processed = false;
CREATE INDEX idx_notification_triggers_type ON public.notification_triggers(trigger_type);

ALTER TABLE public.notification_triggers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only for notification triggers"
ON public.notification_triggers FOR ALL
USING (false);

-- ===========================================
-- PHASE C: CONVERSION FEATURES
-- ===========================================

-- 7. Add price history tracking to shopable_products
ALTER TABLE public.shopable_products ADD COLUMN IF NOT EXISTS original_price_cents INTEGER;
ALTER TABLE public.shopable_products ADD COLUMN IF NOT EXISTS price_history JSONB NOT NULL DEFAULT '[]';
ALTER TABLE public.shopable_products ADD COLUMN IF NOT EXISTS last_price_change_at TIMESTAMP WITH TIME ZONE;

-- 8. Saved products price tracking
ALTER TABLE public.saved_products ADD COLUMN IF NOT EXISTS saved_price_cents INTEGER;
ALTER TABLE public.saved_products ADD COLUMN IF NOT EXISTS price_alert_enabled BOOLEAN NOT NULL DEFAULT true;

-- 9. Function to track price changes
CREATE OR REPLACE FUNCTION public.track_price_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.price_cents IS DISTINCT FROM NEW.price_cents THEN
    NEW.price_history = NEW.price_history || jsonb_build_object(
      'price_cents', OLD.price_cents,
      'changed_at', now()
    );
    NEW.last_price_change_at = now();
    
    -- Set original price if not set
    IF NEW.original_price_cents IS NULL THEN
      NEW.original_price_cents = OLD.price_cents;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trigger_track_price_change
BEFORE UPDATE ON public.shopable_products
FOR EACH ROW
EXECUTE FUNCTION public.track_price_change();

-- 10. View for creator follower stats
CREATE OR REPLACE VIEW public.creator_follower_stats AS
SELECT 
  creator_id,
  COUNT(*) as follower_count,
  COUNT(*) FILTER (WHERE notifications_enabled = true) as notification_enabled_count
FROM public.creator_follows
GROUP BY creator_id;

-- 11. Function to generate unique short codes
CREATE OR REPLACE FUNCTION public.generate_short_code(length INTEGER DEFAULT 8)
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 12. Trigger to create user referral code on profile creation
CREATE OR REPLACE FUNCTION public.create_user_referral_code()
RETURNS TRIGGER AS $$
DECLARE
  base_code TEXT;
  final_code TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate base code from username or random
  IF NEW.username IS NOT NULL AND NEW.username != '' THEN
    base_code := lower(NEW.username) || '-invite';
  ELSE
    base_code := 'ryl-' || public.generate_short_code(6);
  END IF;
  
  final_code := base_code;
  
  -- Handle collisions
  WHILE EXISTS (SELECT 1 FROM public.user_referral_codes WHERE code = final_code) LOOP
    counter := counter + 1;
    final_code := base_code || counter::TEXT;
  END LOOP;
  
  INSERT INTO public.user_referral_codes (user_id, code)
  VALUES (NEW.id, final_code)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_create_user_referral_code
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.create_user_referral_code();

-- 13. Trigger for new episode notifications
CREATE OR REPLACE FUNCTION public.trigger_new_episode_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
    -- Get the series creator
    INSERT INTO public.notification_triggers (trigger_type, target_creator_id, reference_id, payload)
    SELECT 
      'new_episode',
      s.creator_id,
      NEW.id,
      jsonb_build_object(
        'episode_id', NEW.id,
        'episode_title', NEW.title,
        'series_id', NEW.series_id,
        'series_title', s.title
      )
    FROM public.series s
    WHERE s.id = NEW.series_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_episode_published_notification
AFTER INSERT OR UPDATE ON public.episodes
FOR EACH ROW
EXECUTE FUNCTION public.trigger_new_episode_notification();