import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface BrandAccount {
  id: string;
  company_name: string;
  logo_url: string | null;
  industry: string | null;
  website_url: string | null;
}

interface Partnership {
  id: string;
  brand_id: string;
  creator_id: string;
  status: string;
  commission_rate_percent: number | null;
  total_clicks: number | null;
  total_conversions: number | null;
  total_revenue_cents: number | null;
  created_at: string;
  updated_at: string;
  brand?: BrandAccount;
}

interface CreatorPartnershipRequest {
  id: string;
  creator_id: string;
  status: string;
  commission_rate_percent: number | null;
  total_clicks: number | null;
  total_conversions: number | null;
  total_revenue_cents: number | null;
  created_at: string;
  creator_profile?: {
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
}

// Hook for Creators to manage their partnerships
export function useCreatorPartnerships() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch available brands (active brand accounts)
  const { data: availableBrands = [], isLoading: brandsLoading } = useQuery({
    queryKey: ['available-brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_accounts')
        .select('id, company_name, logo_url, industry, website_url')
        .eq('status', 'active')
        .order('company_name');

      if (error) throw error;
      return data as BrandAccount[];
    },
    enabled: !!user,
  });

  // Fetch creator's partnerships
  const { data: partnerships = [], isLoading: partnershipsLoading } = useQuery({
    queryKey: ['creator-partnerships', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('brand_creator_partnerships')
        .select(`
          *,
          brand:brand_accounts(id, company_name, logo_url, industry, website_url)
        `)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Partnership[];
    },
    enabled: !!user,
  });

  // Request a partnership
  const requestPartnership = useMutation({
    mutationFn: async (brandId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('brand_creator_partnerships')
        .insert({
          brand_id: brandId,
          creator_id: user.id,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-partnerships'] });
      toast.success('Partnerschaftsanfrage gesendet');
    },
    onError: (error: Error) => {
      if (error.message.includes('duplicate')) {
        toast.error('Du hast bereits eine Anfrage an diese Brand gesendet');
      } else {
        toast.error('Fehler beim Senden der Anfrage');
      }
    },
  });

  // Check if user has active partnership with a brand
  const hasActivePartnership = (brandId: string): boolean => {
    return partnerships.some(
      (p) => p.brand_id === brandId && p.status === 'active'
    );
  };

  // Check if user has pending partnership with a brand
  const hasPendingPartnership = (brandId: string): boolean => {
    return partnerships.some(
      (p) => p.brand_id === brandId && p.status === 'pending'
    );
  };

  // Get partnership status for a brand
  const getPartnershipStatus = (brandId: string): string | null => {
    const partnership = partnerships.find((p) => p.brand_id === brandId);
    return partnership?.status ?? null;
  };

  return {
    availableBrands,
    partnerships,
    isLoading: brandsLoading || partnershipsLoading,
    requestPartnership,
    hasActivePartnership,
    hasPendingPartnership,
    getPartnershipStatus,
  };
}

// Hook for Brands to manage creator requests
export function useBrandCreatorRequests(brandId: string | undefined) {
  const queryClient = useQueryClient();

  // Fetch pending creator requests
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['brand-creator-requests', brandId],
    queryFn: async () => {
      if (!brandId) return [];

      const { data, error } = await supabase
        .from('brand_creator_partnerships')
        .select(`
          id,
          creator_id,
          status,
          commission_rate_percent,
          created_at,
          total_clicks,
          total_conversions,
          total_revenue_cents
        `)
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch creator profiles separately via public_profiles view
      const creatorIds = data.map((r) => r.creator_id);
      const { data: profiles } = await supabase
        .from('public_profiles')
        .select('id, display_name, username, avatar_url')
        .in('id', creatorIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);

      return data.map((r) => ({
        ...r,
        creator_profile: profileMap.get(r.creator_id) ?? null,
      })) as CreatorPartnershipRequest[];
    },
    enabled: !!brandId,
  });

  // Accept a partnership request
  const acceptRequest = useMutation({
    mutationFn: async ({
      partnershipId,
      commissionRate,
    }: {
      partnershipId: string;
      commissionRate?: number;
    }) => {
      const { data, error } = await supabase
        .from('brand_creator_partnerships')
        .update({
          status: 'active',
          commission_rate_percent: commissionRate ?? 10,
        })
        .eq('id', partnershipId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-creator-requests'] });
      toast.success('Partnerschaft aktiviert');
    },
    onError: () => {
      toast.error('Fehler beim Aktivieren der Partnerschaft');
    },
  });

  // Reject a partnership request
  const rejectRequest = useMutation({
    mutationFn: async (partnershipId: string) => {
      const { data, error } = await supabase
        .from('brand_creator_partnerships')
        .update({ status: 'rejected' })
        .eq('id', partnershipId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-creator-requests'] });
      toast.success('Anfrage abgelehnt');
    },
    onError: () => {
      toast.error('Fehler beim Ablehnen der Anfrage');
    },
  });

  // Update commission rate
  const updateCommissionRate = useMutation({
    mutationFn: async ({
      partnershipId,
      commissionRate,
    }: {
      partnershipId: string;
      commissionRate: number;
    }) => {
      const { data, error } = await supabase
        .from('brand_creator_partnerships')
        .update({ commission_rate_percent: commissionRate })
        .eq('id', partnershipId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-creator-requests'] });
      toast.success('Provisionsrate aktualisiert');
    },
    onError: () => {
      toast.error('Fehler beim Aktualisieren');
    },
  });

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const activePartnerships = requests.filter((r) => r.status === 'active');
  const rejectedRequests = requests.filter((r) => r.status === 'rejected');

  return {
    requests,
    pendingRequests,
    activePartnerships,
    rejectedRequests,
    isLoading,
    acceptRequest,
    rejectRequest,
    updateCommissionRate,
  };
}
