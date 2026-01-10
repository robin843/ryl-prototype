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
        // Parallel fetch all 3 RPCs - reads from purchase_intents, purchase_items, purchase_events
        const [analyticsResult, productsResult, episodesResult] = await Promise.all([
          supabase.rpc('get_creator_analytics', { 
            p_creator_id: creatorId, 
            p_timeframe: timeRange 
          }),
          supabase.rpc('get_top_products', { 
            p_creator_id: creatorId, 
            p_timeframe: timeRange 
          }),
          supabase.rpc('get_episode_performance', { 
            p_creator_id: creatorId, 
            p_timeframe: timeRange 
          }),
        ]);

        // Process analytics summary
        if (analyticsResult.data && analyticsResult.data.length > 0) {
          const data = analyticsResult.data[0];
          const views = Number(data.total_views) || 0;
          const clicks = Number(data.total_clicks) || 0;
          const purchases = Number(data.total_purchases) || 0;
          
          // CTR = 100% as proxy (views = hotspot clicks, no separate page views tracked)
          const ctr = views > 0 ? 100 : 0;
          // Conversion = purchases / views (intents created)
          const conversionRate = views > 0 ? (purchases / views) * 100 : 0;
          
          setAnalytics({
            totalRevenue: Number(data.total_revenue) || 0,
            totalViews: views,
            totalClicks: clicks,
            totalPurchases: purchases,
            ctr,
            conversionRate,
          });
        } else {
          setAnalytics({
            totalRevenue: 0,
            totalViews: 0,
            totalClicks: 0,
            totalPurchases: 0,
            ctr: 0,
            conversionRate: 0,
          });
        }

        // Process top products
        if (productsResult.data && productsResult.data.length > 0) {
          setTopProducts(productsResult.data.map((p: {
            id: string;
            name: string;
            image_url: string | null;
            clicks: number;
            purchases: number;
            revenue: number;
          }) => ({
            id: p.id,
            name: p.name,
            imageUrl: p.image_url,
            clicks: Number(p.clicks) || 0,
            purchases: Number(p.purchases) || 0,
            revenue: Number(p.revenue) || 0,
          })));
        } else {
          setTopProducts([]);
        }

        // Process episode stats
        if (episodesResult.data && episodesResult.data.length > 0) {
          setEpisodeStats(episodesResult.data.map((e: {
            id: string;
            title: string;
            views: number;
            hotspot_clicks: number;
            revenue: number;
          }) => {
            const views = Number(e.views) || 0;
            const hotspotClicks = Number(e.hotspot_clicks) || 0;
            // CTR = 100% as proxy (no separate page views tracked)
            const ctr = views > 0 ? 100 : 0;
            
            return {
              id: e.id,
              title: e.title,
              views,
              hotspotClicks,
              revenue: Number(e.revenue) || 0,
              ctr,
            };
          }));
        } else {
          setEpisodeStats([]);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setAnalytics({
          totalRevenue: 0,
          totalViews: 0,
          totalClicks: 0,
          totalPurchases: 0,
          ctr: 0,
          conversionRate: 0,
        });
        setTopProducts([]);
        setEpisodeStats([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalytics();
  }, [creatorId, timeRange]);

  return { analytics, topProducts, episodeStats, isLoading };
}
