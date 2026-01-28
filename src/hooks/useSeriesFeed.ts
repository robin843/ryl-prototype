import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SeriesFeedEpisode {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  hls_url: string | null;
  duration: string | null;
  episode_number: number;
  views: number;
  created_at: string;
  series_id: string;
  creator_id: string;
  series_title: string;
  series_cover_url: string | null;
}

interface UseSeriesFeedOptions {
  seriesId: string | null;
  startEpisodeId?: string | null;
  enabled?: boolean;
}

export function useSeriesFeed(options: UseSeriesFeedOptions) {
  const { seriesId, startEpisodeId, enabled = true } = options;

  return useQuery({
    queryKey: ['series-feed', seriesId],
    queryFn: async (): Promise<SeriesFeedEpisode[]> => {
      if (!seriesId) return [];

      // First get series info
      const { data: series, error: seriesError } = await supabase
        .from('series')
        .select('id, title, cover_url, creator_id')
        .eq('id', seriesId)
        .eq('status', 'published')
        .single();

      if (seriesError || !series) {
        console.error('[useSeriesFeed] Series not found:', seriesError);
        return [];
      }

      // Get all published episodes for this series
      const { data: episodes, error: episodesError } = await supabase
        .from('episodes')
        .select('*')
        .eq('series_id', seriesId)
        .eq('status', 'published')
        .order('episode_number', { ascending: true });

      if (episodesError) {
        console.error('[useSeriesFeed] Error fetching episodes:', episodesError);
        return [];
      }

      return episodes.map(ep => ({
        id: ep.id,
        title: ep.title,
        description: ep.description,
        thumbnail_url: ep.thumbnail_url,
        video_url: ep.video_url,
        hls_url: ep.hls_url,
        duration: ep.duration,
        episode_number: ep.episode_number,
        views: ep.views || 0,
        created_at: ep.created_at,
        series_id: ep.series_id,
        creator_id: ep.creator_id,
        series_title: series.title,
        series_cover_url: series.cover_url,
      }));
    },
    enabled: enabled && !!seriesId,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}

// Helper to find starting index based on episode ID
export function findStartingIndex(episodes: SeriesFeedEpisode[], episodeId?: string | null): number {
  if (!episodeId || episodes.length === 0) return 0;
  const index = episodes.findIndex(ep => ep.id === episodeId);
  return index >= 0 ? index : 0;
}
