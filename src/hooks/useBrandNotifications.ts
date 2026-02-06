import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BrandNotification {
  id: string;
  brand_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export function useBrandNotifications(brandId: string | undefined) {
  const [notifications, setNotifications] = useState<BrandNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!brandId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('brand_notifications')
        .select('*')
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const items = (data || []) as BrandNotification[];
      setNotifications(items);
      setUnreadCount(items.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Error fetching brand notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [brandId]);

  const markAsRead = useCallback(async (notificationId: string) => {
    await supabase
      .from('brand_notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!brandId) return;
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;

    await supabase
      .from('brand_notifications')
      .update({ is_read: true })
      .in('id', unreadIds);

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, [brandId, notifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Realtime subscription
  useEffect(() => {
    if (!brandId) return;

    const channel = supabase
      .channel(`brand-notifications-${brandId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'brand_notifications',
          filter: `brand_id=eq.${brandId}`,
        },
        (payload) => {
          const newNotification = payload.new as BrandNotification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [brandId]);

  return { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, refetch: fetchNotifications };
}
