import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const EPISODES_WATCHED_KEY = 'ryl_episodes_watched';
const SUBSCRIPTION_PROMPT_SHOWN_KEY = 'ryl_subscription_prompt_shown';
const TRIGGER_THRESHOLD = 2;

export function useSubscriptionPrompt() {
  const { user } = useAuth();
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false);
  const [episodesWatched, setEpisodesWatched] = useState(0);

  // Load watched count on mount
  useEffect(() => {
    const count = parseInt(localStorage.getItem(EPISODES_WATCHED_KEY) || '0', 10);
    setEpisodesWatched(count);
  }, []);

  // Check if we should show prompt
  useEffect(() => {
    if (!user) return;
    
    const alreadyShown = localStorage.getItem(SUBSCRIPTION_PROMPT_SHOWN_KEY) === 'true';
    
    if (episodesWatched >= TRIGGER_THRESHOLD && !alreadyShown) {
      setShouldShowPrompt(true);
    }
  }, [episodesWatched, user]);

  const trackEpisodeWatched = () => {
    const newCount = episodesWatched + 1;
    setEpisodesWatched(newCount);
    localStorage.setItem(EPISODES_WATCHED_KEY, String(newCount));
  };

  const dismissPrompt = () => {
    setShouldShowPrompt(false);
    localStorage.setItem(SUBSCRIPTION_PROMPT_SHOWN_KEY, 'true');
  };

  const resetPrompt = () => {
    localStorage.removeItem(SUBSCRIPTION_PROMPT_SHOWN_KEY);
  };

  return {
    shouldShowPrompt,
    episodesWatched,
    trackEpisodeWatched,
    dismissPrompt,
    resetPrompt,
  };
}
