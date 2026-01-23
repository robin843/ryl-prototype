import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PromoCode {
  id: string;
  creator_id: string;
  code: string;
  discount_percent: number | null;
  discount_amount_cents: number | null;
  usage_limit: number | null;
  used_count: number;
  expires_at: string | null;
  status: "active" | "disabled" | "expired";
  campaign_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface PromoCodeUsage {
  id: string;
  promo_code_id: string;
  purchase_intent_id: string | null;
  user_id: string | null;
  discount_applied_cents: number;
  created_at: string;
}

interface CreatePromoCodeParams {
  code: string;
  discount_percent?: number;
  discount_amount_cents?: number;
  usage_limit?: number;
  expires_at?: string;
  campaign_name?: string;
}

interface ValidatePromoCodeResult {
  valid: boolean;
  code?: PromoCode;
  error?: string;
  discountCents?: number;
}

export function usePromoCodes() {
  const { user } = useAuth();
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch creator's promo codes
  const fetchCodes = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setCodes((data as PromoCode[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch codes");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Create a new promo code
  const createCode = useCallback(
    async (params: CreatePromoCodeParams): Promise<PromoCode | null> => {
      if (!user) {
        setError("Not authenticated");
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Validate code format (alphanumeric, uppercase, 4-12 chars)
        const normalizedCode = params.code.toUpperCase().trim();
        if (!/^[A-Z0-9]{4,12}$/.test(normalizedCode)) {
          throw new Error("Code must be 4-12 alphanumeric characters");
        }

        // Validate discount
        if (!params.discount_percent && !params.discount_amount_cents) {
          throw new Error("Either discount_percent or discount_amount_cents required");
        }
        if (params.discount_percent && params.discount_amount_cents) {
          throw new Error("Cannot set both discount types");
        }
        if (params.discount_percent && (params.discount_percent < 1 || params.discount_percent > 50)) {
          throw new Error("Discount must be between 1% and 50%");
        }
        if (params.discount_amount_cents && params.discount_amount_cents < 100) {
          throw new Error("Minimum discount is €1.00");
        }

        const { data, error: insertError } = await supabase
          .from("promo_codes")
          .insert({
            creator_id: user.id,
            code: normalizedCode,
            discount_percent: params.discount_percent || null,
            discount_amount_cents: params.discount_amount_cents || null,
            usage_limit: params.usage_limit || null,
            expires_at: params.expires_at || null,
            campaign_name: params.campaign_name || null,
          })
          .select()
          .single();

        if (insertError) {
          if (insertError.code === "23505") {
            throw new Error("This code already exists");
          }
          throw insertError;
        }

        setCodes((prev) => [data as PromoCode, ...prev]);
        return data as PromoCode;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create code";
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  // Update a promo code (status only)
  const updateCode = useCallback(
    async (codeId: string, updates: { status?: "active" | "disabled" }): Promise<boolean> => {
      if (!user) return false;

      try {
        const { error: updateError } = await supabase
          .from("promo_codes")
          .update(updates)
          .eq("id", codeId)
          .eq("creator_id", user.id);

        if (updateError) throw updateError;

        setCodes((prev) =>
          prev.map((c) => (c.id === codeId ? { ...c, ...updates } : c))
        );
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update code");
        return false;
      }
    },
    [user]
  );

  // Delete a promo code
  const deleteCode = useCallback(
    async (codeId: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const { error: deleteError } = await supabase
          .from("promo_codes")
          .delete()
          .eq("id", codeId)
          .eq("creator_id", user.id);

        if (deleteError) throw deleteError;

        setCodes((prev) => prev.filter((c) => c.id !== codeId));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete code");
        return false;
      }
    },
    [user]
  );

  // Validate a promo code for checkout (public, no auth required)
  const validateCode = useCallback(
    async (code: string, totalCents: number): Promise<ValidatePromoCodeResult> => {
      const normalizedCode = code.toUpperCase().trim();

      try {
        const { data, error: fetchError } = await supabase
          .from("promo_codes")
          .select("*")
          .eq("code", normalizedCode)
          .eq("status", "active")
          .single();

        if (fetchError || !data) {
          return { valid: false, error: "Code not found or expired" };
        }

        const promoCode = data as PromoCode;

        // Check usage limit
        if (promoCode.usage_limit && promoCode.used_count >= promoCode.usage_limit) {
          return { valid: false, error: "Code usage limit reached" };
        }

        // Check expiration
        if (promoCode.expires_at && new Date(promoCode.expires_at) < new Date()) {
          return { valid: false, error: "Code has expired" };
        }

        // Calculate discount
        let discountCents = 0;
        if (promoCode.discount_percent) {
          discountCents = Math.round(totalCents * (promoCode.discount_percent / 100));
        } else if (promoCode.discount_amount_cents) {
          discountCents = Math.min(promoCode.discount_amount_cents, totalCents);
        }

        return {
          valid: true,
          code: promoCode,
          discountCents,
        };
      } catch (err) {
        return { valid: false, error: "Failed to validate code" };
      }
    },
    []
  );

  // Fetch usages for a specific code
  const fetchCodeUsages = useCallback(
    async (codeId: string): Promise<PromoCodeUsage[]> => {
      if (!user) return [];

      try {
        const { data, error: fetchError } = await supabase
          .from("promo_code_usages")
          .select("*")
          .eq("promo_code_id", codeId)
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;
        return (data as PromoCodeUsage[]) || [];
      } catch {
        return [];
      }
    },
    [user]
  );

  // Calculate total stats
  const stats = {
    totalCodes: codes.length,
    activeCodes: codes.filter((c) => c.status === "active").length,
    totalUsages: codes.reduce((sum, c) => sum + c.used_count, 0),
  };

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  return {
    codes,
    stats,
    isLoading,
    error,
    fetchCodes,
    createCode,
    updateCode,
    deleteCode,
    validateCode,
    fetchCodeUsages,
  };
}
