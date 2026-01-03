import { useState } from 'react';
import { Check, Crown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { subscriptionTiers } from '@/lib/subscriptionTiers';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export function SubscriptionStep({ onNext, onSkip }: SubscriptionStepProps) {
  const { session } = useAuth();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const userTiers = subscriptionTiers.filter(tier => tier.type === 'user');

  const handleSubscribe = async () => {
    if (!selectedTier || !session) return;

    const tier = userTiers.find(t => t.id === selectedTier);
    if (!tier) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: tier.priceId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        // Continue to next step after opening checkout
        onNext();
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full px-6 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/20 mb-4">
          <Crown className="w-6 h-6 text-gold" />
        </div>
        <h1 className="text-headline text-2xl mb-3">Wähle dein Abo</h1>
        <p className="text-body text-muted-foreground">
          Genieße unbegrenzten Zugang zu allen Inhalten.
        </p>
      </div>

      {/* Subscription Options */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {userTiers.map(tier => (
          <button
            key={tier.id}
            onClick={() => setSelectedTier(tier.id)}
            className={cn(
              "relative w-full p-4 rounded-2xl border-2 text-left transition-all",
              selectedTier === tier.id
                ? "bg-gold/10 border-gold"
                : "bg-card border-border hover:border-muted-foreground/50",
              tier.popular && "ring-2 ring-gold/30"
            )}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-4 px-3 py-1 rounded-full bg-gold text-primary-foreground text-xs font-medium">
                Beliebt
              </div>
            )}
            
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-foreground">{tier.name.replace('User ', '')}</h3>
                <p className="text-sm text-muted-foreground mt-1">{tier.description}</p>
                
                <ul className="mt-3 space-y-1.5">
                  {tier.features.slice(0, 3).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="text-right ml-4">
                <div className="text-xl font-semibold text-foreground">
                  €{tier.price.toFixed(2).replace('.', ',')}
                </div>
                <div className="text-xs text-muted-foreground">/Monat</div>
              </div>
            </div>

            {selectedTier === tier.id && (
              <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-6 space-y-3">
        <Button 
          onClick={handleSubscribe}
          disabled={!selectedTier || isLoading}
          className="w-full h-14 rounded-full bg-gold hover:bg-gold/90 text-primary-foreground font-medium"
        >
          {isLoading ? 'Wird geladen...' : 'Jetzt abonnieren'}
        </Button>
        <Button 
          variant="ghost" 
          onClick={onSkip}
          className="w-full text-muted-foreground hover:text-foreground"
        >
          Später entscheiden
        </Button>
      </div>
    </div>
  );
}
