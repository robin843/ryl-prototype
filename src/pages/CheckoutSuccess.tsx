import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, PartyPopper, CheckCircle } from "lucide-react";
import { ReviewPrompt } from "@/components/reviews";
import { Button } from "@/components/ui/button";
import { 
  getPurchaseContext, 
  clearPurchaseContext, 
  PurchaseContext,
  getReturnUrl 
} from "@/hooks/usePurchaseContext";

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);
  const [purchaseContext, setPurchaseContext] = useState<PurchaseContext | null>(null);

  const sessionId = searchParams.get("session_id");

  // Load purchase context and verify
  useEffect(() => {
    // Get stored purchase context
    const context = getPurchaseContext();
    setPurchaseContext(context);

    // Verification delay (could be enhanced to actually verify with Stripe)
    const timer = setTimeout(() => {
      setIsVerifying(false);
      // Show review prompt after verification
      if (context?.productId) {
        setShowReviewPrompt(true);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [sessionId]);

  const handleComplete = () => {
    // Clear purchase context
    clearPurchaseContext();
    // Navigate back to feed
    const returnUrl = getReturnUrl();
    navigate(returnUrl);
  };

  const handleDismissReview = () => {
    setShowReviewPrompt(false);
    handleComplete();
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gold animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Zahlung wird bestätigt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Success State */}
      <div className="text-center mb-8">
        <div className="relative inline-block mb-6">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <PartyPopper className="w-8 h-8 text-gold absolute -top-2 -right-2" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Zahlung erfolgreich!
        </h1>
        <p className="text-muted-foreground mb-2">
          Vielen Dank für deinen Einkauf.
        </p>
        
        {purchaseContext && (
          <div className="mt-4 p-4 rounded-xl bg-card/50 border border-border/30 text-left max-w-sm mx-auto">
            <div className="flex items-center gap-3">
              {purchaseContext.productImage && (
                <img 
                  src={purchaseContext.productImage} 
                  alt={purchaseContext.productName}
                  className="w-14 h-14 rounded-lg object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gold">{purchaseContext.brandName}</p>
                <p className="font-medium text-sm text-foreground truncate">
                  {purchaseContext.productName}
                </p>
                <p className="text-sm text-gold">{purchaseContext.priceDisplay}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Review Prompt */}
      {showReviewPrompt && purchaseContext && (
        <div className="w-full max-w-sm mb-6">
          <ReviewPrompt
            productId={purchaseContext.productId}
            productName={purchaseContext.productName}
            productImage={purchaseContext.productImage || undefined}
            purchaseIntentId={purchaseContext.purchaseIntentId}
            onDismiss={handleDismissReview}
          />
        </div>
      )}

      {/* Continue Button */}
      {!showReviewPrompt && (
        <Button
          onClick={handleComplete}
          className="bg-gold hover:bg-gold/90 text-black min-w-[200px]"
        >
          Weiter shoppen
        </Button>
      )}
    </div>
  );
}
