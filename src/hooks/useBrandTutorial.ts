import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useBrandTutorial() {
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
          .from('brand_accounts')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        // Check localStorage for tutorial completion (brand-specific)
        const tutorialKey = `brand_tutorial_seen_${data?.id}`;
        const hasSeen = localStorage.getItem(tutorialKey) === 'true';
        setHasSeenTutorial(hasSeen);
      } catch (err) {
        console.error('Error fetching brand tutorial status:', err);
        setHasSeenTutorial(true); // Don't show tutorial if error
      } finally {
        setLoading(false);
      }
    }

    fetchTutorialStatus();
  }, [user]);

  const completeTutorial = useCallback(async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('brand_accounts')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (data?.id) {
        const tutorialKey = `brand_tutorial_seen_${data.id}`;
        localStorage.setItem(tutorialKey, 'true');
        setHasSeenTutorial(true);
      }
    } catch (err) {
      console.error('Error completing brand tutorial:', err);
    }
  }, [user]);

  const resetTutorial = useCallback(async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('brand_accounts')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (data?.id) {
        const tutorialKey = `brand_tutorial_seen_${data.id}`;
        localStorage.removeItem(tutorialKey);
        setHasSeenTutorial(false);
      }
    } catch (err) {
      console.error('Error resetting brand tutorial:', err);
    }
  }, [user]);

  return {
    hasSeenTutorial,
    loading,
    completeTutorial,
    resetTutorial,
    shouldShowTutorial: hasSeenTutorial === false,
  };
}
