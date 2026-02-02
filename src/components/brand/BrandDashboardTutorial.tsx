import { useState, useEffect, useCallback, useRef } from 'react';
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
    // On mobile, "right" often clamps into the card and blocks controls.
    // Default to bottom and let auto-placement pick the best spot.
    position: 'bottom',
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
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [tooltipSize, setTooltipSize] = useState({ width: 280, height: 140 });

  const currentStep = BRAND_STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === BRAND_STEPS.length - 1;

  // Track tooltip size (so placement doesn't guess wrong and overlap the target)
  useEffect(() => {
    const el = tooltipRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      if (r.width && r.height) {
        setTooltipSize({ width: r.width, height: r.height });
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Highlight + tooltip placement (single source of truth)
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  const recalc = useCallback(() => {
    const padding = 16;

    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(v, max));

    const getOpposite = (pos: BrandTutorialStep['position']) => {
      switch (pos) {
        case 'top':
          return 'bottom';
        case 'bottom':
          return 'top';
        case 'left':
          return 'right';
        case 'right':
          return 'left';
        default:
          return 'center';
      }
    };

    const computeCandidate = (
      pos: BrandTutorialStep['position'],
      rect: DOMRect,
      size: { width: number; height: number },
    ) => {
      let top = 0;
      let left = 0;

      switch (pos) {
        case 'bottom':
          top = rect.bottom + padding;
          left = rect.left + rect.width / 2 - size.width / 2;
          break;
        case 'top':
          top = rect.top - size.height - padding;
          left = rect.left + rect.width / 2 - size.width / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - size.height / 2;
          left = rect.left - size.width - padding;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - size.height / 2;
          left = rect.right + padding;
          break;
        default:
          top = window.innerHeight / 2 - size.height / 2;
          left = window.innerWidth / 2 - size.width / 2;
      }

      // Keep in viewport
      left = clamp(left, padding, window.innerWidth - size.width - padding);
      top = clamp(top, padding, window.innerHeight - size.height - padding);

      return { top, left };
    };

    const intersectionArea = (
      a: { top: number; left: number; width: number; height: number },
      b: DOMRect,
    ) => {
      const x1 = Math.max(a.left, b.left);
      const y1 = Math.max(a.top, b.top);
      const x2 = Math.min(a.left + a.width, b.right);
      const y2 = Math.min(a.top + a.height, b.bottom);
      const w = Math.max(0, x2 - x1);
      const h = Math.max(0, y2 - y1);
      return w * h;
    };

    if (!currentStep?.highlightId) {
      setHighlightRect(null);
      setTooltipPosition({ top: window.innerHeight / 2, left: window.innerWidth / 2 });
      return;
    }

    const el = document.querySelector(`[data-brand-tutorial="${currentStep.highlightId}"]`);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    setHighlightRect(rect);

    const preferred = currentStep.position;
    const opposite = getOpposite(preferred);

    // On narrow screens, side placements often get clamped into the target.
    const isNarrow = window.innerWidth < 520;

    const candidates: BrandTutorialStep['position'][] = Array.from(
      new Set([
        preferred,
        opposite,
        // Prefer vertical placements on narrow viewports
        ...(isNarrow ? (['bottom', 'top'] as const) : ([] as const)),
        'bottom',
        'top',
        'right',
        'left',
      ]),
    );

    let best = computeCandidate(preferred, rect, tooltipSize);
    let bestOverlap = intersectionArea(
      { top: best.top, left: best.left, width: tooltipSize.width, height: tooltipSize.height },
      rect,
    );

    for (const pos of candidates) {
      const candidate = computeCandidate(pos, rect, tooltipSize);
      const overlap = intersectionArea(
        { top: candidate.top, left: candidate.left, width: tooltipSize.width, height: tooltipSize.height },
        rect,
      );

      if (overlap < bestOverlap) {
        best = candidate;
        bestOverlap = overlap;
        if (bestOverlap === 0) break;
      }
    }

    setTooltipPosition(best);
  }, [currentStep, tooltipSize]);

  useEffect(() => {
    recalc();
    window.addEventListener('scroll', recalc);
    window.addEventListener('resize', recalc);
    const interval = setInterval(recalc, 200);

    return () => {
      window.removeEventListener('scroll', recalc);
      window.removeEventListener('resize', recalc);
      clearInterval(interval);
    };
  }, [recalc]);

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
        ref={tooltipRef}
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
