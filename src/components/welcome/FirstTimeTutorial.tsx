import { useState, useRef, useEffect } from 'react';
import { Hand, ShoppingBag, Sparkles, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FirstTimeTutorialProps {
  onComplete: () => void;
}

const tutorialSlides = [
  {
    icon: Hand,
    title: 'Wische durch Videos',
    description: 'Swipe nach oben, um durch unsere Serien zu stöbern.',
  },
  {
    icon: ShoppingBag,
    title: 'Entdecke Produkte',
    description: 'Tippe auf Produkte im Video, um sie zu kaufen.',
  },
  {
    icon: Sparkles,
    title: 'Kaufe direkt ein',
    description: 'Ohne das Video zu verlassen.',
  },
];

export function FirstTimeTutorial({ onComplete }: FirstTimeTutorialProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isLastSlide = currentSlide === tutorialSlides.length - 1;

  // Handle swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    
    // Swipe up threshold (50px)
    if (diff > 50) {
      if (isLastSlide) {
        onComplete();
      } else {
        setCurrentSlide(prev => prev + 1);
      }
    }
    // Swipe down (go back)
    else if (diff < -50 && currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
    
    touchStartY.current = null;
  };

  // Handle wheel/scroll for desktop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timeout: NodeJS.Timeout;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      clearTimeout(timeout);
      
      timeout = setTimeout(() => {
        if (e.deltaY > 30) {
          if (isLastSlide) {
            onComplete();
          } else {
            setCurrentSlide(prev => Math.min(prev + 1, tutorialSlides.length - 1));
          }
        } else if (e.deltaY < -30 && currentSlide > 0) {
          setCurrentSlide(prev => prev - 1);
        }
      }, 50);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [currentSlide, isLastSlide, onComplete]);

  const slide = tutorialSlides[currentSlide];
  const IconComponent = slide.icon;

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-background flex flex-col px-6 py-8 safe-area-top safe-area-bottom select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Logo */}
      <div className="text-center pt-4">
        <span className="ryl-logo text-2xl">RYL</span>
      </div>

      {/* Slide Indicators */}
      <div className="flex justify-center gap-2 mt-8 mb-8">
        {tutorialSlides.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              i === currentSlide ? "w-8 bg-foreground" : "w-2 bg-muted"
            )}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {/* Icon */}
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-10 bg-muted/20">
          <IconComponent className="w-12 h-12 text-foreground" />
        </div>

        <h1 className="font-black uppercase text-2xl mb-4 text-foreground">
          {slide.title}
        </h1>
        <p className="text-muted-foreground max-w-xs">
          {slide.description}
        </p>
      </div>

      {/* Footer - Swipe hint */}
      <div className="pt-6 text-center">
        {isLastSlide ? (
          <Button 
            onClick={onComplete}
            className="w-full h-14 rounded-full font-medium"
          >
            Los geht's
          </Button>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground animate-pulse">
            <ChevronUp className="w-6 h-6" />
            <span className="text-sm">Swipe nach oben</span>
          </div>
        )}
      </div>
    </div>
  );
}