import { Eye, MousePointer, Percent, ArrowRightLeft } from 'lucide-react';
import type { BrandAnalytics } from '@/hooks/useBrandData';

interface SecondaryMetricsProps {
  analytics: BrandAnalytics;
}

export function SecondaryMetrics({ analytics }: SecondaryMetricsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return new Intl.NumberFormat('de-DE').format(num);
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 2,
    }).format(cents / 100);
  };

  const cpa = analytics.totalConversions > 0 
    ? analytics.totalSpent / analytics.totalConversions 
    : 0;

  const aov = analytics.totalConversions > 0 
    ? analytics.totalRevenue / analytics.totalConversions 
    : 0;

  const metrics = [
    { 
      label: 'Impressions', 
      value: formatNumber(analytics.totalImpressions), 
      icon: Eye 
    },
    { 
      label: 'Clicks', 
      value: formatNumber(analytics.totalClicks), 
      subtext: `${analytics.averageCTR.toFixed(2)}% CTR`,
      icon: MousePointer 
    },
    { 
      label: 'CVR', 
      value: `${analytics.averageConversionRate.toFixed(2)}%`, 
      icon: Percent 
    },
    { 
      label: 'CPA', 
      value: formatCurrency(cpa), 
      icon: ArrowRightLeft 
    },
  ];

  return (
    <div className="flex items-center gap-6 px-4 py-3 bg-card/50 rounded-lg border border-gold/10">
      {metrics.map((metric, index) => (
        <div key={metric.label} className="flex items-center gap-4">
          {index > 0 && <div className="w-px h-8 bg-border" />}
          <div className="flex items-center gap-2">
            <metric.icon className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">{metric.label}</div>
              <div className="font-semibold text-sm">
                {metric.value}
                {metric.subtext && (
                  <span className="text-xs text-muted-foreground ml-1.5">
                    {metric.subtext}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
