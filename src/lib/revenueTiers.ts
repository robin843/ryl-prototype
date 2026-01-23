export type RevenueTier = 'starter' | 'pro' | 'expert' | 'elite';

export interface TierConfig {
  id: RevenueTier;
  name: string;
  minCents: number;
  maxCents: number | null; // null = unlimited
  creatorSharePercent: number;
  platformFeePercent: number;
  badge: string;
  color: string;
}

export const REVENUE_TIERS: TierConfig[] = [
  {
    id: 'starter',
    name: 'Starter',
    minCents: 0,
    maxCents: 99999, // < €1,000
    creatorSharePercent: 85,
    platformFeePercent: 15,
    badge: '🌱',
    color: 'text-muted-foreground',
  },
  {
    id: 'pro',
    name: 'Pro',
    minCents: 100000, // €1,000
    maxCents: 999999, // < €10,000
    creatorSharePercent: 88,
    platformFeePercent: 12,
    badge: '⚡',
    color: 'text-blue-500',
  },
  {
    id: 'expert',
    name: 'Expert',
    minCents: 1000000, // €10,000
    maxCents: 4999999, // < €50,000
    creatorSharePercent: 90,
    platformFeePercent: 10,
    badge: '🔥',
    color: 'text-orange-500',
  },
  {
    id: 'elite',
    name: 'Elite',
    minCents: 5000000, // €50,000+
    maxCents: null,
    creatorSharePercent: 92,
    platformFeePercent: 8,
    badge: '👑',
    color: 'text-yellow-500',
  },
];

export function getTierByName(tierId: RevenueTier): TierConfig {
  return REVENUE_TIERS.find(t => t.id === tierId) || REVENUE_TIERS[0];
}

export function getTierBySales(salesCents: number): TierConfig {
  // Find the highest tier the creator qualifies for
  for (let i = REVENUE_TIERS.length - 1; i >= 0; i--) {
    if (salesCents >= REVENUE_TIERS[i].minCents) {
      return REVENUE_TIERS[i];
    }
  }
  return REVENUE_TIERS[0];
}

export function getNextTier(currentTier: RevenueTier): TierConfig | null {
  const currentIndex = REVENUE_TIERS.findIndex(t => t.id === currentTier);
  if (currentIndex === -1 || currentIndex >= REVENUE_TIERS.length - 1) {
    return null;
  }
  return REVENUE_TIERS[currentIndex + 1];
}

export function getProgressToNextTier(salesCents: number): {
  currentTier: TierConfig;
  nextTier: TierConfig | null;
  progressPercent: number;
  remainingCents: number;
} {
  const currentTier = getTierBySales(salesCents);
  const nextTier = getNextTier(currentTier.id);

  if (!nextTier) {
    return {
      currentTier,
      nextTier: null,
      progressPercent: 100,
      remainingCents: 0,
    };
  }

  const tierRangeCents = nextTier.minCents - currentTier.minCents;
  const progressInTier = salesCents - currentTier.minCents;
  const progressPercent = Math.min(100, Math.round((progressInTier / tierRangeCents) * 100));
  const remainingCents = nextTier.minCents - salesCents;

  return {
    currentTier,
    nextTier,
    progressPercent,
    remainingCents: Math.max(0, remainingCents),
  };
}

export function formatCurrency(cents: number): string {
  return `€${(cents / 100).toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
