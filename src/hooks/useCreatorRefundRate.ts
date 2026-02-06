import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RefundStats {
  totalRefunds: number;
  totalRefundCents: number;
  refundRatePct: number;
  netRevenueCents: number;
  clawbackCents: number;
  isLoading: boolean;
}

export function useCreatorRefundRate(
  creatorId: string | undefined,
  totalRevenueCents: number,
  totalSales: number
): RefundStats {
  const [stats, setStats] = useState<RefundStats>({
    totalRefunds: 0,
    totalRefundCents: 0,
    refundRatePct: 0,
    netRevenueCents: 0,
    clawbackCents: 0,
    isLoading: true,
  });

  const fetch = useCallback(async () => {
    if (!creatorId) {
      setStats(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const { data: returns, error } = await supabase
        .from('purchase_returns')
        .select('refund_amount_cents')
        .eq('creator_id', creatorId);

      if (error) throw error;

      const totalRefunds = (returns || []).length;
      const totalRefundCents = (returns || []).reduce(
        (sum, r) => sum + (r.refund_amount_cents || 0),
        0
      );

      // Clawback = creator's share of refunds (using starter tier 85%)
      const clawbackCents = Math.round(totalRefundCents * 0.85);
      const netRevenueCents = Math.max(0, totalRevenueCents - clawbackCents);
      const refundRatePct = totalSales > 0 ? (totalRefunds / totalSales) * 100 : 0;

      setStats({
        totalRefunds,
        totalRefundCents,
        refundRatePct,
        netRevenueCents,
        clawbackCents,
        isLoading: false,
      });
    } catch (err) {
      console.error('Error fetching refund rate:', err);
      setStats(prev => ({ ...prev, isLoading: false }));
    }
  }, [creatorId, totalRevenueCents, totalSales]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return stats;
}
