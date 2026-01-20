import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type TimeRange = '7d' | '30d' | 'all';

interface EpisodeStats {
  id: string;
  title: string;
  seriesTitle: string;
  thumbnailUrl: string | null;
  views: number;
  hotspotClicks: number;
  purchases: number;
  revenueCents: number;
  ctr: number;
  conversionRate: number;
  publishedAt: string;
  hotspotsCount: number;
}

interface EpisodeComparison {
  bestPerformer: EpisodeStats | null;
  worstPerformer: EpisodeStats | null;
  avgRevenueCents: number;
  avgCtr: number;
  avgConversion: number;
}

interface HotspotTiming {
  earlyPerformance: number; // 0-30 seconds
  midPerformance: number; // 30-60 seconds
  latePerformance: number; // 60+ seconds
}

export interface EpisodePerformanceData {
  episodes: EpisodeStats[];
  comparison: EpisodeComparison;
  hotspotTiming: HotspotTiming;
  totalEpisodes: number;
  publishedEpisodes: number;
  isLoading: boolean;
  error: string | null;
}

export function useEpisodePerformance(creatorId: string | undefined, timeRange: TimeRange) {
  const [data, setData] = useState<EpisodePerformanceData>({
    episodes: [],
    comparison: {
      bestPerformer: null,
      worstPerformer: null,
      avgRevenueCents: 0,
      avgCtr: 0,
      avgConversion: 0,
    },
    hotspotTiming: {
      earlyPerformance: 0,
      midPerformance: 0,
      latePerformance: 0,
    },
    totalEpisodes: 0,
    publishedEpisodes: 0,
    isLoading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    if (!creatorId) {
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    setData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const startDate = timeRange === '7d' 
        ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        : timeRange === '30d'
        ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        : '1970-01-01';

      // Fetch all episodes with their series
      const { data: episodes } = await supabase
        .from('episodes')
        .select(`
          id,
          title,
          thumbnail_url,
          views,
          status,
          created_at,
          series!inner(title)
        `)
        .eq('creator_id', creatorId)
        .order('created_at', { ascending: false });

      const publishedEpisodes = (episodes || []).filter((e: any) => e.status === 'published');
      const episodeIds = publishedEpisodes.map((e: any) => e.id);

      if (episodeIds.length === 0) {
        setData({
          episodes: [],
          comparison: {
            bestPerformer: null,
            worstPerformer: null,
            avgRevenueCents: 0,
            avgCtr: 0,
            avgConversion: 0,
          },
          hotspotTiming: {
            earlyPerformance: 0,
            midPerformance: 0,
            latePerformance: 0,
          },
          totalEpisodes: (episodes || []).length,
          publishedEpisodes: 0,
          isLoading: false,
          error: null,
        });
        return;
      }

      // Fetch hotspots for these episodes
      const { data: hotspots } = await supabase
        .from('episode_hotspots')
        .select('id, episode_id, product_id, start_time')
        .in('episode_id', episodeIds);

      // Fetch analytics events
      const { data: analyticsEvents } = await supabase
        .from('analytics_events')
        .select('event_type, episode_id, hotspot_id, revenue_cents')
        .eq('creator_id', creatorId)
        .in('episode_id', episodeIds)
        .gte('created_at', startDate);

      // Group analytics by episode
      const episodeAnalytics: Record<string, {
        clicks: number;
        purchases: number;
        revenue: number;
      }> = {};

      (analyticsEvents || []).forEach((event: any) => {
        if (!event.episode_id) return;
        
        if (!episodeAnalytics[event.episode_id]) {
          episodeAnalytics[event.episode_id] = { clicks: 0, purchases: 0, revenue: 0 };
        }

        if (event.event_type === 'hotspot_click') {
          episodeAnalytics[event.episode_id].clicks++;
        } else if (event.event_type === 'purchase') {
          episodeAnalytics[event.episode_id].purchases++;
          episodeAnalytics[event.episode_id].revenue += event.revenue_cents || 0;
        }
      });

      // Count hotspots per episode
      const hotspotsPerEpisode: Record<string, number> = {};
      (hotspots || []).forEach((h: any) => {
        hotspotsPerEpisode[h.episode_id] = (hotspotsPerEpisode[h.episode_id] || 0) + 1;
      });

      // Build episode stats
      const episodeStats: EpisodeStats[] = publishedEpisodes.map((e: any) => {
        const analytics = episodeAnalytics[e.id] || { clicks: 0, purchases: 0, revenue: 0 };
        const views = e.views || 0;
        const ctr = views > 0 ? (analytics.clicks / views) * 100 : 0;
        const conversionRate = analytics.clicks > 0 
          ? (analytics.purchases / analytics.clicks) * 100 
          : 0;

        return {
          id: e.id,
          title: e.title,
          seriesTitle: e.series?.title || 'Unbekannt',
          thumbnailUrl: e.thumbnail_url,
          views,
          hotspotClicks: analytics.clicks,
          purchases: analytics.purchases,
          revenueCents: analytics.revenue,
          ctr,
          conversionRate,
          publishedAt: e.created_at,
          hotspotsCount: hotspotsPerEpisode[e.id] || 0,
        };
      });

      // Sort by revenue
      episodeStats.sort((a, b) => b.revenueCents - a.revenueCents);

      // Calculate hotspot timing performance
      let earlyClicks = 0, midClicks = 0, lateClicks = 0;
      let earlyPurchases = 0, midPurchases = 0, latePurchases = 0;

      (hotspots || []).forEach((hotspot: any) => {
        const startTime = hotspot.start_time || 0;
        const hotspotEvents = (analyticsEvents || []).filter((e: any) => 
          e.hotspot_id === hotspot.id
        );

        const clicks = hotspotEvents.filter((e: any) => e.event_type === 'hotspot_click').length;
        const purchases = hotspotEvents.filter((e: any) => e.event_type === 'purchase').length;

        if (startTime < 30) {
          earlyClicks += clicks;
          earlyPurchases += purchases;
        } else if (startTime < 60) {
          midClicks += clicks;
          midPurchases += purchases;
        } else {
          lateClicks += clicks;
          latePurchases += purchases;
        }
      });

      const hotspotTiming: HotspotTiming = {
        earlyPerformance: earlyClicks > 0 ? (earlyPurchases / earlyClicks) * 100 : 0,
        midPerformance: midClicks > 0 ? (midPurchases / midClicks) * 100 : 0,
        latePerformance: lateClicks > 0 ? (latePurchases / lateClicks) * 100 : 0,
      };

      // Calculate comparison stats
      const episodesWithRevenue = episodeStats.filter(e => e.revenueCents > 0);
      const avgRevenueCents = episodesWithRevenue.length > 0
        ? Math.round(episodesWithRevenue.reduce((sum, e) => sum + e.revenueCents, 0) / episodesWithRevenue.length)
        : 0;

      const avgCtr = episodeStats.length > 0
        ? episodeStats.reduce((sum, e) => sum + e.ctr, 0) / episodeStats.length
        : 0;

      const avgConversion = episodeStats.length > 0
        ? episodeStats.reduce((sum, e) => sum + e.conversionRate, 0) / episodeStats.length
        : 0;

      setData({
        episodes: episodeStats,
        comparison: {
          bestPerformer: episodeStats[0] || null,
          worstPerformer: episodeStats.length > 1 ? episodeStats[episodeStats.length - 1] : null,
          avgRevenueCents,
          avgCtr,
          avgConversion,
        },
        hotspotTiming,
        totalEpisodes: (episodes || []).length,
        publishedEpisodes: publishedEpisodes.length,
        isLoading: false,
        error: null,
      });

    } catch (err) {
      console.error('Error fetching episode performance:', err);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Fehler beim Laden',
      }));
    }
  }, [creatorId, timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return data;
}
