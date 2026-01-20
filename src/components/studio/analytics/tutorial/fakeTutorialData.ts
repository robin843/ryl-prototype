// Realistic fake data that looks achievable for new creators
// Numbers are intentionally modest but inspiring

import type { TutorialStep } from './TutorialContext';
import type { AudienceInsightsData } from '@/hooks/useAudienceInsights';
import type { EpisodePerformanceData } from '@/hooks/useEpisodePerformance';
import type { ProductPerformanceData } from '@/hooks/useProductPerformance';

export interface FakeMoneyStats {
  totalRevenueCents: number;
  totalSales: number;
  avgOrderCents: number;
  pendingRevenueCents: number;
}

export interface FakeSeriesRevenue {
  id: string;
  title: string;
  revenueCents: number;
  salesCount: number;
  percentage: number;
}

export interface FakeProductRevenue {
  id: string;
  name: string;
  imageUrl: string | null;
  revenueCents: number;
  salesCount: number;
}

export interface FakeConversionFunnel {
  hotspotClicks: number;
  purchases: number;
  conversionRate: number;
}

export interface FakeRecommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
  reason: string;
  link?: string;
}

// Base fake data - represents a creator doing "okay"
export const baseFakeMoneyStats: FakeMoneyStats = {
  totalRevenueCents: 84700, // 847€
  totalSales: 23,
  avgOrderCents: 3683,      // ~37€
  pendingRevenueCents: 12400,
};

export const baseFakeSeriesRevenue: FakeSeriesRevenue[] = [
  { id: '1', title: 'Skincare Routine', revenueCents: 45200, salesCount: 12, percentage: 53 },
  { id: '2', title: 'Fashion Basics', revenueCents: 28500, salesCount: 8, percentage: 34 },
  { id: '3', title: 'Tech Setup', revenueCents: 11000, salesCount: 3, percentage: 13 },
];

export const baseFakeProductRevenue: FakeProductRevenue[] = [
  { id: '1', name: 'Vitamin C Serum', imageUrl: null, revenueCents: 28900, salesCount: 9 },
  { id: '2', name: 'Oversized Blazer', imageUrl: null, revenueCents: 21400, salesCount: 5 },
  { id: '3', name: 'LED Ring Light', imageUrl: null, revenueCents: 11000, salesCount: 3 },
];

export const baseFakeFunnel: FakeConversionFunnel = {
  hotspotClicks: 412,
  purchases: 23,
  conversionRate: 5.6,
};

export const baseFakeRecommendations: FakeRecommendation[] = [
  {
    id: '1',
    priority: 'high',
    action: 'Neue Episode mit Skincare Serum',
    reason: 'Skincare konvertiert 3x besser als Tech',
  },
  {
    id: '2',
    priority: 'medium',
    action: 'Hotspots früher platzieren',
    reason: 'Deine besten Conversions passieren in den ersten 20 Sekunden',
  },
];

// Audience tab fake data - matching AudienceInsightsData interface
export const fakeAudienceData: AudienceInsightsData = {
  isLoading: false,
  error: null,
  insights: [
    {
      id: '1',
      icon: 'clock' as const,
      title: 'Deine Audience kauft abends',
      description: '67% der Käufe zwischen 19:00–22:00 Uhr',
      action: 'Poste neue Episoden gegen 18:00',
    },
    {
      id: '2',
      icon: 'target' as const,
      title: 'Fashion konvertiert am besten',
      description: '8.2% Conversion vs. 2.1% bei Tech',
      action: 'Mehr Fashion-Produkte featuren',
    },
  ],
  categoryPerformance: [
    { category: 'Fashion', revenue: 42000, count: 12, percentage: 49 },
    { category: 'Skincare', revenue: 31000, count: 9, percentage: 37 },
    { category: 'Tech', revenue: 11700, count: 3, percentage: 14 },
  ],
  hourlyPattern: Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: hour >= 19 && hour <= 22 ? 5 + Math.floor(Math.random() * 3) : Math.floor(Math.random() * 2),
    revenue: hour >= 19 && hour <= 22 ? 15000 + Math.floor(Math.random() * 5000) : Math.floor(Math.random() * 3000),
  })),
  weekdayPattern: [
    { day: 0, count: 2, revenue: 6000 },  // Sunday
    { day: 1, count: 4, revenue: 12000 }, // Monday
    { day: 2, count: 3, revenue: 9000 },  // Tuesday
    { day: 3, count: 5, revenue: 15000 }, // Wednesday
    { day: 4, count: 4, revenue: 12000 }, // Thursday
    { day: 5, count: 3, revenue: 9000 },  // Friday
    { day: 6, count: 2, revenue: 6000 },  // Saturday
  ],
  buyerSegments: [
    { id: 'repeat', label: 'Wiederkäufer', description: 'Haben mehr als 1× gekauft', count: 4, percentage: 18, revenueCents: 34700, revenuePercentage: 41 },
    { id: 'first', label: 'Erstkäufer', description: 'Erster Kauf', count: 19, percentage: 82, revenueCents: 50000, revenuePercentage: 59 },
  ],
  saveVsPurchase: {
    savedThenPurchased: 8,
    directPurchases: 15,
    savedThenPurchasedRevenue: 28800,
    directRevenue: 55900,
    saveConversionRate: 34,
  },
  avgBasketCents: 3683,
  repeatBuyerRate: 18,
};

