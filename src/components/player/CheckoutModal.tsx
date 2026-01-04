import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { X, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

// Stripe publishable key - this is public and safe to include
const stripePromise = loadStripe("pk_test_51SlWJWLHz2QNjBxKehhnE6BIpMWMEUqZ6lKOQAGxfWEGBM9o0gNs3LwPIJy8V4V36t0wBRJXgRILd5edcHQbNPBB00LzJuqhKE");

interface CheckoutModalProps {
  productId: string;
  productName: string;
  brandName: string;
  priceDisplay: string;
  priceInCents: number;
  episodeId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

function CheckoutForm({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: "if_required",
    });

    if (submitError) {
      setError(submitError.message || "Zahlung fehlgeschlagen");
      setIsProcessing(false);
    } else {
      setIsComplete(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }
  };

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4 animate-scale-in" />
        <h3 className="text-xl font-serif text-white mb-2">Vielen Dank!</h3>
        <p className="text-white/60 text-center">
          Deine Bestellung wurde erfolgreich aufgegeben.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement 
        options={{
          layout: "tabs",
        }}
      />
      
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      <Button
        type="submit"
        variant="premium"
        className="w-full h-14 text-base font-medium rounded-2xl"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Wird bearbeitet...
          </span>
        ) : (
          "Jetzt bezahlen"
        )}
      </Button>
    </form>
  );
}

export function CheckoutModal({
  productId,
  productName,
  brandName,
  priceDisplay,
  priceInCents,
  episodeId,
  onClose,
  onSuccess,
}: CheckoutModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("create-payment-intent", {
          body: {
            productId,
            productName,
            brandName,
            priceInCents,
            episodeId,
          },
        });

        if (error) throw error;
        if (data.error) throw new Error(data.error);

        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error("Payment intent error:", err);
        setError(err instanceof Error ? err.message : "Fehler beim Erstellen der Zahlung");
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [productId, productName, brandName, priceInCents, episodeId]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "fixed inset-x-4 top-1/2 -translate-y-1/2 z-50",
          "max-w-md mx-auto",
          "bg-gradient-to-b from-card to-charcoal-deep",
          "rounded-3xl",
          "border border-white/10",
          "shadow-[0_20px_60px_rgba(0,0,0,0.5)]",
          "animate-scale-in"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wider">{brandName}</p>
            <h2 className="text-lg font-serif text-white">{productName}</h2>
            <p className="text-gold font-medium mt-1">{priceDisplay}</p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="shrink-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-gold animate-spin mb-4" />
              <p className="text-white/60">Checkout wird vorbereitet...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-400 mb-4">{error}</p>
              <Button variant="outline" onClick={onClose}>
                Schließen
              </Button>
            </div>
          )}

          {clientSecret && stripePromise && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "night",
                  variables: {
                    colorPrimary: "#d4af55",
                    colorBackground: "#1a1512",
                    colorText: "#f5f0e6",
                    colorDanger: "#ef4444",
                    fontFamily: "Inter, sans-serif",
                    borderRadius: "12px",
                  },
                },
              }}
            >
              <CheckoutForm onSuccess={onSuccess} onClose={onClose} />
            </Elements>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <p className="text-xs text-white/40 text-center">
            Sichere Zahlung über Stripe. Deine Daten sind verschlüsselt.
          </p>
        </div>
      </div>
    </>
  );
}
