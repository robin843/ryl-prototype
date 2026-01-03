import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

// Routes that don't require auth or onboarding check
const PUBLIC_ROUTES = ['/auth', '/onboarding'];

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      // Skip check for public routes
      if (PUBLIC_ROUTES.includes(location.pathname)) {
        setIsChecking(false);
        setShouldRender(true);
        return;
      }

      // Wait for auth to load
      if (authLoading) return;

      // If not logged in, redirect to auth
      if (!user) {
        navigate('/auth', { replace: true });
        return;
      }

      try {
        // Check onboarding status
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed_at')
          .eq('user_id', user.id)
          .single();

        if (!profile?.onboarding_completed_at) {
          // Onboarding not complete, redirect to onboarding
          navigate('/onboarding', { replace: true });
          return;
        }

        // All good, render the content
        setIsChecking(false);
        setShouldRender(true);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // On error, assume onboarding needed
        navigate('/onboarding', { replace: true });
      }
    };

    checkOnboardingStatus();
  }, [user, authLoading, navigate, location.pathname]);

  // Show loading state while checking
  if (authLoading || isChecking) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!shouldRender) {
    return null;
  }

  return <>{children}</>;
}
