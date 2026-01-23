import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface FollowState {
  isFollowing: boolean;
  notificationsEnabled: boolean;
}

export function useCreatorFollow(creatorId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: followState, isLoading } = useQuery({
    queryKey: ['creator-follow', creatorId, user?.id],
    queryFn: async (): Promise<FollowState> => {
      if (!user || !creatorId) {
        return { isFollowing: false, notificationsEnabled: false };
      }

      const { data, error } = await supabase
        .from('creator_follows')
        .select('id, notifications_enabled')
        .eq('follower_id', user.id)
        .eq('creator_id', creatorId)
        .maybeSingle();

      if (error) {
        console.error('[useCreatorFollow] Error checking follow state:', error);
        return { isFollowing: false, notificationsEnabled: false };
      }

      return {
        isFollowing: !!data,
        notificationsEnabled: data?.notifications_enabled ?? false,
      };
    },
    enabled: !!creatorId,
  });

  const { data: followerCount = 0 } = useQuery({
    queryKey: ['creator-follower-count', creatorId],
    queryFn: async (): Promise<number> => {
      if (!creatorId) return 0;

      const { count, error } = await supabase
        .from('creator_follows')
        .select('id', { count: 'exact', head: true })
        .eq('creator_id', creatorId);

      if (error) {
        console.error('[useCreatorFollow] Error fetching follower count:', error);
        return 0;
      }

      return count ?? 0;
    },
    enabled: !!creatorId,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!user || !creatorId) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('creator_follows')
        .insert({
          follower_id: user.id,
          creator_id: creatorId,
          notifications_enabled: true,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-follow', creatorId] });
      queryClient.invalidateQueries({ queryKey: ['creator-follower-count', creatorId] });
      queryClient.invalidateQueries({ queryKey: ['followed-creators'] });
      toast.success('Creator gefolgt!');
    },
    onError: (error) => {
      console.error('[useCreatorFollow] Follow error:', error);
      toast.error('Fehler beim Folgen');
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      if (!user || !creatorId) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('creator_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('creator_id', creatorId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-follow', creatorId] });
      queryClient.invalidateQueries({ queryKey: ['creator-follower-count', creatorId] });
      queryClient.invalidateQueries({ queryKey: ['followed-creators'] });
      toast.success('Nicht mehr gefolgt');
    },
    onError: (error) => {
      console.error('[useCreatorFollow] Unfollow error:', error);
      toast.error('Fehler beim Entfolgen');
    },
  });

  const toggleNotificationsMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!user || !creatorId) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('creator_follows')
        .update({ notifications_enabled: enabled })
        .eq('follower_id', user.id)
        .eq('creator_id', creatorId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-follow', creatorId] });
    },
  });

  const toggleFollow = useCallback(() => {
    if (!user) {
      toast.error('Bitte melde dich an');
      return;
    }

    if (followState?.isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  }, [user, followState?.isFollowing, followMutation, unfollowMutation]);

  const toggleNotifications = useCallback((enabled: boolean) => {
    toggleNotificationsMutation.mutate(enabled);
  }, [toggleNotificationsMutation]);

  return {
    isFollowing: followState?.isFollowing ?? false,
    notificationsEnabled: followState?.notificationsEnabled ?? false,
    followerCount,
    isLoading,
    isUpdating: followMutation.isPending || unfollowMutation.isPending,
    toggleFollow,
    toggleNotifications,
  };
}

// Hook to get all followed creators
export function useFollowedCreators() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['followed-creators', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('creator_follows')
        .select(`
          id,
          creator_id,
          notifications_enabled,
          created_at,
          profiles!creator_follows_creator_id_fkey (
            user_id,
            display_name,
            avatar_url,
            username
          )
        `)
        .eq('follower_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useFollowedCreators] Error:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!user,
  });
}
