import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface InterestCategory {
  id: string;
  name: string;
  name_de: string;
  icon: string;
  sort_order: number;
}

interface OnboardingState {
  step: number;
  completedAt: string | null;
  selectedInterests: string[];
  isLoading: boolean;
}

export function useOnboarding() {
  const { user, session } = useAuth();
  const [state, setState] = useState<OnboardingState>({
    step: 0,
    completedAt: null,
    selectedInterests: [],
    isLoading: true,
  });
  const [categories, setCategories] = useState<InterestCategory[]>([]);

  // Fetch onboarding state and categories
  useEffect(() => {
    if (!user) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchOnboardingState = async () => {
      try {
        // Fetch profile for onboarding step
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_step, onboarding_completed_at')
          .eq('user_id', user.id)
          .single();

        // Fetch categories
        const { data: cats } = await supabase
          .from('interest_categories')
          .select('*')
          .order('sort_order');

        // Fetch user's selected interests
        const { data: interests } = await supabase
          .from('user_interests')
          .select('category_id')
          .eq('user_id', user.id);

        setCategories(cats || []);
        setState({
          step: profile?.onboarding_step || 0,
          completedAt: profile?.onboarding_completed_at || null,
          selectedInterests: interests?.map(i => i.category_id) || [],
          isLoading: false,
        });
      } catch (error) {
        console.error('Error fetching onboarding state:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchOnboardingState();
  }, [user]);

  const isOnboardingComplete = state.completedAt !== null;

  const updateStep = async (newStep: number) => {
    if (!user) return;

    try {
      await supabase
        .from('profiles')
        .update({ onboarding_step: newStep })
        .eq('user_id', user.id);

      setState(prev => ({ ...prev, step: newStep }));
    } catch (error) {
      console.error('Error updating onboarding step:', error);
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;

    try {
      await supabase
        .from('profiles')
        .update({ 
          onboarding_step: 3,
          onboarding_completed_at: new Date().toISOString() 
        })
        .eq('user_id', user.id);

      setState(prev => ({ 
        ...prev, 
        step: 3, 
        completedAt: new Date().toISOString() 
      }));
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const saveInterests = async (categoryIds: string[]) => {
    if (!user) return;

    try {
      // Delete existing interests
      await supabase
        .from('user_interests')
        .delete()
        .eq('user_id', user.id);

      // Insert new interests
      if (categoryIds.length > 0) {
        await supabase
          .from('user_interests')
          .insert(categoryIds.map(categoryId => ({
            user_id: user.id,
            category_id: categoryId,
          })));
      }

      setState(prev => ({ ...prev, selectedInterests: categoryIds }));
    } catch (error) {
      console.error('Error saving interests:', error);
    }
  };

  return {
    ...state,
    categories,
    isOnboardingComplete,
    updateStep,
    completeOnboarding,
    saveInterests,
  };
}