// Episodes tab fake data - matching EpisodePerformanceData interface
export const fakeEpisodesData: EpisodePerformanceData = {
  isLoading: false,
  error: null,
  totalEpisodes: 7,
  publishedEpisodes: 7,
  comparison: {
    avgRevenueCents: 12100,
    avgCtr: 8.7,
    avgConversion: 5.6,
    bestPerformer: {
      id: '1',
      title: 'Morning Skincare Routine',
      seriesTitle: 'Skincare Routine',
      thumbnailUrl: null,
      views: 1240,
      hotspotClicks: 108,
      purchases: 9,
      revenueCents: 28900,
      ctr: 8.7,
      conversionRate: 8.3,
      publishedAt: new Date().toISOString(),
      hotspotsCount: 3,
    },
    worstPerformer: {
      id: '2',
      title: 'Tech Desk Setup',
      seriesTitle: 'Tech Setup',
      thumbnailUrl: null,
      views: 580,
      hotspotClicks: 38,
      purchases: 1,
      revenueCents: 4200,
      ctr: 6.6,
      conversionRate: 2.6,
      publishedAt: new Date().toISOString(),
      hotspotsCount: 3,
    },
  },
  hotspotTiming: {
    earlyPerformance: 8.7,   // 0-30 sec
    midPerformance: 4.2,     // 30-60 sec
    latePerformance: 2.1,    // 60+ sec
  },
  episodes: [
    { id: '1', title: 'Morning Skincare Routine', seriesTitle: 'Skincare', thumbnailUrl: null, views: 1240, hotspotClicks: 108, purchases: 9, hotspotsCount: 3, revenueCents: 28900, ctr: 8.7, conversionRate: 8.3, publishedAt: new Date().toISOString() },
    { id: '2', title: 'Fall Fashion Lookbook', seriesTitle: 'Fashion', thumbnailUrl: null, views: 890, hotspotClicks: 67, purchases: 4, hotspotsCount: 4, revenueCents: 18200, ctr: 7.5, conversionRate: 6.0, publishedAt: new Date().toISOString() },
    { id: '3', title: 'Evening Skincare', seriesTitle: 'Skincare', thumbnailUrl: null, views: 720, hotspotClicks: 52, purchases: 3, hotspotsCount: 2, revenueCents: 14300, ctr: 7.2, conversionRate: 5.8, publishedAt: new Date().toISOString() },
    { id: '4', title: 'Winter Basics Haul', seriesTitle: 'Fashion', thumbnailUrl: null, views: 650, hotspotClicks: 41, purchases: 2, hotspotsCount: 5, revenueCents: 10300, ctr: 6.3, conversionRate: 4.9, publishedAt: new Date().toISOString() },
    { id: '5', title: 'Tech Desk Setup', seriesTitle: 'Tech', thumbnailUrl: null, views: 580, hotspotClicks: 38, purchases: 1, hotspotsCount: 3, revenueCents: 4200, ctr: 6.6, conversionRate: 2.6, publishedAt: new Date().toISOString() },
  ],
};

