import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface FeedEpisode {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  hls_url: string | null; // Cloudflare Stream HLS URL
  duration: string | null;
  episode_number: number;
  views: number;
  created_at: string;
  series_id: string;
  creator_id: string;
  series_title: string;
  series_cover_url: string | null;
  creator_display_name: string | null;
  creator_avatar_url: string | null;
  is_discovery: boolean;
  // Social proof data from DB
  purchases_today: number;
  saves_count: number;
  is_trending: boolean;
}

interface FeedResponse {
  episodes: FeedEpisode[];
  total: number;
  has_more: boolean;
}

interface UsePersonalizedFeedOptions {
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

export function usePersonalizedFeed(options: UsePersonalizedFeedOptions = {}) {
  const { limit = 30, offset = 0, enabled = true } = options;
  const { user } = useAuth();

  return useQuery({
    queryKey: ['personalized-feed', user?.id, limit, offset],
    queryFn: async (): Promise<FeedResponse> => {
      const { data, error } = await supabase.functions.invoke('get-personalized-feed', {
        body: { limit, offset },
      });

      if (error) {
        console.error('[usePersonalizedFeed] Error:', error);
        throw new Error(error.message || 'Failed to fetch personalized feed');
      }

      return data as FeedResponse;
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes cache (increased from 1)
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection (increased from 5)
    refetchOnWindowFocus: false, // Don't refetch on tab switch
    refetchOnMount: false, // Use cached data on remount
  });
}

// Hook for infinite scrolling
export function useInfinitePersonalizedFeed(pageSize = 20) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['personalized-feed-infinite', user?.id],
    queryFn: async (): Promise<FeedEpisode[]> => {
      const { data, error } = await supabase.functions.invoke('get-personalized-feed', {
        body: { limit: pageSize, offset: 0 },
      });

      if (error) {
        console.error('[useInfinitePersonalizedFeed] Error:', error);
        throw new Error(error.message || 'Failed to fetch feed');
      }

      return (data as FeedResponse).episodes;
    },
    staleTime: 60 * 1000,
  });
}