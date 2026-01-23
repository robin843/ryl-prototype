import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function usePriceAlert() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const togglePriceAlertMutation = useMutation({
    mutationFn: async ({ productId, enabled }: { productId: string; enabled: boolean }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('saved_products')
        .update({ price_alert_enabled: enabled })
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
    },
    onSuccess: (_, { enabled }) => {
      queryClient.invalidateQueries({ queryKey: ['saved-products'] });
      toast.success(enabled ? 'Preis-Alert aktiviert' : 'Preis-Alert deaktiviert');
    },
    onError: (error) => {
      console.error('[usePriceAlert] Error:', error);
      toast.error('Fehler beim Aktualisieren des Preis-Alerts');
    },
  });

  const togglePriceAlert = useCallback((productId: string, enabled: boolean) => {
    togglePriceAlertMutation.mutate({ productId, enabled });
  }, [togglePriceAlertMutation]);

  return {
    togglePriceAlert,
    isUpdating: togglePriceAlertMutation.isPending,
  };
}

// Calculate price change information
export function calculatePriceChange(
  currentPriceCents: number,
  savedPriceCents: number | null | undefined
): { hasChanged: boolean; direction: 'up' | 'down' | 'same'; percentChange: number } {
  if (!savedPriceCents) {
    return { hasChanged: false, direction: 'same', percentChange: 0 };
  }

  if (currentPriceCents === savedPriceCents) {
    return { hasChanged: false, direction: 'same', percentChange: 0 };
  }

  const percentChange = Math.round(
    ((currentPriceCents - savedPriceCents) / savedPriceCents) * 100
  );

  return {
    hasChanged: true,
    direction: currentPriceCents < savedPriceCents ? 'down' : 'up',
    percentChange: Math.abs(percentChange),
  };
}
