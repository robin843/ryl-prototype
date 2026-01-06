import { Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, Eye, MousePointer, ShoppingBag, DollarSign, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { ProducerGuard } from "@/components/studio/ProducerGuard";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { cn } from "@/lib/utils";

type TimeRange = '7d' | '30d' | 'all';

export default function StudioAnalytics() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const { analytics, topProducts, episodeStats, isLoading } = useAnalytics(user?.id, timeRange);

  return (
    <ProducerGuard>
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/30">
          <div className="px-6 py-4 flex items-center gap-4">
            <Link to="/studio" className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-title">Analytics</h1>
              <p className="text-caption text-muted-foreground">Deine Performance auf einen Blick</p>
            </div>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="px-6 py-4">
          <div className="flex gap-2">
            {(['7d', '30d', 'all'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  timeRange === range
                    ? "bg-gold text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground"
                )}
              >
                {range === '7d' ? '7 Tage' : range === '30d' ? '30 Tage' : 'Gesamt'}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="px-6 py-4">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-card/50 border border-border/30">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-gold" />
                  <span className="text-caption text-muted-foreground">Umsatz</span>
                </div>
                <p className="text-title text-xl">
                  {(analytics.totalRevenue / 100).toLocaleString('de-DE', { 
                    style: 'currency', 
                    currency: 'EUR' 
                  })}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-card/50 border border-border/30">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-gold" />
                  <span className="text-caption text-muted-foreground">Views</span>
                </div>
                <p className="text-title text-xl">{analytics.totalViews.toLocaleString()}</p>
              </div>

              <div className="p-4 rounded-xl bg-card/50 border border-border/30">
                <div className="flex items-center gap-2 mb-2">
                  <MousePointer className="w-4 h-4 text-gold" />
                  <span className="text-caption text-muted-foreground">CTR</span>
                </div>
                <p className="text-title text-xl">{analytics.ctr.toFixed(1)}%</p>
              </div>

              <div className="p-4 rounded-xl bg-card/50 border border-border/30">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-gold" />
                  <span className="text-caption text-muted-foreground">Conversion</span>
                </div>
                <p className="text-title text-xl">{analytics.conversionRate.toFixed(1)}%</p>
              </div>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="px-6 py-6 border-t border-border/30">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="w-4 h-4 text-gold" />
            <h2 className="text-title">Top Produkte</h2>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : topProducts.length === 0 ? (
            <div className="p-6 rounded-xl bg-muted/20 border border-border/30 text-center">
              <p className="text-body text-muted-foreground">
                Noch keine Produktdaten verfügbar
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, i) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-card/50 border border-border/30"
                >
                  <span className="text-lg font-medium text-muted-foreground w-6">{i + 1}</span>
                  <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.clicks} Klicks • {product.purchases} Käufe</p>
                  </div>
                  <p className="text-sm font-medium text-gold">
                    {(product.revenue / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Episode Performance */}
        <div className="px-6 py-6 border-t border-border/30">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-gold" />
            <h2 className="text-title">Episoden-Performance</h2>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : episodeStats.length === 0 ? (
            <div className="p-6 rounded-xl bg-muted/20 border border-border/30 text-center">
              <p className="text-body text-muted-foreground">
                Noch keine Episodendaten verfügbar
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {episodeStats.map((ep) => (
                <Link
                  key={ep.id}
                  to={`/watch/${ep.id}`}
                  className="block p-3 rounded-xl bg-card/50 border border-border/30 hover:border-gold/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium truncate flex-1 mr-4">{ep.title}</p>
                    <p className="text-sm font-medium text-gold flex-shrink-0">
                      {(ep.revenue / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{ep.views.toLocaleString()} Views</span>
                    <span>{ep.hotspotClicks} Hotspot-Klicks</span>
                    <span>{ep.ctr.toFixed(1)}% CTR</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProducerGuard>
  );
}