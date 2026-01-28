import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ProfileSheet } from '@/components/sheets/ProfileSheet';
import { CreatorSheet } from '@/components/sheets/CreatorSheet';
import { SeriesSheet } from '@/components/sheets/SeriesSheet';

interface SheetContextType {
  openProfile: () => void;
  openCreator: (creatorId: string) => void;
  openSeries: (seriesId: string, currentEpisodeId?: string) => void;
  closeAll: () => void;
  // For integration with feed
  setEpisodeSelectHandler: (handler: ((episodeId: string) => void) | null) => void;
}

const SheetContext = createContext<SheetContextType | undefined>(undefined);

export function SheetProvider({ children }: { children: ReactNode }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [seriesOpen, setSeriesOpen] = useState(false);
  
  const [currentCreatorId, setCurrentCreatorId] = useState<string | null>(null);
  const [currentSeriesId, setCurrentSeriesId] = useState<string | null>(null);
  const [currentEpisodeId, setCurrentEpisodeId] = useState<string | null>(null);
  
  // Handler for episode selection from series sheet
  const [episodeSelectHandler, setEpisodeSelectHandlerState] = useState<((episodeId: string) => void) | null>(null);

  const closeAll = useCallback(() => {
    setProfileOpen(false);
    setCreatorOpen(false);
    setSeriesOpen(false);
  }, []);

  const openProfile = useCallback(() => {
    closeAll();
    setProfileOpen(true);
  }, [closeAll]);

  const openCreator = useCallback((creatorId: string) => {
    closeAll();
    setCurrentCreatorId(creatorId);
    setCreatorOpen(true);
  }, [closeAll]);

  const openSeries = useCallback((seriesId: string, episodeId?: string) => {
    closeAll();
    setCurrentSeriesId(seriesId);
    setCurrentEpisodeId(episodeId || null);
    setSeriesOpen(true);
  }, [closeAll]);

  const setEpisodeSelectHandler = useCallback((handler: ((episodeId: string) => void) | null) => {
    setEpisodeSelectHandlerState(() => handler);
  }, []);

  // Handler to open series from creator sheet
  const handleOpenSeriesFromCreator = useCallback((seriesId: string) => {
    setCreatorOpen(false);
    setCurrentSeriesId(seriesId);
    setSeriesOpen(true);
  }, []);

  // Handler to open creator from series sheet
  const handleOpenCreatorFromSeries = useCallback((creatorId: string) => {
    setSeriesOpen(false);
    setCurrentCreatorId(creatorId);
    setCreatorOpen(true);
  }, []);

  return (
    <SheetContext.Provider value={{ 
      openProfile, 
      openCreator, 
      openSeries, 
      closeAll,
      setEpisodeSelectHandler,
    }}>
      {children}
      
      <ProfileSheet 
        isOpen={profileOpen} 
        onClose={() => setProfileOpen(false)} 
      />
      
      <CreatorSheet 
        isOpen={creatorOpen}
        onClose={() => setCreatorOpen(false)}
        creatorId={currentCreatorId}
        onOpenSeries={handleOpenSeriesFromCreator}
      />
      
      <SeriesSheet 
        isOpen={seriesOpen}
        onClose={() => setSeriesOpen(false)}
        seriesId={currentSeriesId}
        currentEpisodeId={currentEpisodeId}
        onSelectEpisode={episodeSelectHandler || undefined}
        onOpenCreator={handleOpenCreatorFromSeries}
      />
    </SheetContext.Provider>
  );
}

export function useSheets() {
  const context = useContext(SheetContext);
  if (context === undefined) {
    throw new Error('useSheets must be used within a SheetProvider');
  }
  return context;
}
