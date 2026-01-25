import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import { Play, Pause, Volume2, VolumeX, ShoppingBag, X, ExternalLink, Bookmark, Heart, MessageCircle, Share2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { SeriesMenu } from "@/components/feed/SeriesMenu";
import { SubscriptionPromptOverlay } from "@/components/feed/SubscriptionPromptOverlay";
import { SoftAuthPrompt } from "@/components/auth/SoftAuthPrompt";
import { CommentsSheet } from "@/components/feed/CommentsSheet";
import { NotificationOptIn, incrementVideoViewCount } from "@/components/notifications/NotificationOptIn";
import { FeedHLSPlayer } from "@/components/player/FeedHLSPlayer";
import { cn } from "@/lib/utils";
import { useShopableData, useEpisodeProducts } from "@/hooks/useShopableData";
import { usePersonalizedFeed, FeedEpisode } from "@/hooks/usePersonalizedFeed";
import { Sparkles, Flame } from "lucide-react";
import { SocialProofBadge } from "@/components/feed/SocialProofBadge";
import { useSavedProducts } from "@/hooks/useSavedProducts";
import { usePurchaseIntent } from "@/hooks/usePurchaseIntent";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { useSubscriptionPrompt } from "@/hooks/useSubscriptionPrompt";
import { useAnonymousFlowLimit } from "@/hooks/useAnonymousFlowLimit";
import { useLocalLikes } from "@/hooks/useLocalLikes";
import { useSeriesIntent } from "@/hooks/useSeriesIntent";
import { useTrackEvent } from "@/hooks/useTrackEvent";
import { savePurchaseContext } from "@/hooks/usePurchaseContext";
import { useSheets } from "@/contexts/SheetContext";
import { ShopableProductDetail, ShopableHotspot } from "@/services/shopable";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useRequireAuth, useAuthModal } from "@/contexts/AuthModalContext";
import { supabase } from "@/integrations/supabase/client";

interface Episode {
  id: string;
  title: string;
  description: string | null;
  episodeNumber: number;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  hlsUrl: string | null; // Cloudflare Stream HLS URL
  seriesCoverUrl: string | null;
  seriesId: string;
  seriesTitle: string;
  creatorId: string;
  isDiscovery?: boolean;
  // Real social proof data from API
  purchasesToday: number;
  savesCount: number;
  isTrending: boolean;
  viewsCount?: number;
}

interface FeedItemProps {
  episode: Episode;
  isActive: boolean;
  isNearby: boolean; // For preloading adjacent videos
  preloadPriority: 'active' | 'nearby' | 'prefetch' | 'none';
  onOpenMenu: () => void;
  onAutoNext: () => void;
  onPrefetchNext: () => void; // Trigger next video prefetch at 75%
  localLikesHook: ReturnType<typeof useLocalLikes>;
  onOpenCreator: (creatorId: string) => void;
  onOpenSeries: (seriesId: string) => void;
}

