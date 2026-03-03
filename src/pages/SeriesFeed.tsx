import { useState, useRef, useEffect, useCallback, memo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Play, Pause, Volume2, VolumeX, ShoppingBag, Heart, MessageCircle, Share2, ArrowLeft, Loader2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { FeedHLSPlayer, FeedHLSPlayerHandle } from "@/components/player/FeedHLSPlayer";
import { CommentsSheet } from "@/components/feed/CommentsSheet";
import { useSeriesFeed, SeriesFeedEpisode, findStartingIndex } from "@/hooks/useSeriesFeed";
import { useShopableData, useEpisodeProducts } from "@/hooks/useShopableData";
import { useSavedProducts } from "@/hooks/useSavedProducts";
import { usePurchaseIntent } from "@/hooks/usePurchaseIntent";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { useLocalLikes } from "@/hooks/useLocalLikes";
import { useTrackEvent } from "@/hooks/useTrackEvent";
import { savePurchaseContext } from "@/hooks/usePurchaseContext";
import { useSheets } from "@/contexts/SheetContext";
import { ShopableHotspot, ShopableProductDetail } from "@/services/shopable";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useRequireAuth, useAuthModal } from "@/contexts/AuthModalContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useWatchHistory } from "@/hooks/useWatchHistory";

interface Episode {
  id: string;
  title: string;
  description: string | null;
  episodeNumber: number;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  hlsUrl: string | null;
  seriesCoverUrl: string | null;
  seriesId: string;
  seriesTitle: string;
  creatorId: string;
}

interface SeriesFeedItemProps {
  episode: Episode;
  isActive: boolean;
  isNearby: boolean;
  preloadPriority: 'active' | 'nearby' | 'prefetch' | 'none';
  onAutoNext: () => void;
  localLikesHook: ReturnType<typeof useLocalLikes>;
  totalEpisodes: number;
  startTime?: number;
}

