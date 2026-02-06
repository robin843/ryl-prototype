import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type TimeRange = '7d' | '30d' | 'all';

export interface FunnelStep {
  label: string;
  count: number;
  rate: number; // % of previous step
}

export interface EpisodeFunnel {
  episodeId: string;
  episodeTitle: string;
  steps: FunnelStep[];
}

export interface ConversionFunnelData {
  overall: FunnelStep[];
  episodes: EpisodeFunnel[];
  isLoading: boolean;
}

export function useConversionFunnel(
  creatorId: string | undefined,
  timeRange: TimeRange
) {
  const [data, setData] = useState<ConversionFunnelData>({
    overall: [],
    episodes: [],
    isLoading: true,
  });

  const fetchData = useCallback(async () => {
    if (!creatorId) {
      setData({ overall: [], episodes: [], isLoading: false });
      return;
    }

    setData(prev => ({ ...prev, isLoading: true }));

    try {
      const startDate = timeRange === '7d'
        ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        : timeRange === '30d'
        ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        : '1970-01-01';

      // Fetch all analytics events for this creator
      const { data: events } = await supabase
        .from('analytics_events')
        .select('event_type, episode_id')
        .eq('creator_id', creatorId)
        .gte('created_at', startDate);

      // Fetch episode titles
      const { data: episodes } = await supabase
        .from('episodes')
        .select('id, title')
        .eq('creator_id', creatorId)
        .eq('status', 'published');

      const episodeMap = new Map((episodes || []).map(e => [e.id, e.title]));

      const funnelEvents = [
        'video_view',
        'hotspot_impression',
        'hotspot_click',
        'product_panel_open',
        'mock_checkout_attempt',
      ] as const;

      const labels = [
        'Video Views',
        'Hotspot Impressions',
        'Hotspot Klicks',
        'Panel geöffnet',
        'Checkout-Versuch',
      ];

      // Overall funnel
      const overallCounts = funnelEvents.map(
        type => (events || []).filter(e => e.event_type === type).length
      );

      const overall: FunnelStep[] = overallCounts.map((count, i) => ({
        label: labels[i],
        count,
        rate: i === 0 ? 100 : overallCounts[i - 1] > 0
          ? (count / overallCounts[i - 1]) * 100
          : 0,
      }));

      // Per-episode funnels (top 5 by views)
      const episodeCounts: Record<string, number[]> = {};
      (events || []).forEach(e => {
        if (!e.episode_id) return;
        const idx = funnelEvents.indexOf(e.event_type as any);
        if (idx === -1) return;
        if (!episodeCounts[e.episode_id]) {
          episodeCounts[e.episode_id] = new Array(funnelEvents.length).fill(0);
        }
        episodeCounts[e.episode_id][idx]++;
      });

      const episodeFunnels: EpisodeFunnel[] = Object.entries(episodeCounts)
        .map(([epId, counts]) => ({
          episodeId: epId,
          episodeTitle: episodeMap.get(epId) || 'Unbekannt',
          steps: counts.map((count, i) => ({
            label: labels[i],
            count,
            rate: i === 0 ? 100 : counts[i - 1] > 0 ? (count / counts[i - 1]) * 100 : 0,
          })),
        }))
        .sort((a, b) => (b.steps[0]?.count || 0) - (a.steps[0]?.count || 0))
        .slice(0, 5);

      setData({ overall, episodes: episodeFunnels, isLoading: false });
    } catch (err) {
      console.error('Error fetching conversion funnel:', err);
      setData({ overall: [], episodes: [], isLoading: false });
    }
  }, [creatorId, timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return data;
}
