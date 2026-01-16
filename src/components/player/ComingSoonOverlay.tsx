import { useState } from "react";
import { X, Clock, Loader2, CheckCircle, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTrackEvent } from "@/hooks/useTrackEvent";

interface ComingSoonOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productImage?: string;
  brandName: string;
  priceDisplay?: string;
  productId: string;
  episodeId?: string;
  creatorId?: string;
}

export function ComingSoonOverlay({
  isOpen,
  onClose,
  productName,
  productImage,
  brandName,
  priceDisplay,
  productId,
  episodeId,
  creatorId,
}: ComingSoonOverlayProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { trackMockCheckoutAttempt } = useTrackEvent();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast.error("Bitte gib eine gültige E-Mail-Adresse ein");
      return;
    }

    setIsSubmitting(true);

    try {
      // Track mock checkout attempt
      trackMockCheckoutAttempt(productId, episodeId || "", creatorId || "");

      // Save email to waitlist (using type assertion until types regenerate)
      const { error } = await (supabase
        .from("product_waitlist" as any)
        .insert({
          email,
          product_id: productId,
          episode_id: episodeId || null,
        }) as any);

      if (error) {
        // Handle duplicate email gracefully
        if (error.code === "23505") {
          setIsSuccess(true);
          toast.success("Du bist bereits auf der Warteliste!");
        } else {
          throw error;
        }
      } else {
        setIsSuccess(true);
        toast.success("Du wirst benachrichtigt, sobald verfügbar!");
      }
    } catch (err) {
      console.error("Error saving to waitlist:", err);
      toast.error("Etwas ist schief gelaufen. Bitte versuche es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setIsSuccess(false);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-background/60 backdrop-blur-md animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "fixed inset-x-4 top-1/2 -translate-y-1/2 z-50",
          "max-w-md mx-auto",
          "bg-gradient-to-b from-card via-card to-card/95",
          "rounded-3xl",
          "border border-gold/20",
          "shadow-[0_0_60px_rgba(212,175,55,0.15)]",
          "animate-scale-in"
        )}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 pt-8">
          {/* Coming Soon Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30">
              <Clock className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium text-gold">Bald verfügbar</span>
            </div>
          </div>

          {/* Product Preview */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 mb-6">
            <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              {productImage && productImage !== "/placeholder.svg" ? (
                <img src={productImage} alt={productName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gold/20" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/50 uppercase tracking-wider">{brandName}</p>
              <p className="text-sm font-medium text-white truncate">{productName}</p>
              {priceDisplay && (
                <p className="text-lg font-medium text-gold mt-0.5">{priceDisplay}</p>
              )}
            </div>
          </div>

          {/* Content */}
          {isSuccess ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Du bist dabei!
              </h3>
              <p className="text-sm text-white/60 mb-6">
                Wir benachrichtigen dich, sobald dieses Produkt in Ryl verfügbar ist.
              </p>
              <Button variant="outline" onClick={handleClose} className="w-full">
                Zurück zum Video
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-white mb-2">
                  Wir arbeiten an deinem Shopping-Erlebnis
                </h3>
                <p className="text-sm text-white/60">
                  Hinterlasse deine E-Mail und sei unter den Ersten, die dieses Produkt in Ryl kaufen können.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <Input
                    type="email"
                    placeholder="deine@email.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cn(
                      "pl-12 h-14 rounded-2xl",
                      "bg-white/5 border-white/10",
                      "text-white placeholder:text-white/40",
                      "focus:border-gold/50 focus:ring-gold/20"
                    )}
                    disabled={isSubmitting}
                  />
                </div>

                <Button
                  type="submit"
                  variant="premium"
                  className="w-full h-14 rounded-2xl text-base"
                  disabled={isSubmitting || !email}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Wird gespeichert...
                    </span>
                  ) : (
                    "Benachrichtige mich"
                  )}
                </Button>
              </form>

              {/* Trust signal */}
              <div className="flex items-center justify-center gap-2 mt-6 text-white/40">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs">Deine Daten sind sicher bei uns</span>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
