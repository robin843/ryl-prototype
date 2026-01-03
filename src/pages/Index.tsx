import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, ShoppingBag, X, ExternalLink, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { getAllEpisodes, Episode } from "@/data/mockData";

import { SeriesMenu } from "@/components/feed/SeriesMenu";
import { cn } from "@/lib/utils";
import { useShopableData, useEpisodeProducts } from "@/hooks/useShopableData";
import { ShopableProductDetail, ShopableHotspot } from "@/services/shopable";

interface FeedItemProps {
  episode: Episode;
  isActive: boolean;
  onOpenMenu: () => void;
}

function FeedItem({ episode, isActive, onOpenMenu }: FeedItemProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showHotspots, setShowHotspots] = useState(false);
  const [showProductList, setShowProductList] = useState(false);
  
  // Fetch hotspots and products from Shopable API
  const { data: shopableData, isLoading: hotspotsLoading } = useShopableData(episode.id);
  const { products, isLoading: productsLoading } = useEpisodeProducts(episode.id);
  const hotspots = shopableData?.hotspots || [];

  useEffect(() => {
    if (isActive) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      setShowHotspots(false);
      setShowProductList(false);
    }
  }, [isActive]);

  const handleHotspotClick = (hotspot: ShopableHotspot) => {
    // Open the product URL from Shopable
    const product = products.find(p => p.id === hotspot.productId);
    if (product?.productUrl) {
      window.open(product.productUrl, '_blank');
    }
  };

  const handleProductClick = (product: ShopableProductDetail) => {
    window.open(product.productUrl, '_blank');
  };

  const handleShopButtonClick = () => {
    if (showHotspots || showProductList) {
      // Close everything
      setShowHotspots(false);
      setShowProductList(false);
    } else {
      // Show hotspots on video
      setShowHotspots(true);
    }
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

      {/* Top right menu button */}
      <button
        onClick={onOpenMenu}
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center hover:bg-background/30 transition-colors"
      >
        <Menu className="w-5 h-5 text-foreground/80" />
      </button>

      {/* Hotspots on Video - appear when shop button is clicked */}
      {showHotspots && !hotspotsLoading && hotspots.map((hotspot) => (
        <button
          key={hotspot.id}
          onClick={() => handleHotspotClick(hotspot)}
          className="absolute z-20 group animate-scale-in"
          style={{
            left: `${hotspot.position.x}%`,
            top: `${hotspot.position.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Pulsing ring */}
          <span className="absolute inset-0 w-10 h-10 rounded-full bg-gold/30 animate-ping" />
          
          {/* Main hotspot dot */}
          <span className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gold/90 backdrop-blur-sm border-2 border-white/50 shadow-lg">
            <ShoppingBag className="w-4 h-4 text-primary-foreground" />
          </span>
          
          {/* Product label on hover */}
          <span className="absolute left-12 top-1/2 -translate-y-1/2 whitespace-nowrap px-3 py-1.5 rounded-lg bg-card/95 backdrop-blur-sm border border-border/50 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {hotspot.productName}
            <ExternalLink className="inline-block w-3 h-3 ml-1.5 text-muted-foreground" />
          </span>
        </button>
      ))}

      {/* Close hotspots hint */}
      {showHotspots && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 animate-fade-in">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/90 backdrop-blur-sm border border-border/50">
            <span className="text-xs text-muted-foreground">Tippe auf einen Hotspot zum Kaufen</span>
            <button 
              onClick={() => setShowProductList(true)}
              className="text-xs text-gold font-medium hover:underline"
            >
              Alle anzeigen
            </button>
          </div>
        </div>
      )}

      {/* Shop Menu Panel - shows all products in a list */}
      <div
        className={cn(
          "absolute left-0 right-0 bottom-0 z-30",
          "bg-card/95 backdrop-blur-xl border-t border-border/50",
          "rounded-t-2xl",
          "transition-all duration-300 ease-out",
          showProductList 
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
            onClick={() => {
              setShowProductList(false);
              setShowHotspots(false);
            }}
            className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product List */}
        <div className="p-4 space-y-3 overflow-y-auto" style={{ maxHeight: "calc(50vh - 60px)" }}>
          {productsLoading ? (
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
      <div className="absolute right-4 bottom-8 flex flex-col items-center gap-5">
        {/* Shop Button - toggles hotspots visibility */}
        <button
          onClick={handleShopButtonClick}
          className={cn(
            "relative w-11 h-11 rounded-full backdrop-blur-sm flex items-center justify-center transition-all",
            (showHotspots || showProductList)
              ? "bg-gold text-primary-foreground" 
              : "bg-background/20 hover:bg-background/30"
          )}
        >
          {(showHotspots || showProductList) ? (
            <X className="w-5 h-5" />
          ) : (
            <ShoppingBag className="w-5 h-5 text-foreground/80" />
          )}
          {hotspots.length > 0 && !showHotspots && !showProductList && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold text-primary-foreground text-[10px] font-medium flex items-center justify-center">
              {hotspots.length}
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
        "absolute inset-x-0 bottom-0 p-5 pb-8 transition-opacity duration-300",
        (showHotspots || showProductList) && "opacity-0 pointer-events-none"
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
  const [showSeriesMenu, setShowSeriesMenu] = useState(false);

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

  const scrollToEpisode = (index: number) => {
    const container = containerRef.current;
    if (!container) return;
    
    const itemHeight = container.clientHeight;
    container.scrollTo({
      top: index * itemHeight,
      behavior: 'smooth'
    });
    setActiveIndex(index);
  };

  const currentEpisode = episodes[activeIndex];

  return (
    <>
      <div
        ref={containerRef}
        className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      >
        {episodes.map((episode, index) => (
          <div key={episode.id} className="h-screen w-full snap-start snap-always">
            <FeedItem 
              episode={episode} 
              isActive={index === activeIndex} 
              onOpenMenu={() => setShowSeriesMenu(true)}
            />
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
      
      {/* Series Menu */}
      <SeriesMenu 
        isOpen={showSeriesMenu}
        onClose={() => setShowSeriesMenu(false)}
        onSelectEpisode={scrollToEpisode}
        currentEpisodeId={currentEpisode?.id}
      />
    </>
  );
};

export default Index;
