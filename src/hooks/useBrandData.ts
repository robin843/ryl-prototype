import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type TimeRange = '7d' | '30d' | 'all';

export interface BrandAccount {
  id: string;
  user_id: string;
  company_name: string;
  logo_url: string | null;
  website_url: string | null;
  industry: string | null;
  contact_email: string | null;
  status: string;
  verified_at: string | null;
  created_at: string;
}

export interface BrandProduct {
  id: string;
  brand_id: string;
  product_id: string;
  campaign_name: string | null;
  cpc_rate_cents: number;
  cpa_rate_cents: number;
  revenue_share_percent: number;
  budget_cents: number | null;
  spent_cents: number;
  status: string;
  starts_at: string | null;
  ends_at: string | null;
  product?: {
    id: string;
    name: string;
    brand_name: string;
    image_url: string | null;
    price_cents: number;
  };
}

export interface CreatorPartnership {
  id: string;
  brand_id: string;
  creator_id: string;
  status: string;
  commission_rate_percent: number;
  total_revenue_cents: number;
  total_clicks: number;
  total_conversions: number;
  creator?: {
    display_name: string | null;
    avatar_url: string | null;
    company_name: string | null;
  };
}

export interface BrandAnalytics {
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  totalSpent: number;
  averageCTR: number;
  averageConversionRate: number;
  roi: number;
}

export interface ProductPerformance {
  productId: string;
  productName: string;
  imageUrl: string | null;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  conversionRate: number;
}

export interface CreatorPerformance {
  creatorId: string;
  displayName: string;
  avatarUrl: string | null;
  clicks: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
}

export function useBrandData() {
  const { user } = useAuth();
  const [brandAccount, setBrandAccount] = useState<BrandAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setBrandAccount(null);
      setIsLoading(false);
      return;
    }

    const fetchBrandAccount = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('brand_accounts')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (fetchError) throw fetchError;
        setBrandAccount(data);
      } catch (err) {
        console.error('Error fetching brand account:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch brand account');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrandAccount();
  }, [user?.id]);

  return { brandAccount, isLoading, error };
}

