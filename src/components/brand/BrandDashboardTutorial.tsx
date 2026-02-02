import { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BrandTutorialStep {
  id: string;
  title: string;
  description: string;
  highlightId: string | null;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const BRAND_STEPS: BrandTutorialStep[] = [
  {
    id: 'welcome',
    title: 'Deine KPIs',
    description: 'Umsatz, Investition, ROAS und Conversions – dein Performance-Cockpit auf einen Blick.',
    highlightId: 'brand-hero-kpis',
    position: 'bottom',
  },
  {
    id: 'budget',
    title: 'Budget Management',
    description: 'Hier siehst du dein verfügbares Budget und kannst neues hinzufügen.',
    highlightId: 'brand-budget-card',
    position: 'right',
  },
  {
    id: 'products',
    title: 'Produkt-Performance',
    description: 'Sehe, welche Produkte am besten performen – Clicks, CTR und Umsatz pro Produkt.',
    highlightId: 'brand-tab-products',
    position: 'top',
  },
  {
    id: 'creators',
    title: 'Creator-Partner',
    description: 'Welche Creators generieren den meisten Umsatz? Hier findest du die Antwort.',
    highlightId: 'brand-tab-creators',
    position: 'top',
  },
];

interface BrandDashboardTutorialProps {
  onComplete: () => void;
}

export function BrandDashboardTutorial({ onComplete }: BrandDashboardTutorialProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [showCompletion, setShowCompletion] = useState(false);

  const currentStep = BRAND_STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === BRAND_STEPS.length - 1;

  // Calculate tooltip position relative to highlighted element
  const updateTooltipPosition = useCallback(() => {
    if (!currentStep?.highlightId) {
      setTooltipPosition({ top: window.innerHeight / 2, left: window.innerWidth / 2 });
      return;
    }

    const element = document.querySelector(`[data-brand-tutorial="${currentStep.highlightId}"]`);
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const tooltipWidth = 280;
    const tooltipHeight = 140;
    const padding = 16;

    let top = 0;
    let left = 0;

    switch (currentStep.position) {
      case 'bottom':
        top = rect.bottom + padding;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'top':
        top = rect.top - tooltipHeight - padding;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - padding;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + padding;
        break;
      default:
        top = window.innerHeight / 2 - tooltipHeight / 2;
        left = window.innerWidth / 2 - tooltipWidth / 2;
    }

    // Keep tooltip in viewport
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding));

    setTooltipPosition({ top, left });
  }, [currentStep]);

  useEffect(() => {
    updateTooltipPosition();
    window.addEventListener('scroll', updateTooltipPosition);
    window.addEventListener('resize', updateTooltipPosition);
    const interval = setInterval(updateTooltipPosition, 200);

    return () => {
      window.removeEventListener('scroll', updateTooltipPosition);
      window.removeEventListener('resize', updateTooltipPosition);
      clearInterval(interval);
    };
  }, [updateTooltipPosition]);

  // Highlight the current element
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  
  useEffect(() => {
    if (!currentStep?.highlightId) {
      setHighlightRect(null);
      return;
    }

    const updateRect = () => {
      const element = document.querySelector(`[data-brand-tutorial="${currentStep.highlightId}"]`);
      if (element) {
        setHighlightRect(element.getBoundingClientRect());
      }
    };

    updateRect();
    const interval = setInterval(updateRect, 200);
    return () => clearInterval(interval);
  }, [currentStep?.highlightId]);

  const handleNext = () => {
    if (isLastStep) {
      setShowCompletion(true);
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  // Completion screen
  if (showCompletion) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 animate-fade-in">
        <div className="text-center px-6 max-w-sm">
          <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-5">
            <Sparkles className="w-8 h-8 text-gold" />
          </div>
          
          <h1 className="text-xl font-bold mb-3">Dashboard bereit!</h1>
          
          <p className="text-sm text-muted-foreground mb-6">
            Tracke Performance, analysiere Creator und optimiere deinen ROAS.
          </p>
          
          <Button
            onClick={onComplete}
            className="bg-gold hover:bg-gold/90 text-black font-semibold px-6 h-10 rounded-full"
          >
            Los geht's
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Subtle backdrop - much lighter */}
      <div 
        className="fixed inset-0 z-[90] bg-black/30 pointer-events-none transition-opacity duration-300"
        onClick={handleSkip}
      />

      {/* Highlight ring around current element */}
      {highlightRect && (
        <div
          className="fixed z-[91] border-2 border-gold rounded-lg pointer-events-none shadow-[0_0_12px_rgba(212,175,55,0.5)]"
          style={{
            left: highlightRect.left - 6,
            top: highlightRect.top - 6,
            width: highlightRect.width + 12,
            height: highlightRect.height + 12,
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
      )}

      {/* Compact tooltip - positioned near the element */}
      <div
        className="fixed z-[100] w-[280px] transition-all duration-300"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        <div className="bg-card border border-gold/40 rounded-xl p-4 shadow-lg shadow-black/30">
          {/* Close button */}
          <button 
            onClick={handleSkip}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Content */}
          <h3 className="font-semibold text-sm mb-1.5 pr-6">{currentStep.title}</h3>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            {currentStep.description}
          </p>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            {/* Progress dots */}
            <div className="flex gap-1">
              {BRAND_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors",
                    i === currentStepIndex ? "bg-gold" : 
                    i < currentStepIndex ? "bg-gold/50" : "bg-muted"
                  )}
                />
              ))}
            </div>

            {/* Nav buttons */}
            <div className="flex items-center gap-1">
              {currentStepIndex > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handlePrev}
                  className="h-7 w-7 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleNext}
                className="bg-gold hover:bg-gold/90 text-black font-medium h-7 px-3 text-xs rounded-full"
              >
                {isLastStep ? 'Fertig' : 'Weiter'}
                <ChevronRight className="w-3 h-3 ml-0.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
