import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, DollarSign, ShoppingCart, Target, Wallet } from 'lucide-react';
import type { BrandAnalytics } from '@/hooks/useBrandData';
import { cn } from '@/lib/utils';

interface HeroKPICardsProps {
  analytics: BrandAnalytics;
  previousAnalytics?: BrandAnalytics;
}

export function HeroKPICards({ analytics, previousAnalytics }: HeroKPICardsProps) {
  const formatCurrency = (cents: number) => {
    if (cents >= 100000) {
      return `€${(cents / 100000).toFixed(1)}k`;
    }
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return new Intl.NumberFormat('de-DE').format(num);
  };

  const calculateChange = (current: number, previous: number | undefined) => {
    if (!previous || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  const calculateROAS = (revenue: number, spent: number) => {
    if (spent === 0) return 0;
    return revenue / spent;
  };

  const roas = calculateROAS(analytics.totalRevenue, analytics.totalSpent);
  const previousRoas = previousAnalytics 
    ? calculateROAS(previousAnalytics.totalRevenue, previousAnalytics.totalSpent)
    : undefined;

  const cards = [
    {
      title: 'Spend',
      value: formatCurrency(analytics.totalSpent),
      change: calculateChange(analytics.totalSpent, previousAnalytics?.totalSpent),
      icon: Wallet,
      isNegativeGood: true, // Lower spend with same results is good
    },
    {
      title: 'Revenue',
      value: formatCurrency(analytics.totalRevenue),
      change: calculateChange(analytics.totalRevenue, previousAnalytics?.totalRevenue),
      icon: DollarSign,
      isNegativeGood: false,
      highlight: true,
    },
    {
      title: 'ROAS',
      value: `${roas.toFixed(2)}x`,
      change: previousRoas ? ((roas - previousRoas) / previousRoas) * 100 : null,
      icon: Target,
      isNegativeGood: false,
      isHero: true,
    },
    {
      title: 'Conversions',
      value: formatNumber(analytics.totalConversions),
      change: calculateChange(analytics.totalConversions, previousAnalytics?.totalConversions),
      icon: ShoppingCart,
      isNegativeGood: false,
    },
  ];

  const TrendIcon = ({ change, isNegativeGood }: { change: number | null; isNegativeGood: boolean }) => {
    if (change === null) return <Minus className="h-3 w-3 text-muted-foreground" />;
    const isPositive = isNegativeGood ? change < 0 : change > 0;
    if (change > 0) return <TrendingUp className={cn("h-3 w-3", isPositive ? "text-green-500" : "text-red-500")} />;
    if (change < 0) return <TrendingDown className={cn("h-3 w-3", isPositive ? "text-green-500" : "text-red-500")} />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card 
          key={card.title} 
          className={cn(
            "border-gold/20 transition-all",
            card.isHero && "bg-gradient-to-br from-gold/10 to-gold/5 border-gold/40"
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {card.title}
              </span>
              <div className={cn(
                "p-1.5 rounded-lg",
                card.isHero ? "bg-gold/20" : "bg-gold/10"
              )}>
                <card.icon className={cn(
                  "h-4 w-4",
                  card.isHero ? "text-gold" : "text-gold/70"
                )} />
              </div>
            </div>
            
            <div className={cn(
              "text-2xl font-bold mb-1",
              card.isHero && "text-gold",
              card.highlight && "text-green-500"
            )}>
              {card.value}
            </div>
            
            {card.change !== null ? (
              <div className="flex items-center gap-1.5 text-xs">
                <TrendIcon change={card.change} isNegativeGood={card.isNegativeGood ?? false} />
                <span className={cn(
                  (card.isNegativeGood ? card.change < 0 : card.change > 0) 
                    ? "text-green-500" 
                    : card.change === 0 
                      ? "text-muted-foreground"
                      : "text-red-500"
                )}>
                  {Math.abs(card.change).toFixed(1)}%
                </span>
                <span className="text-muted-foreground">vs. Vorperiode</span>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                Kein Vergleich verfügbar
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
