import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, ShoppingBag, X, ExternalLink, Bookmark, Heart, MessageCircle, Share2, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { SeriesMenu } from "@/components/feed/SeriesMenu";
import { cn } from "@/lib/utils";
import { useShopableData, useEpisodeProducts } from "@/hooks/useShopableData";
import { usePublishedContent } from "@/hooks/usePublishedContent";
import { useSavedProducts } from "@/hooks/useSavedProducts";
import { ShopableProductDetail, ShopableHotspot } from "@/services/shopable";
import { toast } from "sonner";

interface Episode {
  id: string;
  title: string;
  description: string | null;
  episodeNumber: number;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  seriesCoverUrl: string | null;
  seriesId: string;
  seriesTitle: string;
  creatorId: string;
}

interface FeedItemProps {
  episode: Episode;
  isActive: boolean;
  onOpenMenu: () => void;
  nextEpisode?: Episode;
  onNextEpisode?: () => void;
}

function FeedItem({ episode, isActive, onOpenMenu, nextEpisode, onNextEpisode }: FeedItemProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showHotspots, setShowHotspots] = useState(false);
  const [showProductList, setShowProductList] = useState(false);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 5000) + 100);
  const [showUI, setShowUI] = useState(true);
  const [showNextButton, setShowNextButton] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastTapRef = useRef<number>(0);
  
  const { data: shopableData, isLoading: hotspotsLoading } = useShopableData(episode.id);
  const { products, isLoading: productsLoading } = useEpisodeProducts(episode.id);
  const { saveProduct, unsaveProduct, isProductSaved } = useSavedProducts();
  const hotspots = shopableData?.hotspots || [];

  // Reset state when becoming active/inactive
  useEffect(() => {
    if (isActive) {
      setIsPlaying(true);
      setShowNextButton(false);
    } else {
      setIsPlaying(false);
      setShowHotspots(false);
      setShowProductList(false);
      setProgress(0);
      setShowNextButton(false);
      setShowUI(true);
    }
  }, [isActive]);

  // Show next episode button when video ends
  useEffect(() => {
    if (progress >= 95 && nextEpisode) {
      setShowNextButton(true);
    }
  }, [progress, nextEpisode]);

  // Video play/pause control
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isActive && isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isActive, isPlaying]);

  // Mute control - directly set on video element
  const handleMuteToggle = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  }, []);

  // Video progress tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, []);

  // Tap to play/pause, double tap to hide/show UI
  const handleVideoTap = useCallback(() => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    
    if (timeSinceLastTap < 300) {
      // Double tap - toggle UI visibility
      setShowUI(prev => !prev);
    } else {
      // Single tap - play/pause (with delay to detect double tap)
      setTimeout(() => {
        if (Date.now() - lastTapRef.current >= 300) {
          setIsPlaying(prev => !prev);
          setShowPlayIcon(true);
          setTimeout(() => setShowPlayIcon(false), 600);
        }
      }, 300);
    }
    lastTapRef.current = now;
  }, []);

  // Like button handler
  const handleLike = useCallback(() => {
    setIsLiked(prev => {
      if (!prev) {
        setLikeCount(c => c + 1);
      } else {
        setLikeCount(c => c - 1);
      }
      return !prev;
    });
  }, []);

  // Share handler
  const handleShare = useCallback(async () => {
    const shareData = {
      title: `${episode.seriesTitle} - Episode ${episode.episodeNumber}`,
      text: episode.title,
      url: window.location.href,
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link kopiert!");
    }
  }, [episode]);

  // Comment handler (placeholder)
  const handleComment = useCallback(() => {
    toast.info("Kommentare kommen bald!");
  }, []);

  const handleHotspotClick = (hotspot: ShopableHotspot) => {
    const product = products.find(p => p.id === hotspot.productId);
    if (product?.productUrl) {
      window.open(product.productUrl, '_blank');
    }
  };

  const handleProductClick = (product: ShopableProductDetail) => {
    window.open(product.productUrl, '_blank');
  };

  const handleSaveProduct = async (product: ShopableProductDetail, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isProductSaved(product.id)) {
      await unsaveProduct(product.id);
    } else {
      await saveProduct(product.id, episode.id);
    }
  };

  const handleShopButtonClick = () => {
    if (showHotspots || showProductList) {
      setShowHotspots(false);
      setShowProductList(false);
    } else {
      setShowHotspots(true);
    }
  };

  return (
    <div className="relative h-full w-full bg-black">
      {/* Video or Fallback Image - Tappable area */}
      <div 
        className="absolute inset-0 z-10 flex items-center justify-center"
        onClick={handleVideoTap}
      >
        {episode.videoUrl ? (
          <video
            ref={videoRef}
            src={episode.videoUrl}
            poster={episode.thumbnailUrl || episode.seriesCoverUrl || '/placeholder.svg'}
            className="w-full h-full object-contain"
            loop
            muted
            playsInline
            preload="auto"
          />
        ) : (
          <img
            src={episode.thumbnailUrl || episode.seriesCoverUrl || '/placeholder.svg'}
            alt={episode.title}
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* Next Episode Button */}
      {showNextButton && nextEpisode && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          <button
            onClick={onNextEpisode}
            className="pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-2xl bg-gold/90 backdrop-blur-sm border border-white/20 shadow-2xl animate-scale-in hover:bg-gold transition-colors"
          >
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted/50 flex-shrink-0">
              <img 
                src={nextEpisode.thumbnailUrl || nextEpisode.seriesCoverUrl || '/placeholder.svg'} 
                alt={nextEpisode.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <p className="text-[10px] text-primary-foreground/70 uppercase tracking-wide">Nächste Episode</p>
              <p className="text-sm font-semibold text-primary-foreground">
                Ep. {nextEpisode.episodeNumber}: {nextEpisode.title}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-primary-foreground ml-2" />
          </button>
        </div>
      )}

      {/* Play/Pause indicator (TikTok style) */}
      {showPlayIcon && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center animate-scale-in">
            {isPlaying ? (
              <Play className="w-10 h-10 text-white ml-1" fill="white" />
            ) : (
              <Pause className="w-10 h-10 text-white" fill="white" />
            )}
          </div>
        </div>
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none z-10" />

      {/* Hotspots on Video */}
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
          <span className="absolute inset-0 w-10 h-10 rounded-full bg-gold/30 animate-ping" />
          <span className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gold/90 backdrop-blur-sm border-2 border-white/50 shadow-lg">
            <ShoppingBag className="w-4 h-4 text-primary-foreground" />
          </span>
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

      {/* Shop Menu Panel */}
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
              <div
                key={product.id}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors text-left group"
              >
                <Link 
                  to={`/product/${product.id}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
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
                </Link>
                <button
                  onClick={(e) => handleSaveProduct(product, e)}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                    isProductSaved(product.id)
                      ? "bg-gold/20 text-gold"
                      : "bg-muted/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Bookmark className={cn("w-4 h-4", isProductSaved(product.id) && "fill-current")} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right side - Action buttons vertical */}
      <div className={cn(
        "absolute right-4 bottom-44 z-50 flex flex-col items-center gap-5 transition-opacity duration-300",
        (!showUI || showHotspots || showProductList) && "opacity-0 pointer-events-none"
      )}>
        {/* Like Button */}
        <button onClick={handleLike} className="flex flex-col items-center gap-0.5">
          <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <Heart 
              className={cn(
                "w-6 h-6 transition-all",
                isLiked ? "text-red-500 scale-110" : "text-white"
              )} 
              fill={isLiked ? "currentColor" : "none"}
            />
          </div>
          <span className="text-[10px] text-white font-medium">
            {likeCount >= 1000 ? `${(likeCount / 1000).toFixed(1)}K` : likeCount}
          </span>
        </button>

        {/* Comment Button */}
        <button onClick={handleComment} className="flex flex-col items-center gap-0.5">
          <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] text-white font-medium">89</span>
        </button>

        {/* Shop Button */}
        <button onClick={handleShopButtonClick} className="flex flex-col items-center">
          <div className={cn(
            "w-11 h-11 rounded-full flex items-center justify-center transition-all backdrop-blur-sm",
            (showHotspots || showProductList)
              ? "bg-gold" 
              : "bg-black/40"
          )}>
            {(showHotspots || showProductList) ? (
              <X className="w-6 h-6 text-primary-foreground" />
            ) : (
              <ShoppingBag className="w-6 h-6 text-white" />
            )}
          </div>
        </button>

        {/* Share Button */}
        <button onClick={handleShare} className="flex flex-col items-center">
          <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <Share2 className="w-6 h-6 text-white" />
          </div>
        </button>
      </div>

      {/* Mute Button - separate, aligned with progress bar */}
      <button 
        onClick={handleMuteToggle} 
        className={cn(
          "absolute right-4 bottom-24 z-50 flex flex-col items-center transition-opacity duration-300",
          (!showUI || showHotspots || showProductList) && "opacity-0 pointer-events-none"
        )}
      >
        <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
          {isMuted ? (
            <VolumeX className="w-6 h-6 text-white" />
          ) : (
            <Volume2 className="w-6 h-6 text-white" />
          )}
        </div>
      </button>

      {/* Bottom content */}
      <div className={cn(
        "absolute inset-x-0 bottom-20 p-4 z-20 transition-opacity duration-300",
        (!showUI || showHotspots || showProductList) && "opacity-0 pointer-events-none"
      )}>
        <div className="max-w-[75%]">
          {/* Producer name - links to creator profile */}
          <Link to={`/creator/${episode.creatorId}`} className="flex items-center gap-2 mb-2">
            <span className="text-sm font-bold text-white">@{episode.seriesTitle.toLowerCase().replace(/\s/g, '')}</span>
            <span className="px-2 py-0.5 rounded bg-gold/20 text-gold text-[10px] font-medium">Folgen</span>
          </Link>
          
          {/* Episode title */}
          <h2 className="text-white text-sm font-medium mb-1">
            Ep. {episode.episodeNumber}: {episode.title}
          </h2>
          
          {/* Description - links to series */}
          <Link to={`/series/${episode.seriesId}`}>
            <p className="text-white/70 text-xs line-clamp-2 hover:text-white/90 transition-colors">
              {episode.description || "Schau dir diese Episode an!"}
            </p>
          </Link>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-[2px] bg-white/20 rounded-full overflow-hidden max-w-[75%]">
          <div
            className="h-full bg-white rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function Feed() {
  const { episodes, isLoading, error } = usePublishedContent();
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

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (error || episodes.length === 0) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background px-6">
        <div className="text-center">
          <p className="text-headline text-lg mb-3">Noch keine Episoden</p>
          <p className="text-body text-muted-foreground mb-6">
            Die ersten Creator arbeiten gerade an spannenden Inhalten.
          </p>
          <Link 
            to="/studio"
            className="inline-block px-6 py-3 rounded-full bg-gold text-primary-foreground font-medium text-sm"
          >
            Werde Creator
          </Link>
        </div>
      </div>
    );
  }

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
              nextEpisode={episodes[index + 1]}
              onNextEpisode={() => scrollToEpisode(index + 1)}
            />
          </div>
        ))}

        {/* End of feed */}
        <div className="h-screen w-full flex items-center justify-center bg-background snap-start snap-always">
          <div className="text-center px-8 pb-24">
            <p className="text-headline text-lg mb-3">Das war's fürs Erste!</p>
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
      
      <SeriesMenu 
        isOpen={showSeriesMenu}
        onClose={() => setShowSeriesMenu(false)}
        onSelectEpisode={scrollToEpisode}
        currentEpisodeId={currentEpisode?.id}
      />
    </>
  );
}