import { useState, useRef, useCallback } from 'react';
import { ShoppingBag, Sparkles, Hand } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface TutorialStepProps {
  onComplete: () => void;
}

const tutorialSlides = [
  {
    icon: Hand,
    title: 'Wische durch Videos',
    description: 'Swipe nach oben oder unten, um durch unsere Serien zu stöbern.',
    color: 'from-purple-500/20 to-purple-600/10',
  },
  {
    icon: ShoppingBag,
    title: 'Entdecke Produkte',
    description: 'Tippe auf das Shop-Icon, um alle Produkte im Video zu sehen.',
    color: 'from-gold/20 to-amber-600/10',
  },
  {
    icon: Sparkles,
    title: 'Kaufe direkt ein',
    description: 'Klicke auf ein Produkt und kaufe es direkt, ohne das Video zu verlassen.',
    color: 'from-emerald-500/20 to-emerald-600/10',
  },
];

export function TutorialStep({ onComplete }: TutorialStepProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  const isLastSlide = currentSlide === tutorialSlides.length - 1;

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < tutorialSlides.length) {
      setCurrentSlide(index);
    }
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const diff = touchStartY.current - touchEndY.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe up → next
        goToSlide(currentSlide + 1);
      } else {
        // Swipe down → prev
        goToSlide(currentSlide - 1);
      }
    }
  };

  const slide = tutorialSlides[currentSlide];
  const IconComponent = slide.icon;

  return (
    <div
      className="flex flex-col h-full px-6 py-8"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slide Indicators */}
      <div className="flex justify-center gap-2 mb-8">
        {tutorialSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={cn(
              "h-2 rounded-full transition-all",
              i === currentSlide ? "w-8 bg-gold" : "w-2 bg-muted"
            )}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center min-h-0">
        <div className={cn(
          "w-32 h-32 rounded-full flex items-center justify-center mb-10 shrink-0",
          "bg-gradient-to-br",
          slide.color
        )}>
          <IconComponent className="w-16 h-16 text-gold" />
        </div>

        <h1 className="text-headline text-2xl mb-4 animate-fade-in" key={`title-${currentSlide}`}>
          {slide.title}
        </h1>
        <p className="text-body text-muted-foreground max-w-xs animate-fade-in" key={`desc-${currentSlide}`}>
          {slide.description}
        </p>
      </div>

      {/* Footer - CTA only on last slide */}
      <div className="pt-6 pb-4 space-y-3 shrink-0">
        {isLastSlide ? (
          <Button
            onClick={onComplete}
            className="w-full h-14 rounded-full bg-gold hover:bg-gold/90 text-primary-foreground font-medium group"
          >
            Fahre weiter
            <Sparkles className="ml-2 w-5 h-5" />
          </Button>
        ) : (
          <>
            <p className="text-center text-sm text-muted-foreground">
              Wische nach oben, um fortzufahren
            </p>
            <Button
              variant="ghost"
              onClick={onComplete}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              Überspringen
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