// Memoized FeedItem for performance - only re-renders when active/nearby/priority state changes
const FeedItem = memo(function FeedItem({ episode, isActive, isNearby, preloadPriority, onOpenMenu, onAutoNext, onPrefetchNext, localLikesHook, onOpenCreator, onOpenSeries }: FeedItemProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showHotspots, setShowHotspots] = useState(false);
  const [showProductList, setShowProductList] = useState(false);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [progress, setProgress] = useState(0);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 5000) + 100);
  const [showUI, setShowUI] = useState(true);
  const [checkoutProductId, setCheckoutProductId] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const hasAutoAdvanced = useRef(false);
  const hasTrackedView = useRef(false);
  const hasTrackedComplete = useRef(false);
  const trackedHotspotImpressions = useRef<Set<string>>(new Set());
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastTapRef = useRef<number>(0);
  
  // Use shared local likes hook
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
  const { trackVideoView, trackVideoComplete, trackHotspotImpression, trackHotspotClick } = useTrackEvent();
  const hotspots = shopableData?.hotspots || [];

  // Track video view when becoming active
  useEffect(() => {
    if (isActive && !hasTrackedView.current) {
      hasTrackedView.current = true;
      trackVideoView(episode.id, episode.creatorId, 'feed');
      // Increment view count for notification prompt
      incrementVideoViewCount();
    }
  }, [isActive, episode.id, episode.creatorId, trackVideoView]);

  // Track video complete when progress reaches 100%
  useEffect(() => {
    if (progress >= 98 && !hasTrackedComplete.current) {
      hasTrackedComplete.current = true;
      trackVideoComplete(episode.id, episode.creatorId);
    }
  }, [progress, episode.id, episode.creatorId, trackVideoComplete]);

  // Track hotspot impressions when they become visible
  useEffect(() => {
    if (showHotspots && hotspots.length > 0) {
      hotspots.forEach(hotspot => {
        if (!trackedHotspotImpressions.current.has(hotspot.id)) {
          trackedHotspotImpressions.current.add(hotspot.id);
          trackHotspotImpression(
            hotspot.id, 
            episode.id, 
            episode.creatorId,
            hotspot.productId,
            hotspot.position
          );
        }
      });
    }
  }, [showHotspots, hotspots, episode.id, episode.creatorId, trackHotspotImpression]);

  // Reset state when becoming active/inactive
  useEffect(() => {
    if (isActive) {
      setIsPlaying(true);
      hasAutoAdvanced.current = false;
    } else {
      setIsPlaying(false);
      setShowHotspots(false);
      setShowProductList(false);
      setProgress(0);
      setShowUI(true);
      // Reset tracking for this episode
      hasTrackedView.current = false;
      hasTrackedComplete.current = false;
      trackedHotspotImpressions.current.clear();
    }
  }, [isActive]);

  // Auto-advance to next episode when video ends
  useEffect(() => {
    if (progress >= 98 && isActive && !hasAutoAdvanced.current) {
      hasAutoAdvanced.current = true;
      // Small delay before auto-advancing
      const timer = setTimeout(() => {
        onAutoNext();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [progress, isActive, onAutoNext]);

  // Video play/pause control - instant playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const tryPlay = () => {
      if (isActive && isPlaying) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      }
    };
    
    if (isActive && isPlaying) {
      // If video is ready, play immediately
      if (video.readyState >= 3) {
        tryPlay();
      } else {
        // Wait for video to be ready
        video.addEventListener('canplay', tryPlay, { once: true });
      }
    } else {
      video.pause();
    }
    
    return () => {
      video.removeEventListener('canplay', tryPlay);
    };
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

  // Like button handler - local first, with instability hint
  const handleLike = useCallback(() => {
    const newLikedState = toggleLike(episode.id);
    setLikeCount(c => newLikedState ? c + 1 : c - 1);
    
    // If instability hint is showing and user taps like, show auth modal
    if (shouldShowInstabilityHint && newLikedState) {
      // Show a subtle prompt after a short delay
      setTimeout(() => {
        showAuthModal({ type: 'like', episodeId: episode.id });
      }, 1500);
    }
  }, [episode.id, toggleLike, shouldShowInstabilityHint, showAuthModal]);

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

  // Fetch comment count - deferred to idle time for performance
  useEffect(() => {
    if (!isActive) return;
    
    // Use requestIdleCallback for non-critical data fetching
    const fetchCommentCount = async () => {
      const { count } = await supabase
        .from("comments")
        .select("id", { count: "exact", head: true })
        .eq("episode_id", episode.id);
      setCommentCount(count || 0);
    };
    
    // Defer to idle time if available, otherwise use timeout
    if ('requestIdleCallback' in window) {
      const idleId = requestIdleCallback(() => fetchCommentCount(), { timeout: 2000 });
      return () => cancelIdleCallback(idleId);
    } else {
      const timeoutId = setTimeout(fetchCommentCount, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [episode.id, isActive]);

  // Comment handler
  const handleComment = useCallback(() => {
    setShowComments(true);
  }, []);

  // Stripe Checkout Flow: Hotspot -> Intent -> Stripe Hosted Checkout
  const handleCheckout = useCallback(async (productId: string, hotspotId?: string) => {
    // Use AuthModal instead of toast + redirect
    if (!requireAuth({ type: 'purchase', productId, episodeId: episode.id, hotspotId })) {
      return; // Modal shown, user will retry after login
    }

    setCheckoutProductId(productId);
    
    try {
      // Find product details for context
      const product = products.find(p => p.id === productId);
      
      // Step 1: Create purchase intent
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

      // Step 2: Save purchase context for post-purchase celebration
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

      // Step 3: Redirect to Stripe Checkout (with shipping address collection)
      await checkoutAndRedirect(intent.intentId);
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Checkout fehlgeschlagen");
    } finally {
      setCheckoutProductId(null);
    }
  }, [requireAuth, createIntent, checkoutAndRedirect, episode.id, episode.episodeNumber, episode.seriesTitle, products]);

  const handleHotspotClick = (hotspot: ShopableHotspot) => {
    // Track hotspot click
    trackHotspotClick(hotspot.id, episode.id, episode.creatorId, hotspot.productId);
    handleCheckout(hotspot.productId, hotspot.id);
  };

  const handleProductClick = (product: ShopableProductDetail) => {
    // Track as hotspot click for analytics (product list click)
    trackHotspotClick("", episode.id, episode.creatorId, product.id);
    handleCheckout(product.id);
  };

  const handleSaveProduct = async (product: ShopableProductDetail, e: React.MouseEvent) => {
    e.stopPropagation();
    // Require auth to save products
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
      {/* Blurred background layer for premium aesthetic */}
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
      
      {/* Video or Fallback Image - Tappable area */}
      <div 
        className="absolute inset-0 z-10 flex items-start justify-center"
        onClick={handleVideoTap}
      >
        {/* HLS Video Player with fallback - Use HLS URL if available */}
        {(episode.hlsUrl || episode.videoUrl) ? (
          <FeedHLSPlayer
            hlsUrl={episode.hlsUrl}
            fallbackUrl={episode.videoUrl}
            poster={episode.thumbnailUrl || episode.seriesCoverUrl}
            muted={isMuted}
            isActive={isActive}
            isNearby={isNearby}
            preloadPriority={preloadPriority}
            loop={true}
            className="w-full h-full object-cover object-top"
            onTimeUpdate={(currentTime, duration) => {
              if (duration > 0) {
                setProgress((currentTime / duration) * 100);
              }
            }}
            onProgress75={onPrefetchNext}
            onEnded={() => {
              // Video ended (if loop is disabled)
            }}
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
            products.map((product) => {
              const isLoading = checkoutProductId === product.id;
              return (
                <div
                  key={product.id}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors text-left group"
                >
                  <button 
                    onClick={() => handleProductClick(product)}
                    disabled={isLoading || isCreatingIntent || isCheckoutLoading}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left disabled:opacity-50"
                  >
                    <div className="w-14 h-14 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                      {product.thumbnailUrl && product.thumbnailUrl !== '/placeholder.svg' ? (
                        <img src={product.thumbnailUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                      )}
                      {isLoading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 text-gold animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.brandName}</p>
                      {product.priceDisplay && (
                        <p className="text-xs text-gold font-medium mt-0.5">{product.priceDisplay}</p>
                      )}
                    </div>
                  </button>
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
              );
            })
          )}
        </div>
      </div>

      {/* Right side - Action buttons vertical */}
      <div className={cn(
        "absolute right-4 bottom-44 z-50 flex flex-col items-center gap-5 transition-opacity duration-300",
        (!showUI || showHotspots || showProductList) && "opacity-0 pointer-events-none"
      )}>
        {/* Like Button with instability hint */}
        <button onClick={handleLike} className="flex flex-col items-center gap-0.5 relative">
          <div className={cn(
            "w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center relative",
            shouldShowInstabilityHint && !isLiked && "gold-instability-pulse"
          )}>
            <Heart 
              className={cn(
                "w-7 h-7 transition-all drop-shadow-lg",
                isLiked ? "text-red-500 scale-110" : "text-white"
              )} 
              fill={isLiked ? "currentColor" : "none"}
            />
            {/* Gold ring hint when instability is active */}
            {shouldShowInstabilityHint && (
              <span className="absolute inset-0 rounded-full border-2 border-gold/60 gold-instability-pulse pointer-events-none" />
            )}
          </div>
          <span className="text-[10px] text-white font-medium drop-shadow-lg">
            {likeCount >= 1000 ? `${(likeCount / 1000).toFixed(1)}K` : likeCount}
          </span>
          {/* Instability hint text */}
          {shouldShowInstabilityHint && (
            <span className="absolute -left-24 top-1/2 -translate-y-1/2 text-[9px] text-gold font-medium gold-instability-hint whitespace-nowrap">
              Anmelden um Likes zu behalten
            </span>
          )}
        </button>

        {/* Comment Button */}
        <button onClick={handleComment} className="flex flex-col items-center gap-0.5">
          <div className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <MessageCircle className="w-7 h-7 text-white drop-shadow-lg" />
          </div>
          <span className="text-[10px] text-white font-medium drop-shadow-lg">
            {commentCount >= 1000 ? `${(commentCount / 1000).toFixed(1)}K` : commentCount}
          </span>
        </button>

        {/* Shop Button */}
        <button onClick={handleShopButtonClick} className="flex flex-col items-center">
          <div className={cn(
            "w-11 h-11 rounded-full flex items-center justify-center transition-all backdrop-blur-sm",
            (showHotspots || showProductList)
              ? "bg-gold" 
              : "bg-black/30"
          )}>
            {(showHotspots || showProductList) ? (
              <X className="w-7 h-7 text-primary-foreground" />
            ) : (
              <ShoppingBag className="w-7 h-7 text-white drop-shadow-lg" />
            )}
          </div>
        </button>

        {/* Share Button */}
        <button onClick={handleShare} className="flex flex-col items-center">
          <div className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <Share2 className="w-7 h-7 text-white drop-shadow-lg" />
          </div>
        </button>
      </div>


      {/* Bottom content */}
      <div className={cn(
        "absolute inset-x-0 bottom-20 p-4 z-20 transition-opacity duration-300",
        (!showUI || showHotspots || showProductList) && "opacity-0 pointer-events-none"
      )}>
        <div className="max-w-[75%]">
          {/* Discovery Badge + Social Proof */}
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            {episode.isDiscovery && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/80 backdrop-blur-sm text-accent-foreground text-[10px] font-medium">
                <Sparkles className="w-3 h-3" />
                Entdeckung
              </span>
            )}
            <SocialProofBadge 
              purchasesToday={episode.purchasesToday}
              savesCount={episode.savesCount}
              isTrending={episode.isTrending}
            />
          </div>
          
          {/* Producer name - opens creator sheet */}
          <button 
            onClick={() => onOpenCreator(episode.creatorId)} 
            className="flex items-center gap-2 mb-2"
          >
            <span className="text-sm font-bold text-white">@{episode.seriesTitle.toLowerCase().replace(/\s/g, '')}</span>
            <span className="px-2 py-0.5 rounded bg-gold/20 text-gold text-[10px] font-medium">Folgen</span>
          </button>
          
          {/* Episode title */}
          <h2 className="text-white text-sm font-medium mb-1">
            Ep. {episode.episodeNumber}: {episode.title}
          </h2>
          
          {/* Description - opens series sheet */}
          <button onClick={() => onOpenSeries(episode.seriesId)}>
            <p className="text-white/70 text-xs line-clamp-2 hover:text-white/90 transition-colors text-left">
              {episode.description || "Schau dir diese Episode an!"}
            </p>
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-[2px] bg-white/20 rounded-full overflow-hidden max-w-[75%]">
          <div
            className="h-full bg-white rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Comments Sheet */}
      <CommentsSheet
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        episodeId={episode.id}
        commentCount={commentCount}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for optimal re-rendering
  // Only re-render when active/nearby/priority status changes or episode changes
  return (
    prevProps.isActive === nextProps.isActive &&
    prevProps.isNearby === nextProps.isNearby &&
    prevProps.preloadPriority === nextProps.preloadPriority &&
    prevProps.episode.id === nextProps.episode.id
  );
});

// Map FeedEpisode from API to local Episode interface
function mapFeedEpisode(ep: FeedEpisode): Episode {
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
    isDiscovery: ep.is_discovery,
    viewsCount: ep.views,
    // Real social proof data from API
    purchasesToday: ep.purchases_today,
    savesCount: ep.saves_count,
    isTrending: ep.is_trending,
  };
}

export default function Feed() {
  const { data: feedData, isLoading, error } = usePersonalizedFeed();
  const episodes = (feedData?.episodes || []).map(mapFeedEpisode);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showSeriesMenu, setShowSeriesMenu] = useState(false);
  const { shouldShowPrompt, trackEpisodeWatched, dismissPrompt } = useSubscriptionPrompt();
  const { 
    shouldShowSoftPrompt, 
    videosWatched, 
    trackVideoWatch, 
    dismissPrompt: dismissSoftPrompt,
    isAnonymous 
  } = useAnonymousFlowLimit();
  
  // Sheets context for opening overlays
  const { openCreator, openSeries } = useSheets();
  
  // Shared local likes hook for all FeedItems
  const localLikesHook = useLocalLikes();
  
  // Series intent tracking for auth trigger
  const { trackSeriesSwipe } = useSeriesIntent();
  
  const lastTrackedIndex = useRef<number>(-1);
  const lastSeriesId = useRef<string | null>(null);

  // Track episode watched and series intent when activeIndex changes
  useEffect(() => {
    if (activeIndex > 0 && activeIndex !== lastTrackedIndex.current && episodes[activeIndex]) {
      const currentEp = episodes[activeIndex];
      trackEpisodeWatched();
      
      // Track anonymous flow limit
      if (isAnonymous) {
        trackVideoWatch();
      }
      
      // Track series intent for auth trigger on 2nd swipe in same series
      if (lastSeriesId.current && lastSeriesId.current === currentEp.seriesId) {
        trackSeriesSwipe(currentEp.seriesId);
      }
      lastSeriesId.current = currentEp.seriesId;
      
      lastTrackedIndex.current = activeIndex;
    }
  }, [activeIndex, episodes, trackEpisodeWatched, isAnonymous, trackVideoWatch, trackSeriesSwipe]);

  // RAF-throttled scroll handler for 60fps performance
  useEffect(() => {
    const container = containerRef.current;
    if (!container || episodes.length === 0) return;

    let rafId: number | null = null;
    let lastIndex = activeIndex;

    const handleScroll = () => {
      // Cancel any pending RAF to avoid stacking
      if (rafId !== null) return;
      
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const scrollTop = container.scrollTop;
        const itemHeight = container.clientHeight;
        const newIndex = Math.round(scrollTop / itemHeight);
        
        // Only update state if index actually changed
        if (newIndex !== lastIndex) {
          // Infinite loop: if scrolled past last episode, jump to first
          if (newIndex >= episodes.length) {
            container.scrollTo({ top: 0, behavior: 'auto' });
            lastIndex = 0;
            setActiveIndex(0);
          } else {
            lastIndex = newIndex;
            setActiveIndex(newIndex);
          }
        }
      });
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [episodes.length, activeIndex]);

  const scrollToEpisode = (index: number) => {
    const container = containerRef.current;
    if (!container) return;
    
    // Wrap around for infinite loop
    const targetIndex = index >= episodes.length ? 0 : index;
    
    const itemHeight = container.clientHeight;
    container.scrollTo({
      top: targetIndex * itemHeight,
      behavior: 'smooth'
    });
    setActiveIndex(targetIndex);
  };

  const currentEpisode = episodes[activeIndex];

  if (isLoading) {
    return (
      <div className="fixed inset-0 w-full bg-black relative overflow-hidden">
        {/* Video skeleton */}
        <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-muted/10 to-muted/30 animate-pulse" />
        
        {/* Center loading indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-3 border-gold/30 border-t-gold rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground animate-pulse">Lädt Videos...</p>
          </div>
        </div>
        
        {/* Right side action skeleton */}
        <div className="absolute right-4 bottom-32 flex flex-col gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-10 h-10 rounded-full bg-muted/30 animate-pulse" />
          ))}
        </div>
        
        {/* Bottom info skeleton */}
        <div className="absolute bottom-6 left-4 right-20 space-y-2">
          <div className="h-4 w-24 bg-muted/30 rounded animate-pulse" />
          <div className="h-5 w-48 bg-muted/30 rounded animate-pulse" />
          <div className="h-3 w-32 bg-muted/30 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || episodes.length === 0) {
    return (
      <div className="fixed inset-0 w-full flex items-center justify-center bg-black px-6 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gold/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-gold/3 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
        
        <div className="text-center relative z-10">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gold/10 flex items-center justify-center">
            <Play className="w-8 h-8 text-gold" />
          </div>
          <p className="text-headline text-xl mb-2 font-semibold">Coming Soon</p>
          <p className="text-body text-muted-foreground mb-8 max-w-xs mx-auto">
            Unsere Creator produzieren gerade die ersten Shopable Videos. Schau bald wieder vorbei!
          </p>
          <div className="flex flex-col gap-3 items-center">
            <Link 
              to="/studio"
              className="inline-block px-6 py-3 rounded-full bg-gold text-primary-foreground font-medium text-sm hover:bg-gold/90 transition-colors"
            >
              Als Creator starten
            </Link>
            <button 
              onClick={() => window.location.reload()}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Seite neu laden
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className="fixed inset-0 w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      >
        {/* DOM Virtualization with 3-stage preloading strategy */}
        {episodes.map((episode, index) => {
          // Calculate distance from active video
          const distance = Math.abs(index - activeIndex);
          
          // Determine preload priority based on distance
          const preloadPriority = index === activeIndex 
            ? 'active' as const
            : distance === 1 
              ? 'nearby' as const
              : distance <= 3 
                ? 'prefetch' as const
                : 'none' as const;
          
          // Only render videos within ±2 positions for DOM efficiency
          const isInViewport = distance <= 2;
          
          if (!isInViewport) {
            // Placeholder div to maintain scroll position
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
              <FeedItem 
                episode={episode} 
                isActive={index === activeIndex}
                isNearby={distance <= 1}
                preloadPriority={preloadPriority}
                onOpenMenu={() => setShowSeriesMenu(true)}
                onAutoNext={() => scrollToEpisode((index + 1) % episodes.length)}
                onPrefetchNext={() => {
                  // At 75% progress, prefetch next video manifest
                  const nextIndex = index + 1;
                  if (nextIndex < episodes.length) {
                    const nextEpisode = episodes[nextIndex];
                    if (nextEpisode?.hlsUrl) {
                      // Prefetch next episode manifest (low priority)
                      fetch(nextEpisode.hlsUrl, { 
                        cache: 'force-cache',
                        priority: 'low' as RequestPriority,
                      }).catch(() => {});
                    }
                  }
                }}
                localLikesHook={localLikesHook}
                onOpenCreator={openCreator}
                onOpenSeries={(seriesId) => openSeries(seriesId, episode.id)}
              />
            </div>
          );
        })}
      </div>
      
      <SeriesMenu 
        isOpen={showSeriesMenu}
        onClose={() => setShowSeriesMenu(false)}
        onSelectEpisode={scrollToEpisode}
        currentEpisodeId={currentEpisode?.id}
      />

      {/* Subscription Prompt for logged-in users after 2 episodes */}
      {shouldShowPrompt && (
        <SubscriptionPromptOverlay onDismiss={dismissPrompt} />
      )}

      {/* Soft Auth Prompt for anonymous users after 4 videos */}
      <SoftAuthPrompt 
        open={shouldShowSoftPrompt} 
        onDismiss={dismissSoftPrompt}
        videosWatched={videosWatched}
      />

      {/* Push Notification Opt-In (after 3 videos) */}
      <NotificationOptIn />
    </>
  );
}