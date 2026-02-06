import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  MousePointer,
  Eye,
  Clock,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Zap,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AttributionData } from '@/hooks/useBrandAttribution';

interface BrandAttributionTabProps {
  data: AttributionData;
  totalSpent: number;
}

export function BrandAttributionTab({ data, totalSpent }: BrandAttributionTabProps) {
  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(cents / 100);

  const formatNumber = (n: number) => new Intl.NumberFormat('de-DE').format(n);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}min`;
    return `${(seconds / 3600).toFixed(1)}h`;
  };

  const { breakdown, funnel, avgTimeToPurchase, costPerEngagedViewer } = data;

  const totalAttributed = breakdown.directClick.count + breakdown.viewThrough.count + breakdown.assisted.count;
  const totalAttributedRevenue = breakdown.directClick.revenue + breakdown.viewThrough.revenue + breakdown.assisted.revenue;

  // Funnel visualization
  const maxFunnelCount = funnel.length > 0 ? Math.max(...funnel.map(f => f.count), 1) : 1;

  // Find biggest drop-off
  let biggestDropIdx = -1;
  let biggestDrop = 0;
  funnel.forEach((step, i) => {
    if (i > 0 && step.rate < 100) {
      const drop = 100 - step.rate;
      if (drop > biggestDrop) {
        biggestDrop = drop;
        biggestDropIdx = i;
      }
    }
  });

  const overallConversion = funnel.length >= 2 && funnel[0].count > 0
    ? (funnel[funnel.length - 1].count / funnel[0].count) * 100
    : 0;

  return (
    <div className="space-y-4">
      {/* Attribution Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TooltipProvider>
          {/* Direct Click */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="border-gold/20 cursor-help">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-lg bg-green-500/10">
                      <MousePointer className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Direct Click</span>
                      <p className="text-[10px] text-muted-foreground/70">Klick → Kauf</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-500">{formatNumber(breakdown.directClick.count)}</div>
                  <div className="text-xs text-muted-foreground mt-1">{formatCurrency(breakdown.directClick.revenue)} Umsatz</div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-[200px]">User klickt Hotspot im Video und kauft direkt. Stärkste Attribution.</p>
            </TooltipContent>
          </Tooltip>

          {/* View-Through */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="border-gold/20 cursor-help">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-lg bg-blue-500/10">
                      <Eye className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">View-Through</span>
                      <p className="text-[10px] text-muted-foreground/70">Gesehen → Kauf (24h)</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-500">{formatNumber(breakdown.viewThrough.count)}</div>
                  <div className="text-xs text-muted-foreground mt-1">{formatCurrency(breakdown.viewThrough.revenue)} Umsatz</div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-[200px]">User sieht Produkt in der Story, kauft innerhalb von 24h ohne Klick. Storytelling-Effekt.</p>
            </TooltipContent>
          </Tooltip>

          {/* Assisted */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="border-gold/20 cursor-help">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-lg bg-purple-500/10">
                      <Zap className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Assisted</span>
                      <p className="text-[10px] text-muted-foreground/70">Multi-Touch</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-purple-500">{formatNumber(breakdown.assisted.count)}</div>
                  <div className="text-xs text-muted-foreground mt-1">{formatCurrency(breakdown.assisted.revenue)} Umsatz</div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-[200px]">User wurde mehrfach erreicht (verschiedene Episodes/Creators) bevor Kauf erfolgte.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-gold/10">
          <CardContent className="p-3 text-center">
            <Clock className="h-4 w-4 text-gold mx-auto mb-1" />
            <div className="text-lg font-bold">{formatTime(avgTimeToPurchase)}</div>
            <div className="text-[10px] text-muted-foreground">Ø Zeit bis Kauf</div>
          </CardContent>
        </Card>
        <Card className="border-gold/10">
          <CardContent className="p-3 text-center">
            <Target className="h-4 w-4 text-gold mx-auto mb-1" />
            <div className="text-lg font-bold">{formatCurrency(costPerEngagedViewer)}</div>
            <div className="text-[10px] text-muted-foreground">Cost / Engaged Viewer</div>
          </CardContent>
        </Card>
        <Card className="border-gold/10">
          <CardContent className="p-3 text-center">
            <TrendingUp className="h-4 w-4 text-gold mx-auto mb-1" />
            <div className="text-lg font-bold">{overallConversion.toFixed(2)}%</div>
            <div className="text-[10px] text-muted-foreground">Gesamt-Conversion</div>
          </CardContent>
        </Card>
        <Card className="border-gold/10">
          <CardContent className="p-3 text-center">
            <DollarSign className="h-4 w-4 text-gold mx-auto mb-1" />
            <div className="text-lg font-bold">{formatCurrency(totalAttributedRevenue)}</div>
            <div className="text-[10px] text-muted-foreground">Attributierter Umsatz</div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card className="border-gold/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gold" />
            Conversion Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          {funnel.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Noch keine Funnel-Daten verfügbar
            </div>
          ) : (
            <div className="space-y-3">
              {funnel.map((step, i) => (
                <div key={step.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{step.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{formatNumber(step.count)}</span>
                      {i > 0 && (
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] px-1.5',
                            step.rate >= 50
                              ? 'border-green-500/30 text-green-500'
                              : step.rate >= 20
                              ? 'border-gold/30 text-gold'
                              : 'border-red-500/30 text-red-500'
                          )}
                        >
                          {step.rate.toFixed(1)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="h-6 bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        i === biggestDropIdx
                          ? 'bg-gradient-to-r from-red-500/70 to-red-500/40'
                          : 'bg-gradient-to-r from-gold/70 to-gold/40'
                      )}
                      style={{ width: `${Math.max(2, (step.count / maxFunnelCount) * 100)}%` }}
                    />
                  </div>
                  {i < funnel.length - 1 && (
                    <div className="flex justify-center my-1">
                      <ArrowRight className="h-3 w-3 text-muted-foreground rotate-90" />
                    </div>
                  )}
                </div>
              ))}

              {biggestDropIdx > 0 && (
                <div className="mt-4 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                  <p className="text-xs text-red-400">
                    ⚠️ Größter Drop-off: <strong>{funnel[biggestDropIdx].label}</strong> (-{biggestDrop.toFixed(0)}%).
                    {biggestDropIdx === 2 && ' Optimiere die Produktpräsentation im Video.'}
                    {biggestDropIdx === 3 && ' Der Checkout-Einstieg ist eine Hürde. Vereinfache den Kaufprozess.'}
                    {biggestDropIdx === 4 && ' Viele starten den Checkout, schließen aber nicht ab.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
