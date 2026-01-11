import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const LOCAL_LIKES_KEY = 'ryl_local_likes';
const LOCAL_LIKE_COUNT_KEY = 'ryl_local_like_count';

interface LocalLike {
  episodeId: string;
  likedAt: number;
}

/**
 * Local likes that feel "unstable" - works without auth but shows hint after 3 likes
 * Once authenticated, likes are persisted (future: sync to server)
 */
export function useLocalLikes() {
  const { user } = useAuth();
  const [localLikes, setLocalLikes] = useState<LocalLike[]>([]);
  const [totalLocalLikeCount, setTotalLocalLikeCount] = useState(0);

  // Load local likes from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_LIKES_KEY);
      if (stored) {
        setLocalLikes(JSON.parse(stored));
      }
      const count = localStorage.getItem(LOCAL_LIKE_COUNT_KEY);
      if (count) {
        setTotalLocalLikeCount(parseInt(count, 10));
      }
    } catch (e) {
      console.error('Error loading local likes:', e);
    }
  }, []);

  // Save local likes to localStorage
  const saveLocalLikes = useCallback((likes: LocalLike[], count: number) => {
    try {
      localStorage.setItem(LOCAL_LIKES_KEY, JSON.stringify(likes));
      localStorage.setItem(LOCAL_LIKE_COUNT_KEY, count.toString());
    } catch (e) {
      console.error('Error saving local likes:', e);
    }
  }, []);

  // Check if episode is liked locally
  const isLikedLocally = useCallback((episodeId: string): boolean => {
    return localLikes.some(l => l.episodeId === episodeId);
  }, [localLikes]);

  // Toggle like for an episode
  const toggleLike = useCallback((episodeId: string): boolean => {
    const isCurrentlyLiked = isLikedLocally(episodeId);
    let newLikes: LocalLike[];
    let newCount: number;

    if (isCurrentlyLiked) {
      // Unlike
      newLikes = localLikes.filter(l => l.episodeId !== episodeId);
      newCount = totalLocalLikeCount; // Don't decrement count for hint purposes
    } else {
      // Like
      newLikes = [...localLikes, { episodeId, likedAt: Date.now() }];
      newCount = totalLocalLikeCount + 1;
    }

    setLocalLikes(newLikes);
    setTotalLocalLikeCount(newCount);
    saveLocalLikes(newLikes, newCount);

    return !isCurrentlyLiked; // Return new liked state
  }, [localLikes, totalLocalLikeCount, isLikedLocally, saveLocalLikes]);

  // Should show instability hint (after 3 local likes when not authenticated)
  const shouldShowInstabilityHint = !user && totalLocalLikeCount >= 3;

  // Clear local likes after auth (optional: sync to server)
  const clearLocalLikes = useCallback(() => {
    setLocalLikes([]);
    setTotalLocalLikeCount(0);
    localStorage.removeItem(LOCAL_LIKES_KEY);
    localStorage.removeItem(LOCAL_LIKE_COUNT_KEY);
  }, []);

  return {
    isLikedLocally,
    toggleLike,
    localLikeCount: localLikes.length,
    totalLocalLikeCount,
    shouldShowInstabilityHint,
    clearLocalLikes,
    isAuthenticated: !!user,
  };
}
