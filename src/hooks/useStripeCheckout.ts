import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CreateCheckoutResult {
  checkoutUrl: string;
  sessionId: string;
}

/**
 * Hook for creating Stripe Checkout sessions from purchase intents.
 * Handles the redirect flow to Stripe Checkout.
 */
export function useStripeCheckout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createCheckout(
    purchaseIntentId: string
  ): Promise<CreateCheckoutResult | null> {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "create-stripe-checkout",
        {
          body: { purchase_intent_id: purchaseIntentId },
        }
      );

      if (fnError) {
        const errorMsg = fnError.message || "Failed to create checkout";
        setError(errorMsg);
        console.error('[useStripeCheckout] Function error:', fnError);
        return null;
      }

      if (data.error) {
        setError(data.error);
        console.error('[useStripeCheckout] Response error:', data.error);
        return null;
      }

      return {
        checkoutUrl: data.checkoutUrl,
        sessionId: data.sessionId,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Convenience method: creates checkout and redirects immediately
   * Throws error if checkout fails so caller can handle it
   */
  async function checkoutAndRedirect(purchaseIntentId: string): Promise<void> {
    const result = await createCheckout(purchaseIntentId);
    if (!result?.checkoutUrl) {
      // Throw the error so calling code can catch and display it
      throw new Error(error || "Checkout konnte nicht erstellt werden");
    }
    window.location.href = result.checkoutUrl;
  }

  return { createCheckout, checkoutAndRedirect, isLoading, error };
}
