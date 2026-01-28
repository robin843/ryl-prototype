import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, DollarSign, ShoppingCart, Target, Percent } from 'lucide-react';
import type { BrandAnalytics } from '@/hooks/useBrandData';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HeroKPICardsProps {
  analytics: BrandAnalytics;
  previousAnalytics?: BrandAnalytics;
  commissionRate?: number;
}

export function HeroKPICards({ analytics, previousAnalytics, commissionRate = 15 }: HeroKPICardsProps) {
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

  // Calculate net profit (revenue minus platform fee)
  const netProfit = analytics.totalRevenue - analytics.totalSpent;

  const cards = [
    {
      title: 'Umsatz',
      subtitle: 'Generierter Umsatz',
      value: formatCurrency(analytics.totalRevenue),
      change: calculateChange(analytics.totalRevenue, previousAnalytics?.totalRevenue),
      icon: DollarSign,
      isNegativeGood: false,
      highlight: true,
      tooltip: 'Gesamtumsatz durch Hotspot-Käufe deiner Produkte',
    },
    {
      title: 'Investiert',
      subtitle: `${commissionRate}% Umsatzbeteiligung`,
      value: formatCurrency(analytics.totalSpent),
      change: calculateChange(analytics.totalSpent, previousAnalytics?.totalSpent),
      icon: Percent,
      isNegativeGood: true,
      tooltip: 'Du zahlst nur bei echten Verkäufen – keine Kosten für Views oder Clicks',
    },
    {
      title: 'ROAS',
      subtitle: 'Return on Ad Spend',
      value: `${roas.toFixed(2)}x`,
      change: previousRoas ? ((roas - previousRoas) / previousRoas) * 100 : null,
      icon: Target,
      isNegativeGood: false,
      isHero: true,
      tooltip: 'Umsatz pro investiertem Euro',
    },
    {
      title: 'Conversions',
      subtitle: 'Abgeschlossene Käufe',
      value: formatNumber(analytics.totalConversions),
      change: calculateChange(analytics.totalConversions, previousAnalytics?.totalConversions),
      icon: ShoppingCart,
      isNegativeGood: false,
      tooltip: 'Anzahl erfolgreicher Käufe über Hotspots',
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
    <TooltipProvider>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Tooltip key={card.title}>
            <TooltipTrigger asChild>
              <Card 
                className={cn(
                  "border-gold/20 transition-all cursor-help",
                  card.isHero && "bg-gradient-to-br from-gold/10 to-gold/5 border-gold/40"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {card.title}
                      </span>
                      {card.subtitle && (
                        <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                          {card.subtitle}
                        </p>
                      )}
                    </div>
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
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-[200px]">{card.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
