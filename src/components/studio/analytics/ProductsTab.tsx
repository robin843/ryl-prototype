import { ShoppingBag, TrendingUp, MousePointer2, Bookmark, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ProductPerformanceData } from "@/hooks/useProductPerformance";

interface ProductsTabProps {
  data: ProductPerformanceData;
}

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('de-DE', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function ProductsTab({ data }: ProductsTabProps) {
  if (data.isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (data.totalProducts === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-lg font-medium mb-2">Keine Produkte</p>
        <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
          Erstelle dein erstes Produkt, um Performance-Daten zu tracken.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Summary Stats */}
      <div className="px-6 py-6 border-b border-border/30">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{data.totalProducts}</p>
            <p className="text-xs text-muted-foreground">Produkte</p>
          </div>
          <div className="border-x border-border/30">
            <p className="text-2xl font-bold">{data.productsWithSales}</p>
            <p className="text-xs text-muted-foreground">Verkauft</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{data.comparison.avgConversion.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Ø Conversion</p>
          </div>
        </div>
      </div>

      {/* Champions Section */}
      {(data.comparison.bestConverter || data.comparison.mostClicked || data.comparison.highestRevenue) && (
        <div className="px-6 py-6 border-b border-border/30">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Champions</h2>
          
          <div className="space-y-3">
            {/* Highest Revenue */}
            {data.comparison.highestRevenue && data.comparison.highestRevenue.revenueCents > 0 && (
              <ChampionCard 
                icon={<TrendingUp className="w-4 h-4" />}
                label="Höchster Umsatz"
                product={data.comparison.highestRevenue}
                metric={formatCurrency(data.comparison.highestRevenue.revenueCents)}
              />
            )}

            {/* Best Converter */}
            {data.comparison.bestConverter && data.comparison.bestConverter.conversionRate > 0 && (
              <ChampionCard 
                icon={<Target className="w-4 h-4" />}
                label="Beste Conversion"
                product={data.comparison.bestConverter}
                metric={`${data.comparison.bestConverter.conversionRate.toFixed(1)}%`}
              />
            )}

            {/* Most Clicked */}
            {data.comparison.mostClicked && data.comparison.mostClicked.hotspotClicks > 0 && (
              <ChampionCard 
                icon={<MousePointer2 className="w-4 h-4" />}
                label="Meiste Klicks"
                product={data.comparison.mostClicked}
                metric={`${data.comparison.mostClicked.hotspotClicks} Klicks`}
              />
            )}
          </div>
        </div>
      )}

      {/* Save to Convert Insight */}
      {data.saveToConvert.totalSaves > 0 && (
        <div className="px-6 py-6 border-b border-border/30">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Gespeichert → Gekauft</h2>
          
          <div className="p-4 rounded-xl bg-card/30 border border-border/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-gold" />
                <span className="text-sm font-medium">Conversion von Saves</span>
              </div>
              <span className="text-lg font-bold text-gold">
                {data.saveToConvert.conversionRate.toFixed(0)}%
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center pt-3 border-t border-border/30">
              <div>
                <p className="text-xl font-semibold">{data.saveToConvert.totalSaves}</p>
                <p className="text-xs text-muted-foreground">Gespeichert</p>
              </div>
              <div>
                <p className="text-xl font-semibold">{data.saveToConvert.savesThatConverted}</p>
                <p className="text-xs text-muted-foreground">Davon gekauft</p>
              </div>
            </div>

            {data.saveToConvert.avgDaysToConvert > 0 && (
              <p className="text-xs text-muted-foreground text-center mt-3">
                Ø {data.saveToConvert.avgDaysToConvert} Tage zwischen Speichern und Kauf
              </p>
            )}
          </div>
        </div>
      )}

      {/* Product List */}
      <div className="px-6 py-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-4">Alle Produkte</h2>
        
        <div className="space-y-3">
          {data.products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-card/30"
            >
              <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{product.name}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span>{product.hotspotClicks} Klicks</span>
                  <span>•</span>
                  <span>{product.saves} Saves</span>
                  <span>•</span>
                  <span>{product.episodesCount} Episoden</span>
                </div>
              </div>
              
              <div className="text-right flex-shrink-0">
                <p className={cn(
                  "text-sm font-medium",
                  product.revenueCents > 0 ? "text-gold" : "text-muted-foreground"
                )}>
                  {formatCurrency(product.revenueCents)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {product.purchases}× verkauft
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ChampionCardProps {
  icon: React.ReactNode;
  label: string;
  product: {
    name: string;
    imageUrl: string | null;
  };
  metric: string;
}

function ChampionCard({ icon, label, product, metric }: ChampionCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gold/5 border border-gold/20">
      <div className="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center text-gold flex-shrink-0">
        {icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gold font-medium">{label}</p>
        <p className="text-sm font-medium truncate">{product.name}</p>
      </div>
      
      <p className="text-sm font-bold text-gold flex-shrink-0">{metric}</p>
    </div>
  );
}
