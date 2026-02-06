import { useEffect, useState } from 'react';
import { X, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTutorial, TutorialStep } from './TutorialContext';
import { stepHints } from './fakeTutorialData';

export function TutorialOverlay() {
  const { isActive, currentStep, endTutorial, nextStep, highlightedElement } = useTutorial();
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  // Find and track highlighted element
  useEffect(() => {
    if (!isActive || !highlightedElement) {
      setHighlightRect(null);
      return;
    }

    const updateRect = () => {
      const element = document.querySelector(`[data-tutorial-id="${highlightedElement}"]`);
      if (element) {
        setHighlightRect(element.getBoundingClientRect());
      }
    };

    updateRect();
    
    // Update on scroll/resize
    window.addEventListener('scroll', updateRect);
    window.addEventListener('resize', updateRect);
    
    // Poll for dynamic content
    const interval = setInterval(updateRect, 200);

    return () => {
      window.removeEventListener('scroll', updateRect);
      window.removeEventListener('resize', updateRect);
      clearInterval(interval);
    };
  }, [isActive, highlightedElement]);

  if (!isActive) return null;

  const hint = stepHints[currentStep];
  const isComplete = currentStep === 'complete';

  // Completion screen
  if (isComplete) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 animate-fade-in">
        <div className="text-center px-6 max-w-sm">
          <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-gold" />
          </div>
          
          <h1 className="text-2xl font-bold mb-4">Du bist bereit.</h1>
          
          <p className="text-lg text-muted-foreground mb-6">
            <span className="text-gold font-semibold">3.192.000 €</span> wurden letztes Jahr von Creators auf Ryl verdient.
          </p>
          
          <p className="text-sm text-muted-foreground mb-8">
            Du bist jetzt Teil davon.
          </p>
          
          <Button
            onClick={endTutorial}
            className="bg-gold hover:bg-gold/90 text-black font-semibold px-8 h-12 rounded-full"
          >
            Los geht's
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop with spotlight cutout - LIGHTER overlay */}
      <div className="fixed inset-0 z-[90] pointer-events-none">
        {/* Semi-transparent overlay - reduced from bg-black/60 to bg-black/40 */}
        <div 
          className="absolute inset-0 bg-black/40 transition-opacity duration-300"
          style={{
            clipPath: highlightRect 
              ? `polygon(
                  0% 0%, 
                  0% 100%, 
                  ${highlightRect.left - 8}px 100%, 
                  ${highlightRect.left - 8}px ${highlightRect.top - 8}px, 
                  ${highlightRect.right + 8}px ${highlightRect.top - 8}px, 
                  ${highlightRect.right + 8}px ${highlightRect.bottom + 8}px, 
                  ${highlightRect.left - 8}px ${highlightRect.bottom + 8}px, 
                  ${highlightRect.left - 8}px 100%, 
                  100% 100%, 
                  100% 0%
                )`
              : 'none'
          }}
        />
        
        {/* Highlight ring with glow effect */}
        {highlightRect && (
          <div
            className="absolute border-2 border-gold rounded-lg pointer-events-none shadow-[0_0_20px_rgba(212,175,55,0.4)]"
            style={{
              left: highlightRect.left - 8,
              top: highlightRect.top - 8,
              width: highlightRect.width + 16,
              height: highlightRect.height + 16,
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
        )}
      </div>

      {/* Hint card with clear action */}
      {hint && (
        <div 
          className={cn(
            "fixed z-[100] transition-all duration-300",
            "bottom-24 left-4 right-4",
          )}
        >
          <div className="bg-card border border-gold/30 rounded-2xl p-5 shadow-xl shadow-black/20 max-w-sm mx-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="font-bold text-lg">{hint.title}</h3>
              <button 
                onClick={endTutorial}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 -m-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Description */}
            <p className="text-sm text-muted-foreground mb-4">
              {hint.description}
            </p>

            {/* Action instruction - highly visible */}
            {hint.action && (
              <div className="bg-gold/10 border border-gold/30 rounded-xl p-3 mb-4">
                <p className="text-sm font-semibold text-gold text-center animate-pulse">
                  {hint.action}
                </p>
              </div>
            )}

            {/* Progress indicator - correct order */}
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {['welcome', 'revenue', 'audience', 'episodes', 'retention', 'funnel', 'products', 'optimization'].map((step, i) => (
                  <div
                    key={step}
                    className={cn(
                      "w-2.5 h-2.5 rounded-full transition-colors",
                      step === currentStep ? "bg-gold" : 
                      ['welcome', 'revenue', 'audience', 'episodes', 'retention', 'funnel', 'products', 'optimization'].indexOf(currentStep) > i 
                        ? "bg-gold/50" 
                        : "bg-muted"
                    )}
                  />
                ))}
              </div>

              {/* Complete button for last step */}
              {currentStep === 'optimization' && (
                <Button
                  size="sm"
                  onClick={nextStep}
                  className="bg-gold hover:bg-gold/90 text-black font-semibold h-9 px-4 rounded-full"
                >
                  Verstanden!
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Skip button */}
      <button
        onClick={endTutorial}
        className="fixed top-4 right-4 z-[100] text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        Überspringen
      </button>
    </>
  );
}
