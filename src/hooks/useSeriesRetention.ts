import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type TimeRange = '7d' | '30d' | 'all';

export interface SeriesRetentionEpisode {
  episodeId: string;
  episodeNumber: number;
  title: string;
  hookRate: number;        // % viewers past 3 seconds
  cliffhangerScore: number; // 1 - (drop_off_last_5s / completions)
  bingeVelocityMin: number; // avg minutes to next episode
  totalViews: number;
  completions: number;
}

export interface SeriesRetentionData {
  seriesId: string;
  seriesTitle: string;
  episodes: SeriesRetentionEpisode[];
  avgHookRate: number;
  avgCliffhangerScore: number;
  avgBingeVelocityMin: number;
  overallCompletionRate: number;
}

export interface SeriesRetentionResult {
  series: SeriesRetentionData[];
  isLoading: boolean;
  error: string | null;
}

export function useSeriesRetention(creatorId: string | undefined, timeRange: TimeRange): SeriesRetentionResult {
  const [result, setResult] = useState<SeriesRetentionResult>({
    series: [],
    isLoading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    if (!creatorId) {
      setResult({ series: [], isLoading: false, error: null });
      return;
    }

    setResult(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const startDate = timeRange === '7d'
        ? new Date(Date.now() - 7 * 86400000).toISOString()
        : timeRange === '30d'
        ? new Date(Date.now() - 30 * 86400000).toISOString()
        : '1970-01-01';

      // Fetch creator's series and their episodes
      const { data: seriesList } = await supabase
        .from('series')
        .select('id, title')
        .eq('creator_id', creatorId)
        .eq('status', 'published');

      if (!seriesList || seriesList.length === 0) {
        setResult({ series: [], isLoading: false, error: null });
        return;
      }

      const seriesIds = seriesList.map(s => s.id);

      const { data: episodes } = await supabase
        .from('episodes')
        .select('id, title, episode_number, series_id, views, status')
        .in('series_id', seriesIds)
        .eq('status', 'published')
        .order('episode_number', { ascending: true });

      if (!episodes || episodes.length === 0) {
        setResult({ series: [], isLoading: false, error: null });
        return;
      }

      const episodeIds = episodes.map(e => e.id);

      // Fetch relevant analytics events
      const { data: events } = await supabase
        .from('analytics_events')
        .select('event_type, episode_id, metadata, created_at')
        .eq('creator_id', creatorId)
        .in('episode_id', episodeIds)
        .in('event_type', ['video_view', 'video_progress', 'video_complete', 'episode_transition'])
        .gte('created_at', startDate);

      // Aggregate per episode
      const episodeMetrics: Record<string, {
        views: number;
        past3s: number;
        completions: number;
        dropOffLast5s: number;
        transitionTimesMs: number[];
      }> = {};

      (events || []).forEach((ev: any) => {
        const eid = ev.episode_id;
        if (!eid) return;

        if (!episodeMetrics[eid]) {
          episodeMetrics[eid] = { views: 0, past3s: 0, completions: 0, dropOffLast5s: 0, transitionTimesMs: [] };
        }

        const m = episodeMetrics[eid];

        if (ev.event_type === 'video_view') {
          m.views++;
        } else if (ev.event_type === 'video_progress') {
          const checkpoint = ev.metadata?.progressCheckpoint;
          if (checkpoint === '3s') m.past3s++;
          // 75% checkpoint without completion = potential cliffhanger drop-off
          if (checkpoint === '75%') m.dropOffLast5s++;
        } else if (ev.event_type === 'video_complete') {
          m.completions++;
          // If they completed, remove the 75% drop-off count (they didn't actually drop)
          m.dropOffLast5s = Math.max(0, m.dropOffLast5s - 1);
        } else if (ev.event_type === 'episode_transition') {
          const transMs = ev.metadata?.transitionMs;
          if (typeof transMs === 'number') {
            m.transitionTimesMs.push(transMs);
          }
        }
      });

      // Build per-series data
      const seriesDataMap: Record<string, SeriesRetentionData> = {};

      seriesList.forEach(s => {
        seriesDataMap[s.id] = {
          seriesId: s.id,
          seriesTitle: s.title,
          episodes: [],
          avgHookRate: 0,
          avgCliffhangerScore: 0,
          avgBingeVelocityMin: 0,
          overallCompletionRate: 0,
        };
      });

      episodes.forEach(ep => {
        const metrics = episodeMetrics[ep.id] || { views: 0, past3s: 0, completions: 0, dropOffLast5s: 0, transitionTimesMs: [] };
        const views = metrics.views || (ep.views ?? 0);

        const hookRate = views > 0 ? (metrics.past3s / views) * 100 : 0;
        const cliffhangerScore = metrics.completions > 0
          ? Math.max(0, 1 - (metrics.dropOffLast5s / (metrics.completions + metrics.dropOffLast5s))) * 100
          : 0;
        const avgTransMs = metrics.transitionTimesMs.length > 0
          ? metrics.transitionTimesMs.reduce((a, b) => a + b, 0) / metrics.transitionTimesMs.length
          : 0;

        const retEp: SeriesRetentionEpisode = {
          episodeId: ep.id,
          episodeNumber: ep.episode_number,
          title: ep.title,
          hookRate: Math.round(hookRate * 10) / 10,
          cliffhangerScore: Math.round(cliffhangerScore * 10) / 10,
          bingeVelocityMin: Math.round(avgTransMs / 60000 * 10) / 10,
          totalViews: views,
          completions: metrics.completions,
        };

        if (seriesDataMap[ep.series_id]) {
          seriesDataMap[ep.series_id].episodes.push(retEp);
        }
      });

      // Calculate series-level averages
      const seriesArray = Object.values(seriesDataMap).filter(s => s.episodes.length > 0);

      seriesArray.forEach(s => {
        const eps = s.episodes;
        s.avgHookRate = eps.reduce((sum, e) => sum + e.hookRate, 0) / eps.length;
        s.avgCliffhangerScore = eps.reduce((sum, e) => sum + e.cliffhangerScore, 0) / eps.length;
        
        const epsWithBinge = eps.filter(e => e.bingeVelocityMin > 0);
        s.avgBingeVelocityMin = epsWithBinge.length > 0
          ? epsWithBinge.reduce((sum, e) => sum + e.bingeVelocityMin, 0) / epsWithBinge.length
          : 0;

        const totalViews = eps.reduce((sum, e) => sum + e.totalViews, 0);
        const totalCompletions = eps.reduce((sum, e) => sum + e.completions, 0);
        s.overallCompletionRate = totalViews > 0 ? (totalCompletions / totalViews) * 100 : 0;
      });

      setResult({ series: seriesArray, isLoading: false, error: null });
    } catch (err) {
      console.error('Error fetching series retention:', err);
      setResult(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Fehler beim Laden',
      }));
    }
  }, [creatorId, timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return result;
}
