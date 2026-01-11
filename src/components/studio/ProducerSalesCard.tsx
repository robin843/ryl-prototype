import { useEffect } from 'react';
import { ShoppingBag, TrendingUp, ExternalLink, Loader2 } from 'lucide-react';
import { useProducerSales } from '@/hooks/useProducerSales';
import { cn } from '@/lib/utils';

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}

export function ProducerSalesCard() {
  const { products, totalSales, totalRevenueCents, isLoading, fetchSales } = useProducerSales();

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  if (isLoading) {
    return (
      <div className="p-4 rounded-xl bg-card border border-border/30">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Lade Verkaufsdaten...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card border border-border/30 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Bestellungen & Einnahmen</h3>
              <p className="text-xs text-muted-foreground">Read-only • Stripe ist Source of Truth</p>
            </div>
          </div>
          <a 
            href="https://dashboard.stripe.com/payments" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-gold hover:text-gold/80 transition-colors"
          >
            In Stripe ansehen
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 divide-x divide-border/30 border-b border-border/30">
        <div className="p-4 text-center">
          <p className="text-2xl font-serif text-gold">{totalSales}</p>
          <p className="text-xs text-muted-foreground">Verkäufe</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-2xl font-serif text-gold">{formatCurrency(totalRevenueCents)}</p>
          <p className="text-xs text-muted-foreground">Gesamtumsatz</p>
        </div>
      </div>

      {/* Product List */}
      <div className="p-4">
        {products.length === 0 ? (
          <div className="text-center py-6">
            <ShoppingBag className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Noch keine Verkäufe</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <div 
                key={product.productId}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30"
              >
                <div className="w-12 h-12 rounded-lg bg-secondary flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ShoppingBag className="w-5 h-5 text-muted-foreground/50" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.salesCount}x verkauft
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gold">
                    {formatCurrency(product.revenueCents)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
