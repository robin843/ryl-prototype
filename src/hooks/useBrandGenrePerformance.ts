import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { TimeRange } from '@/hooks/useBrandData';

export interface GenrePerformance {
  genre: string;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  conversionRate: number;
  avgOrderValue: number;
}

export interface BrandGenreData {
  genres: GenrePerformance[];
  bestGenre: string | null;
  worstGenre: string | null;
  recommendation: string | null;
  isLoading: boolean;
}

export function useBrandGenrePerformance(
  brandId: string | undefined,
  companyName: string | undefined,
  timeRange: TimeRange
): BrandGenreData {
  const [data, setData] = useState<BrandGenreData>({
    genres: [],
    bestGenre: null,
    worstGenre: null,
    recommendation: null,
    isLoading: true,
  });

  const fetchData = useCallback(async () => {
    if (!brandId || !companyName) {
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const startDate = timeRange === '7d'
        ? new Date(Date.now() - 7 * 86400000).toISOString()
        : timeRange === '30d'
        ? new Date(Date.now() - 30 * 86400000).toISOString()
        : '1970-01-01';

      // Get brand's products
      const { data: products } = await supabase
        .from('shopable_products')
        .select('id, series_id')
        .ilike('brand_name', companyName);

      const productIds = products?.map(p => p.id) || [];
      if (productIds.length === 0) {
        setData(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Get series genres for these products
      const seriesIds = [...new Set((products || []).filter(p => p.series_id).map(p => p.series_id!))];
      const { data: seriesList } = await supabase
        .from('series')
        .select('id, genre')
        .in('id', seriesIds.length > 0 ? seriesIds : ['none']);

      const seriesGenreMap = new Map((seriesList || []).map(s => [s.id, s.genre || 'Sonstige']));

      // Get episodes for these series to map analytics
      const { data: episodes } = await supabase
        .from('episodes')
        .select('id, series_id')
        .in('series_id', seriesIds.length > 0 ? seriesIds : ['none']);

      const episodeSeriesMap = new Map((episodes || []).map(e => [e.id, e.series_id]));

      // Fetch analytics events
      const { data: events } = await supabase
        .from('analytics_events')
        .select('event_type, product_id, episode_id, revenue_cents')
        .in('product_id', productIds)
        .gte('created_at', startDate);

      // Aggregate by genre
      const genreMap = new Map<string, { impressions: number; clicks: number; conversions: number; revenue: number }>();

      (events || []).forEach(e => {
        let genre = 'Sonstige';
        if (e.episode_id) {
          const seriesId = episodeSeriesMap.get(e.episode_id);
          if (seriesId) {
            genre = seriesGenreMap.get(seriesId) || 'Sonstige';
          }
        }

        if (!genreMap.has(genre)) {
          genreMap.set(genre, { impressions: 0, clicks: 0, conversions: 0, revenue: 0 });
        }

        const g = genreMap.get(genre)!;
        if (e.event_type === 'hotspot_impression') g.impressions++;
        else if (e.event_type === 'hotspot_click') g.clicks++;
        else if (e.event_type === 'purchase') {
          g.conversions++;
          g.revenue += e.revenue_cents || 0;
        }
      });

      const genres: GenrePerformance[] = Array.from(genreMap.entries())
        .map(([genre, stats]) => ({
          genre,
          ...stats,
          ctr: stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0,
          conversionRate: stats.clicks > 0 ? (stats.conversions / stats.clicks) * 100 : 0,
          avgOrderValue: stats.conversions > 0 ? stats.revenue / stats.conversions : 0,
        }))
        .sort((a, b) => b.conversionRate - a.conversionRate);

      const bestGenre = genres.length > 0 ? genres[0].genre : null;
      const worstGenre = genres.length > 1 ? genres[genres.length - 1].genre : null;

      let recommendation: string | null = null;
      if (bestGenre && genres[0].conversionRate > 0) {
        const bestCR = genres[0].conversionRate;
        const avgCR = genres.reduce((s, g) => s + g.conversionRate, 0) / genres.length;
        if (bestCR > avgCR * 1.3) {
          recommendation = `Deine Produkte performen ${Math.round(((bestCR / avgCR) - 1) * 100)}% besser in "${bestGenre}" als im Durchschnitt. Fokussiere Creator-Partnerschaften in diesem Genre.`;
        }
      }

      setData({ genres, bestGenre, worstGenre, recommendation, isLoading: false });
    } catch (err) {
      console.error('Error fetching genre performance:', err);
      setData(prev => ({ ...prev, isLoading: false }));
    }
  }, [brandId, companyName, timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return data;
}
