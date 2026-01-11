import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const ANON_VIDEOS_KEY = 'ryl_anon_videos_watched';
const SOFT_PROMPT_DISMISSED_KEY = 'ryl_soft_prompt_dismissed';
const SOFT_PROMPT_DISMISS_COUNT_KEY = 'ryl_soft_prompt_dismiss_count';

// Champions League config: 4 videos free, then soft prompt
const ANON_VIDEO_LIMIT = 4;
const MAX_DISMISSALS = 2; // After 2 dismissals, prompt every 3 videos

export function useAnonymousFlowLimit() {
  const { user } = useAuth();
  const [videosWatched, setVideosWatched] = useState(0);
  const [shouldShowSoftPrompt, setShouldShowSoftPrompt] = useState(false);
  const [dismissCount, setDismissCount] = useState(0);

  // Load state on mount
  useEffect(() => {
    const count = parseInt(localStorage.getItem(ANON_VIDEOS_KEY) || '0', 10);
    const dismissed = localStorage.getItem(SOFT_PROMPT_DISMISSED_KEY) === 'true';
    const dismissals = parseInt(localStorage.getItem(SOFT_PROMPT_DISMISS_COUNT_KEY) || '0', 10);
    
    setVideosWatched(count);
    setDismissCount(dismissals);
    
    // If logged in, never show prompt
    if (user) {
      setShouldShowSoftPrompt(false);
      return;
    }

    // Check if we should show prompt
    if (dismissed) {
      // User dismissed before, show again after more videos
      const nextThreshold = ANON_VIDEO_LIMIT + (dismissals * 3);
      if (count >= nextThreshold) {
        setShouldShowSoftPrompt(true);
        // Reset dismissed flag for next cycle
        localStorage.removeItem(SOFT_PROMPT_DISMISSED_KEY);
      }
    } else if (count >= ANON_VIDEO_LIMIT) {
      setShouldShowSoftPrompt(true);
    }
  }, [user]);

  // Track a video watch
  const trackVideoWatch = useCallback(() => {
    if (user) return; // Don't track logged-in users
    
    const newCount = videosWatched + 1;
    setVideosWatched(newCount);
    localStorage.setItem(ANON_VIDEOS_KEY, String(newCount));

    // Check if we should show prompt after this video
    const dismissed = localStorage.getItem(SOFT_PROMPT_DISMISSED_KEY) === 'true';
    
    if (dismissed) {
      const nextThreshold = ANON_VIDEO_LIMIT + (dismissCount * 3);
      if (newCount >= nextThreshold) {
        setShouldShowSoftPrompt(true);
        localStorage.removeItem(SOFT_PROMPT_DISMISSED_KEY);
      }
    } else if (newCount >= ANON_VIDEO_LIMIT) {
      setShouldShowSoftPrompt(true);
    }
  }, [videosWatched, dismissCount, user]);

  // Dismiss the prompt (user chose "Noch nicht")
  const dismissPrompt = useCallback(() => {
    setShouldShowSoftPrompt(false);
    localStorage.setItem(SOFT_PROMPT_DISMISSED_KEY, 'true');
    
    const newDismissCount = dismissCount + 1;
    setDismissCount(newDismissCount);
    localStorage.setItem(SOFT_PROMPT_DISMISS_COUNT_KEY, String(newDismissCount));
  }, [dismissCount]);

  // Reset tracking (useful for testing)
  const resetTracking = useCallback(() => {
    localStorage.removeItem(ANON_VIDEOS_KEY);
    localStorage.removeItem(SOFT_PROMPT_DISMISSED_KEY);
    localStorage.removeItem(SOFT_PROMPT_DISMISS_COUNT_KEY);
    setVideosWatched(0);
    setDismissCount(0);
    setShouldShowSoftPrompt(false);
  }, []);

  return {
    videosWatched,
    shouldShowSoftPrompt,
    isAnonymous: !user,
    trackVideoWatch,
    dismissPrompt,
    resetTracking,
  };
}
