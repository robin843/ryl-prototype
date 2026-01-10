import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Brief verification delay for UX
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [sessionId]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gold animate-spin mx-auto mb-4" />
          <p className="text-white/60">Zahlung wird bestätigt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div
        className={cn(
          "max-w-md w-full",
          "bg-gradient-to-b from-card to-charcoal-deep",
          "rounded-3xl",
          "border border-white/10",
          "shadow-[0_20px_60px_rgba(0,0,0,0.5)]",
          "p-8 text-center"
        )}
      >
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-2xl font-serif text-white mb-2">
            Vielen Dank!
          </h1>
          <p className="text-white/60">
            Deine Bestellung wurde erfolgreich aufgegeben.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            variant="premium"
            className="w-full h-12 rounded-xl"
            onClick={() => navigate("/feed")}
          >
            Weiter schauen
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl"
            onClick={() => navigate("/saved")}
          >
            Meine Produkte
          </Button>
        </div>

        <p className="text-xs text-white/40 mt-6">
          Du erhältst eine Bestätigung per E-Mail.
        </p>
      </div>
    </div>
  );
}
