import { Link } from "react-router-dom";
import { ArrowLeft, Bookmark, ShoppingBag, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSavedProducts } from "@/hooks/useSavedProducts";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function SavedProducts() {
  const { user } = useAuth();
  const { savedProducts, isLoading, unsaveProduct } = useSavedProducts();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-headline text-lg mb-3">Anmeldung erforderlich</p>
          <p className="text-body text-muted-foreground mb-6">
            Melde dich an, um Produkte zu speichern.
          </p>
          <Button asChild>
            <Link to="/auth">Anmelden</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="px-6 py-6">
          <Skeleton className="h-8 w-40 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Group by series
  const groupedProducts = savedProducts.reduce((acc, item) => {
    const seriesTitle = item.seriesTitle || 'Andere';
    if (!acc[seriesTitle]) {
      acc[seriesTitle] = [];
    }
    acc[seriesTitle].push(item);
    return acc;
  }, {} as Record<string, typeof savedProducts>);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/30">
        <div className="px-6 py-4 flex items-center gap-4">
          <Link to="/feed" className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-title text-gold">Gespeicherte Produkte</h1>
            <p className="text-caption text-muted-foreground">{savedProducts.length} Produkte</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {savedProducts.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-7 h-7 text-gold" />
            </div>
            <p className="text-headline text-lg mb-2">Noch keine Produkte gespeichert</p>
            <p className="text-body text-muted-foreground mb-6 max-w-xs mx-auto">
              Tippe auf das Lesezeichen-Symbol bei einem Produkt, um es hier zu speichern.
            </p>
            <Button asChild variant="outline">
              <Link to="/feed">
                Zum Feed
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedProducts).map(([seriesTitle, products]) => (
              <div key={seriesTitle}>
                <h2 className="text-caption text-gold mb-3">{seriesTitle}</h2>
                <div className="space-y-3">
                  {products.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-card/50 border border-gold/10 hover:border-gold/20 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* Product Image */}
                        <div className="w-16 h-16 rounded-lg bg-muted/50 flex-shrink-0 overflow-hidden">
                          {item.productImageUrl ? (
                            <img 
                              src={item.productImageUrl} 
                              alt={item.productName} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <Link 
                            to={`/product/${item.productId}`}
                            className="text-sm font-medium hover:text-gold transition-colors line-clamp-1"
                          >
                            {item.productName}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.brandName}</p>
                          <p className="text-sm font-medium text-gold mt-2">
                            {(item.priceCents / 100).toLocaleString('de-DE', { style: 'currency', currency: item.currency || 'EUR' })}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => unsaveProduct(item.productId)}
                            className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Actions Row */}
                      <div className="flex gap-3 mt-4">
                        {item.productUrl && (
                          <Button 
                            asChild 
                            size="sm" 
                            className="flex-1 bg-gold hover:bg-gold/90 text-primary-foreground"
                          >
                            <a href={item.productUrl} target="_blank" rel="noopener noreferrer">
                              Jetzt kaufen
                              <ExternalLink className="w-3 h-3 ml-1.5" />
                            </a>
                          </Button>
                        )}
                        {item.episodeId && (
                          <Button asChild size="sm" variant="outline" className="flex-1">
                            <Link to={`/watch/${item.episodeId}`}>
                              Zur Episode
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}