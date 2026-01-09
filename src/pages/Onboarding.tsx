import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/contexts/AuthContext';
import { ProgressIndicator } from '@/components/onboarding/ProgressIndicator';
import { InterestsStep } from '@/components/onboarding/InterestsStep';
import { ProfileDataStep } from '@/components/onboarding/ProfileDataStep';
import { SubscriptionStep } from '@/components/onboarding/SubscriptionStep';
import { TutorialStep } from '@/components/onboarding/TutorialStep';

const TOTAL_STEPS = 4;

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { 
    step, 
    isLoading, 
    isOnboardingComplete,
    categories, 
    selectedInterests,
    updateStep,
    completeOnboarding,
    saveInterests,
    saveProfileData,
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

  const handleNextStep = () => {
    if (step < TOTAL_STEPS - 1) {
      updateStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleProfileDataNext = async (data: { birthdate: string; gender: string; age: number }) => {
    await saveProfileData(data);
    handleNextStep();
  };

  const handleComplete = async () => {
    await completeOnboarding();
    navigate('/');
  };

  if (authLoading || isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-background flex flex-col safe-area-top safe-area-bottom">
      {/* Progress indicator */}
      <div className="pt-6 pb-2">
        <ProgressIndicator currentStep={step} totalSteps={TOTAL_STEPS} />
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-hidden">
        {step === 0 && (
          <InterestsStep 
            categories={categories}
            selectedInterests={selectedInterests}
            onSave={saveInterests}
            onNext={handleNextStep}
          />
        )}
        
        {step === 1 && (
          <ProfileDataStep 
            onNext={handleProfileDataNext}
            onSkip={handleNextStep}
          />
        )}
        
        {step === 2 && (
          <SubscriptionStep 
            onNext={handleNextStep}
            onSkip={handleNextStep}
          />
        )}
        
        {step === 3 && (
          <TutorialStep onComplete={handleComplete} />
        )}
      </div>
    </div>
  );
}
