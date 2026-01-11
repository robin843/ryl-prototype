import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthModal } from '@/contexts/AuthModalContext';

const SERIES_SWIPES_KEY = 'ryl_series_swipes';

interface SeriesSwipeData {
  [seriesId: string]: number; // Number of swipes within each series
}

/**
 * Intent-based series auth trigger
 * Shows auth modal on 2nd swipe within the same series (or explicit "Next Episode" tap)
 */
export function useSeriesIntent() {
  const { user } = useAuth();
  const { showAuthModal } = useAuthModal();
  const [seriesSwipes, setSeriesSwipes] = useState<SeriesSwipeData>({});
  const lastSeriesId = useRef<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    if (!user) {
      try {
        const stored = localStorage.getItem(SERIES_SWIPES_KEY);
        if (stored) {
          setSeriesSwipes(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Error loading series swipes:', e);
      }
    }
  }, [user]);

  // Save to localStorage
  const saveSeriesSwipes = useCallback((data: SeriesSwipeData) => {
    try {
      localStorage.setItem(SERIES_SWIPES_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving series swipes:', e);
    }
  }, []);

  /**
   * Track a swipe/navigation within a series
   * Returns true if user should continue (authenticated or first swipe)
   * Returns false if auth modal was shown (needs login for series continuation)
   */
  const trackSeriesSwipe = useCallback((seriesId: string): boolean => {
    // Authenticated users can always continue
    if (user) {
      return true;
    }

    // Same series as last one?
    const isSameSeries = lastSeriesId.current === seriesId;
    lastSeriesId.current = seriesId;

    if (!isSameSeries) {
      // New series, reset counter for this series
      return true;
    }

    // Same series - increment swipe count
    const currentSwipes = seriesSwipes[seriesId] || 0;
    const newSwipes = currentSwipes + 1;

    const newData = { ...seriesSwipes, [seriesId]: newSwipes };
    setSeriesSwipes(newData);
    saveSeriesSwipes(newData);

    // 2nd+ swipe in same series = trigger auth
    if (newSwipes >= 2) {
      showAuthModal({ type: 'series-continue', seriesId });
      return false;
    }

    return true;
  }, [user, seriesSwipes, showAuthModal, saveSeriesSwipes]);

  /**
   * Explicit "Next Episode" button tap - always triggers auth if not logged in
   */
  const handleNextEpisodeTap = useCallback((seriesId: string): boolean => {
    if (user) {
      return true;
    }
    
    showAuthModal({ type: 'series-continue', seriesId });
    return false;
  }, [user, showAuthModal]);

  // Clear tracking after auth
  const clearSeriesTracking = useCallback(() => {
    setSeriesSwipes({});
    lastSeriesId.current = null;
    localStorage.removeItem(SERIES_SWIPES_KEY);
  }, []);

  return {
    trackSeriesSwipe,
    handleNextEpisodeTap,
    clearSeriesTracking,
    isAuthenticated: !!user,
  };
}
