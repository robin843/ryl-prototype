/**
 * Demo data for the Contextual Performance Suite modules.
 * Used when brand has no real data (demo mode).
 */

import type { AttributionData } from '@/hooks/useBrandAttribution';
import type { BrandGenreData, GenrePerformance } from '@/hooks/useBrandGenrePerformance';

// --- Attribution Demo ---
export function getAttributionDemoData(totalSpent: number): AttributionData {
  const directRevenue = 847500; // 8.475€
  const viewThroughRevenue = 312000; // 3.120€
  const assistedRevenue = 88000; // 880€

  const engagedViewers = 2890;
  const costPerEngagedViewer = totalSpent > 0 ? totalSpent / engagedViewers : 0;

  return {
    breakdown: {
      directClick: { count: 62, revenue: directRevenue },
      viewThrough: { count: 19, revenue: viewThroughRevenue },
      assisted: { count: 8, revenue: assistedRevenue },
    },
    funnel: [
      { label: 'Impressionen', count: 45200, rate: 100 },
      { label: 'Hotspot-Klicks', count: 2890, rate: 6.4 },
      { label: 'Produkt angesehen', count: 1845, rate: 63.8 },
      { label: 'Checkout gestartet', count: 142, rate: 7.7 },
      { label: 'Kauf abgeschlossen', count: 89, rate: 62.7 },
    ],
    avgTimeToPurchase: 847, // ~14 minutes
    costPerEngagedViewer,
    isLoading: false,
  };
}

// --- Genre Performance Demo ---
export function getGenreDemoData(): BrandGenreData {
  const genres: GenrePerformance[] = [
    {
      genre: 'High School Drama',
      impressions: 18400,
      clicks: 1420,
      conversions: 42,
      revenue: 587900,
      ctr: 7.7,
      conversionRate: 3.0,
      avgOrderValue: 13997,
    },
    {
      genre: 'Romantik',
      impressions: 12200,
      clicks: 780,
      conversions: 28,
      revenue: 389200,
      ctr: 6.4,
      conversionRate: 3.6,
      avgOrderValue: 13900,
    },
    {
      genre: 'Lifestyle',
      impressions: 8900,
      clicks: 450,
      conversions: 14,
      revenue: 195500,
      ctr: 5.1,
      conversionRate: 3.1,
      avgOrderValue: 13964,
    },
    {
      genre: 'Krimi',
      impressions: 5700,
      clicks: 240,
      conversions: 5,
      revenue: 74900,
      ctr: 4.2,
      conversionRate: 2.1,
      avgOrderValue: 14980,
    },
  ];

  return {
    genres,
    bestGenre: 'Romantik',
    worstGenre: 'Krimi',
    recommendation: 'Deine Produkte performen 40% besser in "Romantik" und "High School Drama" als in "Krimi". Fokussiere Creator-Partnerschaften in emotionalen Genres.',
    isLoading: false,
  };
}

// --- Stock Alerts Demo ---
export interface StockAlertDemo {
  productId: string;
  productName: string;
  stockLevel: number;
  threshold: number;
  isCritical: boolean;
  inViralContent: boolean;
}

export function getStockAlertsDemoData(): StockAlertDemo[] {
  return [
    {
      productId: '1',
      productName: 'Vitamin C Brightening Serum',
      stockLevel: 23,
      threshold: 50,
      isCritical: true,
      inViralContent: true,
    },
    {
      productId: '3',
      productName: 'Retinol Night Cream',
      stockLevel: 45,
      threshold: 50,
      isCritical: false,
      inViralContent: false,
    },
  ];
}
