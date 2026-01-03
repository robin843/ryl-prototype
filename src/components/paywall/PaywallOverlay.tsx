import { Lock, Play, Crown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaywallOverlayProps {
  episodeTitle: string;
  seriesTitle: string;
  thumbnailUrl: string;
  onSubscribe?: () => void;
  onLogin?: () => void;
  isLoggedIn?: boolean;
}

const PaywallOverlay = ({
  episodeTitle,
  seriesTitle,
  thumbnailUrl,
  onSubscribe,
  onLogin,
  isLoggedIn = false,
}: PaywallOverlayProps) => {
  const features = [
    "Unbegrenzter Zugang zu allen Episoden",
    "Exklusive Premium-Inhalte",
    "Keine Werbung",
    "Offline verfügbar",
  ];

  return (
    <div className="relative w-full h-full min-h-screen">
      {/* Background with blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${thumbnailUrl})` }}
      />
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        {/* Lock Icon */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-6 animate-scale-in">
          <Lock className="w-10 h-10 text-black" />
        </div>

        {/* Episode Info */}
        <div className="text-center mb-8 animate-fade-in">
          <p className="text-white/60 text-sm uppercase tracking-wider mb-2">
            Premium Episode
          </p>
          <h2 className="text-2xl font-bold text-white mb-1">
            {episodeTitle}
          </h2>
          <p className="text-white/70">
            {seriesTitle}
          </p>
        </div>

        {/* Subscription Card */}
        <div className="w-full max-w-sm bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 animate-fade-in">
          {/* Price Header */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-amber-400" />
            <span className="text-amber-400 font-semibold">Premium Abo</span>
          </div>
          
          <div className="text-center mb-6">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-white">4,99€</span>
              <span className="text-white/60">/Monat</span>
            </div>
            <p className="text-white/50 text-sm mt-1">
              Jederzeit kündbar
            </p>
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-6">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3 text-white/80">
                <div className="w-5 h-5 rounded-full bg-amber-400/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-amber-400" />
                </div>
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={onSubscribe}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold py-6 rounded-xl transition-all hover:scale-[1.02]"
            >
              <Play className="w-5 h-5 mr-2" />
              Jetzt abonnieren
            </Button>
            
            {!isLoggedIn && (
              <Button
                variant="ghost"
                onClick={onLogin}
                className="w-full text-white/70 hover:text-white hover:bg-white/10"
              >
                Bereits Mitglied? Einloggen
              </Button>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-white/40 text-xs text-center mt-6 max-w-xs">
          Die erste Episode jeder Serie ist immer kostenlos verfügbar.
        </p>
      </div>
    </div>
  );
};

export default PaywallOverlay;