// Products tab fake data - matching ProductPerformanceData interface
export const fakeProductsData: ProductPerformanceData = {
  isLoading: false,
  error: null,
  totalProducts: 12,
  productsWithSales: 8,
  comparison: {
    avgConversion: 5.6,
    bestConverter: {
      id: '1',
      name: 'Vitamin C Serum',
      brandName: 'The Ordinary',
      imageUrl: null,
      priceCents: 2990,
      hotspotClicks: 80,
      saves: 12,
      purchases: 9,
      revenueCents: 28900,
      ctr: 100,
      conversionRate: 11.2,
      episodesCount: 2,
    },
    mostClicked: {
      id: '2',
      name: 'Oversized Blazer',
      brandName: 'Zara',
      imageUrl: null,
      priceCents: 4990,
      hotspotClicks: 124,
      saves: 18,
      purchases: 5,
      revenueCents: 21400,
      ctr: 100,
      conversionRate: 4.0,
      episodesCount: 3,
    },
    highestRevenue: {
      id: '1',
      name: 'Vitamin C Serum',
      brandName: 'The Ordinary',
      imageUrl: null,
      priceCents: 2990,
      hotspotClicks: 80,
      saves: 12,
      purchases: 9,
      revenueCents: 28900,
      ctr: 100,
      conversionRate: 11.2,
      episodesCount: 2,
    },
  },
  saveToConvert: {
    totalSaves: 47,
    savesThatConverted: 16,
    conversionRate: 34,
    avgDaysToConvert: 2,
  },
  products: [
    { id: '1', name: 'Vitamin C Serum', brandName: 'The Ordinary', imageUrl: null, priceCents: 2990, hotspotClicks: 80, saves: 12, purchases: 9, episodesCount: 2, revenueCents: 28900, ctr: 100, conversionRate: 11.2 },
    { id: '2', name: 'Oversized Blazer', brandName: 'Zara', imageUrl: null, priceCents: 4990, hotspotClicks: 124, saves: 18, purchases: 5, episodesCount: 3, revenueCents: 21400, ctr: 100, conversionRate: 4.0 },
    { id: '3', name: 'LED Ring Light', brandName: 'Elgato', imageUrl: null, priceCents: 3990, hotspotClicks: 67, saves: 8, purchases: 3, episodesCount: 1, revenueCents: 11000, ctr: 100, conversionRate: 4.5 },
    { id: '4', name: 'Retinol Night Cream', brandName: 'Paula\'s Choice', imageUrl: null, priceCents: 4200, hotspotClicks: 45, saves: 6, purchases: 2, episodesCount: 1, revenueCents: 8400, ctr: 100, conversionRate: 4.4 },
    { id: '5', name: 'Wool Scarf', brandName: 'COS', imageUrl: null, priceCents: 3500, hotspotClicks: 38, saves: 5, purchases: 2, episodesCount: 2, revenueCents: 7100, ctr: 100, conversionRate: 5.3 },
  ],
};

// Step-specific hints with clear action instructions
// Order: Welcome → Revenue → Audience → Episodes → Products → Optimization
export const stepHints: Record<TutorialStep, { 
  title: string; 
  description: string; 
  action?: string;
  actionLabel?: string;
} | null> = {
  welcome: {
    title: 'Willkommen im Business Dashboard',
    description: 'Hier siehst du, wie dein Content echtes Geld verdient – nicht Views, sondern Euros.',
    action: '👆 Klicke jetzt auf "Revenue"',
    actionLabel: 'Revenue Tab',
  },
  revenue: {
    title: '💰 Revenue – Deine Einnahmen',
    description: '847€ in 30 Tagen. Umsatz kommt aus Episoden + Produkten, nicht aus Views oder Likes.',
    action: '👆 Klicke auf "Audience"',
    actionLabel: 'Audience Tab',
  },
  audience: {
    title: '👥 Wer kauft wann?',
    description: '67% kaufen zwischen 19–22 Uhr. Fashion konvertiert 4× besser als Tech bei deiner Audience.',
    action: '👆 Klicke auf "Episodes"',
    actionLabel: 'Episodes Tab',
  },
  episodes: {
    title: '🎬 Episode Performance',
    description: '"Skincare Routine" konvertiert 3× besser wegen Hotspot-Timing in den ersten 20 Sekunden.',
    action: '👆 Klicke auf "Products"',
    actionLabel: 'Products Tab',
  },
  products: {
    title: '🛍️ Deine Bestseller',
    description: 'Vitamin C Serum: 11% Conversion. Wiederholung in mehreren Episoden verkauft besser als einmal zeigen.',
    action: '👆 Scroll runter zum Hotspot-Timing',
    actionLabel: 'Hotspot Timing',
  },
  optimization: {
    title: '⚡ Der Geheimtipp',
    description: 'Hotspots in den ersten 20 Sekunden: 8.7% Conversion. Nach 60 Sekunden: nur 2.1%.',
    action: null,
    actionLabel: null,
  },
  complete: null,
};