const SeriesFeedItem = memo(function SeriesFeedItem({
  episode,
  isActive,
  isNearby,
  preloadPriority,
  onAutoNext,
  localLikesHook,
  totalEpisodes,
  startTime,
}: SeriesFeedItemProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showHotspots, setShowHotspots] = useState(false);
  const [showProductList, setShowProductList] = useState(false);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 5000) + 100);
  const [showUI, setShowUI] = useState(true);
  const [checkoutProductId, setCheckoutProductId] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const hasAutoAdvanced = useRef(false);
  const hasTrackedView = useRef(false);
  const lastTapRef = useRef<number>(0);
  const playerRef = useRef<FeedHLSPlayerHandle>(null);
  const seekbarRef = useRef<HTMLDivElement>(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const [duration, setDuration] = useState(0);
  const currentTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  const maxProgressRef = useRef<number>(0);
  const hasCompletedRef = useRef(false);
  const { trackWatch } = useWatchHistory();

  const { isLikedLocally, toggleLike, shouldShowInstabilityHint } = localLikesHook;
  const isLiked = isLikedLocally(episode.id);
  const { showAuthModal } = useAuthModal();

  const { data: shopableData, isLoading: hotspotsLoading } = useShopableData(episode.id);
  const { products, isLoading: productsLoading } = useEpisodeProducts(episode.id);
  const { saveProduct, unsaveProduct, isProductSaved } = useSavedProducts();
  const { createIntent, isCreating: isCreatingIntent } = usePurchaseIntent();
  const { checkoutAndRedirect, isLoading: isCheckoutLoading } = useStripeCheckout();
  const { user } = useAuth();
  const { requireAuth } = useRequireAuth();
  const { trackVideoView, trackHotspotClick } = useTrackEvent();
  const hotspots = shopableData?.hotspots || [];
  const vibratedHotspots = useRef<Set<string>>(new Set());

  // Vibrate when hotspots first appear
  useEffect(() => {
    if (!isActive || hotspots.length === 0) return;
    hotspots.forEach(h => {
      if (vibratedHotspots.current.has(h.id)) return;
      const visible = showHotspots || (h.startTime <= currentTime && (!h.endTime || currentTime <= h.endTime));
      if (visible) {
        vibratedHotspots.current.add(h.id);
        if (navigator.vibrate) navigator.vibrate(50);
      }
    });
  }, [isActive, currentTime, hotspots, showHotspots]);
  useEffect(() => {
    if (isActive && !hasTrackedView.current) {
      hasTrackedView.current = true;
      trackVideoView(episode.id, episode.creatorId, 'series');
    }
  }, [isActive, episode.id, episode.creatorId, trackVideoView]);

  // Save watch progress when leaving episode
  useEffect(() => {
    if (isActive) {
      setIsPlaying(true);
      hasAutoAdvanced.current = false;
      maxProgressRef.current = 0;
      hasCompletedRef.current = false;
    } else {
      // Save progress when leaving this episode
      if (durationRef.current > 0 && (maxProgressRef.current > 0 || hasCompletedRef.current)) {
        trackWatch.mutate({
          episodeId: episode.id,
          progressSeconds: Math.floor(maxProgressRef.current),
          completed: hasCompletedRef.current,
        });
      }
      setIsPlaying(false);
      setShowHotspots(false);
      setShowProductList(false);
      setProgress(0);
      setShowUI(true);
      hasTrackedView.current = false;
      vibratedHotspots.current.clear();
    }
  }, [isActive]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save on unmount (navigating away)
  useEffect(() => {
    return () => {
      if (durationRef.current > 0 && (maxProgressRef.current > 0 || hasCompletedRef.current)) {
        trackWatch.mutate({
          episodeId: episode.id,
          progressSeconds: Math.floor(maxProgressRef.current),
          completed: hasCompletedRef.current,
        });
      }
    };
  }, [episode.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-advance to next episode when video ends
  useEffect(() => {
    if (progress >= 98 && isActive && !hasAutoAdvanced.current) {
      hasAutoAdvanced.current = true;
      const timer = setTimeout(() => {
        onAutoNext();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [progress, isActive, onAutoNext]);

  const handleMuteToggle = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const handleVideoTap = useCallback(() => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < 300) {
      setShowUI(prev => !prev);
    } else {
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

  const handleLike = useCallback(() => {
    const newLikedState = toggleLike(episode.id);
    setLikeCount(c => newLikedState ? c + 1 : c - 1);

    if (shouldShowInstabilityHint && newLikedState) {
      setTimeout(() => {
        showAuthModal({ type: 'like', episodeId: episode.id });
      }, 1500);
    }
  }, [episode.id, toggleLike, shouldShowInstabilityHint, showAuthModal]);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: `${episode.seriesTitle} - Episode ${episode.episodeNumber}`,
      text: episode.title,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link kopiert!");
    }
  }, [episode]);

  // Fetch comment count
  useEffect(() => {
    if (!isActive) return;

    const fetchCommentCount = async () => {
      const { count } = await supabase
        .from("comments")
        .select("id", { count: "exact", head: true })
        .eq("episode_id", episode.id);
      setCommentCount(count || 0);
    };

    if ('requestIdleCallback' in window) {
      const idleId = requestIdleCallback(() => fetchCommentCount(), { timeout: 2000 });
      return () => cancelIdleCallback(idleId);
    } else {
      const timeoutId = setTimeout(fetchCommentCount, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [episode.id, isActive]);

  // Checkout flow
  const handleCheckout = useCallback(async (productId: string, hotspotId?: string) => {
    if (!requireAuth({ type: 'purchase', productId, episodeId: episode.id, hotspotId })) {
      return;
    }

    setCheckoutProductId(productId);

    try {
      const product = products.find(p => p.id === productId);

      const intent = await createIntent({
        productId,
        quantity: 1,
        context: {
          episodeId: episode.id,
          hotspotId,
        },
      });

      if (!intent) {
        toast.error("Fehler beim Erstellen der Bestellung");
        return;
      }

      if (product) {
        savePurchaseContext({
          productId: product.id,
          productName: product.name,
          productImage: product.thumbnailUrl,
          brandName: product.brandName,
          priceDisplay: product.priceDisplay || `${(intent.totalCents / 100).toFixed(2)} €`,
          episodeId: episode.id,
          episodeNumber: episode.episodeNumber,
          seriesTitle: episode.seriesTitle,
        });
      }

      await checkoutAndRedirect(intent.intentId);
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Checkout fehlgeschlagen");
    } finally {
      setCheckoutProductId(null);
    }
  }, [requireAuth, createIntent, checkoutAndRedirect, episode, products]);

  const handleHotspotClick = (hotspot: ShopableHotspot) => {
    trackHotspotClick(hotspot.id, episode.id, episode.creatorId, hotspot.productId);
    const product = products.find(p => p.id === hotspot.productId);
    if (product?.productUrl) {
      window.open(product.productUrl, "_blank", "noopener,noreferrer");
    } else {
      toast.error("Produkt-Link nicht verfügbar");
    }
  };

  const handleProductClick = (product: ShopableProductDetail) => {
    trackHotspotClick("", episode.id, episode.creatorId, product.id);
    if (product.productUrl) {
      window.open(product.productUrl, "_blank", "noopener,noreferrer");
    } else {
      toast.error("Produkt-Link nicht verfügbar");
    }
  };

  const handleSaveProduct = async (product: ShopableProductDetail, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requireAuth({ type: 'save', productId: product.id, episodeId: episode.id })) {
      return;
    }
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
    <div className="relative h-full w-full bg-black overflow-hidden">
      {/* Blurred background layer */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${episode.thumbnailUrl || episode.seriesCoverUrl || '/placeholder.svg'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(40px) brightness(0.4)',
          transform: 'scale(1.2)',
        }}
      />

      {/* Video */}
      <div
        className="absolute inset-0 z-10 flex items-center justify-center"
        onClick={handleVideoTap}
      >
        {(episode.hlsUrl || episode.videoUrl) ? (
          <FeedHLSPlayer
            ref={playerRef}
            hlsUrl={episode.hlsUrl}
            fallbackUrl={episode.videoUrl}
            poster={episode.thumbnailUrl || episode.seriesCoverUrl}
            muted={isMuted}
            isActive={isActive}
            isPlaying={isPlaying && !isSeeking}
            isNearby={isNearby}
            preloadPriority={preloadPriority}
            loop={true}
            startTime={startTime}
            className="w-full h-full object-cover object-top"
            onTimeUpdate={(time, dur) => {
              currentTimeRef.current = time;
              durationRef.current = dur;
              setCurrentTime(time);
              setDuration(dur);
              if (time > maxProgressRef.current) {
                maxProgressRef.current = time;
              }
              if (dur > 0) {
                const pct = (time / dur) * 100;
                setProgress(pct);
                if (pct >= 90 && !hasCompletedRef.current) {
                  hasCompletedRef.current = true;
                }
              }
            }}
            onProgress75={() => {}}
            onEnded={() => { hasCompletedRef.current = true; }}
          />
        ) : (
          <img
            src={episode.thumbnailUrl || episode.seriesCoverUrl || '/placeholder.svg'}
            alt={episode.title}
            className="w-full h-full object-cover object-top"
            loading="lazy"
          />
        )}
      </div>

      {/* Play/Pause indicator */}
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
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none z-10" />

      {/* Hotspots – auto-show based on time, or all when manually toggled */}
      {!hotspotsLoading && hotspots
        .filter((hotspot) => {
          if (showHotspots) return true;
          const afterStart = hotspot.startTime <= currentTime;
          const beforeEnd = hotspot.endTime ? currentTime <= hotspot.endTime : true;
          return afterStart && beforeEnd;
        })
        .map((hotspot) => (
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

      {/* Interactive Seekbar - always visible */}
      <div 
        className="absolute inset-x-0 bottom-4 z-40 px-4"
        onClick={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        <div 
          ref={seekbarRef}
          className="relative h-8 flex items-end cursor-pointer touch-manipulation group"
          onPointerDown={(e) => {
            if (!seekbarRef.current || duration <= 0) return;
            setIsSeeking(true);
            const rect = seekbarRef.current.getBoundingClientRect();
            const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            playerRef.current?.seek(fraction * duration);
            setProgress(fraction * 100);
            setCurrentTime(fraction * duration);
            
            const handleMove = (ev: PointerEvent) => {
              const f = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
              playerRef.current?.seek(f * duration);
              setProgress(f * 100);
              setCurrentTime(f * duration);
            };
            const handleUp = () => {
              setIsSeeking(false);
              window.removeEventListener('pointermove', handleMove);
              window.removeEventListener('pointerup', handleUp);
            };
            window.addEventListener('pointermove', handleMove);
            window.addEventListener('pointerup', handleUp);
          }}
        >
          {/* Hotspot markers */}
          {duration > 0 && hotspots.map((hotspot) => {
            const startPercent = (hotspot.startTime / duration) * 100;
            const endPercent = hotspot.endTime ? (hotspot.endTime / duration) * 100 : startPercent + 1;
            const widthPercent = Math.max(2, endPercent - startPercent);
            return (
              <div
                key={hotspot.id}
                className="absolute bottom-0 h-[3px] rounded-full bg-gold group-hover:h-1 transition-all z-10"
                style={{
                  left: `${startPercent}%`,
                  width: `${widthPercent}%`,
                }}
                title={hotspot.productName}
              />
            );
          })}
          
          {/* Track background */}
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/40 rounded-full group-hover:h-1 transition-all" />
          
          {/* Track progress */}
          <div
            className="absolute bottom-0 left-0 h-[3px] bg-white rounded-full group-hover:h-1 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* UI Overlay */}
      {showUI && (
        <>
          <div className="absolute right-4 bottom-32 flex flex-col items-center gap-5 z-20">

            {/* Like */}
            <button
              onClick={handleLike}
              className="flex flex-col items-center gap-1"
            >
              <div className={cn(
                "w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center drop-shadow-lg transition-colors",
                isLiked ? "bg-red-500" : "bg-black/30"
              )}>
                <Heart className={cn("w-5 h-5", isLiked ? "text-white fill-white" : "text-white")} />
              </div>
              <span className="text-white text-xs font-medium drop-shadow">{likeCount}</span>
            </button>

            {/* Comments */}
            <button
              onClick={() => setShowComments(true)}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center drop-shadow-lg">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-white text-xs font-medium drop-shadow">{commentCount}</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center drop-shadow-lg">
                <Share2 className="w-5 h-5 text-white" />
              </div>
            </button>

            {/* Shop */}
            {products.length > 0 && (
              <button
                onClick={handleShopButtonClick}
                className="flex flex-col items-center gap-1"
              >
                <div className={cn(
                  "w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center drop-shadow-lg transition-colors",
                  showHotspots ? "bg-gold" : "bg-black/30"
                )}>
                  <ShoppingBag className={cn("w-5 h-5", showHotspots ? "text-primary-foreground" : "text-white")} />
                </div>
              </button>
            )}
          </div>

          {/* Bottom info removed – minimalist series player */}
        </>
      )}

      {/* Product List Panel */}
      {showProductList && (
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-xl rounded-t-3xl border-t border-border/50 p-4 pb-8 animate-slide-in-right">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Produkte in diesem Video</h4>
            <button onClick={() => setShowProductList(false)}>
              <span className="text-muted-foreground">×</span>
            </button>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <img
                  src={product.thumbnailUrl || '/placeholder.svg'}
                  alt={product.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.brandName}</p>
                  <p className="text-sm font-semibold text-gold mt-1">{product.priceDisplay}</p>
                </div>
                {checkoutProductId === product.id && (
                  <Loader2 className="w-5 h-5 animate-spin text-gold" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Comments Sheet */}
      <CommentsSheet
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        episodeId={episode.id}
        commentCount={commentCount}
      />
    </div>
  );
});

function mapSeriesEpisode(ep: SeriesFeedEpisode): Episode {
  return {
    id: ep.id,
    title: ep.title,
    description: ep.description,
    episodeNumber: ep.episode_number,
    thumbnailUrl: ep.thumbnail_url,
    videoUrl: ep.video_url,
    hlsUrl: ep.hls_url,
    seriesCoverUrl: ep.series_cover_url,
    seriesId: ep.series_id,
    seriesTitle: ep.series_title,
    creatorId: ep.creator_id,
  };
}

export default function SeriesFeed() {
  const { seriesId } = useParams<{ seriesId: string }>();
  const [searchParams] = useSearchParams();
  const startEpisodeId = searchParams.get('episode');
  const startTimeParam = searchParams.get('t');
  const startTime = startTimeParam ? parseFloat(startTimeParam) : undefined;
  const navigate = useNavigate();

  const { data: episodes = [], isLoading, error } = useSeriesFeed({
    seriesId: seriesId || null,
    startEpisodeId,
  });

  const mappedEpisodes = episodes.map(mapSeriesEpisode);
  const startIndex = findStartingIndex(episodes, startEpisodeId);

  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(startIndex);
  const localLikesHook = useLocalLikes();
  const hasScrolledToStart = useRef(false);

  // Scroll to starting episode on mount
  useEffect(() => {
    if (!hasScrolledToStart.current && mappedEpisodes.length > 0 && startIndex > 0) {
      const container = containerRef.current;
      if (container) {
        const itemHeight = container.clientHeight;
        container.scrollTo({ top: startIndex * itemHeight, behavior: 'auto' });
        setActiveIndex(startIndex);
        hasScrolledToStart.current = true;
      }
    }
  }, [mappedEpisodes.length, startIndex]);

  // Scroll handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container || mappedEpisodes.length === 0) return;

    let rafId: number | null = null;
    let lastIndex = activeIndex;

    const handleScroll = () => {
      if (rafId !== null) return;

      rafId = requestAnimationFrame(() => {
        rafId = null;
        const scrollTop = container.scrollTop;
        const itemHeight = container.clientHeight;
        const newIndex = Math.round(scrollTop / itemHeight);

        if (newIndex !== lastIndex && newIndex >= 0 && newIndex < mappedEpisodes.length) {
          lastIndex = newIndex;
          setActiveIndex(newIndex);
        }
      });
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [mappedEpisodes.length, activeIndex]);

  const scrollToEpisode = (index: number) => {
    const container = containerRef.current;
    if (!container || index < 0 || index >= mappedEpisodes.length) return;

    const itemHeight = container.clientHeight;
    container.scrollTo({
      top: index * itemHeight,
      behavior: 'smooth',
    });
    setActiveIndex(index);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 w-full bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-gold/30 border-t-gold rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">Lädt Serie...</p>
        </div>
      </div>
    );
  }

  if (error || mappedEpisodes.length === 0) {
    return (
      <div className="fixed inset-0 w-full flex items-center justify-center bg-black px-6">
        <div className="text-center">
          <p className="text-headline text-xl mb-4">Keine Episoden gefunden</p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Back button */}
      <button
        onClick={handleBack}
        className="fixed top-4 left-4 z-50 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>

      <div
        ref={containerRef}
        className="fixed inset-0 w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      >
        {mappedEpisodes.map((episode, index) => {
          const distance = Math.abs(index - activeIndex);
          const preloadPriority = index === activeIndex
            ? 'active' as const
            : distance === 1
              ? 'nearby' as const
              : distance <= 3
                ? 'prefetch' as const
                : 'none' as const;

          const isInViewport = distance <= 2;

          if (!isInViewport) {
            return (
              <div
                key={episode.id}
                className="h-full w-full snap-start snap-always"
                aria-hidden="true"
              />
            );
          }

          return (
            <div key={episode.id} className="h-full w-full snap-start snap-always">
              <SeriesFeedItem
                episode={episode}
                isActive={index === activeIndex}
                isNearby={distance <= 1}
                preloadPriority={preloadPriority}
                onAutoNext={() => {
                  if (index + 1 < mappedEpisodes.length) {
                    scrollToEpisode(index + 1);
                  }
                }}
                localLikesHook={localLikesHook}
                totalEpisodes={mappedEpisodes.length}
                startTime={index === startIndex ? startTime : undefined}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}
