import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Bookmark, ExternalLink, Play, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProductDetail } from "@/hooks/useShopableData";
import { useSavedProducts } from "@/hooks/useSavedProducts";
import { useProductEpisodes } from "@/hooks/useProductEpisodes";
import { ProductReviews } from "@/components/reviews";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const { product, isLoading, error } = useProductDetail(productId || null);
  const { saveProduct, unsaveProduct, isProductSaved } = useSavedProducts();
  const { episodes, creator, isLoading: episodesLoading } = useProductEpisodes(productId);

  const isSaved = productId ? isProductSaved(productId) : false;

  const handleSaveToggle = async () => {
    if (!productId) return;
    if (isSaved) {
      await unsaveProduct(productId);
    } else {
      await saveProduct(productId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="aspect-square bg-muted/30" />
        <div className="px-6 py-6">
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-5 w-1/2 mb-4" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-headline text-lg mb-3">Produkt nicht gefunden</p>
          <p className="text-body text-muted-foreground mb-6">
            Dieses Produkt existiert nicht oder ist nicht mehr verfügbar.
          </p>
          <Button asChild variant="outline">
            <Link to="/feed">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück zum Feed
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const price = product.priceDisplay || 'Preis auf Anfrage';

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Product Image */}
      <div className="relative aspect-square bg-muted/30">
        {product.thumbnailUrl && product.thumbnailUrl !== '/placeholder.svg' ? (
          <img 
            src={product.thumbnailUrl} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
        
        {/* Back Button */}
        <Link 
          to="/feed"
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        {/* Save Button */}
        <button
          onClick={handleSaveToggle}
          className={cn(
            "absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors",
            isSaved 
              ? "bg-gold text-primary-foreground" 
              : "bg-background/50 text-foreground hover:bg-background/70"
          )}
        >
          <Bookmark className={cn("w-5 h-5", isSaved && "fill-current")} />
        </button>
      </div>

      {/* Product Info */}
      <div className="px-6 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-caption text-gold">{product.brandName}</p>
            <h1 className="text-headline text-xl mt-1">{product.name}</h1>
          </div>
          <p className="text-title text-xl text-gold flex-shrink-0">{price}</p>
        </div>

        {product.description && (
          <p className="text-body text-foreground/80 mt-4">{product.description}</p>
        )}

        {/* Buy Button */}
        {product.productUrl && (
          <Button 
            asChild 
            size="lg" 
            className="w-full mt-6 bg-gold hover:bg-gold/90 text-primary-foreground rounded-full"
          >
            <a href={product.productUrl} target="_blank" rel="noopener noreferrer">
              Jetzt kaufen
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </Button>
        )}

        {/* Why Shopable Link */}
        <Link 
          to="/why-shopable"
          className="block mt-4 text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Sicher bezahlen mit Stripe • Mehr erfahren
        </Link>
      </div>

      {/* Creator */}
      {creator && (
        <div className="px-6 py-6 border-t border-border/30">
          <h2 className="text-caption text-muted-foreground mb-3">ANGEBOTEN VON</h2>
          <Link 
            to={`/creator/${creator.userId}`}
            className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/30 hover:border-gold/30 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center overflow-hidden">
              {creator.avatarUrl ? (
                <img src={creator.avatarUrl} alt={creator.displayName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">{creator.displayName || 'Creator'}</p>
              {creator.companyName && (
                <p className="text-xs text-muted-foreground">{creator.companyName}</p>
              )}
            </div>
          </Link>
        </div>
      )}

      {/* Seen In Episodes */}
      {!episodesLoading && episodes.length > 0 && (
        <div className="px-6 py-6 border-t border-border/30">
          <h2 className="text-caption text-muted-foreground mb-3">GESEHEN IN</h2>
          <div className="space-y-3">
            {episodes.map((ep) => (
              <Link
                key={ep.id}
                to={`/watch/${ep.id}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/30 hover:border-gold/30 transition-colors group"
              >
                <div className="w-16 h-10 rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden">
                  {ep.thumbnailUrl ? (
                    <img src={ep.thumbnailUrl} alt={ep.title} className="w-full h-full object-cover" />
                  ) : (
                    <Play className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-gold transition-colors">
                    {ep.seriesTitle} - Episode {ep.episodeNumber}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{ep.title}</p>
                </div>
                <Play className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Product Reviews */}
      <div className="px-6 py-6 border-t border-border/30">
        <ProductReviews productId={productId!} productName={product.name} />
      </div>
    </div>
  );
}