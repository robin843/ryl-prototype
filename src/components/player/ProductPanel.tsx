import { X, Heart, ShoppingBag, ExternalLink, ShieldCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ShopableHotspot } from "@/services/shopable/types";
import { getProductDetail } from "@/services/shopable";
import { cn } from "@/lib/utils";
import { useTrackEvent } from "@/hooks/useTrackEvent";

interface ProductPanelProps {
  hotspot: ShopableHotspot | null;
  episodeId?: string;
  producerId?: string;
  onClose: () => void;
}

export function ProductPanel({ hotspot, episodeId, producerId, onClose }: ProductPanelProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [priceDisplay, setPriceDisplay] = useState<string>("");
  const [productUrl, setProductUrl] = useState<string>("");
  const panelOpenTime = useRef<number>(Date.now());

  const { trackProductPanelOpen, trackProductPanelClose, trackProductSave } = useTrackEvent();

  // Track panel open time for analytics
  useEffect(() => {
    if (hotspot) {
      panelOpenTime.current = Date.now();
      trackProductPanelOpen(hotspot.productId, episodeId || "", producerId || "");
    }
  }, [hotspot?.productId, episodeId, producerId, trackProductPanelOpen]);

  // Fetch product detail for price and URL
  useEffect(() => {
    if (!hotspot) return;

    getProductDetail(hotspot.productId).then((res) => {
      if (res.success && res.data) {
        if (res.data.priceDisplay) setPriceDisplay(res.data.priceDisplay);
        if (res.data.productUrl) setProductUrl(res.data.productUrl);
      }
    });
  }, [hotspot?.productId]);

  if (!hotspot) return null;

  const handleClose = () => {
    const durationMs = Date.now() - panelOpenTime.current;
    trackProductPanelClose(hotspot.productId, episodeId || "", producerId || "", durationMs);
    onClose();
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newSaved = !isSaved;
    setIsSaved(newSaved);
    if (newSaved) {
      trackProductSave(hotspot.productId, episodeId || "", producerId || "");
    }
  };

  const handleVisitProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (productUrl) {
      window.open(productUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 z-30 bg-background/40 backdrop-blur-md animate-fade-in"
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed bottom-0 inset-x-0 z-40",
          "bg-gradient-to-t from-card via-card to-card/95",
          "rounded-t-[2rem]",
          "border-t border-white/10",
          "animate-slide-up",
          "safe-area-bottom"
        )}
      >
        {/* Swipe handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-white/20 rounded-full" />
        </div>

        <div className="px-6 pb-8 max-w-md mx-auto">
          {/* Close & Save buttons */}
          <div className="flex justify-between items-center mb-4">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleSave}
              className={cn(
                "transition-colors",
                isSaved && "text-red-400"
              )}
            >
              <Heart className={cn("w-5 h-5", isSaved && "fill-current")} />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Product content */}
          <div className="flex gap-5">
            {/* Product image */}
            <div className={cn(
              "w-28 h-28 rounded-2xl flex-shrink-0",
              "bg-gradient-to-br from-white/10 to-white/5",
              "border border-white/10",
              "flex items-center justify-center",
              "overflow-hidden",
              "shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
            )}>
              {hotspot.thumbnailUrl && hotspot.thumbnailUrl !== '/placeholder.svg' ? (
                <img
                  src={hotspot.thumbnailUrl}
                  alt={hotspot.productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ShoppingBag className="w-8 h-8 text-muted-foreground" />
              )}
            </div>

            {/* Product info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {hotspot.brandName}
              </span>
              <h3 className="text-lg font-serif font-medium text-foreground mt-1 leading-tight">
                {hotspot.productName}
              </h3>
              {priceDisplay && (
                <p className="text-2xl font-medium text-gold mt-2">
                  {priceDisplay}
                </p>
              )}
            </div>
          </div>

          {/* Trust signal */}
          <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-gold/60" />
            <span className="text-xs">Direkt zum Produkt</span>
          </div>

          {/* Episode context */}
          <p className="text-sm text-muted-foreground mt-3 text-center">
            Gesehen in dieser Episode
          </p>

          {/* CTA Button — redirects to product URL */}
          <Button
            variant="premium"
            className={cn(
              "w-full mt-4 h-14 text-base font-medium",
              "rounded-2xl",
              "shadow-[0_4px_20px_rgba(212,175,55,0.3)]",
              "transition-all duration-300",
              !productUrl ? "opacity-50 cursor-not-allowed" : [
                "hover:shadow-[0_8px_30px_rgba(212,175,55,0.4)]",
                "hover:scale-[1.02]"
              ]
            )}
            onClick={handleVisitProduct}
            disabled={!productUrl}
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5" />
              Zum Produkt
            </span>
          </Button>
        </div>
      </div>
    </>
  );
}
