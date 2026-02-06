import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { TimeRange } from '@/hooks/useBrandData';

export interface AttributionBreakdown {
  directClick: { count: number; revenue: number };
  viewThrough: { count: number; revenue: number };
  assisted: { count: number; revenue: number };
}

export interface FunnelStep {
  label: string;
  count: number;
  rate: number;
}

export interface AttributionData {
  breakdown: AttributionBreakdown;
  funnel: FunnelStep[];
  avgTimeToPurchase: number; // seconds
  costPerEngagedViewer: number; // cents
  isLoading: boolean;
}

export function useBrandAttribution(
  brandId: string | undefined,
  companyName: string | undefined,
  timeRange: TimeRange,
  totalSpent: number
): AttributionData {
  const [data, setData] = useState<AttributionData>({
    breakdown: {
      directClick: { count: 0, revenue: 0 },
      viewThrough: { count: 0, revenue: 0 },
      assisted: { count: 0, revenue: 0 },
    },
    funnel: [],
    avgTimeToPurchase: 0,
    costPerEngagedViewer: 0,
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
        .select('id')
        .ilike('brand_name', companyName);

      const productIds = products?.map(p => p.id) || [];
      if (productIds.length === 0) {
        setData(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Fetch attribution events
      const { data: attrEvents } = await supabase
        .from('brand_attribution_events')
        .select('*')
        .eq('brand_id', brandId)
        .gte('created_at', startDate);

      // Fetch analytics events for funnel
      const { data: events } = await supabase
        .from('analytics_events')
        .select('event_type, product_id, revenue_cents')
        .in('product_id', productIds)
        .gte('created_at', startDate);

      // Attribution breakdown
      const breakdown: AttributionBreakdown = {
        directClick: { count: 0, revenue: 0 },
        viewThrough: { count: 0, revenue: 0 },
        assisted: { count: 0, revenue: 0 },
      };

      let totalTimeToPurchase = 0;
      let purchaseCount = 0;

      (attrEvents || []).forEach(e => {
        const type = e.attribution_type as keyof AttributionBreakdown;
        if (breakdown[type]) {
          breakdown[type].count++;
          breakdown[type].revenue += e.revenue_cents || 0;
        }
        if (e.time_to_purchase_seconds) {
          totalTimeToPurchase += e.time_to_purchase_seconds;
          purchaseCount++;
        }
      });

      // Build funnel from analytics events
      const funnelTypes = [
        { type: 'hotspot_impression', label: 'Impressionen' },
        { type: 'hotspot_click', label: 'Hotspot-Klicks' },
        { type: 'product_panel_open', label: 'Produkt angesehen' },
        { type: 'mock_checkout_attempt', label: 'Checkout gestartet' },
        { type: 'purchase', label: 'Kauf abgeschlossen' },
      ];

      const funnelCounts = funnelTypes.map(
        ft => (events || []).filter(e => e.event_type === ft.type).length
      );

      const funnel: FunnelStep[] = funnelCounts.map((count, i) => ({
        label: funnelTypes[i].label,
        count,
        rate: i === 0 ? 100 : funnelCounts[i - 1] > 0 ? (count / funnelCounts[i - 1]) * 100 : 0,
      }));

      // Cost per engaged viewer (viewers who clicked a hotspot)
      const engagedViewers = funnelCounts[1] || 0; // hotspot clicks
      const costPerEngagedViewer = engagedViewers > 0 ? totalSpent / engagedViewers : 0;

      setData({
        breakdown,
        funnel,
        avgTimeToPurchase: purchaseCount > 0 ? totalTimeToPurchase / purchaseCount : 0,
        costPerEngagedViewer,
        isLoading: false,
      });
    } catch (err) {
      console.error('Error fetching brand attribution:', err);
      setData(prev => ({ ...prev, isLoading: false }));
    }
  }, [brandId, companyName, timeRange, totalSpent]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return data;
}
