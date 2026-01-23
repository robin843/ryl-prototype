import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ProducerApplication {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  company_name: string;
  description: string;
  portfolio_url: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
}

export function useProducerApplication() {
  const { user } = useAuth();
  const [application, setApplication] = useState<ProducerApplication | null>(null);
  const [isProducer, setIsProducer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplication = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Check if user is already a verified producer
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'verified_producer')
        .maybeSingle();

      if (roleData) {
        setIsProducer(true);
        setLoading(false);
        return;
      }

      // Check for existing application
      const { data, error: fetchError } = await supabase
        .from('producer_applications')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      setApplication(data as ProducerApplication | null);
    } catch (err) {
      console.error('Error fetching producer application:', err);
      setError('Fehler beim Laden der Bewerbung');
    } finally {
      setLoading(false);
    }
  };

  const submitApplication = async (data: {
    company_name: string;
    description: string;
    portfolio_url?: string;
  }) => {
    if (!user) throw new Error('Not authenticated');

    // Check for referral code in localStorage
    const referralCode = localStorage.getItem('ryl_referral_code');

    const { error: insertError } = await supabase
      .from('producer_applications')
      .insert({
        user_id: user.id,
        company_name: data.company_name,
        description: data.description,
        portfolio_url: data.portfolio_url || null,
        referral_code: referralCode || null,
      });

    if (insertError) throw insertError;
    
    // Clear referral code from localStorage after successful submission
    if (referralCode) {
      localStorage.removeItem('ryl_referral_code');
    }
    
    await fetchApplication();
  };

  useEffect(() => {
    fetchApplication();
  }, [user]);

  return {
    application,
    isProducer,
    loading,
    error,
    submitApplication,
    refetch: fetchApplication,
  };
}
