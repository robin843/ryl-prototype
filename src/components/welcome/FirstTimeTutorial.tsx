import { useState, useRef, useEffect, useCallback } from 'react';
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
    color: 'from-purple-500/20 to-purple-600/10',
    iconColor: 'text-purple-400',
  },
  {
    icon: ShoppingBag,
    title: 'Entdecke Produkte',
    description: 'Tippe auf Produkte im Video, um sie zu kaufen.',
    color: 'from-amber-500/20 to-amber-600/10',
    iconColor: 'text-amber-400',
  },
  {
    icon: Sparkles,
    title: 'Kaufe direkt ein',
    description: 'Ohne das Video zu verlassen.',
    color: 'from-emerald-500/20 to-emerald-600/10',
    iconColor: 'text-emerald-400',
  },
];

export function FirstTimeTutorial({ onComplete }: FirstTimeTutorialProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const isSwiping = useRef<boolean>(false);

  const isLastSlide = currentSlide === tutorialSlides.length - 1;

  const goToNextSlide = useCallback(() => {
    if (isLastSlide) {
      onComplete();
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  }, [isLastSlide, onComplete]);

  const goToPrevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  }, [currentSlide]);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    isSwiping.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping.current) return;
    // Prevent default scroll
    e.preventDefault();
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isSwiping.current) return;
    isSwiping.current = false;
    
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    const timeDiff = Date.now() - touchStartTime.current;
    
    // Swipe threshold: 40px or fast swipe (< 300ms with 20px)
    const isValidSwipe = Math.abs(diff) > 40 || (timeDiff < 300 && Math.abs(diff) > 20);
    
    if (isValidSwipe) {
      if (diff > 0) {
        // Swipe up
        goToNextSlide();
      } else {
        // Swipe down
        goToPrevSlide();
      }
    }
  }, [goToNextSlide, goToPrevSlide]);

  // Keyboard and wheel for desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goToNextSlide();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevSlide();
      }
    };

    let wheelTimeout: NodeJS.Timeout;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      clearTimeout(wheelTimeout);
      
      wheelTimeout = setTimeout(() => {
        if (e.deltaY > 30) {
          goToNextSlide();
        } else if (e.deltaY < -30) {
          goToPrevSlide();
        }
      }, 100);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
      clearTimeout(wheelTimeout);
    };
  }, [goToNextSlide, goToPrevSlide]);

  const slide = tutorialSlides[currentSlide];
  const IconComponent = slide.icon;

  return (
    <div 
      className="min-h-screen bg-background flex flex-col px-6 py-8 safe-area-top safe-area-bottom select-none touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Logo */}
      <div className="text-center pt-4">
        <span className="text-2xl font-black uppercase tracking-tight text-amber-400">RYL</span>
      </div>

      {/* Slide Indicators */}
      <div className="flex justify-center gap-2 mt-8 mb-8">
        {tutorialSlides.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === currentSlide ? "w-8 bg-amber-400" : "w-2 bg-muted"
            )}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {/* Icon with gradient background */}
        <div className={cn(
          "w-28 h-28 rounded-full flex items-center justify-center mb-10",
          "bg-gradient-to-br transition-all duration-500",
          slide.color
        )}>
          <IconComponent className={cn("w-14 h-14 transition-colors duration-500", slide.iconColor)} />
        </div>

        <h1 className="font-black uppercase text-2xl mb-4 text-foreground">
          {slide.title}
        </h1>
        <p className="text-muted-foreground max-w-xs">
          {slide.description}
        </p>
      </div>

      {/* Footer - Swipe hint or button */}
      <div className="pt-6 text-center">
        {isLastSlide ? (
          <Button 
            onClick={onComplete}
            className="w-full h-14 rounded-full font-medium bg-amber-400 hover:bg-amber-500 text-black"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Los geht's
          </Button>
        ) : (
          <div className="flex flex-col items-center gap-2 text-amber-400/70 animate-bounce">
            <ChevronUp className="w-6 h-6" />
            <span className="text-sm">Swipe nach oben</span>
          </div>
        )}
      </div>
    </div>
  );
}