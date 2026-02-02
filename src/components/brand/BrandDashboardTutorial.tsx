import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, TrendingUp, DollarSign, ShoppingCart, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { fakeBrandAnalytics, fakeBrandBudget } from './tutorial/fakeBrandTutorialData';

interface BrandTutorialStep {
  id: string;
  title: string;
  description: string;
  highlightId: string | null;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  actionHint?: string;
  // Fake data display
  fakeMetric?: {
    label: string;
    value: string;
    subtext?: string;
    icon?: 'revenue' | 'roas' | 'conversions' | 'budget';
    color?: 'gold' | 'green' | 'blue';
  };
}

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(cents / 100);
};

const BRAND_STEPS: BrandTutorialStep[] = [
  {
    id: 'welcome',
    title: 'Deine KPIs',
    description: 'Umsatz, Investment, ROAS und Conversions – dein Performance-Cockpit.',
    highlightId: 'brand-hero-kpis',
    position: 'bottom',
    actionHint: '👆 Schau dir die vier Kennzahlen an',
    fakeMetric: {
      label: 'Generierter Umsatz',
      value: formatCurrency(fakeBrandAnalytics.totalRevenue),
      subtext: `bei nur ${formatCurrency(fakeBrandAnalytics.totalSpent)} Investment`,
      icon: 'revenue',
      color: 'green',
    },
  },
  {
    id: 'budget',
    title: 'Budget Management',
    description: 'Du zahlst nur bei echten Verkäufen. Keine Views, keine Clicks.',
    highlightId: 'brand-budget-card',
    position: 'bottom',
    actionHint: '👆 Hier siehst du dein verfügbares Budget',
    fakeMetric: {
      label: 'Verfügbar',
      value: formatCurrency(fakeBrandBudget.remainingCents),
      subtext: `von ${formatCurrency(fakeBrandBudget.totalBudgetCents)} Budget`,
      icon: 'budget',
      color: 'gold',
    },
  },
  {
    id: 'products',
    title: 'Produkt-Performance',
    description: 'Welche Produkte konvertieren am besten bei Creators?',
    highlightId: 'brand-tab-products',
    position: 'top',
    actionHint: '👇 Scrolle nach unten, um die Produkt-Tabelle zu sehen',
    fakeMetric: {
      label: 'ROAS',
      value: `${fakeBrandAnalytics.roas.toFixed(1)}x`,
      subtext: 'Return on Ad Spend',
      icon: 'roas',
      color: 'green',
    },
  },
  {
    id: 'creators',
    title: 'Creator-Partner',
    description: 'Deine Top-Performer auf einen Blick. Wer generiert den meisten Umsatz?',
    highlightId: 'brand-tab-creators',
    position: 'top',
    actionHint: '👇 Scrolle nach unten, um alle Creator zu sehen',
    fakeMetric: {
      label: 'Conversions',
      value: fakeBrandAnalytics.conversions.toString(),
      subtext: `${fakeBrandAnalytics.ctr.toFixed(1)}% CTR`,
      icon: 'conversions',
      color: 'blue',
    },
  },
];

interface BrandDashboardTutorialProps {
  onComplete: () => void;
  onDisableDemo?: () => void;
}

export function BrandDashboardTutorial({ onComplete, onDisableDemo }: BrandDashboardTutorialProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [showCompletion, setShowCompletion] = useState(false);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [tooltipSize, setTooltipSize] = useState({ width: 300, height: 180 });

  const currentStep = BRAND_STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === BRAND_STEPS.length - 1;

  // Track tooltip size
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

  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  const recalc = useCallback(() => {
    const padding = 16;
    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(v, max));

    const getOpposite = (pos: BrandTutorialStep['position']) => {
      switch (pos) {
        case 'top': return 'bottom';
        case 'bottom': return 'top';
        case 'left': return 'right';
        case 'right': return 'left';
        default: return 'center';
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
    const isNarrow = window.innerWidth < 520;

    const candidates: BrandTutorialStep['position'][] = Array.from(
      new Set([
        preferred,
        opposite,
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

  const getMetricIcon = (icon?: string) => {
    switch (icon) {
      case 'revenue': return <DollarSign className="w-4 h-4" />;
      case 'roas': return <TrendingUp className="w-4 h-4" />;
      case 'conversions': return <ShoppingCart className="w-4 h-4" />;
      case 'budget': return <Percent className="w-4 h-4" />;
      default: return null;
    }
  };

  const getMetricColor = (color?: string) => {
    switch (color) {
      case 'green': return 'text-green-500 bg-green-500/10';
      case 'blue': return 'text-blue-500 bg-blue-500/10';
      case 'gold': return 'text-gold bg-gold/10';
      default: return 'text-gold bg-gold/10';
    }
  };

  // Completion screen
  if (showCompletion) {
    const handleFinish = () => {
      // Disable demo mode to show real dashboard
      onDisableDemo?.();
      onComplete();
    };

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 animate-fade-in">
        <div className="text-center px-6 max-w-sm">
          <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-5">
            <Sparkles className="w-8 h-8 text-gold" />
          </div>
          
          <h1 className="text-xl font-bold mb-3">Dashboard bereit!</h1>
          
          <p className="text-sm text-muted-foreground mb-2">
            Tracke Performance, analysiere Creator und optimiere deinen ROAS.
          </p>
          
          <p className="text-xs text-muted-foreground mb-6">
            <span className="text-gold font-semibold">{formatCurrency(fakeBrandAnalytics.totalRevenue)}</span> wurden im Beispiel generiert – bei nur <span className="text-gold">{formatCurrency(fakeBrandAnalytics.totalSpent)}</span> Investment.
          </p>
          
          <Button
            onClick={handleFinish}
            className="bg-gold hover:bg-gold/90 text-black font-semibold px-6 h-10 rounded-full"
          >
            Zum echten Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Subtle backdrop */}
      <div 
        className="fixed inset-0 z-[90] bg-black/30 pointer-events-none transition-opacity duration-300"
        onClick={handleSkip}
      />

      {/* Highlight ring */}
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

      {/* Tooltip with fake data */}
      <div
        className="fixed z-[100] w-[300px] transition-all duration-300"
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
          <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
            {currentStep.description}
          </p>

          {/* Action hint */}
          {currentStep.actionHint && (
            <div className="text-xs font-medium text-gold bg-gold/10 rounded-md px-2 py-1.5 mb-3 text-center">
              {currentStep.actionHint}
            </div>
          )}

          {/* Fake Metric Display */}
          {currentStep.fakeMetric && (
            <div className={cn(
              "rounded-lg p-3 mb-3 border",
              getMetricColor(currentStep.fakeMetric.color),
              "border-current/20"
            )}>
              <div className="flex items-center gap-2 mb-1">
                {getMetricIcon(currentStep.fakeMetric.icon)}
                <span className="text-[10px] uppercase tracking-wide opacity-80">
                  {currentStep.fakeMetric.label}
                </span>
              </div>
              <div className="text-xl font-bold">
                {currentStep.fakeMetric.value}
              </div>
              {currentStep.fakeMetric.subtext && (
                <div className="text-[10px] opacity-70 mt-0.5">
                  {currentStep.fakeMetric.subtext}
                </div>
              )}
            </div>
          )}

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
