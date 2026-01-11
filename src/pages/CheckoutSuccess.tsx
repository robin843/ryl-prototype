import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { PurchaseSuccessOverlay } from "@/components/player/PurchaseSuccessOverlay";
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
  const [countdown, setCountdown] = useState(3);
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
    }, 1500);

    return () => clearTimeout(timer);
  }, [sessionId]);

  // Auto-redirect countdown after verification
  useEffect(() => {
    if (isVerifying) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVerifying]);

  const handleComplete = () => {
    // Clear purchase context
    clearPurchaseContext();
    // Navigate back to feed
    const returnUrl = getReturnUrl();
    navigate(returnUrl);
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
    <PurchaseSuccessOverlay
      context={purchaseContext}
      onComplete={handleComplete}
      countdown={countdown}
    />
  );
}
