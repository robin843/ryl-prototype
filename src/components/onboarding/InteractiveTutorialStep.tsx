import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Check, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveTutorialStepProps {
  onComplete: () => void;
}

// Demo-Hotspot Daten (lokal, kein DB-Eintrag nötig)
const TUTORIAL_HOTSPOT = {
  id: 'tutorial-demo',
  position: { x: 65, y: 45 },
  productName: 'Premium Sneaker',
  brandName: 'Nike',
  thumbnailUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
  priceDisplay: '99,00 €',
};

type TutorialPhase = 'intro' | 'hotspot-visible' | 'product-shown' | 'complete';

// Gold-styled Hotspot for tutorial
function GoldHotspot({ position, onClick, isActive }: { position: { x: number; y: number }; onClick: () => void; isActive: boolean }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "absolute z-20 group",
        "w-14 h-14",
        "flex items-center justify-center",
        "transition-all duration-300",
        "animate-fade-in"
      )}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* Gold ripple rings */}
      {isActive && (
        <>
          <span className="absolute inset-0 rounded-full border border-[hsl(var(--gold)/0.5)] animate-[gold-ripple_2s_ease-out_infinite]" />
          <span className="absolute inset-0 rounded-full border border-[hsl(var(--gold)/0.4)] animate-[gold-ripple_2s_ease-out_infinite_0.6s]" />
          <span className="absolute inset-0 rounded-full border border-[hsl(var(--gold)/0.3)] animate-[gold-ripple_2s_ease-out_infinite_1.2s]" />
        </>
      )}
      
      {/* Core gold orb */}
      <span className={cn(
        "relative w-5 h-5 rounded-full",
        "bg-gradient-to-br from-[hsl(var(--gold-glow))] via-[hsl(var(--gold))] to-[hsl(var(--gold-muted))]",
        "shadow-[0_0_20px_hsl(var(--gold)/0.5),0_0_40px_hsl(var(--gold)/0.3)]",
        "group-hover:scale-125",
        "group-hover:shadow-[0_0_30px_hsl(var(--gold)/0.7),0_0_60px_hsl(var(--gold)/0.4)]",
        "transition-all duration-300"
      )}>
        {/* Inner shimmer */}
        <span className="absolute inset-0.5 rounded-full bg-gradient-to-br from-white/60 to-transparent" />
      </span>
    </button>
  );
}

export function InteractiveTutorialStep({ onComplete }: InteractiveTutorialStepProps) {
  const [phase, setPhase] = useState<TutorialPhase>('intro');

  // Auto-advance from intro to hotspot-visible after 1.5s
  useEffect(() => {
    if (phase === 'intro') {
      const timer = setTimeout(() => setPhase('hotspot-visible'), 1500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Auto-advance from product-shown to complete after 1.5s
  useEffect(() => {
    if (phase === 'product-shown') {
      const timer = setTimeout(() => setPhase('complete'), 1500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const handleHotspotClick = () => {
    if (phase === 'hotspot-visible') {
      setPhase('product-shown');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Video-Area mit simuliertem Content */}
      <div className="flex-1 relative overflow-hidden">
        {/* Animated gradient background (simulating video) */}
        <div className="absolute inset-0 bg-gradient-to-br from-muted via-background to-secondary" />
        
        {/* Fashion/lifestyle image overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=1200&fit=crop)',
          }}
        />
        
        {/* Dark gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

        {/* Gold Hotspot - appears after intro phase */}
        {(phase === 'hotspot-visible' || phase === 'product-shown') && (
          <GoldHotspot
            position={TUTORIAL_HOTSPOT.position}
            onClick={handleHotspotClick}
            isActive={phase === 'hotspot-visible'}
          />
        )}

        {/* Hint overlay - only in hotspot-visible phase */}
        {phase === 'hotspot-visible' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="animate-slide-up bg-background/95 backdrop-blur-sm rounded-full px-6 py-3 border border-[hsl(var(--gold)/0.4)] shadow-[0_0_20px_hsl(var(--gold)/0.2)]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[hsl(var(--gold))]" />
                <span className="text-sm font-medium text-foreground">Tippe auf den leuchtenden Punkt</span>
                <div className="w-3 h-3 rounded-full bg-[hsl(var(--gold))] gold-instability-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Mini Product Panel - appears after hotspot click */}
        {(phase === 'product-shown' || phase === 'complete') && (
          <div className="absolute bottom-20 left-4 right-4 animate-slide-up">
            <div className="glass-panel rounded-xl p-4 border border-[hsl(var(--gold)/0.3)] shadow-[0_0_30px_hsl(var(--gold)/0.15)]">
              <div className="flex gap-3">
                {/* Product image */}
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted ring-2 ring-[hsl(var(--gold)/0.3)]">
                  <img 
                    src={TUTORIAL_HOTSPOT.thumbnailUrl} 
                    alt={TUTORIAL_HOTSPOT.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Product info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[hsl(var(--gold))]">{TUTORIAL_HOTSPOT.brandName}</p>
                  <p className="text-sm font-medium text-foreground truncate">{TUTORIAL_HOTSPOT.productName}</p>
                  <p className="text-sm font-semibold text-foreground mt-1">{TUTORIAL_HOTSPOT.priceDisplay}</p>
                </div>
                
                {/* Shop icon with gold accent */}
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--gold-glow))] via-[hsl(var(--gold))] to-[hsl(var(--gold-muted))] flex items-center justify-center shadow-[0_0_15px_hsl(var(--gold)/0.4)]">
                    <ShoppingBag className="w-5 h-5 text-background" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success message - only in complete phase */}
        {phase === 'complete' && (
          <div className="absolute top-1/3 left-4 right-4 animate-scale-in">
            <div className="bg-gradient-to-br from-[hsl(var(--gold))] via-[hsl(var(--gold))] to-[hsl(var(--gold-muted))] rounded-xl p-4 text-center shadow-[0_0_40px_hsl(var(--gold)/0.4)]">
              <div className="w-12 h-12 rounded-full bg-background/20 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-background" />
              </div>
              <p className="text-lg font-semibold text-background">So findest du Produkte!</p>
              <p className="text-sm text-background/80 mt-1">Tippe auf Hotspots, um direkt zu shoppen</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA - only in complete phase */}
      <div className={cn(
        "px-6 pb-6 pt-4 transition-opacity duration-300",
        phase === 'complete' ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}>
        <Button 
          onClick={onComplete}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-[hsl(var(--gold-glow))] via-[hsl(var(--gold))] to-[hsl(var(--gold-muted))] text-background hover:shadow-[0_0_30px_hsl(var(--gold)/0.5)] transition-shadow"
          size="lg"
        >
          Weiter zum Feed
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
