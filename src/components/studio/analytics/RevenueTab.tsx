import { ShoppingBag, ChevronRight, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { 
  SetupStateHero, 
  EarlyRevenueHero, 
  ScaleHero,
  type DashboardPhase,
  type SetupStep
} from "./DashboardStates";

interface MoneyStats {
  totalRevenueCents: number;
  totalSales: number;
  avgOrderCents: number;
  pendingRevenueCents: number;
}

interface SeriesRevenue {
  id: string;
  title: string;
  revenueCents: number;
  salesCount: number;
  percentage: number;
}

interface ProductRevenue {
  id: string;
  name: string;
  imageUrl: string | null;
  revenueCents: number;
  salesCount: number;
}

interface ConversionFunnel {
  hotspotClicks: number;
  purchases: number;
  conversionRate: number;
}

interface ActionRecommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
  reason: string;
  link?: string;
}

interface RefundStats {
  totalRefunds: number;
  totalRefundCents: number;
  refundRatePct: number;
  netRevenueCents: number;
  clawbackCents: number;
  isLoading: boolean;
}

interface RevenueTabProps {
  moneyStats: MoneyStats;
  seriesRevenue: SeriesRevenue[];
  productRevenue: ProductRevenue[];
  funnel: ConversionFunnel;
  recommendations: ActionRecommendation[];
  timeRangeLabel: string;
  isLoading: boolean;
  dashboardPhase: DashboardPhase;
  setupSteps: SetupStep[];
  refundStats?: RefundStats;
}

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('de-DE', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function RevenueTab({
  moneyStats,
  seriesRevenue,
  productRevenue,
  funnel,
  recommendations,
  timeRangeLabel,
  isLoading,
  dashboardPhase,
  setupSteps,
  refundStats,
}: RevenueTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const hasRevenue = moneyStats.totalRevenueCents > 0;

  // Render phase-appropriate hero
  const renderHero = () => {
    switch (dashboardPhase) {
      case 'setup':
        return <SetupStateHero steps={setupSteps} />;
      case 'early':
        return (
          <EarlyRevenueHero 
            totalRevenueCents={moneyStats.totalRevenueCents}
            totalSales={moneyStats.totalSales}
          />
        );
      case 'scale':
        return (
          <ScaleHero
            totalRevenueCents={moneyStats.totalRevenueCents}
            totalSales={moneyStats.totalSales}
            avgOrderCents={moneyStats.avgOrderCents}
            pendingRevenueCents={moneyStats.pendingRevenueCents}
            timeRangeLabel={timeRangeLabel}
          />
        );
      default:
        return null;
    }
  };
  return (
    <div className="space-y-0">
      {/* Phase-appropriate Hero */}
      {renderHero()}

      {/* Stats Section (only show for early/scale phases) */}
      {dashboardPhase !== 'setup' && (
        <div className="px-6 py-6 border-b border-border/30">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-semibold">{moneyStats.totalSales}</p>
              <p className="text-xs text-muted-foreground">Verkäufe</p>
            </div>
            <div className="border-x border-border/30">
              <p className="text-xl font-semibold">{formatCurrency(moneyStats.avgOrderCents)}</p>
              <p className="text-xs text-muted-foreground">Ø pro Verkauf</p>
            </div>
            <div>
              <p className="text-xl font-semibold">
                {funnel.conversionRate.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Conversion</p>
            </div>
          </div>
        </div>
      )}

      {(hasRevenue || seriesRevenue.length > 0) && (
        <div className="px-6 py-6 border-b border-border/30">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Top 3 Serien</h2>
          
          {seriesRevenue.length === 0 ? (
            <EmptyState 
              icon="📺" 
              title="Noch keine Verkäufe nach Serie"
              description="Hier siehst du, welche Serie am meisten Umsatz macht."
            />
          ) : (
            <div className="space-y-3">
              {seriesRevenue.slice(0, 3).map((series, index) => (
                <div key={series.id} className="flex items-center gap-3">
                  <span className="text-lg font-medium text-muted-foreground w-6">
                    {index + 1}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate">{series.title}</p>
                      <p className="text-sm font-medium text-gold">
                        {formatCurrency(series.revenueCents)}
                      </p>
                    </div>
                    <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gold/60 rounded-full transition-all"
                        style={{ width: `${series.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Top 3 Products */}
      {(hasRevenue || productRevenue.length > 0) && (
        <div className="px-6 py-6 border-b border-border/30">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Top 3 Produkte</h2>
          
          {productRevenue.length === 0 ? (
            <EmptyState 
              icon="🛍️" 
              title="Noch keine Produktverkäufe"
              description="Hier erscheinen deine meistverkauften Produkte."
            />
          ) : (
            <div className="space-y-3">
              {productRevenue.slice(0, 3).map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card/30"
                >
                  <span className="text-lg font-medium text-muted-foreground w-6">
                    {index + 1}.
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.salesCount}× verkauft</p>
                  </div>
                  <p className="text-sm font-medium text-gold">
                    {formatCurrency(product.revenueCents)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="px-6 py-6 border-b border-border/30">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">
            Nächster Schritt
          </h2>
          
          <div className="space-y-3">
            {recommendations.slice(0, 2).map((rec) => (
              <Link
                key={rec.id}
                to={rec.link || '/studio'}
                className="flex items-start gap-3 p-4 rounded-xl bg-gold/5 border border-gold/20 hover:border-gold/40 transition-colors"
              >
                <div className={cn(
                  "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                  rec.priority === 'high' ? "bg-gold" :
                  rec.priority === 'medium' ? "bg-gold/60" : "bg-muted-foreground"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{rec.action}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{rec.reason}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gold flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Refund Rate Warning */}
      {dashboardPhase !== 'setup' && refundStats && !refundStats.isLoading && refundStats.totalRefunds > 0 && (
        <div className="px-6 py-6">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/20">
            <RotateCcw className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">Retourenquote</p>
                <p className="text-sm font-bold text-red-500">{refundStats.refundRatePct.toFixed(1)}%</p>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{refundStats.totalRefunds} Retoure{refundStats.totalRefunds !== 1 ? 'n' : ''} · Clawback: {formatCurrency(refundStats.clawbackCents)}</span>
                <span>Netto: <span className="text-foreground font-medium">{formatCurrency(refundStats.netRevenueCents)}</span></span>
              </div>
            </div>
          </div>
          {refundStats.refundRatePct > 10 && (
            <p className="text-xs text-red-500/80 mt-2 px-1">
              ⚠️ Hohe Retourenquote. Aggressive Produktplatzierung kann zu Retouren führen, die deinen Umsatz schmälern.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="py-6 text-center">
      <span className="text-2xl mb-2 block">{icon}</span>
      <p className="text-sm font-medium mb-1">{title}</p>
      <p className="text-xs text-muted-foreground max-w-[240px] mx-auto">{description}</p>
    </div>
  );
}
