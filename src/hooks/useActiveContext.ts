import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type ActiveContext = 'creator';

export function useActiveContext() {
  const { user } = useAuth();
  
  const [activeContext] = useState<ActiveContext>('creator');

  return {
    activeContext,
    switchContext: useCallback(() => true, []),
    toggleContext: useCallback(() => false, []),
    canSwitchToBrand: false,
    hasBrandAccount: false,
    brandName: null,
    brandStatus: null,
    isLoading: false,
  };
}
