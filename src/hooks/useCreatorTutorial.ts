import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useCreatorTutorial() {
  const { user } = useAuth();
  const [hasSeenTutorial, setHasSeenTutorial] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTutorialStatus() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('has_seen_studio_tutorial')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setHasSeenTutorial(data?.has_seen_studio_tutorial ?? false);
      } catch (err) {
        console.error('Error fetching tutorial status:', err);
        setHasSeenTutorial(false);
      } finally {
        setLoading(false);
      }
    }

    fetchTutorialStatus();
  }, [user]);

  const completeTutorial = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ has_seen_studio_tutorial: true })
        .eq('user_id', user.id);

      if (error) throw error;
      setHasSeenTutorial(true);
    } catch (err) {
      console.error('Error completing tutorial:', err);
    }
  }, [user]);

  const resetTutorial = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ has_seen_studio_tutorial: false })
        .eq('user_id', user.id);

      if (error) throw error;
      setHasSeenTutorial(false);
    } catch (err) {
      console.error('Error resetting tutorial:', err);
    }
  }, [user]);

  // Force show tutorial - used when navigating to analytics for first time
  const forceShowTutorial = useCallback(() => {
    setHasSeenTutorial(false);
  }, []);

  return {
    hasSeenTutorial,
    loading,
    completeTutorial,
    resetTutorial,
    forceShowTutorial,
    // For analytics page, we check the flag and show tutorial if false
    shouldShowAnalyticsTutorial: hasSeenTutorial === false,
  };
}
