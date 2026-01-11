import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [countdown, setCountdown] = useState(3);

  const sessionId = searchParams.get("session_id");

  // Verification delay
  useEffect(() => {
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
          navigate("/feed");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVerifying, navigate]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-foreground animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Zahlung wird bestätigt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div
        className={cn(
          "max-w-md w-full",
          "bg-card",
          "rounded-2xl",
          "border border-border",
          "p-8 text-center"
        )}
      >
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-2xl font-black uppercase text-foreground mb-2">
            Vielen Dank!
          </h1>
          <p className="text-muted-foreground">
            Deine Bestellung wurde erfolgreich aufgegeben.
          </p>
        </div>

        {/* Auto-redirect indicator */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-3">
            Weiter geht's in {countdown}...
          </p>
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-foreground rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${((3 - countdown) / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Tap anywhere to go back immediately */}
        <button
          onClick={() => navigate("/feed")}
          className="w-full py-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Tippe, um sofort weiterzuschauen
        </button>

        <p className="text-xs text-muted-foreground/50 mt-4">
          Du erhältst eine Bestätigung per E-Mail.
        </p>
      </div>
    </div>
  );
}
