import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type TimeRange = '7d' | '30d' | 'all';

interface PurchaseTimePattern {
  hour: number;
  count: number;
  revenue: number;
}

interface DayOfWeekPattern {
  day: number; // 0-6 (Sunday-Saturday)
  count: number;
  revenue: number;
}

interface CategoryPerformance {
  category: string;
  revenue: number;
  count: number;
  percentage: number;
}

interface BuyerSegment {
  id: string;
  label: string;
  description: string;
  count: number;
  percentage: number;
  revenueCents: number;
  revenuePercentage: number;
}

interface SaveVsPurchaseStats {
  savedThenPurchased: number;
  directPurchases: number;
  savedThenPurchasedRevenue: number;
  directRevenue: number;
  saveConversionRate: number;
}

interface AudienceInsight {
  id: string;
  icon: 'clock' | 'calendar' | 'target' | 'trending' | 'save' | 'users';
  title: string;
  description: string;
  action?: string;
}

export interface AudienceInsightsData {
  hourlyPattern: PurchaseTimePattern[];
  weekdayPattern: DayOfWeekPattern[];
  categoryPerformance: CategoryPerformance[];
  buyerSegments: BuyerSegment[];
  saveVsPurchase: SaveVsPurchaseStats;
  insights: AudienceInsight[];
  avgBasketCents: number;
  repeatBuyerRate: number;
  isLoading: boolean;
  error: string | null;
}

