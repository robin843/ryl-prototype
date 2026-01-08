import { useState } from 'react';
import { Check, Sparkles, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUserTier } from '@/lib/subscriptionTiers';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SubscriptionStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export function SubscriptionStep({ onNext, onSkip }: SubscriptionStepProps) {
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const adFreeTier = getUserTier();

  const handleSubscribe = async () => {
    if (!adFreeTier || !session) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: adFreeTier.priceId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        onNext();
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Fehler beim Starten des Checkouts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueFree = () => {
    onSkip();
  };

  return (
    <div className="flex flex-col h-full px-6 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-4">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-headline text-2xl mb-3">Werbefrei schauen?</h1>
        <p className="text-body text-muted-foreground">
          Ryl ist kostenlos. Für nur €{adFreeTier?.price.toFixed(2).replace('.', ',')}/Monat ohne Unterbrechungen.
        </p>
      </div>

      {/* Options */}
      <div className="flex-1 space-y-4">
        {/* Free Option */}
        <div className="p-4 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Zap className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-medium">Kostenlos mit Werbung</h3>
              <p className="text-sm text-muted-foreground">Immer gratis</p>
            </div>
          </div>
          <ul className="space-y-2 ml-13">
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-primary flex-shrink-0" />
              Alle Serien & Episoden
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-primary flex-shrink-0" />
              Unbegrenzte Wiedergabezeit
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              Werbung vor und während Videos
            </li>
          </ul>
        </div>

        {/* Ad-Free Option */}
        {adFreeTier && (
          <div className="p-4 rounded-2xl border-2 border-primary bg-primary/5 relative">
            <div className="absolute -top-3 left-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
              Empfohlen
            </div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{adFreeTier.name}</h3>
                  <p className="text-sm text-muted-foreground">{adFreeTier.description}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold">
                  €{adFreeTier.price.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-sm text-muted-foreground">/Mo</span>
              </div>
            </div>
            <ul className="space-y-2 ml-13">
              {adFreeTier.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-6 space-y-3">
        <Button 
          onClick={handleSubscribe}
          disabled={isLoading || !adFreeTier}
          variant="premium"
          className="w-full h-14 rounded-full font-medium"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          Werbefrei upgraden
        </Button>
        <Button 
          variant="ghost" 
          onClick={handleContinueFree}
          className="w-full text-muted-foreground hover:text-foreground"
        >
          Kostenlos mit Werbung weiter
        </Button>
      </div>
    </div>
  );
}
