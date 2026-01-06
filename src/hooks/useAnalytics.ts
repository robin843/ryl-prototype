import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type TimeRange = '7d' | '30d' | 'all';

interface Analytics {
  totalRevenue: number;
  totalViews: number;
  totalClicks: number;
  totalPurchases: number;
  ctr: number;
  conversionRate: number;
}

interface TopProduct {
  id: string;
  name: string;
  imageUrl: string | null;
  clicks: number;
  purchases: number;
  revenue: number;
}

interface EpisodeStat {
  id: string;
  title: string;
  views: number;
  hotspotClicks: number;
  revenue: number;
  ctr: number;
}

export function useAnalytics(creatorId: string | undefined, timeRange: TimeRange) {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalRevenue: 0,
    totalViews: 0,
    totalClicks: 0,
    totalPurchases: 0,
    ctr: 0,
    conversionRate: 0,
  });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [episodeStats, setEpisodeStats] = useState<EpisodeStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!creatorId) {
      setIsLoading(false);
      return;
    }

    async function fetchAnalytics() {
      setIsLoading(true);
      try {
        // Calculate date filter
        let dateFilter: string | null = null;
        const now = new Date();
        if (timeRange === '7d') {
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        } else if (timeRange === '30d') {
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        }

        // Fetch analytics events
        let query = supabase
          .from('analytics_events')
          .select('*')
          .eq('creator_id', creatorId);

        if (dateFilter) {
          query = query.gte('created_at', dateFilter);
        }

        const { data: events } = await query;

        if (events) {
          const views = events.filter(e => e.event_type === 'view').length;
          const clicks = events.filter(e => e.event_type === 'hotspot_click').length;
          const purchases = events.filter(e => e.event_type === 'purchase').length;
          const revenue = events
            .filter(e => e.event_type === 'purchase')
            .reduce((sum, e) => sum + (e.revenue_cents || 0), 0);

          setAnalytics({
            totalRevenue: revenue,
            totalViews: views,
            totalClicks: clicks,
            totalPurchases: purchases,
            ctr: views > 0 ? (clicks / views) * 100 : 0,
            conversionRate: clicks > 0 ? (purchases / clicks) * 100 : 0,
          });

          // Group by product for top products
          const productStats = new Map<string, { clicks: number; purchases: number; revenue: number }>();
          events.forEach(e => {
            if (e.product_id && (e.event_type === 'hotspot_click' || e.event_type === 'purchase')) {
              const existing = productStats.get(e.product_id) || { clicks: 0, purchases: 0, revenue: 0 };
              if (e.event_type === 'hotspot_click') existing.clicks++;
              if (e.event_type === 'purchase') {
                existing.purchases++;
                existing.revenue += e.revenue_cents || 0;
              }
              productStats.set(e.product_id, existing);
            }
          });

          // Fetch product details
          const productIds = Array.from(productStats.keys());
          if (productIds.length > 0) {
            const { data: products } = await supabase
              .from('shopable_products')
              .select('id, name, image_url')
              .in('id', productIds);

            const topProds: TopProduct[] = (products || [])
              .map(p => ({
                id: p.id,
                name: p.name,
                imageUrl: p.image_url,
                ...productStats.get(p.id)!,
              }))
              .sort((a, b) => b.revenue - a.revenue)
              .slice(0, 5);

            setTopProducts(topProds);
          }

          // Group by episode
          const episodeStatsMap = new Map<string, { views: number; clicks: number; revenue: number }>();
          events.forEach(e => {
            if (e.episode_id) {
              const existing = episodeStatsMap.get(e.episode_id) || { views: 0, clicks: 0, revenue: 0 };
              if (e.event_type === 'view') existing.views++;
              if (e.event_type === 'hotspot_click') existing.clicks++;
              if (e.event_type === 'purchase') existing.revenue += e.revenue_cents || 0;
              episodeStatsMap.set(e.episode_id, existing);
            }
          });

          const episodeIds = Array.from(episodeStatsMap.keys());
          if (episodeIds.length > 0) {
            const { data: episodes } = await supabase
              .from('episodes')
              .select('id, title')
              .in('id', episodeIds);

            const epStats: EpisodeStat[] = (episodes || [])
              .map(ep => {
                const stats = episodeStatsMap.get(ep.id)!;
                return {
                  id: ep.id,
                  title: ep.title,
                  views: stats.views,
                  hotspotClicks: stats.clicks,
                  revenue: stats.revenue,
                  ctr: stats.views > 0 ? (stats.clicks / stats.views) * 100 : 0,
                };
              })
              .sort((a, b) => b.revenue - a.revenue)
              .slice(0, 10);

            setEpisodeStats(epStats);
          }
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalytics();
  }, [creatorId, timeRange]);

  return { analytics, topProducts, episodeStats, isLoading };
}