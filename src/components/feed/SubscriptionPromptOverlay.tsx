import { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUserTier } from '@/lib/subscriptionTiers';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SubscriptionPromptOverlayProps {
  onDismiss: () => void;
}

export function SubscriptionPromptOverlay({ onDismiss }: SubscriptionPromptOverlayProps) {
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
        onDismiss();
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Fehler beim Starten des Checkouts');
    } finally {
      setIsLoading(false);
    }
  };

  if (!adFreeTier) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className={cn(
          "w-full max-w-lg mx-4 mb-8 p-6 rounded-2xl",
          "bg-card border border-border",
          "animate-slide-up"
        )}
      >
        {/* Close button */}
        <button 
          onClick={onDismiss}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-foreground/10 mb-4">
            <Sparkles className="w-6 h-6 text-foreground" />
          </div>
          <h2 className="font-black uppercase text-xl mb-2">Werbefrei weiterschauen?</h2>
          <p className="text-muted-foreground text-sm">
            Für nur €{adFreeTier.price.toFixed(2).replace('.', ',')}/Monat ohne Unterbrechungen.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button 
            onClick={handleSubscribe}
            disabled={isLoading}
            className="w-full h-12 rounded-full font-medium"
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
            onClick={onDismiss}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            Später
          </Button>
        </div>
      </div>
    </div>
  );
}
