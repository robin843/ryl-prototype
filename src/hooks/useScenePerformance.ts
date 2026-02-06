import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { HotspotPerformance } from '@/components/studio/analytics/SceneTimeline';

type TimeRange = '7d' | '30d' | 'all';

export interface ScenePerformanceData {
  hotspots: HotspotPerformance[];
  isLoading: boolean;
}

export function useScenePerformance(
  episodeId: string | null,
  creatorId: string | undefined,
  timeRange: TimeRange
) {
  const [data, setData] = useState<ScenePerformanceData>({
    hotspots: [],
    isLoading: false,
  });

  const fetchData = useCallback(async () => {
    if (!episodeId || !creatorId) {
      setData({ hotspots: [], isLoading: false });
      return;
    }

    setData(prev => ({ ...prev, isLoading: true }));

    try {
      const startDate = timeRange === '7d'
        ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        : timeRange === '30d'
        ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        : '1970-01-01';

      // Fetch hotspots with product info
      const { data: hotspots } = await supabase
        .from('episode_hotspots')
        .select(`
          id,
          product_id,
          start_time,
          end_time,
          position_x,
          position_y,
          shopable_products!inner(name, image_url)
        `)
        .eq('episode_id', episodeId);

      if (!hotspots || hotspots.length === 0) {
        setData({ hotspots: [], isLoading: false });
        return;
      }

      const hotspotIds = hotspots.map(h => h.id);

      // Fetch analytics events for these hotspots
      const { data: events } = await supabase
        .from('analytics_events')
        .select('event_type, hotspot_id, product_id, revenue_cents')
        .eq('creator_id', creatorId)
        .eq('episode_id', episodeId)
        .gte('created_at', startDate);

      // Aggregate per hotspot
      const hotspotEvents: Record<string, {
        impressions: number;
        clicks: number;
        purchases: number;
        revenue: number;
      }> = {};

      (events || []).forEach((e: any) => {
        const hid = e.hotspot_id;
        if (!hid || !hotspotIds.includes(hid)) return;

        if (!hotspotEvents[hid]) {
          hotspotEvents[hid] = { impressions: 0, clicks: 0, purchases: 0, revenue: 0 };
        }

        if (e.event_type === 'hotspot_impression') {
          hotspotEvents[hid].impressions++;
        } else if (e.event_type === 'hotspot_click') {
          hotspotEvents[hid].clicks++;
        } else if (e.event_type === 'purchase' || e.event_type === 'mock_checkout_attempt') {
          hotspotEvents[hid].purchases++;
          hotspotEvents[hid].revenue += e.revenue_cents || 0;
        }
      });

      const result: HotspotPerformance[] = hotspots.map((h: any) => {
        const stats = hotspotEvents[h.id] || { impressions: 0, clicks: 0, purchases: 0, revenue: 0 };
        return {
          hotspotId: h.id,
          productId: h.product_id,
          productName: h.shopable_products?.name || 'Unbekannt',
          productImage: h.shopable_products?.image_url || null,
          startTime: h.start_time || 0,
          endTime: h.end_time || 0,
          positionX: h.position_x,
          positionY: h.position_y,
          impressions: stats.impressions,
          clicks: stats.clicks,
          purchases: stats.purchases,
          revenueCents: stats.revenue,
          ctr: stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0,
          conversionRate: stats.clicks > 0 ? (stats.purchases / stats.clicks) * 100 : 0,
        };
      });

      setData({ hotspots: result, isLoading: false });
    } catch (err) {
      console.error('Error fetching scene performance:', err);
      setData({ hotspots: [], isLoading: false });
    }
  }, [episodeId, creatorId, timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return data;
}
