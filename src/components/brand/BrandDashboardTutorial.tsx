import { useState, useEffect } from 'react';
import { X, ChevronRight, TrendingUp, Package, Users, BarChart3, Building2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BrandTutorialStep {
  id: string;
  title: string;
  description: string;
  action: string | null;
  icon: React.ReactNode;
  highlightId: string | null;
}

const BRAND_STEPS: BrandTutorialStep[] = [
  {
    id: 'welcome',
    title: 'Willkommen im Brand Dashboard',
    description: 'Hier trackst du die Performance deiner Produkte auf Ryl – in Echtzeit.',
    action: '👆 Schaue dir die KPIs an',
    icon: <Building2 className="w-6 h-6" />,
    highlightId: 'brand-hero-kpis',
  },
  {
    id: 'kpis',
    title: '📊 Deine Key Metrics',
    description: 'Spend, Revenue, ROAS und Conversions – alles auf einen Blick. Hier misst du deinen ROI.',
    action: '👆 Klicke auf "Produkte"',
    icon: <TrendingUp className="w-6 h-6" />,
    highlightId: 'brand-tab-products',
  },
  {
    id: 'products',
    title: '🛍️ Produkt-Performance',
    description: 'Sehe, welche Produkte am besten performen. Impressions, Clicks und Conversion Rate pro Produkt.',
    action: '👆 Klicke auf "Creators"',
    icon: <Package className="w-6 h-6" />,
    highlightId: 'brand-tab-creators',
  },
  {
    id: 'creators',
    title: '👥 Creator-Netzwerk',
    description: 'Deine Produkte werden von Creators in Videos platziert. Hier siehst du, wer am meisten Umsatz generiert.',
    action: '👆 Klicke auf "Anfragen"',
    icon: <Users className="w-6 h-6" />,
    highlightId: 'brand-tab-requests',
  },
  {
    id: 'requests',
    title: '📬 Creator-Anfragen',
    description: 'Creators können sich bewerben, deine Produkte zu featuren. Prüfe Anfragen und starte Partnerschaften.',
    action: null,
    icon: <BarChart3 className="w-6 h-6" />,
    highlightId: null,
  },
];

interface BrandDashboardTutorialProps {
  onComplete: () => void;
}

export function BrandDashboardTutorial({ onComplete }: BrandDashboardTutorialProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);

  const currentStep = BRAND_STEPS[currentStepIndex];

  // Track highlighted element
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
    window.addEventListener('scroll', updateRect);
    window.addEventListener('resize', updateRect);
    const interval = setInterval(updateRect, 200);

    return () => {
      window.removeEventListener('scroll', updateRect);
      window.removeEventListener('resize', updateRect);
      clearInterval(interval);
    };
  }, [currentStep?.highlightId]);

  const handleNext = () => {
    if (currentStepIndex < BRAND_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setShowCompletion(true);
    }
  };

  const handleElementClick = (elementId: string) => {
    if (currentStep?.highlightId === elementId) {
      handleNext();
    }
  };

  // Expose click handler globally for elements to call
  useEffect(() => {
    (window as any).__brandTutorialClick = handleElementClick;
    return () => {
      delete (window as any).__brandTutorialClick;
    };
  }, [currentStep?.highlightId]);

  // Completion screen
  if (showCompletion) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 animate-fade-in">
        <div className="text-center px-6 max-w-sm">
          <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-gold" />
          </div>
          
          <h1 className="text-2xl font-bold mb-4">Dein Dashboard ist bereit!</h1>
          
          <p className="text-muted-foreground mb-6">
            Tracke deine Kampagnen-Performance, analysiere Creator und optimiere deinen ROAS.
          </p>
          
          <p className="text-sm text-muted-foreground mb-8">
            <span className="text-gold font-semibold">Performance-First.</span> Messe echten Umsatz, nicht nur Impressionen.
          </p>
          
          <Button
            onClick={onComplete}
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
      {/* Lighter backdrop with spotlight */}
      <div className="fixed inset-0 z-[90] pointer-events-none">
        <div 
          className="absolute inset-0 bg-black/40 transition-opacity duration-300"
          style={{
            clipPath: highlightRect 
              ? `polygon(
                  0% 0%, 
                  0% 100%, 
                  ${highlightRect.left - 12}px 100%, 
                  ${highlightRect.left - 12}px ${highlightRect.top - 12}px, 
                  ${highlightRect.right + 12}px ${highlightRect.top - 12}px, 
                  ${highlightRect.right + 12}px ${highlightRect.bottom + 12}px, 
                  ${highlightRect.left - 12}px ${highlightRect.bottom + 12}px, 
                  ${highlightRect.left - 12}px 100%, 
                  100% 100%, 
                  100% 0%
                )`
              : 'none'
          }}
        />
        
        {/* Glowing highlight ring */}
        {highlightRect && (
          <div
            className="absolute border-2 border-gold rounded-xl pointer-events-none shadow-[0_0_20px_rgba(212,175,55,0.4)]"
            style={{
              left: highlightRect.left - 12,
              top: highlightRect.top - 12,
              width: highlightRect.width + 24,
              height: highlightRect.height + 24,
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
        )}
      </div>

      {/* Hint card */}
      <div className="fixed bottom-24 left-4 right-4 z-[100]">
        <div className="bg-card border border-gold/30 rounded-2xl p-5 shadow-xl shadow-black/20 max-w-sm mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                {currentStep.icon}
              </div>
              <h3 className="font-bold text-lg">{currentStep.title}</h3>
            </div>
            <button 
              onClick={onComplete}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 -m-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4">
            {currentStep.description}
          </p>

          {/* Action instruction */}
          {currentStep.action && (
            <div className="bg-gold/10 border border-gold/30 rounded-xl p-3 mb-4">
              <p className="text-sm font-semibold text-gold text-center animate-pulse">
                {currentStep.action}
              </p>
            </div>
          )}

          {/* Progress + Next button */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {BRAND_STEPS.map((step, i) => (
                <div
                  key={step.id}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-colors",
                    i === currentStepIndex ? "bg-gold" : 
                    i < currentStepIndex ? "bg-gold/50" : "bg-muted"
                  )}
                />
              ))}
            </div>

            {/* Manual next for last step */}
            {!currentStep.highlightId && (
              <Button
                size="sm"
                onClick={handleNext}
                className="bg-gold hover:bg-gold/90 text-black font-semibold h-9 px-4 rounded-full"
              >
                Verstanden!
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Skip button */}
      <button
        onClick={onComplete}
        className="fixed top-4 right-4 z-[100] text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        Überspringen
      </button>
    </>
  );
}
