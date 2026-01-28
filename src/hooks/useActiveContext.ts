import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBrandData } from '@/hooks/useBrandData';

export type ActiveContext = 'creator' | 'brand';

const STORAGE_KEY = 'ryl_active_context';

export function useActiveContext() {
  const { user } = useAuth();
  const { brandAccount, isLoading: brandLoading } = useBrandData();
  
  const [activeContext, setActiveContextState] = useState<ActiveContext>(() => {
    // Initialize from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored === 'brand' ? 'brand' : 'creator') as ActiveContext;
  });

  // Determine if user can switch to brand
  const canSwitchToBrand = brandAccount?.status === 'active';
  const hasBrandAccount = !!brandAccount;
  const brandName = brandAccount?.company_name || null;
  const brandStatus = brandAccount?.status || null;

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, activeContext);
  }, [activeContext]);

  // Reset to creator if brand account becomes unavailable
  useEffect(() => {
    if (activeContext === 'brand' && !canSwitchToBrand && !brandLoading) {
      setActiveContextState('creator');
    }
  }, [activeContext, canSwitchToBrand, brandLoading]);

  // Reset on logout
  useEffect(() => {
    if (!user) {
      setActiveContextState('creator');
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const switchContext = useCallback((context: ActiveContext) => {
    if (context === 'brand' && !canSwitchToBrand) {
      console.warn('Cannot switch to brand context - not available');
      return false;
    }
    setActiveContextState(context);
    return true;
  }, [canSwitchToBrand]);

  const toggleContext = useCallback(() => {
    if (activeContext === 'creator' && canSwitchToBrand) {
      setActiveContextState('brand');
      return true;
    } else if (activeContext === 'brand') {
      setActiveContextState('creator');
      return true;
    }
    return false;
  }, [activeContext, canSwitchToBrand]);

  return {
    activeContext,
    switchContext,
    toggleContext,
    canSwitchToBrand,
    hasBrandAccount,
    brandName,
    brandStatus,
    isLoading: brandLoading,
  };
}
