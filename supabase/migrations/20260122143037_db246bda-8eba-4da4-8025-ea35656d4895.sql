-- =====================================================
-- Push Notifications System - Database Schema
-- =====================================================

-- 1. Push Subscriptions Table
-- Stores Web Push subscription data from browsers
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for push_subscriptions
CREATE POLICY "Users can view own push subscriptions"
  ON public.push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own push subscriptions"
  ON public.push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own push subscriptions"
  ON public.push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own push subscriptions"
  ON public.push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all push subscriptions"
  ON public.push_subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- Index for faster lookups
CREATE INDEX idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_endpoint ON public.push_subscriptions(endpoint);

-- 2. User Notification Preferences Table
CREATE TABLE public.user_notification_preferences (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  new_episodes BOOLEAN NOT NULL DEFAULT true,
  order_updates BOOLEAN NOT NULL DEFAULT true,
  promotions BOOLEAN NOT NULL DEFAULT false,
  followed_creators BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_notification_preferences
CREATE POLICY "Users can view own notification preferences"
  ON public.user_notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notification preferences"
  ON public.user_notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
  ON public.user_notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all notification preferences"
  ON public.user_notification_preferences FOR ALL
  USING (auth.role() = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER update_user_notification_preferences_updated_at
  BEFORE UPDATE ON public.user_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Notification Queue Table
-- For batch processing and retry logic
CREATE TYPE public.notification_type AS ENUM ('new_episode', 'order_update', 'promo', 'creator_update');
CREATE TYPE public.notification_status AS ENUM ('pending', 'processing', 'sent', 'failed', 'partial');

CREATE TABLE public.notification_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type public.notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  url TEXT,
  icon TEXT,
  image TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  target_type TEXT NOT NULL DEFAULT 'all', -- 'all', 'series_followers', 'user', 'segment'
  target_series_id UUID REFERENCES public.series(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.notification_status NOT NULL DEFAULT 'pending',
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_log JSONB DEFAULT '[]'::jsonb
);

-- Enable RLS
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Only service role can access queue
CREATE POLICY "Service role can manage notification queue"
  ON public.notification_queue FOR ALL
  USING (auth.role() = 'service_role');

-- Admins can view queue for monitoring
CREATE POLICY "Admins can view notification queue"
  ON public.notification_queue FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Indexes for queue processing
CREATE INDEX idx_notification_queue_status ON public.notification_queue(status);
CREATE INDEX idx_notification_queue_created_at ON public.notification_queue(created_at);
CREATE INDEX idx_notification_queue_target_series ON public.notification_queue(target_series_id);

-- 4. Function to auto-create notification preferences on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create preferences when profile is created
CREATE TRIGGER create_notification_preferences_on_profile
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_notification_preferences();