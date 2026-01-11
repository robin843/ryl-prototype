import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProducerStatusData {
  stripeAccountId: string | null;
  stripeStatus: 'not_connected' | 'pending' | 'active';
  onboardingCompleted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
}

/**
 * Hook to check a producer's Stripe status by their user ID.
 * Used in frontend guards to prevent purchases from non-active producers.
 */
export function useProducerStatus() {
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState<Record<string, ProducerStatusData>>({});

  const checkProducerStatus = useCallback(async (producerId: string): Promise<ProducerStatusData | null> => {
    // Check cache first
    if (cache[producerId]) {
      return cache[producerId];
    }

    setLoading(true);

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('stripe_account_id, stripe_account_status, stripe_onboarding_completed')
        .eq('user_id', producerId)
        .single();

      if (error || !profile) {
        console.error('Error fetching producer status:', error);
        return null;
      }

      let status: ProducerStatusData['stripeStatus'] = 'not_connected';
      
      if (profile.stripe_account_id) {
        if (profile.stripe_account_status === 'verified' && profile.stripe_onboarding_completed) {
          status = 'active';
        } else {
          status = 'pending';
        }
      }

      const result: ProducerStatusData = {
        stripeAccountId: profile.stripe_account_id,
        stripeStatus: status,
        onboardingCompleted: profile.stripe_onboarding_completed || false,
        chargesEnabled: profile.stripe_account_status === 'verified',
        payoutsEnabled: profile.stripe_account_status === 'verified',
      };

      // Update cache
      setCache(prev => ({ ...prev, [producerId]: result }));

      return result;
    } catch (err) {
      console.error('Error checking producer status:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [cache]);

  const clearCache = useCallback(() => {
    setCache({});
  }, []);

  return {
    loading,
    checkProducerStatus,
    clearCache,
  };
}
