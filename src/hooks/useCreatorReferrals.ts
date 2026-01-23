import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ReferralCode {
  id: string;
  creator_id: string;
  code: string;
  created_at: string;
}

export interface CreatorReferral {
  id: string;
  referrer_id: string;
  referred_id: string;
  referral_code: string;
  status: 'pending' | 'active' | 'expired';
  expires_at: string;
  created_at: string;
  referred_profile?: {
    display_name: string | null;
    avatar_url: string | null;
    username: string | null;
  };
}

export interface ReferralCommission {
  id: string;
  referral_id: string;
  purchase_intent_id: string;
  sale_amount_cents: number;
  commission_cents: number;
  status: 'pending' | 'paid';
  created_at: string;
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalCommissionCents: number;
  pendingCommissionCents: number;
  paidCommissionCents: number;
}

export function useCreatorReferrals() {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [referrals, setReferrals] = useState<CreatorReferral[]>([]);
  const [commissions, setCommissions] = useState<ReferralCommission[]>([]);
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    activeReferrals: 0,
    totalCommissionCents: 0,
    pendingCommissionCents: 0,
    paidCommissionCents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReferralCode = useCallback(async () => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('creator_referral_codes')
      .select('*')
      .eq('creator_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching referral code:', error);
      return null;
    }

    return data as ReferralCode | null;
  }, [user]);

  const fetchReferrals = useCallback(async () => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('creator_referrals')
      .select('*')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching referrals:', error);
      return [];
    }

    // Fetch referred profiles separately
    const referralData = data as CreatorReferral[];
    const referredIds = referralData.map(r => r.referred_id);

    if (referredIds.length > 0) {
      const { data: profiles } = await supabase
        .from('public_profiles')
        .select('user_id, display_name, avatar_url, username')
        .in('user_id', referredIds);

      if (profiles) {
        referralData.forEach(referral => {
          const profile = profiles.find(p => p.user_id === referral.referred_id);
          if (profile) {
            referral.referred_profile = {
              display_name: profile.display_name,
              avatar_url: profile.avatar_url,
              username: profile.username,
            };
          }
        });
      }
    }

    return referralData;
  }, [user]);

  const fetchCommissions = useCallback(async () => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('referral_commissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching commissions:', error);
      return [];
    }

    return data as ReferralCommission[];
  }, [user]);

  const calculateStats = useCallback((
    referralsData: CreatorReferral[],
    commissionsData: ReferralCommission[]
  ): ReferralStats => {
    const activeReferrals = referralsData.filter(r => r.status === 'active').length;
    const totalCommissionCents = commissionsData.reduce((sum, c) => sum + c.commission_cents, 0);
    const pendingCommissionCents = commissionsData
      .filter(c => c.status === 'pending')
      .reduce((sum, c) => sum + c.commission_cents, 0);
    const paidCommissionCents = commissionsData
      .filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + c.commission_cents, 0);

    return {
      totalReferrals: referralsData.length,
      activeReferrals,
      totalCommissionCents,
      pendingCommissionCents,
      paidCommissionCents,
    };
  }, []);

  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [codeData, referralsData, commissionsData] = await Promise.all([
        fetchReferralCode(),
        fetchReferrals(),
        fetchCommissions(),
      ]);

      setReferralCode(codeData);
      setReferrals(referralsData);
      setCommissions(commissionsData);
      setStats(calculateStats(referralsData, commissionsData));
    } catch (err) {
      console.error('Error loading referral data:', err);
      setError('Fehler beim Laden der Referral-Daten');
    } finally {
      setLoading(false);
    }
  }, [user, fetchReferralCode, fetchReferrals, fetchCommissions, calculateStats]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getReferralLink = useCallback(() => {
    if (!referralCode) return null;
    const baseUrl = window.location.origin;
    return `${baseUrl}/join/${referralCode.code}`;
  }, [referralCode]);

  return {
    referralCode,
    referrals,
    commissions,
    stats,
    loading,
    error,
    refetch: loadData,
    getReferralLink,
  };
}

// Hook to validate a referral code (for join page)
export function useValidateReferralCode(code: string | undefined) {
  const [referrer, setReferrer] = useState<{
    code: string;
    creator_id: string;
    profile?: {
      display_name: string | null;
      avatar_url: string | null;
      username: string | null;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (!code) {
      setLoading(false);
      setIsValid(false);
      return;
    }

    const validateCode = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('creator_referral_codes')
        .select('*')
        .eq('code', code)
        .maybeSingle();

      if (error || !data) {
        setIsValid(false);
        setReferrer(null);
        setLoading(false);
        return;
      }

      // Fetch referrer profile
      const { data: profile } = await supabase
        .from('public_profiles')
        .select('display_name, avatar_url, username')
        .eq('user_id', data.creator_id)
        .maybeSingle();

      setReferrer({
        code: data.code,
        creator_id: data.creator_id,
        profile: profile || undefined,
      });
      setIsValid(true);
      setLoading(false);
    };

    validateCode();
  }, [code]);

  return { referrer, loading, isValid };
}
