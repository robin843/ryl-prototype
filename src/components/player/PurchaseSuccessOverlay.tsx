import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, ShoppingBag, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PurchaseContext } from '@/hooks/usePurchaseContext';

interface PurchaseSuccessOverlayProps {
  context: PurchaseContext | null;
  onComplete: () => void;
  countdown: number;
}

// Confetti particle component
function ConfettiParticle({ delay, x }: { delay: number; x: number }) {
  const colors = ['bg-gold', 'bg-gold/70', 'bg-white', 'bg-gold/50'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = Math.random() > 0.5 ? 'w-2 h-2' : 'w-3 h-3';
  const rotation = Math.random() * 360;
  
  return (
    <div
      className={cn(
        'absolute rounded-sm',
        size,
        color
      )}
      style={{
        left: `${x}%`,
        top: '-10px',
        transform: `rotate(${rotation}deg)`,
        animation: `confetti-fall 2.5s ease-out ${delay}s forwards`,
      }}
    />
  );
}

export function PurchaseSuccessOverlay({ 
  context, 
  onComplete,
  countdown 
}: PurchaseSuccessOverlayProps) {
  const [particles, setParticles] = useState<Array<{ id: number; delay: number; x: number }>>([]);
  const [showContent, setShowContent] = useState(false);

  // Generate confetti particles on mount
  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      delay: Math.random() * 0.8,
      x: Math.random() * 100,
    }));
    setParticles(newParticles);
    
    // Show content after initial burst
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const episodeContext = context?.episodeNumber && context?.seriesTitle
    ? `Gesehen in ${context.seriesTitle}, Episode ${context.episodeNumber}`
    : context?.seriesTitle 
      ? `Gesehen in ${context.seriesTitle}`
      : null;

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center overflow-hidden">
      {/* Confetti container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <ConfettiParticle key={p.id} delay={p.delay} x={p.x} />
        ))}
      </div>

      {/* Glow effect behind card */}
      <div className="absolute w-64 h-64 bg-gold/20 rounded-full blur-[100px] animate-pulse" />

      {/* Main content */}
      <div 
        className={cn(
          "relative z-10 max-w-sm w-full mx-4 text-center transition-all duration-500",
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}
      >
        {/* Success icon with sparkle */}
        <div className="relative inline-flex mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center border-2 border-gold/50 shadow-[0_0_40px_rgba(234,179,8,0.3)]">
            <CheckCircle className="w-12 h-12 text-gold" />
          </div>
          <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-gold animate-pulse" />
        </div>

        {/* Headline */}
        <h1 className="text-3xl font-black uppercase tracking-tight text-foreground mb-2">
          Gekauft!
        </h1>

        {/* Product card */}
        {context && (
          <div className="mt-6 p-4 rounded-2xl bg-card/80 border border-border/50 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              {/* Product image */}
              <div className="w-20 h-20 rounded-xl bg-muted/50 flex-shrink-0 overflow-hidden border border-gold/20">
                {context.productImage ? (
                  <img 
                    src={context.productImage} 
                    alt={context.productName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-gold/50" />
                  </div>
                )}
              </div>

              {/* Product info */}
              <div className="flex-1 text-left min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {context.productName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {context.brandName}
                </p>
                <p className="text-sm font-medium text-gold mt-1">
                  {context.priceDisplay}
                </p>
              </div>
            </div>

            {/* Episode context */}
            {episodeContext && (
              <div className="mt-3 pt-3 border-t border-border/30">
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-gold" />
                  {episodeContext}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Countdown */}
        <div className="mt-8">
          <p className="text-sm text-muted-foreground mb-3">
            Weiter geht's in {countdown}...
          </p>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-gold to-gold/70 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${((3 - countdown) / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Tap to continue */}
        <button
          onClick={onComplete}
          className="mt-6 w-full py-4 text-sm text-muted-foreground hover:text-gold transition-colors"
        >
          Tippe, um sofort weiterzuschauen
        </button>

        {/* Email confirmation */}
        <p className="text-xs text-muted-foreground/50 mt-4">
          Du erhältst eine Bestätigung per E-Mail.
        </p>
      </div>

      {/* CSS for confetti animation */}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
