import type {
  BrandAnalytics,
  CreatorPerformance,
  ProductPerformance,
} from "@/hooks/useBrandData";
import {
  fakeBrandAnalytics as base,
  fakeBrandBudget,
  fakeBrandCreators,
  fakeBrandProducts,
  fakeBrandTrendData,
} from "@/components/brand/tutorial/fakeBrandTutorialData";

export interface BrandDashboardDemoData {
  analytics: BrandAnalytics;
  products: ProductPerformance[];
  creators: CreatorPerformance[];
  trendData: Array<{ date: string; spend: number; revenue: number }>;
  budgetCents: number;
}

function safePercent(numerator: number, denominator: number) {
  if (!denominator) return 0;
  return (numerator / denominator) * 100;
}

export function getBrandDashboardDemoData(
  commissionRatePercent: number,
): BrandDashboardDemoData {
  const totalRevenue = base.totalRevenue; // cents
  const totalImpressions = base.impressions;
  const totalClicks = base.clicks;
  const totalConversions = base.conversions;

  // Keep demo consistent with the account's commission rate.
  const totalSpent = Math.max(
    1,
    Math.round((totalRevenue * commissionRatePercent) / 100),
  );

  const averageCTR = safePercent(totalClicks, totalImpressions);
  const averageConversionRate = safePercent(totalConversions, totalClicks);
  const roi = totalSpent > 0 ? ((totalRevenue - totalSpent) / totalSpent) * 100 : 0;

  const products: ProductPerformance[] = fakeBrandProducts
    .map((p) => ({
      productId: p.id,
      productName: p.name,
      imageUrl: p.imageUrl,
      impressions: p.impressions,
      clicks: p.clicks,
      conversions: p.conversions,
      revenue: p.revenueCents,
      ctr: safePercent(p.clicks, p.impressions),
      conversionRate: safePercent(p.conversions, p.clicks),
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const creators: CreatorPerformance[] = fakeBrandCreators
    .map((c) => ({
      creatorId: c.id,
      displayName: c.name,
      avatarUrl: c.avatarUrl,
      clicks: c.clicks,
      conversions: c.conversions,
      revenue: c.revenueCents,
      conversionRate: safePercent(c.conversions, c.clicks),
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Trend chart uses EUR (not cents). Scale the base trend data to match our totals.
  const sumSpend = fakeBrandTrendData.reduce((s, d) => s + d.spend, 0);
  const sumRevenue = fakeBrandTrendData.reduce((s, d) => s + d.revenue, 0);
  const desiredSpend = Math.round(totalSpent / 100);
  const desiredRevenue = Math.round(totalRevenue / 100);
  const spendScale = sumSpend > 0 ? desiredSpend / sumSpend : 1;
  const revenueScale = sumRevenue > 0 ? desiredRevenue / sumRevenue : 1;

  const trendData = fakeBrandTrendData.map((d) => ({
    date: d.date,
    spend: Math.max(0, Math.round(d.spend * spendScale)),
    revenue: Math.max(0, Math.round(d.revenue * revenueScale)),
  }));

  // Keep a realistic "remaining" value and derive total budget from it.
  const budgetCents = totalSpent + fakeBrandBudget.remainingCents;

  return {
    analytics: {
      totalImpressions,
      totalClicks,
      totalConversions,
      totalRevenue,
      totalSpent,
      averageCTR,
      averageConversionRate,
      roi,
    },
    products,
    creators,
    trendData,
    budgetCents,
  };
}
