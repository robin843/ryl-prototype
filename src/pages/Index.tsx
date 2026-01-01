import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, ShoppingBag, X, ChevronRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { getAllEpisodes, Episode } from "@/data/mockData";
import { BottomNav } from "@/components/layout/BottomNav";
import { cn } from "@/lib/utils";
import { useEpisodeProducts } from "@/hooks/useShopableData";
import { ShopableProductDetail } from "@/services/shopable";

interface FeedItemProps {
  episode: Episode;
  isActive: boolean;
}

function FeedItem({ episode, isActive }: FeedItemProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showShopMenu, setShowShopMenu] = useState(false);
  
  // Fetch products from Shopable API
  const { products, isLoading } = useEpisodeProducts(episode.id);

  useEffect(() => {
    if (isActive) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      setShowShopMenu(false);
    }
  }, [isActive]);

  const handleProductClick = (product: ShopableProductDetail) => {
    // In production, this would open the Shopable product URL
    // For now, we just log it
    console.log('Opening product:', product.productUrl);
    window.open(product.productUrl, '_blank');
  };

  return (
    <div className="relative h-full w-full">
      {/* Background Image */}
      <img
        src={episode.thumbnailUrl}
        alt={episode.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/90" />

      {/* Shop Menu Panel */}
      <div
        className={cn(
          "absolute left-0 right-0 bottom-0 z-30",
          "bg-card/95 backdrop-blur-xl border-t border-border/50",
          "rounded-t-2xl",
          "transition-all duration-300 ease-out",
          showShopMenu 
            ? "translate-y-0 opacity-100" 
            : "translate-y-full opacity-0 pointer-events-none"
        )}
        style={{ maxHeight: "50vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/30">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium">In dieser Episode</span>
            {products.length > 0 && (
              <span className="text-xs text-muted-foreground">({products.length})</span>
            )}
          </div>
          <button
            onClick={() => setShowShopMenu(false)}
            className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product List */}
        <div className="p-4 space-y-3 overflow-y-auto" style={{ maxHeight: "calc(50vh - 60px)" }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">
              Keine Produkte in dieser Episode
            </p>
          ) : (
            products.map((product) => (
              <button
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors text-left group"
              >
                <div className="w-14 h-14 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {product.thumbnailUrl && product.thumbnailUrl !== '/placeholder.svg' ? (
                    <img src={product.thumbnailUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.brandName}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right side controls */}
      <div className="absolute right-4 bottom-36 flex flex-col items-center gap-5">
        {/* Shop Button with product count */}
        <button
          onClick={() => setShowShopMenu(!showShopMenu)}
          className={cn(
            "relative w-11 h-11 rounded-full backdrop-blur-sm flex items-center justify-center transition-all",
            showShopMenu 
              ? "bg-gold text-primary-foreground" 
              : "bg-background/20 hover:bg-background/30"
          )}
        >
          <ShoppingBag className={cn("w-5 h-5", !showShopMenu && "text-foreground/80")} />
          {products.length > 0 && !showShopMenu && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold text-primary-foreground text-[10px] font-medium flex items-center justify-center">
              {products.length}
            </span>
          )}
        </button>
        
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="w-11 h-11 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center transition-colors hover:bg-background/30"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-foreground/80" />
          ) : (
            <Volume2 className="w-5 h-5 text-foreground/80" />
          )}
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-11 h-11 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center transition-colors hover:bg-background/30"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-foreground/80" />
          ) : (
            <Play className="w-5 h-5 text-foreground/80 ml-0.5" />
          )}
        </button>
      </div>

      {/* Bottom content */}
      <div className={cn(
        "absolute inset-x-0 bottom-0 p-5 pb-28 transition-opacity duration-300",
        showShopMenu && "opacity-0 pointer-events-none"
      )}>
        <Link to={`/series/${episode.seriesId}`} className="block">
          <span className="text-caption text-gold">{episode.seriesTitle}</span>
          <h2 className="text-title text-lg mt-1.5">
            Episode {episode.episodeNumber}: {episode.title}
          </h2>
          <p className="text-body text-foreground/60 line-clamp-2 mt-2 max-w-[75%]">
            {episode.description}
          </p>
        </Link>

        {/* Progress bar */}
        <div className="mt-5 h-[3px] bg-foreground/15 rounded-full overflow-hidden max-w-[65%]">
          <div
            className={cn(
              "h-full bg-gold rounded-full transition-all duration-[3000ms] ease-linear",
              isPlaying && isActive ? "w-full" : "w-0"
            )}
          />
        </div>
      </div>
    </div>
  );
}

const Index = () => {
  const episodes = getAllEpisodes();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const itemHeight = container.clientHeight;
      const newIndex = Math.round(scrollTop / itemHeight);
      setActiveIndex(newIndex);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      >
        {episodes.map((episode, index) => (
          <div key={episode.id} className="h-screen w-full snap-start snap-always">
            <FeedItem episode={episode} isActive={index === activeIndex} />
          </div>
        ))}

        {/* End of feed */}
        <div className="h-screen w-full flex items-center justify-center bg-background snap-start snap-always">
          <div className="text-center px-8 pb-24">
            <p className="text-headline text-lg mb-3">Premium Stories kommen bald.</p>
            <p className="text-body text-muted-foreground mb-8">
              Entdecke unsere Serien-Kollektion.
            </p>
            <Link
              to="/soaps"
              className="inline-block px-6 py-3 rounded-full bg-gold text-primary-foreground font-medium text-sm"
            >
              Alle Serien entdecken
            </Link>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
};

export default Index;
