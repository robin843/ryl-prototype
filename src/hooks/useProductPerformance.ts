import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type TimeRange = '7d' | '30d' | 'all';

interface ProductStats {
  id: string;
  name: string;
  brandName: string | null;
  imageUrl: string | null;
  priceCents: number;
  hotspotClicks: number;
  saves: number;
  purchases: number;
  revenueCents: number;
  ctr: number;
  conversionRate: number;
  episodesCount: number;
}

interface ProductComparison {
  bestConverter: ProductStats | null;
  mostClicked: ProductStats | null;
  highestRevenue: ProductStats | null;
  avgConversion: number;
}

interface SaveToConvertStats {
  totalSaves: number;
  savesThatConverted: number;
  conversionRate: number;
  avgDaysToConvert: number;
}

export interface ProductPerformanceData {
  products: ProductStats[];
  comparison: ProductComparison;
  saveToConvert: SaveToConvertStats;
  totalProducts: number;
  productsWithSales: number;
  isLoading: boolean;
  error: string | null;
}

export function useProductPerformance(creatorId: string | undefined, timeRange: TimeRange) {
  const [data, setData] = useState<ProductPerformanceData>({
    products: [],
    comparison: {
      bestConverter: null,
      mostClicked: null,
      highestRevenue: null,
      avgConversion: 0,
    },
    saveToConvert: {
      totalSaves: 0,
      savesThatConverted: 0,
      conversionRate: 0,
      avgDaysToConvert: 0,
    },
    totalProducts: 0,
    productsWithSales: 0,
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

      // Fetch all products
      const { data: products } = await supabase
        .from('shopable_products')
        .select('id, name, brand_name, image_url, price_cents')
        .eq('creator_id', creatorId);

      if (!products || products.length === 0) {
        setData(prev => ({
          ...prev,
          isLoading: false,
        }));
        return;
      }

      const productIds = products.map(p => p.id);

      // Fetch hotspots to count episodes per product
      const { data: hotspots } = await supabase
        .from('episode_hotspots')
        .select('product_id, episode_id')
        .in('product_id', productIds);

      // Count unique episodes per product
      const episodesPerProduct: Record<string, Set<string>> = {};
      (hotspots || []).forEach((h: any) => {
        if (!episodesPerProduct[h.product_id]) {
          episodesPerProduct[h.product_id] = new Set();
        }
        episodesPerProduct[h.product_id].add(h.episode_id);
      });

      // Fetch analytics events
      const { data: analyticsEvents } = await supabase
        .from('analytics_events')
        .select('event_type, product_id, revenue_cents')
        .eq('creator_id', creatorId)
        .in('product_id', productIds)
        .gte('created_at', startDate);

      // Fetch saved products
      const { data: savedProducts } = await supabase
        .from('saved_products')
        .select('product_id, user_id, created_at')
        .in('product_id', productIds);

      // Fetch purchases to track save-to-convert
      const { data: purchaseItems } = await supabase
        .from('purchase_items')
        .select(`
          product_id,
          quantity,
          unit_price_cents,
          purchase_intents!inner(user_id, status, completed_at)
        `)
        .in('product_id', productIds)
        .eq('purchase_intents.status', 'completed')
        .gte('purchase_intents.completed_at', startDate);

      // Group analytics by product
      const productAnalytics: Record<string, {
        clicks: number;
        purchases: number;
        revenue: number;
      }> = {};

      (analyticsEvents || []).forEach((event: any) => {
        if (!event.product_id) return;
        
        if (!productAnalytics[event.product_id]) {
          productAnalytics[event.product_id] = { clicks: 0, purchases: 0, revenue: 0 };
        }

        if (event.event_type === 'hotspot_click') {
          productAnalytics[event.product_id].clicks++;
        } else if (event.event_type === 'purchase') {
          productAnalytics[event.product_id].purchases++;
          productAnalytics[event.product_id].revenue += event.revenue_cents || 0;
        }
      });

      // Count saves per product
      const savesPerProduct: Record<string, number> = {};
      (savedProducts || []).forEach((s: any) => {
        savesPerProduct[s.product_id] = (savesPerProduct[s.product_id] || 0) + 1;
      });

      // Build product stats
      const productStats: ProductStats[] = products.map(p => {
        const analytics = productAnalytics[p.id] || { clicks: 0, purchases: 0, revenue: 0 };
        const saves = savesPerProduct[p.id] || 0;
        const ctr = analytics.clicks > 0 ? 100 : 0; // We track clicks as views for products
        const conversionRate = analytics.clicks > 0 
          ? (analytics.purchases / analytics.clicks) * 100 
          : 0;

        return {
          id: p.id,
          name: p.name,
          brandName: p.brand_name,
          imageUrl: p.image_url,
          priceCents: p.price_cents,
          hotspotClicks: analytics.clicks,
          saves,
          purchases: analytics.purchases,
          revenueCents: analytics.revenue,
          ctr,
          conversionRate,
          episodesCount: episodesPerProduct[p.id]?.size || 0,
        };
      });

      // Sort by revenue
      productStats.sort((a, b) => b.revenueCents - a.revenueCents);

      // Find best performers
      const sortedByConversion = [...productStats]
        .filter(p => p.hotspotClicks > 0)
        .sort((a, b) => b.conversionRate - a.conversionRate);

      const sortedByClicks = [...productStats].sort((a, b) => b.hotspotClicks - a.hotspotClicks);

      // Calculate save-to-convert stats
      const purchaseUserProducts = new Map<string, Date>();
      (purchaseItems || []).forEach((item: any) => {
        const key = `${item.purchase_intents.user_id}:${item.product_id}`;
        purchaseUserProducts.set(key, new Date(item.purchase_intents.completed_at));
      });

      let savesThatConverted = 0;
      let totalDaysToConvert = 0;

      (savedProducts || []).forEach((save: any) => {
        const key = `${save.user_id}:${save.product_id}`;
        const purchaseDate = purchaseUserProducts.get(key);
        if (purchaseDate) {
          savesThatConverted++;
          const saveDate = new Date(save.created_at);
          const daysDiff = Math.ceil((purchaseDate.getTime() - saveDate.getTime()) / (1000 * 60 * 60 * 24));
          totalDaysToConvert += Math.max(0, daysDiff);
        }
      });

      const saveToConvert: SaveToConvertStats = {
        totalSaves: (savedProducts || []).length,
        savesThatConverted,
        conversionRate: (savedProducts || []).length > 0 
          ? (savesThatConverted / (savedProducts || []).length) * 100
          : 0,
        avgDaysToConvert: savesThatConverted > 0 
          ? Math.round(totalDaysToConvert / savesThatConverted)
          : 0,
      };

      const avgConversion = sortedByConversion.length > 0
        ? sortedByConversion.reduce((sum, p) => sum + p.conversionRate, 0) / sortedByConversion.length
        : 0;

      setData({
        products: productStats,
        comparison: {
          bestConverter: sortedByConversion[0] || null,
          mostClicked: sortedByClicks[0] || null,
          highestRevenue: productStats[0] || null,
          avgConversion,
        },
        saveToConvert,
        totalProducts: products.length,
        productsWithSales: productStats.filter(p => p.purchases > 0).length,
        isLoading: false,
        error: null,
      });

    } catch (err) {
      console.error('Error fetching product performance:', err);
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
