import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ConnectedAccountStatus {
  hasAccount: boolean;
  accountId?: string;
  status: 'none' | 'pending' | 'verified' | 'restricted';
  onboardingCompleted: boolean;
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
}

export function useStripeConnect() {
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [accountStatus, setAccountStatus] = useState<ConnectedAccountStatus | null>(null);

  const createConnectedAccount = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Bitte melde dich an');
        return null;
      }

      const { data, error } = await supabase.functions.invoke('create-connected-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Create connected account error:', error);
        toast.error('Fehler beim Erstellen des Auszahlungskontos');
        return null;
      }

      if (data?.error) {
        toast.error(data.error);
        return null;
      }

      return data as { success: boolean; url: string; accountId: string };
    } catch (err) {
      console.error('Create connected account error:', err);
      toast.error('Ein unerwarteter Fehler ist aufgetreten');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAccountStatus = useCallback(async () => {
    setCheckingStatus(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return null;
      }

      const { data, error } = await supabase.functions.invoke('check-connected-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Check connected account error:', error);
        return null;
      }

      if (data?.success) {
        const status: ConnectedAccountStatus = {
          hasAccount: data.hasAccount,
          accountId: data.accountId,
          status: data.status,
          onboardingCompleted: data.onboardingCompleted,
          payoutsEnabled: data.payoutsEnabled ?? false,
          chargesEnabled: data.chargesEnabled ?? false,
        };
        setAccountStatus(status);
        return status;
      }

      return null;
    } catch (err) {
      console.error('Check connected account error:', err);
      return null;
    } finally {
      setCheckingStatus(false);
    }
  }, []);

  const startOnboarding = useCallback(async () => {
    const result = await createConnectedAccount();
    if (result?.url) {
      // Redirect to Stripe onboarding
      window.location.href = result.url;
    }
  }, [createConnectedAccount]);

  return {
    loading,
    checkingStatus,
    accountStatus,
    createConnectedAccount,
    checkAccountStatus,
    startOnboarding,
  };
}
