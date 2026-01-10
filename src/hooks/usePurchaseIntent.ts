import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CreateIntentParams {
  productId: string;
  quantity?: number;
  context?: {
    episodeId?: string;
    hotspotId?: string;
  };
}

interface PurchaseIntentResult {
  intentId: string;
  status: string;
  totalCents: number;
  currency: string;
  expiresAt: string;
}

/**
 * Minimal hook for creating purchase intents on hotspot click.
 * No Stripe, no checkout UI - just intent creation.
 */
export function usePurchaseIntent() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createIntent(
    params: CreateIntentParams
  ): Promise<PurchaseIntentResult | null> {
    setIsCreating(true);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        setError("Not authenticated");
        return null;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-purchase-intent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: params.productId,
            quantity: params.quantity ?? 1,
            context: params.context,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create intent");
        return null;
      }

      return {
        intentId: data.intentId,
        status: data.status,
        totalCents: data.totalCents,
        currency: data.currency,
        expiresAt: data.expiresAt,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    } finally {
      setIsCreating(false);
    }
  }

  return { createIntent, isCreating, error };
}
