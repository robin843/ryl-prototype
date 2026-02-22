import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { ShopableHotspot } from '@/services/shopable/types';

interface ShopableEngineState {
  selectedHotspot: ShopableHotspot | null;
  isPanelOpen: boolean;
  mode: 'player' | 'studio' | 'embed';
  episodeId: string;
  producerId?: string;
}

interface ShopableEngineActions {
  selectHotspot: (hotspot: ShopableHotspot) => void;
  closePanel: () => void;
}

type ShopableContextValue = ShopableEngineState & ShopableEngineActions;

const ShopableCtx = createContext<ShopableContextValue | null>(null);

export function useShopableContext() {
  const ctx = useContext(ShopableCtx);
  if (!ctx) throw new Error('useShopableContext must be used within <ShopableProvider>');
  return ctx;
}

interface ShopableProviderProps {
  episodeId: string;
  producerId?: string;
  mode?: 'player' | 'studio' | 'embed';
  children: ReactNode;
}

export function ShopableProvider({
  episodeId,
  producerId,
  mode = 'player',
  children,
}: ShopableProviderProps) {
  const [selectedHotspot, setSelectedHotspot] = useState<ShopableHotspot | null>(null);

  const selectHotspot = useCallback((hotspot: ShopableHotspot) => {
    setSelectedHotspot(hotspot);
  }, []);

  const closePanel = useCallback(() => {
    setSelectedHotspot(null);
  }, []);

  const value: ShopableContextValue = {
    selectedHotspot,
    isPanelOpen: selectedHotspot !== null,
    mode,
    episodeId,
    producerId,
    selectHotspot,
    closePanel,
  };

  return <ShopableCtx.Provider value={value}>{children}</ShopableCtx.Provider>;
}
