import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Get VAPID key from environment
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

interface PushSubscriptionState {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission | 'default';
  loading: boolean;
  error: string | null;
}

interface NotificationPreferences {
  new_episodes: boolean;
  order_updates: boolean;
  promotions: boolean;
  followed_creators: boolean;
}

// Convert base64 VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [state, setState] = useState<PushSubscriptionState>({
    isSupported: false,
    isSubscribed: false,
    permission: 'default',
    loading: true,
    error: null,
  });
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    new_episodes: true,
    order_updates: true,
    promotions: false,
    followed_creators: true,
  });

  // Check if push notifications are supported
  const checkSupport = useCallback(() => {
    const isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    return isSupported;
  }, []);

  // Get current subscription status
  const checkSubscription = useCallback(async () => {
    if (!checkSupport()) {
      setState(prev => ({ ...prev, isSupported: false, loading: false }));
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      const permission = Notification.permission;

      setState(prev => ({
        ...prev,
        isSupported: true,
        isSubscribed: !!subscription,
        permission,
        loading: false,
      }));
    } catch (error) {
      console.error('Error checking subscription:', error);
      setState(prev => ({
        ...prev,
        isSupported: true,
        loading: false,
        error: 'Fehler beim Prüfen der Benachrichtigungen',
      }));
    }
  }, [checkSupport]);

  // Load user preferences
  const loadPreferences = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setPreferences({
          new_episodes: data.new_episodes,
          order_updates: data.order_updates,
          promotions: data.promotions,
          followed_creators: data.followed_creators,
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }, [user]);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, error: 'Du musst angemeldet sein' }));
      return false;
    }

    if (!VAPID_PUBLIC_KEY) {
      console.error('VAPID key not configured');
      setState(prev => ({ ...prev, error: 'Push-Benachrichtigungen nicht konfiguriert' }));
      return false;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setState(prev => ({
          ...prev,
          permission,
          loading: false,
          error: 'Benachrichtigungen wurden abgelehnt',
        }));
        return false;
      }

      // Register service worker if not already
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Subscribe to push
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      });

      // Extract keys
      const subscriptionJson = subscription.toJSON();
      const keys = subscriptionJson.keys;

      if (!keys?.p256dh || !keys?.auth) {
        throw new Error('Failed to get subscription keys');
      }

      // Save to database
      const { error: dbError } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh: keys.p256dh,
          auth_key: keys.auth,
          user_agent: navigator.userAgent,
          last_used_at: new Date().toISOString(),
        } as {
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth_key: string;
          user_agent: string;
          last_used_at: string;
        }, {
          onConflict: 'endpoint',
        });

      if (dbError) throw dbError;

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        permission: 'granted',
        loading: false,
      }));

      return true;
    } catch (error) {
      console.error('Error subscribing:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Fehler beim Aktivieren der Benachrichtigungen',
      }));
      return false;
    }
  }, [user]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!user) return false;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Remove from database
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user.id)
          .eq('endpoint', subscription.endpoint);
      }

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        loading: false,
      }));

      return true;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Fehler beim Deaktivieren',
      }));
      return false;
    }
  }, [user]);

  // Update notification preferences
  const updatePreference = useCallback(async (key: keyof NotificationPreferences, value: boolean) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: user.id,
          [key]: value,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;

      setPreferences(prev => ({ ...prev, [key]: value }));
      return true;
    } catch (error) {
      console.error('Error updating preference:', error);
      return false;
    }
  }, [user]);

  // Initialize
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Load preferences when user changes
  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user, loadPreferences]);

  return {
    ...state,
    preferences,
    subscribe,
    unsubscribe,
    updatePreference,
    checkSubscription,
  };
}
