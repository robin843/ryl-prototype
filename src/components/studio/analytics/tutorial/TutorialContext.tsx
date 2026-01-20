import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Tutorial steps in the CORRECT tab order: Revenue → Audience → Episodes → Products
export type TutorialStep = 
  | 'welcome'
  | 'revenue'
  | 'audience'
  | 'episodes'
  | 'products'
  | 'optimization'
  | 'complete';

interface TutorialContextValue {
  isActive: boolean;
  currentStep: TutorialStep;
  highlightedElement: string | null;
  startTutorial: () => void;
  endTutorial: () => void;
  goToStep: (step: TutorialStep) => void;
  nextStep: () => void;
  validateTabClick: (tabId: string) => boolean;
}

const TutorialContext = createContext<TutorialContextValue | null>(null);

// Step order matches actual tab layout: Revenue → Audience → Episodes → Products
const STEP_ORDER: TutorialStep[] = [
  'welcome',
  'revenue',
  'audience',
  'episodes',
  'products',
  'optimization',
  'complete',
];

const STEP_REQUIREMENTS: Record<TutorialStep, string | null> = {
  welcome: null,
  revenue: 'revenue',
  audience: 'audience',
  episodes: 'episodes',
  products: 'products',
  optimization: null,
  complete: null,
};

interface TutorialProviderProps {
  children: ReactNode;
  onComplete: () => void;
}

export function TutorialProvider({ children, onComplete }: TutorialProviderProps) {
  const [isActive, setIsActive] = useState(true);
  const [currentStep, setCurrentStep] = useState<TutorialStep>('welcome');

  // Highlight elements in correct order: Revenue → Audience → Episodes → Products
  const getHighlightedElement = (step: TutorialStep): string | null => {
    switch (step) {
      case 'welcome':
        return 'tab-revenue';
      case 'revenue':
        return 'tab-audience';
      case 'audience':
        return 'tab-episodes';
      case 'episodes':
        return 'tab-products';
      case 'products':
        return 'hotspot-timing-section';
      case 'optimization':
        return null;
      default:
        return null;
    }
  };

  const startTutorial = useCallback(() => {
    setIsActive(true);
    setCurrentStep('welcome');
  }, []);

  const endTutorial = useCallback(() => {
    setIsActive(false);
    onComplete();
  }, [onComplete]);

  const goToStep = useCallback((step: TutorialStep) => {
    setCurrentStep(step);
    if (step === 'complete') {
      // Delay to show completion message
      setTimeout(() => {
        endTutorial();
      }, 5000);
    }
  }, [endTutorial]);

  const nextStep = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex < STEP_ORDER.length - 1) {
      goToStep(STEP_ORDER[currentIndex + 1]);
    }
  }, [currentStep, goToStep]);

  const validateTabClick = useCallback((tabId: string): boolean => {
    const requiredTab = STEP_REQUIREMENTS[currentStep];
    
    // If current step requires a specific tab click
    if (requiredTab && tabId === requiredTab) {
      // Move to next step when correct tab is clicked
      nextStep();
      return true;
    }
    
    // Check if this is the expected next tab
    const nextStepIndex = STEP_ORDER.indexOf(currentStep) + 1;
    if (nextStepIndex < STEP_ORDER.length) {
      const nextStepId = STEP_ORDER[nextStepIndex];
      const expectedTab = STEP_REQUIREMENTS[nextStepId];
      if (expectedTab === tabId) {
        nextStep();
        return true;
      }
    }
    
    return false;
  }, [currentStep, nextStep]);

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStep,
        highlightedElement: getHighlightedElement(currentStep),
        startTutorial,
        endTutorial,
        goToStep,
        nextStep,
        validateTabClick,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider');
  }
  return context;
}

export function useTutorialOptional() {
  return useContext(TutorialContext);
}
