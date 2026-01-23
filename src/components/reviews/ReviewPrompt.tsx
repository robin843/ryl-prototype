import { useState } from "react";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarRating } from "./StarRating";
import { WriteReviewSheet } from "./WriteReviewSheet";
import { motion, AnimatePresence } from "framer-motion";

interface ReviewPromptProps {
  productId: string;
  productName: string;
  productImage?: string;
  purchaseIntentId?: string;
  onDismiss: () => void;
}

export function ReviewPrompt({
  productId,
  productName,
  productImage,
  purchaseIntentId,
  onDismiss,
}: ReviewPromptProps) {
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [quickRating, setQuickRating] = useState(0);

  const handleQuickRating = (rating: number) => {
    setQuickRating(rating);
    setShowWriteReview(true);
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="relative bg-card border border-border rounded-2xl p-4 shadow-lg"
        >
          {/* Close Button */}
          <button
            onClick={onDismiss}
            className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Schließen"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Content */}
          <div className="flex items-start gap-4 pr-6">
            {/* Product Image */}
            {productImage && (
              <div className="w-16 h-16 rounded-lg bg-muted/50 overflow-hidden flex-shrink-0">
                <img
                  src={productImage}
                  alt={productName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-gold fill-gold" />
                <span className="text-sm font-medium text-foreground">
                  Wie war dein Kauf?
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-3 truncate">
                {productName}
              </p>

              {/* Quick Rating Stars */}
              <div className="flex items-center gap-2">
                <StarRating
                  rating={quickRating}
                  size="md"
                  interactive
                  onChange={handleQuickRating}
                />
                <span className="text-xs text-muted-foreground">
                  Tippe zum Bewerten
                </span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-4 flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="flex-1 text-muted-foreground"
            >
              Später
            </Button>
            <Button
              size="sm"
              onClick={() => setShowWriteReview(true)}
              className="flex-1 bg-gold hover:bg-gold/90 text-black"
            >
              Bewertung schreiben
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Write Review Sheet */}
      <WriteReviewSheet
        isOpen={showWriteReview}
        onClose={() => {
          setShowWriteReview(false);
          onDismiss();
        }}
        productId={productId}
        productName={productName}
        purchaseIntentId={purchaseIntentId}
        onSuccess={onDismiss}
      />
    </>
  );
}
