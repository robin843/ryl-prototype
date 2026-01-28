import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const REFERRAL_CODE_KEY = 'ryl_user_referral_code';

export interface UserReferralCode {
  id: string;
  user_id: string;
  code: string;
  created_at: string;
}

export interface UserReferral {
  id: string;
  referrer_id: string;
  referred_id: string;
  referral_code: string;
  status: 'pending' | 'rewarded' | 'expired';
  referrer_reward_cents: number;
  referred_reward_cents: number;
  rewarded_at: string | null;
  expires_at: string;
  created_at: string;
}

export interface UserReferralStats {
  totalReferrals: number;
  rewardedReferrals: number;
  totalEarnedCents: number;
  pendingReferrals: number;
}

// Helper to generate a short random code
function generateShortCode(length = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function useUserReferral() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get user's referral code - create one if it doesn't exist
  const { data: referralCode, isLoading: codeLoading } = useQuery({
    queryKey: ['user-referral-code', user?.id],
    queryFn: async (): Promise<UserReferralCode | null> => {
      if (!user) return null;

      // First, try to get existing code
      const { data: existingCode, error: fetchError } = await supabase
        .from('user_referral_codes')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('[useUserReferral] Error fetching code:', fetchError);
        return null;
      }

      // If code exists, return it
      if (existingCode) {
        return existingCode;
      }

      // No code exists - create one for this user
      console.log('[useUserReferral] No code found, creating one for user:', user.id);
      
      const newCode = `ryl-${generateShortCode(6)}`;
      
      const { data: createdCode, error: insertError } = await supabase
        .from('user_referral_codes')
        .insert({ user_id: user.id, code: newCode })
        .select()
        .single();

      if (insertError) {
        console.error('[useUserReferral] Error creating code:', insertError);
        return null;
      }

      console.log('[useUserReferral] Created new referral code:', createdCode.code);
      return createdCode;
    },
    enabled: !!user,
  });

  // Get referrals made by this user
  const { data: referrals = [], isLoading: referralsLoading } = useQuery({
    queryKey: ['user-referrals', user?.id],
    queryFn: async (): Promise<UserReferral[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useUserReferral] Error fetching referrals:', error);
        return [];
      }

      // Cast status to the correct type
      return (data || []).map(r => ({
        ...r,
        status: r.status as 'pending' | 'rewarded' | 'expired',
      }));
    },
    enabled: !!user,
  });

  // Get user's credits
  const { data: credits = 0 } = useQuery({
    queryKey: ['user-credits', user?.id],
    queryFn: async (): Promise<number> => {
      if (!user) return 0;

      const { data, error } = await supabase
        .from('profiles')
        .select('credits_cents')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('[useUserReferral] Error fetching credits:', error);
        return 0;
      }

      return data?.credits_cents ?? 0;
    },
    enabled: !!user,
  });

  // Calculate stats
  const stats: UserReferralStats = {
    totalReferrals: referrals.length,
    rewardedReferrals: referrals.filter(r => r.status === 'rewarded').length,
    pendingReferrals: referrals.filter(r => r.status === 'pending').length,
    totalEarnedCents: referrals
      .filter(r => r.status === 'rewarded')
      .reduce((sum, r) => sum + r.referrer_reward_cents, 0),
  };

  const getReferralLink = () => {
    if (!referralCode) return null;
    return `https://ryl.app/invite/${referralCode.code}`;
  };

  return {
    referralCode: referralCode?.code ?? null,
    referrals,
    stats,
    credits,
    loading: codeLoading || referralsLoading,
    getReferralLink,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['user-referral-code'] });
      queryClient.invalidateQueries({ queryKey: ['user-referrals'] });
      queryClient.invalidateQueries({ queryKey: ['user-credits'] });
    },
  };
}

// Hook to validate and apply a referral code during signup
export function useApplyUserReferral() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const applyReferralMutation = useMutation({
    mutationFn: async (code: string) => {
      if (!user) throw new Error('Not authenticated');

      // Find the referral code
      const { data: codeData, error: codeError } = await supabase
        .from('user_referral_codes')
        .select('*')
        .eq('code', code)
        .maybeSingle();

      if (codeError) throw codeError;
      if (!codeData) throw new Error('Invalid referral code');
      if (codeData.user_id === user.id) throw new Error('Cannot use own referral code');

      // Check if user was already referred
      const { data: existing } = await supabase
        .from('user_referrals')
        .select('id')
        .eq('referred_id', user.id)
        .maybeSingle();

      if (existing) throw new Error('Already referred');

      // Create the referral
      const { error: insertError } = await supabase
        .from('user_referrals')
        .insert({
          referrer_id: codeData.user_id,
          referred_id: user.id,
          referral_code: code,
        });

      if (insertError) throw insertError;

      // Clear stored code
      localStorage.removeItem(REFERRAL_CODE_KEY);

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-referrals'] });
      toast.success('Einladungscode eingelöst! Du erhältst €5 Rabatt auf deinen ersten Kauf.');
    },
    onError: (error) => {
      console.error('[useApplyUserReferral] Error:', error);
      // Don't show error toast for invalid codes during auto-apply
    },
  });

  // Auto-apply stored referral code after signup
  useEffect(() => {
    if (user) {
      const storedCode = localStorage.getItem(REFERRAL_CODE_KEY);
      if (storedCode) {
        applyReferralMutation.mutate(storedCode);
      }
    }
  }, [user]);

  return {
    applyReferral: applyReferralMutation.mutate,
    isApplying: applyReferralMutation.isPending,
  };
}

// Hook to validate a referral code (for invite page)
export function useValidateUserReferralCode(code: string | undefined) {
  return useQuery({
    queryKey: ['validate-user-referral', code],
    queryFn: async () => {
      if (!code) return { isValid: false, referrer: null };

      // First get the referral code
      const { data: codeData, error: codeError } = await supabase
        .from('user_referral_codes')
        .select('*')
        .eq('code', code)
        .maybeSingle();

      if (codeError || !codeData) {
        return { isValid: false, referrer: null };
      }

      // Then get the profile separately
      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name, avatar_url, username')
        .eq('user_id', codeData.user_id)
        .maybeSingle();

      return {
        isValid: true,
        referrer: {
          userId: codeData.user_id,
          profile: profileData,
        },
      };
    },
    enabled: !!code,
  });
}
