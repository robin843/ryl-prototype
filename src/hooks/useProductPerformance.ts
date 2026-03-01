import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProductPerformanceItem {
  id: string;
  name: string;
  brandName: string;
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

export interface ProductPerformanceData {
  isLoading: boolean;
  error: Error | null;
  totalProducts: number;
  productsWithSales: number;
  comparison: {
    avgConversion: number;
    bestConverter: ProductPerformanceItem | null;
    mostClicked: ProductPerformanceItem | null;
    highestRevenue: ProductPerformanceItem | null;
  };
  saveToConvert: {
    totalSaves: number;
    savesThatConverted: number;
    conversionRate: number;
    avgDaysToConvert: number;
  };
  products: ProductPerformanceItem[];
}

const emptyData: ProductPerformanceData = {
  isLoading: false,
  error: null,
  totalProducts: 0,
  productsWithSales: 0,
  comparison: {
    avgConversion: 0,
    bestConverter: null,
    mostClicked: null,
    highestRevenue: null,
  },
  saveToConvert: {
    totalSaves: 0,
    savesThatConverted: 0,
    conversionRate: 0,
    avgDaysToConvert: 0,
  },
  products: [],
};

export function useProductPerformance(
  creatorId: string | undefined,
  timeRange: string = '30d'
): ProductPerformanceData {
  const { data, isLoading, error } = useQuery({
    queryKey: ['product-performance', creatorId, timeRange],
    queryFn: async () => {
      if (!creatorId) return emptyData;

      // Fetch products
      const { data: products, error: prodErr } = await supabase
        .from('shopable_products')
        .select('*')
        .eq('creator_id', creatorId);

      if (prodErr) throw prodErr;
      if (!products || products.length === 0) return emptyData;

      const productIds = products.map((p) => p.id);

      // Fetch hotspot clicks per product
      const { data: clicks } = await supabase
        .from('hotspot_clicks')
        .select('product_id')
        .eq('creator_id', creatorId)
        .in('product_id', productIds);

      // Fetch saves per product
      const { data: saves } = await supabase
        .from('saved_products')
        .select('product_id')
        .in('product_id', productIds);

      // Fetch purchases per product (only completed purchases)
      const { data: purchaseItems } = await supabase
        .from('purchase_items')
        .select('product_id, unit_price_cents, quantity, purchase_intents!inner(status)')
        .in('product_id', productIds)
        .eq('purchase_intents.status', 'completed');

      // Fetch episode hotspots to count episodes per product
      const { data: hotspots } = await supabase
        .from('episode_hotspots')
        .select('product_id, episode_id')
        .in('product_id', productIds);

      // Aggregate
      const clicksMap = new Map<string, number>();
      clicks?.forEach((c) => {
        clicksMap.set(c.product_id!, (clicksMap.get(c.product_id!) || 0) + 1);
      });

      const savesMap = new Map<string, number>();
      saves?.forEach((s) => {
        savesMap.set(s.product_id, (savesMap.get(s.product_id) || 0) + 1);
      });

      const purchasesMap = new Map<string, { count: number; revenue: number }>();
      purchaseItems?.forEach((pi) => {
        const prev = purchasesMap.get(pi.product_id) || { count: 0, revenue: 0 };
        purchasesMap.set(pi.product_id, {
          count: prev.count + pi.quantity,
          revenue: prev.revenue + pi.unit_price_cents * pi.quantity,
        });
      });

      const episodesMap = new Map<string, Set<string>>();
      hotspots?.forEach((h) => {
        if (!episodesMap.has(h.product_id)) episodesMap.set(h.product_id, new Set());
        episodesMap.get(h.product_id)!.add(h.episode_id);
      });

      const items: ProductPerformanceItem[] = products.map((p) => {
        const hClicks = clicksMap.get(p.id) || 0;
        const pSaves = savesMap.get(p.id) || 0;
        const purch = purchasesMap.get(p.id) || { count: 0, revenue: 0 };
        const epCount = episodesMap.get(p.id)?.size || 0;
        const convRate = hClicks > 0 ? (purch.count / hClicks) * 100 : 0;

        return {
          id: p.id,
          name: p.name,
          brandName: p.brand_name,
          imageUrl: p.image_url,
          priceCents: p.price_cents,
          hotspotClicks: hClicks,
          saves: pSaves,
          purchases: purch.count,
          revenueCents: purch.revenue,
          ctr: 0,
          conversionRate: convRate,
          episodesCount: epCount,
        };
      });

      items.sort((a, b) => b.revenueCents - a.revenueCents);

      const withSales = items.filter((i) => i.purchases > 0);
      const totalClicks = items.reduce((s, i) => s + i.hotspotClicks, 0);
      const totalPurchases = items.reduce((s, i) => s + i.purchases, 0);
      const avgConversion = totalClicks > 0 ? (totalPurchases / totalClicks) * 100 : 0;

      const bestConverter = [...items].sort((a, b) => b.conversionRate - a.conversionRate)[0] || null;
      const mostClicked = [...items].sort((a, b) => b.hotspotClicks - a.hotspotClicks)[0] || null;
      const highestRevenue = items[0] || null;

      const totalSaves = items.reduce((s, i) => s + i.saves, 0);

      return {
        ...emptyData,
        totalProducts: items.length,
        productsWithSales: withSales.length,
        comparison: { avgConversion, bestConverter, mostClicked, highestRevenue },
        saveToConvert: {
          totalSaves,
          savesThatConverted: 0,
          conversionRate: 0,
          avgDaysToConvert: 0,
        },
        products: items,
      };
    },
    enabled: !!creatorId,
  });

  return {
    ...(data || emptyData),
    isLoading,
    error: error as Error | null,
  };
}