export function useBrandAnalytics(brandId: string | undefined, timeRange: TimeRange) {
  const [data, setData] = useState<{
    analytics: BrandAnalytics;
    products: ProductPerformance[];
    creators: CreatorPerformance[];
    isLoading: boolean;
    error: string | null;
  }>({
    analytics: {
      totalImpressions: 0,
      totalClicks: 0,
      totalConversions: 0,
      totalRevenue: 0,
      totalSpent: 0,
      averageCTR: 0,
      averageConversionRate: 0,
      roi: 0,
    },
    products: [],
    creators: [],
    isLoading: true,
    error: null,
  });

  const fetchAnalytics = useCallback(async () => {
    if (!brandId) {
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      // Calculate date range
      const now = new Date();
      let startDate: Date;
      
      switch (timeRange) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date('2020-01-01');
      }

      // Fetch brand products
      const { data: brandProducts, error: productsError } = await supabase
        .from('brand_products')
        .select(`
          id,
          product_id,
          campaign_name,
          cpc_rate_cents,
          cpa_rate_cents,
          spent_cents,
          status
        `)
        .eq('brand_id', brandId);

      if (productsError) throw productsError;

      const productIds = brandProducts?.map(bp => bp.product_id) || [];

      if (productIds.length === 0) {
        setData({
          analytics: {
            totalImpressions: 0,
            totalClicks: 0,
            totalConversions: 0,
            totalRevenue: 0,
            totalSpent: 0,
            averageCTR: 0,
            averageConversionRate: 0,
            roi: 0,
          },
          products: [],
          creators: [],
          isLoading: false,
          error: null,
        });
        return;
      }

      // Fetch product details
      const { data: products } = await supabase
        .from('shopable_products')
        .select('id, name, image_url, creator_id')
        .in('id', productIds);

      // Fetch analytics events for these products
      const { data: events } = await supabase
        .from('analytics_events')
        .select('*')
        .in('product_id', productIds)
        .gte('created_at', startDate.toISOString());

      // Aggregate analytics
      const impressions = events?.filter(e => e.event_type === 'hotspot_impression').length || 0;
      const clicks = events?.filter(e => e.event_type === 'hotspot_click').length || 0;
      const purchases = events?.filter(e => e.event_type === 'purchase') || [];
      const conversions = purchases.length;
      const revenue = purchases.reduce((sum, e) => sum + (e.revenue_cents || 0), 0);
      const spent = brandProducts?.reduce((sum, bp) => sum + (bp.spent_cents || 0), 0) || 0;

      // Calculate metrics
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
      const roi = spent > 0 ? ((revenue - spent) / spent) * 100 : 0;

      // Product performance
      const productPerformance: ProductPerformance[] = (products || []).map(product => {
        const productEvents = events?.filter(e => e.product_id === product.id) || [];
        const pImpressions = productEvents.filter(e => e.event_type === 'hotspot_impression').length;
        const pClicks = productEvents.filter(e => e.event_type === 'hotspot_click').length;
        const pPurchases = productEvents.filter(e => e.event_type === 'purchase');
        const pConversions = pPurchases.length;
        const pRevenue = pPurchases.reduce((sum, e) => sum + (e.revenue_cents || 0), 0);

        return {
          productId: product.id,
          productName: product.name,
          imageUrl: product.image_url,
          impressions: pImpressions,
          clicks: pClicks,
          conversions: pConversions,
          revenue: pRevenue,
          ctr: pImpressions > 0 ? (pClicks / pImpressions) * 100 : 0,
          conversionRate: pClicks > 0 ? (pConversions / pClicks) * 100 : 0,
        };
      }).sort((a, b) => b.revenue - a.revenue);

      // Creator performance
      const creatorMap = new Map<string, CreatorPerformance>();
      (products || []).forEach(product => {
        const productEvents = events?.filter(e => e.product_id === product.id) || [];
        const cClicks = productEvents.filter(e => e.event_type === 'hotspot_click').length;
        const cPurchases = productEvents.filter(e => e.event_type === 'purchase');
        const cConversions = cPurchases.length;
        const cRevenue = cPurchases.reduce((sum, e) => sum + (e.revenue_cents || 0), 0);

        const existing = creatorMap.get(product.creator_id);
        if (existing) {
          existing.clicks += cClicks;
          existing.conversions += cConversions;
          existing.revenue += cRevenue;
        } else {
          creatorMap.set(product.creator_id, {
            creatorId: product.creator_id,
            displayName: 'Creator',
            avatarUrl: null,
            clicks: cClicks,
            conversions: cConversions,
            revenue: cRevenue,
            conversionRate: 0,
          });
        }
      });

      // Fetch creator profiles
      const creatorIds = Array.from(creatorMap.keys());
      if (creatorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('public_profiles')
          .select('user_id, display_name, avatar_url')
          .in('user_id', creatorIds);

        profiles?.forEach(profile => {
          const creator = creatorMap.get(profile.user_id!);
          if (creator) {
            creator.displayName = profile.display_name || 'Creator';
            creator.avatarUrl = profile.avatar_url;
            creator.conversionRate = creator.clicks > 0 ? (creator.conversions / creator.clicks) * 100 : 0;
          }
        });
      }

      setData({
        analytics: {
          totalImpressions: impressions,
          totalClicks: clicks,
          totalConversions: conversions,
          totalRevenue: revenue,
          totalSpent: spent,
          averageCTR: ctr,
          averageConversionRate: conversionRate,
          roi,
        },
        products: productPerformance,
        creators: Array.from(creatorMap.values()).sort((a, b) => b.revenue - a.revenue),
        isLoading: false,
        error: null,
      });
    } catch (err) {
      console.error('Error fetching brand analytics:', err);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch analytics',
      }));
    }
  }, [brandId, timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return data;
}
