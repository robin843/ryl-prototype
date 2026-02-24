import { useState, useEffect } from 'react';
import { X, ChevronRight, Film, ShoppingBag, Target, CreditCard, BarChart3, Sparkles, Maximize2, Move, MousePointerClick } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StudioTutorialStep {
  id: string;
  title: string;
  description: string;
  action: string;
  icon: React.ReactNode;
  highlightId: string | null;
}

const STUDIO_STEPS: StudioTutorialStep[] = [
  {
    id: 'welcome',
    title: 'Willkommen im Studio',
    description: 'Hier verwaltest du dein Creator Business – Serien, Produkte und Einnahmen.',
    action: '👆 Klicke auf "Neue Serie"',
    icon: <Film className="w-6 h-6" />,
    highlightId: 'studio-create-series',
  },
  {
    id: 'series',
    title: '📺 Serien erstellen',
    description: 'Eine Serie ist dein Kanal. Erstelle Episoden und verknüpfe Produkte.',
    action: '👆 Klicke auf "Produkt hinzufügen"',
    icon: <Film className="w-6 h-6" />,
    highlightId: 'studio-add-product',
  },
  {
    id: 'products',
    title: '🛍️ Produkte anlegen',
    description: 'Produkte werden als Hotspots in deinen Videos eingeblendet. Zuschauer können direkt kaufen.',
    action: '👆 Klicke auf "Analytics"',
    icon: <ShoppingBag className="w-6 h-6" />,
    highlightId: 'studio-analytics-link',
  },
  {
    id: 'hotspots',
    title: '🎯 Hotspots platzieren',
    description: 'Öffne eine Episode, wechsle zum "Hotspots"-Tab und klicke "Hotspot hinzufügen". Der Hotspot wird an der aktuellen Video-Position erstellt.',
    action: null,
    icon: <Target className="w-6 h-6" />,
    highlightId: null,
  },
  {
    id: 'hotspot-drag',
    title: '✋ Hotspot verschieben',
    description: 'Ziehe den goldenen Kreis im Video an die Stelle, wo das Produkt zu sehen ist. Die Position wird automatisch gespeichert.',
    action: null,
    icon: <Move className="w-6 h-6" />,
    highlightId: null,
  },
  {
    id: 'hotspot-size',
    title: '📏 Größe anpassen',
    description: 'Nutze den Slider unter "Größe", um den Hotspot grösser oder kleiner zu machen. Rechts = maximale Größe. Die Änderung siehst du live im Video.',
    action: null,
    icon: <Maximize2 className="w-6 h-6" />,
    highlightId: null,
  },
  {
    id: 'hotspot-shop',
    title: '🛍️ Einkaufstaste',
    description: 'Jeder Hotspot zeigt ein Einkaufs-Symbol. Zuschauer tippen darauf und werden direkt zum Produkt weitergeleitet.',
    action: '👆 Schaue dir die Stripe-Karte an',
    icon: <ShoppingBag className="w-6 h-6" />,
    highlightId: 'studio-stripe-card',
  },
  {
    id: 'stripe',
    title: '💳 Auszahlungen via Stripe',
    description: 'Verbinde Stripe, um Zahlungen zu empfangen. Dein Geld wird automatisch ausgezahlt.',
    action: null,
    icon: <CreditCard className="w-6 h-6" />,
    highlightId: null,
  },
];

interface StudioTutorialProps {
  onComplete: () => void;
}

export function StudioTutorial({ onComplete }: StudioTutorialProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);

  const currentStep = STUDIO_STEPS[currentStepIndex];

  // Track highlighted element
  useEffect(() => {
    if (!currentStep?.highlightId) {
      setHighlightRect(null);
      return;
    }

    const updateRect = () => {
      const element = document.querySelector(`[data-studio-tutorial="${currentStep.highlightId}"]`);
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
    if (currentStepIndex < STUDIO_STEPS.length - 1) {
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
    (window as any).__studioTutorialClick = handleElementClick;
    return () => {
      delete (window as any).__studioTutorialClick;
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
          
          <h1 className="text-2xl font-bold mb-4">Dein Studio ist bereit!</h1>
          
          <p className="text-muted-foreground mb-6">
            Erstelle deine erste Serie, füge Produkte hinzu und starte mit dem Verkaufen.
          </p>
          
          <p className="text-sm text-muted-foreground mb-8">
            <span className="text-gold font-semibold">3.192.000 €</span> – so viel haben Creators letztes Jahr auf Ryl verdient.
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
              {STUDIO_STEPS.map((step, i) => (
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
