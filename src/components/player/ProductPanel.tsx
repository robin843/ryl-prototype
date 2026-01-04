import { X, Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductHotspot } from "@/data/mockData";
import { CheckoutModal } from "./CheckoutModal";
import { cn } from "@/lib/utils";

interface ProductPanelProps {
  hotspot: ProductHotspot | null;
  episodeId?: string;
  onClose: () => void;
}

// Helper to parse price string to cents
function parsePriceToCents(priceDisplay: string): number {
  // Remove currency symbols and parse - e.g. "€2,450" -> 245000
  const cleaned = priceDisplay.replace(/[€$£,.\s]/g, "");
  const num = parseInt(cleaned, 10);
  // Assume the last two characters were cents if there was a decimal
  if (priceDisplay.includes(",") || priceDisplay.includes(".")) {
    return num;
  }
  // Otherwise multiply by 100 to get cents
  return num * 100;
}

export function ProductPanel({ hotspot, episodeId, onClose }: ProductPanelProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  if (!hotspot) return null;

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  const handleBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = () => {
    setShowCheckout(false);
    onClose();
  };

  const priceInCents = parsePriceToCents(hotspot.price);

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 z-30 bg-background/40 backdrop-blur-md animate-fade-in"
        onClick={onClose}
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
              onClick={onClose}
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
              {hotspot.imageUrl && hotspot.imageUrl !== '/placeholder.svg' ? (
                <img 
                  src={hotspot.imageUrl} 
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
                {hotspot.brand}
              </span>
              <h3 className="text-lg font-serif font-medium text-white mt-1 leading-tight">
                {hotspot.productName}
              </h3>
              <p className="text-2xl font-medium text-gold mt-2">
                {hotspot.price}
              </p>
            </div>
          </div>

          {/* Episode context */}
          <p className="text-sm text-white/40 mt-5 text-center">
            Gesehen in dieser Episode
          </p>

          {/* CTA Button - Premium feel */}
          <Button
            variant="premium"
            className={cn(
              "w-full mt-4 h-14 text-base font-medium",
              "rounded-2xl",
              "shadow-[0_4px_20px_rgba(212,175,55,0.3)]",
              "transition-all duration-300",
              "hover:shadow-[0_8px_30px_rgba(212,175,55,0.4)]",
              "hover:scale-[1.02]"
            )}
            onClick={handleBuy}
          >
            Jetzt kaufen
          </Button>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          productId={hotspot.id}
          productName={hotspot.productName}
          brandName={hotspot.brand}
          priceDisplay={hotspot.price}
          priceInCents={priceInCents}
          episodeId={episodeId}
          onClose={() => setShowCheckout(false)}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </>
  );
}
