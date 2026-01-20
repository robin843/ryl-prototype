import { Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, ShoppingBag, Lightbulb, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMoneyAnalytics } from "@/hooks/useMoneyAnalytics";
import { ProducerGuard } from "@/components/studio/ProducerGuard";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  determineDashboardPhase,
  getSetupSteps,
  SetupStateHero,
  EarlyRevenueHero,
  ScaleHero,
  EmptySeriesSection,
  EmptyProductSection,
  EmptyFunnelSection,
} from "@/components/studio/analytics/DashboardStates";

type TimeRange = '7d' | '30d' | 'all';

function formatCurrencyDetailed(cents: number): string {
  return (cents / 100).toLocaleString('de-DE', { 
    style: 'currency', 
    currency: 'EUR',
  });
}

export default function StudioAnalytics() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  
  const { moneyStats, seriesRevenue, productRevenue, funnel, recommendations, setupState, isLoading } = 
    useMoneyAnalytics(user?.id, timeRange);

  const timeRangeLabel = timeRange === '7d' ? 'Letzte 7 Tage' : timeRange === '30d' ? 'Letzte 30 Tage' : 'Gesamt';

  // Determine dashboard phase
  const dashboardPhase = determineDashboardPhase({
    ...setupState,
    totalSales: moneyStats.totalSales,
    totalRevenueCents: moneyStats.totalRevenueCents,
  });

  const setupSteps = getSetupSteps({
    ...setupState,
    totalSales: moneyStats.totalSales,
    totalRevenueCents: moneyStats.totalRevenueCents,
  });

  // Only show time range toggle in scale mode
  const showTimeRangeToggle = dashboardPhase === 'scale';

  return (
    <ProducerGuard>
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/30">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/studio" className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-title">
                {dashboardPhase === 'setup' ? 'Dein Business' : 'Dein Umsatz'}
              </h1>
            </div>
            {/* Time Range Toggle - Only in Scale Mode */}
            {showTimeRangeToggle && (
              <div className="flex gap-1 bg-muted/30 rounded-full p-1">
                {(['7d', '30d', 'all'] as TimeRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                      timeRange === range
                        ? "bg-gold text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {range === '7d' ? '7T' : range === '30d' ? '30T' : 'Alle'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* === HERO SECTION - STATE BASED === */}
        <div className="border-b border-border/30">
          {isLoading ? (
            <div className="px-6 py-10 text-center">
              <Skeleton className="h-16 w-40 mx-auto mb-2" />
              <Skeleton className="h-4 w-24 mx-auto" />
            </div>
          ) : dashboardPhase === 'setup' ? (
            <SetupStateHero steps={setupSteps} />
          ) : dashboardPhase === 'early' ? (
            <EarlyRevenueHero 
              totalRevenueCents={moneyStats.totalRevenueCents} 
              totalSales={moneyStats.totalSales} 
            />
          ) : (
            <ScaleHero
              totalRevenueCents={moneyStats.totalRevenueCents}
              totalSales={moneyStats.totalSales}
              avgOrderCents={moneyStats.avgOrderCents}
              pendingRevenueCents={moneyStats.pendingRevenueCents}
              timeRangeLabel={timeRangeLabel}
            />
          )}
        </div>

        {/* === REVENUE BY SERIES - Only show in early/scale or when has data === */}
        {(dashboardPhase !== 'setup' || seriesRevenue.length > 0) && (
          <div className="px-6 py-6 border-b border-border/30">
            <h2 className="text-sm font-medium text-muted-foreground mb-4">Umsatz nach Serie</h2>
            
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10" />)}
              </div>
            ) : seriesRevenue.length === 0 ? (
              <EmptySeriesSection />
            ) : (
              <div className="space-y-3">
                {seriesRevenue.map((series) => (
                  <div key={series.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium truncate">{series.title}</p>
                        <p className="text-sm font-medium">{formatCurrencyDetailed(series.revenueCents)}</p>
                      </div>
                      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gold rounded-full transition-all"
                          style={{ width: `${series.percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-right">
                      {series.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === REVENUE BY PRODUCT - Only show in early/scale or when has data === */}
        {(dashboardPhase !== 'setup' || productRevenue.length > 0) && (
          <div className="px-6 py-6 border-b border-border/30">
            <h2 className="text-sm font-medium text-muted-foreground mb-4">Top Produkte</h2>
            
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}
              </div>
            ) : productRevenue.length === 0 ? (
              <EmptyProductSection />
            ) : (
              <div className="space-y-3">
                {productRevenue.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-card/30"
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.salesCount} verkauft</p>
                    </div>
                    <p className="text-sm font-medium text-gold">
                      {formatCurrencyDetailed(product.revenueCents)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === CONVERSION FUNNEL - Only show when has hotspots or in scale mode === */}
        {(dashboardPhase === 'scale' || (setupState.hasHotspots && funnel.hotspotClicks > 0)) && (
          <div className="px-6 py-6 border-b border-border/30">
            <h2 className="text-sm font-medium text-muted-foreground mb-4">Conversion Funnel</h2>
            
            {isLoading ? (
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : funnel.hotspotClicks === 0 && funnel.purchases === 0 ? (
              <EmptyFunnelSection hasHotspots={setupState.hasHotspots} />
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-card/30 text-center">
                  <p className="text-2xl font-semibold">{funnel.hotspotClicks.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Hotspot-Klicks</p>
                </div>
                <div className="p-3 rounded-lg bg-card/30 text-center relative">
                  <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-semibold">{funnel.purchases.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Käufe</p>
                </div>
                <div className="p-3 rounded-lg bg-gold/10 border border-gold/20 text-center relative">
                  <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-semibold text-gold">{funnel.conversionRate.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Conversion</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* === WHAT SHOULD I DO NEXT - Always show in early/scale === */}
        {dashboardPhase !== 'setup' && (
          <div className="px-6 py-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-gold" />
              <h2 className="text-sm font-medium">Was du als Nächstes tun solltest</h2>
            </div>
            
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : recommendations.length === 0 ? (
              <div className="p-4 rounded-xl bg-gold/5 border border-gold/20 text-center">
                <TrendingUp className="w-6 h-6 text-gold mx-auto mb-2" />
                <p className="text-sm font-medium">Alles läuft!</p>
                <p className="text-xs text-muted-foreground">Weiter so – du machst das großartig.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.map((rec) => (
                  <Link
                    key={rec.id}
                    to={rec.link || '/studio'}
                    className="block p-4 rounded-xl bg-card/30 border border-border/30 hover:border-gold/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                        rec.priority === 'high' ? "bg-gold" :
                        rec.priority === 'medium' ? "bg-gold/60" : "bg-muted-foreground"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{rec.action}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{rec.reason}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ProducerGuard>
  );
}
