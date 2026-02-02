// Realistic fake data for Brand Dashboard tutorial
// Numbers represent what a successful brand campaign could look like

export interface FakeBrandAnalytics {
  totalRevenue: number;      // cents
  totalSpent: number;        // cents (commission)
  roas: number;              // return on ad spend ratio
  conversions: number;
  impressions: number;
  clicks: number;
  ctr: number;               // percentage
}

export interface FakeBrandProduct {
  id: string;
  name: string;
  imageUrl: string | null;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  revenueCents: number;
}

export interface FakeBrandCreator {
  id: string;
  name: string;
  avatarUrl: string | null;
  impressions: number;
  clicks: number;
  conversions: number;
  revenueCents: number;
  partnerSince: string;
}

export interface FakeBrandBudget {
  totalBudgetCents: number;
  spentCents: number;
  remainingCents: number;
  commissionRate: number;
}

// Main analytics - represents a brand with a successful pilot campaign
export const fakeBrandAnalytics: FakeBrandAnalytics = {
  totalRevenue: 1247500,     // 12.475€ generated revenue
  totalSpent: 187125,        // 1.871,25€ commission (15%)
  roas: 6.67,                // 6.67x return on ad spend
  conversions: 89,
  impressions: 45200,
  clicks: 2890,
  ctr: 6.4,
};

// Budget status
export const fakeBrandBudget: FakeBrandBudget = {
  totalBudgetCents: 500000,   // 5.000€ allocated
  spentCents: 187125,         // 1.871,25€ spent
  remainingCents: 312875,     // 3.128,75€ remaining
  commissionRate: 15,
};

// Top performing products
export const fakeBrandProducts: FakeBrandProduct[] = [
  {
    id: '1',
    name: 'Vitamin C Brightening Serum',
    imageUrl: null,
    impressions: 18400,
    clicks: 1420,
    ctr: 7.7,
    conversions: 42,
    revenueCents: 587900,
  },
  {
    id: '2',
    name: 'Hyaluronic Acid Moisturizer',
    imageUrl: null,
    impressions: 14200,
    clicks: 890,
    ctr: 6.3,
    conversions: 31,
    revenueCents: 418500,
  },
  {
    id: '3',
    name: 'Retinol Night Cream',
    imageUrl: null,
    impressions: 12600,
    clicks: 580,
    ctr: 4.6,
    conversions: 16,
    revenueCents: 241100,
  },
];

// Top performing creators
export const fakeBrandCreators: FakeBrandCreator[] = [
  {
    id: '1',
    name: 'skincarebylena',
    avatarUrl: null,
    impressions: 22100,
    clicks: 1680,
    conversions: 52,
    revenueCents: 724800,
    partnerSince: '2026-01-15',
  },
  {
    id: '2',
    name: 'beautywithmia',
    avatarUrl: null,
    impressions: 15400,
    clicks: 820,
    conversions: 28,
    revenueCents: 389200,
    partnerSince: '2026-01-20',
  },
  {
    id: '3',
    name: 'glowupjules',
    avatarUrl: null,
    impressions: 7700,
    clicks: 390,
    conversions: 9,
    revenueCents: 133500,
    partnerSince: '2026-01-25',
  },
];

// Trend data for chart (30 days)
export const fakeBrandTrendData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const dateStr = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  
  // Simulate growing performance over time
  const baseSpend = 40 + i * 2;
  const baseRevenue = baseSpend * (5 + Math.random() * 3);
  
  return {
    date: dateStr,
    spend: Math.round(baseSpend + Math.random() * 20),
    revenue: Math.round(baseRevenue + Math.random() * 50),
  };
});

// Tutorial step hints (Brand-specific)
export const brandStepHints: Record<string, {
  title: string;
  description: string;
  highlight?: string;
} | null> = {
  welcome: {
    title: 'Deine KPIs',
    description: '12.475€ Umsatz bei nur 1.871€ Investment – das ist 6,67x ROAS.',
    highlight: 'Performance auf einen Blick',
  },
  budget: {
    title: 'Budget Management',
    description: '3.128€ Budget verfügbar. Du zahlst nur 15% auf echte Verkäufe.',
    highlight: 'Nur bei Erfolg zahlen',
  },
  products: {
    title: 'Produkt-Performance',
    description: 'Vitamin C Serum: 7,7% CTR – dein Top-Performer bei Creators.',
    highlight: 'Welche Produkte performen',
  },
  creators: {
    title: 'Creator-Partner',
    description: '@skincarebylena generiert 58% deines Umsatzes. Top-Partner!',
    highlight: 'Wer verkauft am besten',
  },
};
