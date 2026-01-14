import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/contexts/AuthContext';
import { ProgressIndicator } from '@/components/onboarding/ProgressIndicator';
import { InterestsStep } from '@/components/onboarding/InterestsStep';
import { UsernameStep } from '@/components/onboarding/UsernameStep';

// Two step onboarding: Username + Interests
const TOTAL_STEPS = 2;

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const { 
    step, 
    isLoading, 
    isOnboardingComplete,
    categories, 
    selectedInterests,
    updateStep,
    completeOnboarding,
    saveInterests,
    saveUsername,
  } = useOnboarding();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Redirect if onboarding already complete
  useEffect(() => {
    if (!isLoading && isOnboardingComplete) {
      navigate('/');
    }
  }, [isLoading, isOnboardingComplete, navigate]);

  const handleUsernameNext = async (username: string) => {
    await saveUsername(username);
    setCurrentStep(1);
  };

  const handleComplete = async () => {
    await completeOnboarding();
    navigate('/feed');
  };

  if (authLoading || isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-muted border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-background flex flex-col safe-area-top safe-area-bottom">
      {/* Progress indicator */}
      <div className="pt-6 pb-2">
        <ProgressIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-hidden">
        {currentStep === 0 && (
          <UsernameStep onNext={handleUsernameNext} />
        )}
        {currentStep === 1 && (
          <InterestsStep 
            categories={categories}
            selectedInterests={selectedInterests}
            onSave={saveInterests}
            onNext={handleComplete}
          />
        )}
      </div>
    </div>
  );
}
