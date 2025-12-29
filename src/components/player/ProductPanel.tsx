import { X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductHotspot } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface ProductPanelProps {
  hotspot: ProductHotspot | null;
  onClose: () => void;
}

export function ProductPanel({ hotspot, onClose }: ProductPanelProps) {
  if (!hotspot) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed bottom-0 inset-x-0 z-40",
          "bg-card rounded-t-3xl",
          "border-t border-border/50",
          "animate-slide-up",
          "safe-area-bottom"
        )}
      >
        <div className="p-6 max-w-md mx-auto">
          {/* Handle */}
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-6" />

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="absolute top-4 right-4"
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Product content */}
          <div className="flex gap-4">
            {/* Product image */}
            <div className="w-24 h-24 rounded-xl bg-secondary flex-shrink-0 flex items-center justify-center">
              <span className="text-muted-foreground/50 text-xs">Image</span>
            </div>

            {/* Product info */}
            <div className="flex-1 min-w-0">
              <span className="text-caption text-muted-foreground">
                {hotspot.brand}
              </span>
              <h3 className="text-title mt-1 mb-2">{hotspot.productName}</h3>
              <p className="text-lg font-medium text-gold">{hotspot.price}</p>
            </div>
          </div>

          {/* Description placeholder */}
          <p className="text-body text-muted-foreground mt-4">
            Featured in this episode. Tap to explore more from the collection.
          </p>

          {/* CTA */}
          <Button
            variant="premium"
            className="w-full mt-6 h-12"
            onClick={(e) => e.stopPropagation()}
          >
            <span>View Product</span>
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </>
  );
}
