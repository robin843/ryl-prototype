import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, MousePointer, ShoppingCart, DollarSign, Eye, Percent } from 'lucide-react';
import type { BrandAnalytics } from '@/hooks/useBrandData';

interface ROIOverviewCardsProps {
  analytics: BrandAnalytics;
}

export function ROIOverviewCards({ analytics }: ROIOverviewCardsProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('de-DE').format(num);
  };

  const formatPercent = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const cards = [
    {
      title: 'Impressionen',
      value: formatNumber(analytics.totalImpressions),
      icon: Eye,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Clicks',
      value: formatNumber(analytics.totalClicks),
      subtitle: `CTR: ${formatPercent(analytics.averageCTR)}`,
      icon: MousePointer,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Conversions',
      value: formatNumber(analytics.totalConversions),
      subtitle: `CR: ${formatPercent(analytics.averageConversionRate)}`,
      icon: ShoppingCart,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Umsatz',
      value: formatCurrency(analytics.totalRevenue),
      icon: DollarSign,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Ausgaben',
      value: formatCurrency(analytics.totalSpent),
      icon: TrendingUp,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'ROI',
      value: formatPercent(analytics.roi),
      icon: Percent,
      color: analytics.roi >= 0 ? 'text-green-500' : 'text-red-500',
      bgColor: analytics.roi >= 0 ? 'bg-green-500/10' : 'bg-red-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
              <span className="text-xs text-muted-foreground">{card.title}</span>
            </div>
            <div className="text-xl font-bold">{card.value}</div>
            {card.subtitle && (
              <div className="text-xs text-muted-foreground mt-1">{card.subtitle}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
