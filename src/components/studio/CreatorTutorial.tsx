import { useState, useRef, useCallback } from 'react';
import { 
  Rocket, 
  Film, 
  Upload, 
  ShoppingBag, 
  CreditCard, 
  ChevronUp,
  Sparkles 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CreatorTutorialProps {
  onComplete: () => void;
}

const tutorialSlides = [
  {
    icon: Rocket,
    title: 'Dein Studio ist bereit',
    description: 'Hier erstellst du Inhalte, die verkaufen. Keine Follower-Jagd, nur Business.',
    color: 'from-gold/20 to-amber-600/10',
    iconColor: 'text-gold',
  },
  {
    icon: Film,
    title: 'Erstelle eine Serie',
    description: 'Serien organisieren deine Episoden nach Thema. Starte mit einer klaren Idee.',
    color: 'from-purple-500/20 to-purple-600/10',
    iconColor: 'text-purple-400',
  },
  {
    icon: Upload,
    title: 'Lade Episoden hoch',
    description: 'Kurze Videos mit Story performen am besten. 30–90 Sekunden sind ideal.',
    color: 'from-blue-500/20 to-blue-600/10',
    iconColor: 'text-blue-400',
  },
  {
    icon: ShoppingBag,
    title: 'Platziere Produkte',
    description: 'Hotspots markieren Produkte direkt im Video. Die ersten 20 Sekunden konvertieren am besten.',
    color: 'from-emerald-500/20 to-emerald-600/10',
    iconColor: 'text-emerald-400',
  },
  {
    icon: CreditCard,
    title: 'Verbinde Stripe',
    description: 'Damit du Geld verdienen kannst. Auszahlungen direkt auf dein Konto.',
    color: 'from-gold/20 to-amber-600/10',
    iconColor: 'text-gold',
  },
];

export function CreatorTutorial({ onComplete }: CreatorTutorialProps) {
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
    e.preventDefault();
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isSwiping.current) return;
    isSwiping.current = false;
    
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    const timeDiff = Date.now() - touchStartTime.current;
    
    const isValidSwipe = Math.abs(diff) > 40 || (timeDiff < 300 && Math.abs(diff) > 20);
    
    if (isValidSwipe) {
      if (diff > 0) {
        goToNextSlide();
      } else {
        goToPrevSlide();
      }
    }
  }, [goToNextSlide, goToPrevSlide]);

  const slide = tutorialSlides[currentSlide];
  const IconComponent = slide.icon;

  return (
    <div 
      className="min-h-screen bg-background flex flex-col px-6 py-8 safe-area-top safe-area-bottom select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header with Skip */}
      <div className="flex items-center justify-between pt-4">
        <span className="text-2xl font-black uppercase tracking-tight text-gold">RYL</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onComplete}
          className="text-muted-foreground hover:text-foreground"
        >
          Überspringen
        </Button>
      </div>

      {/* Slide Indicators */}
      <div className="flex justify-center gap-2 mt-8 mb-8">
        {tutorialSlides.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === currentSlide ? "w-8 bg-gold" : "w-2 bg-muted"
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
        <p className="text-muted-foreground max-w-xs leading-relaxed">
          {slide.description}
        </p>

        {/* Step counter */}
        <div className="mt-8 text-sm text-muted-foreground">
          Schritt {currentSlide + 1} von {tutorialSlides.length}
        </div>
      </div>

      {/* Footer - Swipe hint or button */}
      <div className="pt-6 text-center">
        {isLastSlide ? (
          <Button 
            onClick={onComplete}
            className="w-full h-14 rounded-full font-medium bg-gold hover:bg-gold/90 text-black"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Los geht's
          </Button>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gold/70 animate-bounce">
            <ChevronUp className="w-6 h-6" />
            <span className="text-sm">Swipe nach oben</span>
          </div>
        )}
      </div>
    </div>
  );
}