export function useAudienceInsights(creatorId: string | undefined, timeRange: TimeRange) {
  const [data, setData] = useState<AudienceInsightsData>({
    hourlyPattern: [],
    weekdayPattern: [],
    categoryPerformance: [],
    buyerSegments: [],
    saveVsPurchase: {
      savedThenPurchased: 0,
      directPurchases: 0,
      savedThenPurchasedRevenue: 0,
      directRevenue: 0,
      saveConversionRate: 0,
    },
    insights: [],
    avgBasketCents: 0,
    repeatBuyerRate: 0,
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

      // Fetch products for category grouping
      const { data: products } = await supabase
        .from('shopable_products')
        .select('id, name, brand_name, price_cents')
        .eq('creator_id', creatorId);

      const productIds = products?.map(p => p.id) || [];

      if (productIds.length === 0) {
        setData(prev => ({
          ...prev,
          isLoading: false,
          insights: generateInsightsFromEmpty(),
        }));
        return;
      }

      // Fetch completed purchases with timestamps
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

      // Fetch saved products that later became purchases
      const { data: savedProducts } = await supabase
        .from('saved_products')
        .select('user_id, product_id, created_at')
        .in('product_id', productIds);

      // Fetch analytics for clicks
      const { data: analyticsEvents } = await supabase
        .from('analytics_events')
        .select('event_type, user_id, product_id, created_at')
        .eq('creator_id', creatorId)
        .gte('created_at', startDate);

      // Calculate hourly patterns
      const hourlyMap: Record<number, { count: number; revenue: number }> = {};
      const weekdayMap: Record<number, { count: number; revenue: number }> = {};
      const buyerPurchases: Record<string, { count: number; revenue: number }> = {};
      const brandRevenue: Record<string, { revenue: number; count: number }> = {};

      let totalRevenue = 0;
      let totalPurchases = 0;

      (purchaseItems || []).forEach((item: any) => {
        const completedAt = new Date(item.purchase_intents.completed_at);
        const hour = completedAt.getHours();
        const day = completedAt.getDay();
        const userId = item.purchase_intents.user_id;
        const revenue = item.unit_price_cents * item.quantity;

        totalRevenue += revenue;
        totalPurchases += item.quantity;

        // Hourly pattern
        if (!hourlyMap[hour]) hourlyMap[hour] = { count: 0, revenue: 0 };
        hourlyMap[hour].count += item.quantity;
        hourlyMap[hour].revenue += revenue;

        // Weekday pattern
        if (!weekdayMap[day]) weekdayMap[day] = { count: 0, revenue: 0 };
        weekdayMap[day].count += item.quantity;
        weekdayMap[day].revenue += revenue;

        // Buyer tracking
        if (userId) {
          if (!buyerPurchases[userId]) buyerPurchases[userId] = { count: 0, revenue: 0 };
          buyerPurchases[userId].count += item.quantity;
          buyerPurchases[userId].revenue += revenue;
        }

        // Brand/category tracking
        const product = products?.find(p => p.id === item.product_id);
        const brand = product?.brand_name || 'Sonstige';
        if (!brandRevenue[brand]) brandRevenue[brand] = { revenue: 0, count: 0 };
        brandRevenue[brand].revenue += revenue;
        brandRevenue[brand].count += item.quantity;
      });

      // Convert hourly pattern
      const hourlyPattern: PurchaseTimePattern[] = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        count: hourlyMap[hour]?.count || 0,
        revenue: hourlyMap[hour]?.revenue || 0,
      }));

      // Convert weekday pattern
      const weekdayPattern: DayOfWeekPattern[] = Array.from({ length: 7 }, (_, day) => ({
        day,
        count: weekdayMap[day]?.count || 0,
        revenue: weekdayMap[day]?.revenue || 0,
      }));

      // Category performance
      const categoryPerformance: CategoryPerformance[] = Object.entries(brandRevenue)
        .map(([category, stats]) => ({
          category,
          revenue: stats.revenue,
          count: stats.count,
          percentage: totalRevenue > 0 ? Math.round((stats.revenue / totalRevenue) * 100) : 0,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Buyer segments
      const buyers = Object.entries(buyerPurchases);
      const totalBuyers = buyers.length;
      
      const repeatBuyers = buyers.filter(([_, stats]) => stats.count >= 2);
      const premiumBuyers = buyers.filter(([_, stats]) => stats.revenue >= 5000); // > 50€
      
      const buyerSegments: BuyerSegment[] = [];
      
      if (totalBuyers > 0) {
        buyerSegments.push({
          id: 'repeat',
          label: 'Wiederkäufer',
          description: 'Haben mehr als 1× gekauft',
          count: repeatBuyers.length,
          percentage: Math.round((repeatBuyers.length / totalBuyers) * 100),
          revenueCents: repeatBuyers.reduce((sum, [_, s]) => sum + s.revenue, 0),
          revenuePercentage: Math.round((repeatBuyers.reduce((sum, [_, s]) => sum + s.revenue, 0) / totalRevenue) * 100) || 0,
        });

        buyerSegments.push({
          id: 'premium',
          label: 'Premium-Käufer',
          description: 'Mehr als 50€ ausgegeben',
          count: premiumBuyers.length,
          percentage: Math.round((premiumBuyers.length / totalBuyers) * 100),
          revenueCents: premiumBuyers.reduce((sum, [_, s]) => sum + s.revenue, 0),
          revenuePercentage: Math.round((premiumBuyers.reduce((sum, [_, s]) => sum + s.revenue, 0) / totalRevenue) * 100) || 0,
        });
      }

      // Save vs. direct purchase analysis
      const purchaseUserProducts = new Set<string>();
      (purchaseItems || []).forEach((item: any) => {
        purchaseUserProducts.add(`${item.purchase_intents.user_id}:${item.product_id}`);
      });

      const savedBeforePurchase = (savedProducts || []).filter((save: any) => {
        return purchaseUserProducts.has(`${save.user_id}:${save.product_id}`);
      });

      const savedRevenue = savedBeforePurchase.reduce((sum: number, save: any) => {
        const item = (purchaseItems || []).find((p: any) => 
          p.purchase_intents.user_id === save.user_id && p.product_id === save.product_id
        );
        return sum + (item ? item.unit_price_cents * item.quantity : 0);
      }, 0);

      const saveVsPurchase: SaveVsPurchaseStats = {
        savedThenPurchased: savedBeforePurchase.length,
        directPurchases: totalPurchases - savedBeforePurchase.length,
        savedThenPurchasedRevenue: savedRevenue,
        directRevenue: totalRevenue - savedRevenue,
        saveConversionRate: (savedProducts || []).length > 0 
          ? Math.round((savedBeforePurchase.length / (savedProducts || []).length) * 100)
          : 0,
      };

      // Generate insights
      const insights = generateInsights(
        hourlyPattern,
        weekdayPattern,
        categoryPerformance,
        buyerSegments,
        saveVsPurchase,
        totalBuyers,
        totalPurchases
      );

      const avgBasketCents = totalBuyers > 0 ? Math.round(totalRevenue / totalBuyers) : 0;
      const repeatBuyerRate = totalBuyers > 0 ? Math.round((repeatBuyers.length / totalBuyers) * 100) : 0;

      setData({
        hourlyPattern,
        weekdayPattern,
        categoryPerformance,
        buyerSegments,
        saveVsPurchase,
        insights,
        avgBasketCents,
        repeatBuyerRate,
        isLoading: false,
        error: null,
      });

    } catch (err) {
      console.error('Error fetching audience insights:', err);
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

function generateInsightsFromEmpty(): AudienceInsight[] {
  return [
    {
      id: 'no-data',
      icon: 'target',
      title: 'Noch keine Kaufdaten',
      description: 'Sobald Käufe eingehen, erscheinen hier Muster und Empfehlungen.',
    },
  ];
}

function generateInsights(
  hourly: PurchaseTimePattern[],
  weekly: DayOfWeekPattern[],
  categories: CategoryPerformance[],
  segments: BuyerSegment[],
  saveStats: SaveVsPurchaseStats,
  totalBuyers: number,
  totalPurchases: number
): AudienceInsight[] {
  const insights: AudienceInsight[] = [];

  // Find peak hours
  const peakHours = hourly
    .filter(h => h.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 2);

  if (peakHours.length >= 1) {
    const startHour = peakHours[0].hour;
    const endHour = startHour + 3;
    insights.push({
      id: 'peak-time',
      icon: 'clock',
      title: `Käufe passieren ${startHour}–${endHour} Uhr`,
      description: `Die meisten Verkäufe entstehen am späten Abend.`,
      action: `Veröffentliche neue Episoden vor ${startHour} Uhr für maximale Conversion.`,
    });
  }

  // Weekend vs. weekday
  const weekendSales = weekly.filter(d => d.day === 0 || d.day === 6).reduce((sum, d) => sum + d.count, 0);
  const weekdaySales = weekly.filter(d => d.day >= 1 && d.day <= 5).reduce((sum, d) => sum + d.count, 0);
  
  if (weekendSales > weekdaySales * 0.5) {
    insights.push({
      id: 'weekend-boost',
      icon: 'calendar',
      title: 'Wochenenden performen stark',
      description: `${Math.round((weekendSales / (weekendSales + weekdaySales)) * 100)}% der Käufe passieren am Wochenende.`,
      action: 'Plane wichtige Launches für Freitag oder Samstag.',
    });
  }

  // Category dominance
  if (categories.length >= 2 && categories[0].percentage >= 50) {
    const topCategory = categories[0];
    const secondCategory = categories[1];
    const ratio = Math.round(topCategory.count / Math.max(secondCategory.count, 1));
    
    insights.push({
      id: 'category-focus',
      icon: 'trending',
      title: `${topCategory.category} dominiert`,
      description: `${ratio}× mehr Verkäufe als ${secondCategory.category}.`,
      action: `Erwäge, mehr ${topCategory.category}-Produkte in kommende Episoden zu integrieren.`,
    });
  }

  // Save conversion insight
  if (saveStats.savedThenPurchased > 0 && saveStats.saveConversionRate > 0) {
    const savePercentage = Math.round((saveStats.savedThenPurchasedRevenue / 
      (saveStats.savedThenPurchasedRevenue + saveStats.directRevenue)) * 100);
    
    if (savePercentage >= 30) {
      insights.push({
        id: 'save-converts',
        icon: 'save',
        title: 'Gespeicherte Produkte konvertieren besser',
        description: `${savePercentage}% des Umsatzes kommt von vorher gespeicherten Produkten.`,
        action: 'Ermutige deine Audience, interessante Produkte zu speichern.',
      });
    }
  }

  // Premium buyers insight
  const premiumSegment = segments.find(s => s.id === 'premium');
  if (premiumSegment && premiumSegment.percentage > 0 && premiumSegment.revenuePercentage >= 50) {
    insights.push({
      id: 'premium-audience',
      icon: 'users',
      title: 'Premium-Käufer treiben den Umsatz',
      description: `${premiumSegment.percentage}% der Käufer machen ${premiumSegment.revenuePercentage}% des Umsatzes.`,
      action: 'Teste höherpreisige Produkte für deine Top-Käufer.',
    });
  }

  return insights.slice(0, 4);
}
