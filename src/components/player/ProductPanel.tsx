import { X, Heart, ShoppingBag, Loader2, AlertCircle, Clock, ShieldCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ShopableHotspot } from "@/services/shopable/types";
import { getProductDetail } from "@/services/shopable";
import { cn } from "@/lib/utils";
import { usePurchaseIntent } from "@/hooks/usePurchaseIntent";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { useProducerStatus } from "@/hooks/useProducerStatus";
import { useTrackEvent } from "@/hooks/useTrackEvent";
import { ComingSoonOverlay } from "./ComingSoonOverlay";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProductPanelProps {
  hotspot: ShopableHotspot | null;
  episodeId?: string;
  producerId?: string;
  onClose: () => void;
}

// Helper to parse price string to cents
function parsePriceToCents(priceDisplay: string): number {
  // Remove currency symbols and parse - e.g. "€2.450,00" or "2.450,00 €" -> 245000
  const cleaned = priceDisplay.replace(/[€$£\s]/g, "");
  // Handle German format: 2.450,00 -> 245000
  const normalized = cleaned.replace(/\./g, "").replace(",", ".");
  const num = parseFloat(normalized);
  return Math.round(num * 100);
}

export function ProductPanel({ hotspot, episodeId, producerId, onClose }: ProductPanelProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [priceDisplay, setPriceDisplay] = useState<string>("");
  const [producerActive, setProducerActive] = useState<boolean | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const panelOpenTime = useRef<number>(Date.now());

  const { createIntent, isCreating } = usePurchaseIntent();
  const { checkoutAndRedirect, isLoading: isCheckoutLoading, error: checkoutError } = useStripeCheckout();
  const { checkProducerStatus, loading: checkingProducer } = useProducerStatus();
  const { trackProductPanelOpen, trackProductPanelClose, trackProductSave } = useTrackEvent();

  // Track panel open time for analytics
  useEffect(() => {
    if (hotspot) {
      panelOpenTime.current = Date.now();
      trackProductPanelOpen(hotspot.productId, episodeId || "", producerId || "");
    }
  }, [hotspot?.productId, episodeId, producerId, trackProductPanelOpen]);

  // Fetch product detail for price
  useEffect(() => {
    if (!hotspot) return;
    
    getProductDetail(hotspot.productId).then((res) => {
      if (res.success && res.data?.priceDisplay) {
        setPriceDisplay(res.data.priceDisplay);
      }
    });
  }, [hotspot?.productId]);

  // Check producer status - MUST have producerId and be active
  useEffect(() => {
    if (!producerId) {
      // No producerId = cannot verify producer, block purchase
      setProducerActive(false);
      console.warn('[ProductPanel] No producerId provided - blocking purchase');
      return;
    }

    checkProducerStatus(producerId).then((status) => {
      // MUST check charges_enabled + payouts_enabled + onboarding, not just stripeStatus
      const isActive = status?.stripeStatus === 'active' 
        && status?.chargesEnabled === true 
        && status?.payoutsEnabled === true 
        && status?.onboardingCompleted === true;
      setProducerActive(isActive);
      console.log('[ProductPanel] Producer status:', { 
        producerId, 
        stripeStatus: status?.stripeStatus, 
        chargesEnabled: status?.chargesEnabled,
        payoutsEnabled: status?.payoutsEnabled,
        onboardingCompleted: status?.onboardingCompleted,
        isActive,
      });
    });
  }, [producerId, checkProducerStatus]);

  if (!hotspot) return null;

  const handleClose = () => {
    // Track panel close with duration
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

  const handleBuy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Show Coming Soon if producer is not yet active on Stripe
    if (producerActive !== true) {
      setShowComingSoon(true);
      return;
    }
    
    // Block purchase if producer not verified
    if (!producerActive) {
      toast.error("Dieser Producer ist noch nicht für Auszahlungen freigeschaltet.");
      return;
    }

    setIsCheckingOut(true);

    try {
      // Step 1: Create purchase intent
      const intent = await createIntent({
        productId: hotspot.productId,
        quantity: 1,
        context: {
          episodeId,
          hotspotId: hotspot.id,
        },
      });

      if (!intent) {
        toast.error("Fehler beim Erstellen der Bestellung");
        setIsCheckingOut(false);
        return;
      }

      // Step 2: Create Stripe checkout and redirect
      await checkoutAndRedirect(intent.intentId);
      
      // Note: If we get here without redirect, show error
      // checkoutError from hook will have the message
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Checkout fehlgeschlagen";
      // Check for specific producer error from backend
      if (errorMessage.includes("Producer payment setup incomplete") || errorMessage.includes("Producer")) {
        toast.error("Der Verkäufer hat die Zahlungseinrichtung noch nicht abgeschlossen. Bitte versuche es später erneut.");
      } else {
        toast.error(errorMessage);
      }
      console.error("Checkout error:", err);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const isBusy = isCreating || isCheckoutLoading || isCheckingOut;
  const isPurchaseBlocked = producerActive === false;
  const isCheckingProducerStatus = checkingProducer && producerActive === null;

  const BuyButton = () => {
    const buttonContent = (
      <Button
        variant="premium"
        className={cn(
          "w-full mt-4 h-14 text-base font-medium",
          "rounded-2xl",
          "shadow-[0_4px_20px_rgba(212,175,55,0.3)]",
          "transition-all duration-300",
          isPurchaseBlocked ? "opacity-50 cursor-not-allowed" : [
            "hover:shadow-[0_8px_30px_rgba(212,175,55,0.4)]",
            "hover:scale-[1.02]"
          ]
        )}
        onClick={handleBuy}
        disabled={isBusy || isPurchaseBlocked || isCheckingProducerStatus}
      >
        {isCheckingProducerStatus ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Prüfe Verfügbarkeit...
          </span>
        ) : isBusy ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Wird vorbereitet...
          </span>
        ) : isPurchaseBlocked ? (
          <span className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Nicht verfügbar
          </span>
        ) : (
          "Jetzt kaufen"
        )}
      </Button>
    );

    if (isPurchaseBlocked) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {buttonContent}
            </TooltipTrigger>
            <TooltipContent>
              <p>Dieser Producer ist noch nicht für Auszahlungen freigeschaltet.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return buttonContent;
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
            {/* Product image - elevated design */}
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
                <ShoppingBag className="w-8 h-8 text-white/30" />
              )}
            </div>

            {/* Product info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
                {hotspot.brandName}
              </span>
              <h3 className="text-lg font-serif font-medium text-white mt-1 leading-tight">
                {hotspot.productName}
              </h3>
              {priceDisplay && (
                <p className="text-2xl font-medium text-gold mt-2">
                  {priceDisplay}
                </p>
              )}
            </div>
          </div>

          {/* Stripe trust signal */}
          <div className="flex items-center justify-center gap-2 mt-4 text-white/40">
            <ShieldCheck className="w-4 h-4 text-gold/60" />
            <span className="text-xs">Sichere Zahlung mit Stripe</span>
          </div>

          {/* Episode context */}
          <p className="text-sm text-white/40 mt-3 text-center">
            Gesehen in dieser Episode
          </p>

          {/* CTA Button with Guard */}
          <BuyButton />
        </div>
      </div>

      {/* Coming Soon Overlay for Mock Mode */}
      <ComingSoonOverlay
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        productName={hotspot.productName}
        productImage={hotspot.thumbnailUrl}
        brandName={hotspot.brandName}
        priceDisplay={priceDisplay}
        productId={hotspot.productId}
        episodeId={episodeId}
        creatorId={producerId}
      />
    </>
  );
}
