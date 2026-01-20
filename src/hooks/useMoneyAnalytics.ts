import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type TimeRange = '7d' | '30d' | 'all';

interface MoneyStats {
  totalRevenueCents: number;
  totalSales: number;
  avgOrderCents: number;
  pendingRevenueCents: number;
}

interface SeriesRevenue {
  id: string;
  title: string;
  revenueCents: number;
  salesCount: number;
  percentage: number;
}

interface ProductRevenue {
  id: string;
  name: string;
  imageUrl: string | null;
  revenueCents: number;
  salesCount: number;
}

interface ConversionFunnel {
  hotspotClicks: number;
  purchases: number;
  conversionRate: number;
}

interface ActionRecommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
  reason: string;
  link?: string;
}

interface MoneyAnalyticsData {
  moneyStats: MoneyStats;
  seriesRevenue: SeriesRevenue[];
  productRevenue: ProductRevenue[];
  funnel: ConversionFunnel;
  recommendations: ActionRecommendation[];
  isLoading: boolean;
  error: string | null;
}

export function useMoneyAnalytics(creatorId: string | undefined, timeRange: TimeRange) {
  const [data, setData] = useState<MoneyAnalyticsData>({
    moneyStats: { totalRevenueCents: 0, totalSales: 0, avgOrderCents: 0, pendingRevenueCents: 0 },
    seriesRevenue: [],
    productRevenue: [],
    funnel: { hotspotClicks: 0, purchases: 0, conversionRate: 0 },
    recommendations: [],
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
      // Calculate date filter
      const startDate = timeRange === '7d' 
        ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        : timeRange === '30d'
        ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        : '1970-01-01';

      // Fetch all creator's products
      const { data: products, error: productsError } = await supabase
        .from('shopable_products')
        .select('id, name, image_url, series_id, price_cents')
        .eq('creator_id', creatorId);

      if (productsError) throw productsError;

      const productIds = products?.map(p => p.id) || [];
      
      if (productIds.length === 0) {
        setData({
          moneyStats: { totalRevenueCents: 0, totalSales: 0, avgOrderCents: 0, pendingRevenueCents: 0 },
          seriesRevenue: [],
          productRevenue: [],
          funnel: { hotspotClicks: 0, purchases: 0, conversionRate: 0 },
          recommendations: generateRecommendations([], [], [], 0),
          isLoading: false,
          error: null,
        });
        return;
      }

      // Fetch series for revenue grouping
      const { data: series } = await supabase
        .from('series')
        .select('id, title')
        .eq('creator_id', creatorId);

      // Fetch completed purchases
      const { data: completedItems } = await supabase
        .from('purchase_items')
        .select(`
          product_id,
          quantity,
          unit_price_cents,
          purchase_intents!inner(status, completed_at, created_at)
        `)
        .in('product_id', productIds)
        .eq('purchase_intents.status', 'completed')
        .gte('purchase_intents.completed_at', startDate);

      // Fetch pending purchases
      const { data: pendingItems } = await supabase
        .from('purchase_items')
        .select(`
          product_id,
          quantity,
          unit_price_cents,
          purchase_intents!inner(status, created_at)
        `)
        .in('product_id', productIds)
        .in('purchase_intents.status', ['created', 'confirmed', 'processing'])
        .gte('purchase_intents.created_at', startDate);

      // Fetch analytics events for funnel
      const { data: analyticsEvents } = await supabase
        .from('analytics_events')
        .select('event_type, product_id')
        .eq('creator_id', creatorId)
        .gte('created_at', startDate);

      // Calculate money stats
      let totalRevenueCents = 0;
      let totalSales = 0;
      const productSalesMap: Record<string, { revenue: number; sales: number }> = {};
      const seriesSalesMap: Record<string, { revenue: number; sales: number }> = {};

      (completedItems || []).forEach(item => {
        const revenue = item.unit_price_cents * item.quantity;
        totalRevenueCents += revenue;
        totalSales += item.quantity;

        // Track by product
        if (!productSalesMap[item.product_id]) {
          productSalesMap[item.product_id] = { revenue: 0, sales: 0 };
        }
        productSalesMap[item.product_id].revenue += revenue;
        productSalesMap[item.product_id].sales += item.quantity;

        // Track by series
        const product = products?.find(p => p.id === item.product_id);
        if (product?.series_id) {
          if (!seriesSalesMap[product.series_id]) {
            seriesSalesMap[product.series_id] = { revenue: 0, sales: 0 };
          }
          seriesSalesMap[product.series_id].revenue += revenue;
          seriesSalesMap[product.series_id].sales += item.quantity;
        }
      });

      // Calculate pending revenue
      let pendingRevenueCents = 0;
      (pendingItems || []).forEach(item => {
        pendingRevenueCents += item.unit_price_cents * item.quantity;
      });

      const avgOrderCents = totalSales > 0 ? Math.round(totalRevenueCents / totalSales) : 0;

      // Build series revenue breakdown
      const seriesRevenue: SeriesRevenue[] = (series || [])
        .map(s => ({
          id: s.id,
          title: s.title,
          revenueCents: seriesSalesMap[s.id]?.revenue || 0,
          salesCount: seriesSalesMap[s.id]?.sales || 0,
          percentage: totalRevenueCents > 0 
            ? Math.round((seriesSalesMap[s.id]?.revenue || 0) / totalRevenueCents * 100)
            : 0,
        }))
        .filter(s => s.revenueCents > 0)
        .sort((a, b) => b.revenueCents - a.revenueCents)
        .slice(0, 3);

      // Build product revenue breakdown
      const productRevenue: ProductRevenue[] = (products || [])
        .map(p => ({
          id: p.id,
          name: p.name,
          imageUrl: p.image_url,
          revenueCents: productSalesMap[p.id]?.revenue || 0,
          salesCount: productSalesMap[p.id]?.sales || 0,
        }))
        .filter(p => p.revenueCents > 0)
        .sort((a, b) => b.revenueCents - a.revenueCents)
        .slice(0, 5);

      // Calculate funnel
      const hotspotClicks = (analyticsEvents || []).filter(e => e.event_type === 'hotspot_click').length;
      const purchaseEvents = (analyticsEvents || []).filter(e => e.event_type === 'purchase').length;
      const conversionRate = hotspotClicks > 0 ? (purchaseEvents / hotspotClicks) * 100 : 0;

      // Generate recommendations
      const recommendations = generateRecommendations(
        series || [],
        products || [],
        productRevenue,
        totalSales
      );

      setData({
        moneyStats: { totalRevenueCents, totalSales, avgOrderCents, pendingRevenueCents },
        seriesRevenue,
        productRevenue,
        funnel: { hotspotClicks, purchases: totalSales, conversionRate },
        recommendations,
        isLoading: false,
        error: null,
      });

    } catch (err) {
      console.error('Error fetching money analytics:', err);
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

function generateRecommendations(
  series: { id: string; title: string }[],
  products: { id: string; name: string; series_id: string | null }[],
  topProducts: ProductRevenue[],
  totalSales: number
): ActionRecommendation[] {
  const recommendations: ActionRecommendation[] = [];

  // If no sales yet, recommend basic actions
  if (totalSales === 0) {
    if (series.length === 0) {
      recommendations.push({
        id: 'create-series',
        priority: 'high',
        action: 'Erste Serie erstellen',
        reason: 'Starte mit deiner ersten Video-Serie',
        link: '/studio',
      });
    } else if (products.length === 0) {
      recommendations.push({
        id: 'add-product',
        priority: 'high',
        action: 'Erstes Produkt hinzufügen',
        reason: 'Füge Produkte hinzu, um Umsatz zu generieren',
        link: '/studio',
      });
    } else {
      recommendations.push({
        id: 'add-hotspots',
        priority: 'high',
        action: 'Hotspots zu Videos hinzufügen',
        reason: 'Verknüpfe Produkte mit deinen Videos',
        link: '/studio',
      });
    }
  }

  // If there are top products, recommend reusing them
  if (topProducts.length > 0) {
    const topProduct = topProducts[0];
    const productInSeries = products.filter(p => p.id === topProduct.id);
    
    if (productInSeries.length === 1 && series.length > 1) {
      recommendations.push({
        id: 'reuse-product',
        priority: 'medium',
        action: `"${topProduct.name}" in andere Serien einbinden`,
        reason: `Verkauft sich gut (${topProduct.salesCount}×) – erhöhe die Reichweite`,
      });
    }
  }

  // If there are series, check for inactive ones
  if (series.length > 0 && recommendations.length < 3) {
    recommendations.push({
      id: 'new-episode',
      priority: 'low',
      action: `Neue Episode für "${series[0].title}" posten`,
      reason: 'Regelmäßiger Content hält deine Käufer aktiv',
      link: '/studio',
    });
  }

  return recommendations.slice(0, 3);
}
