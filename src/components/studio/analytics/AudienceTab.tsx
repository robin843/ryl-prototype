import { Clock, Calendar, Target, TrendingUp, Bookmark, Users, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AudienceInsightsData } from "@/hooks/useAudienceInsights";

interface AudienceTabProps {
  data: AudienceInsightsData;
}

const iconMap = {
  clock: Clock,
  calendar: Calendar,
  target: Target,
  trending: TrendingUp,
  save: Bookmark,
  users: Users,
};

const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('de-DE', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function AudienceTab({ data }: AudienceTabProps) {
  if (data.isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const hasData = data.categoryPerformance.length > 0 || data.insights.length > 0;

  if (!hasData) {
    return (
      <div className="px-6 py-12 text-center">
        <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-lg font-medium mb-2">Noch keine Kaufdaten</p>
        <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
          Sobald Käufe eingehen, erscheinen hier Muster über deine Audience und Empfehlungen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Insights Cards - Main Feature */}
      {data.insights.length > 0 && (
        <div className="px-6 py-6 border-b border-border/30">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Deine Audience kauft</h2>
          
          <div className="space-y-3">
            {data.insights.map((insight) => {
              const IconComponent = iconMap[insight.icon] || Target;
              
              return (
                <div
                  key={insight.id}
                  className="p-4 rounded-xl bg-card/30 border border-border/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-5 h-5 text-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium mb-1">{insight.title}</p>
                      <p className="text-xs text-muted-foreground">{insight.description}</p>
                      {insight.action && (
                        <div className="flex items-center gap-1 mt-2 text-gold">
                          <ArrowRight className="w-3 h-3" />
                          <p className="text-xs font-medium">{insight.action}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Performance - Horizontal Bars */}
      {data.categoryPerformance.length > 0 && (
        <div className="px-6 py-6 border-b border-border/30">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Umsatz nach Marke</h2>
          
          <div className="space-y-3">
            {data.categoryPerformance.map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium truncate">{cat.category}</span>
                  <span className="text-muted-foreground ml-2">{cat.percentage}%</span>
                </div>
                <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gold/70 rounded-full transition-all"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Pattern - Simple Heatmap */}
      {data.weekdayPattern.some(d => d.count > 0) && (
        <div className="px-6 py-6 border-b border-border/30">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Kaufzeiten</h2>
          
          <div className="grid grid-cols-7 gap-1">
            {data.weekdayPattern.map((day) => {
              const maxCount = Math.max(...data.weekdayPattern.map(d => d.count));
              const intensity = maxCount > 0 ? day.count / maxCount : 0;
              
              return (
                <div key={day.day} className="text-center">
                  <span className="text-xs text-muted-foreground">{dayNames[day.day]}</span>
                  <div 
                    className={cn(
                      "w-full aspect-square rounded-lg mt-1 flex items-center justify-center text-xs font-medium",
                      intensity === 0 && "bg-muted/30 text-muted-foreground/50",
                      intensity > 0 && intensity < 0.3 && "bg-gold/20 text-gold/70",
                      intensity >= 0.3 && intensity < 0.6 && "bg-gold/40 text-gold",
                      intensity >= 0.6 && "bg-gold/70 text-primary-foreground"
                    )}
                  >
                    {day.count > 0 ? day.count : '–'}
                  </div>
                </div>
              );
            })}
          </div>
          
          <p className="text-xs text-muted-foreground text-center mt-3">
            Käufe pro Wochentag
          </p>
        </div>
      )}

      {/* Buyer Segments */}
      {data.buyerSegments.length > 0 && (
        <div className="px-6 py-6 border-b border-border/30">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Wer kauft</h2>
          
          <div className="grid grid-cols-2 gap-3">
            {data.buyerSegments.map((segment) => (
              <div 
                key={segment.id}
                className="p-4 rounded-xl bg-card/30 border border-border/30"
              >
                <p className="text-2xl font-bold text-gold mb-1">
                  {segment.revenuePercentage}%
                </p>
                <p className="text-sm font-medium">{segment.label}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {segment.percentage}% deiner Käufer
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save vs Direct Purchase Stats */}
      {(data.saveVsPurchase.savedThenPurchased + data.saveVsPurchase.directPurchases) > 0 && (
        <div className="px-6 py-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Kaufverhalten</h2>
          
          <div className="p-4 rounded-xl bg-card/30 border border-border/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-gold" />
                <span className="text-sm font-medium">Gespeichert → Gekauft</span>
              </div>
              <span className="text-sm font-medium text-gold">
                {data.saveVsPurchase.saveConversionRate.toFixed(0)}%
              </span>
            </div>
            
            <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gold rounded-full"
                style={{ width: `${Math.min(data.saveVsPurchase.saveConversionRate, 100)}%` }}
              />
            </div>
            
            <p className="text-xs text-muted-foreground mt-3">
              {data.saveVsPurchase.savedThenPurchased} gespeicherte Produkte wurden später gekauft.
            </p>
          </div>
        </div>
      )}

      {/* Average Basket */}
      {data.avgBasketCents > 0 && (
        <div className="px-6 py-4 bg-muted/10">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Ø Warenkorb</span>
            <span className="text-lg font-semibold">{formatCurrency(data.avgBasketCents)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
