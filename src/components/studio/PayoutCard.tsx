import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Wallet, CheckCircle2, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStripeConnect } from '@/hooks/useStripeConnect';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function PayoutCard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    loading, 
    checkingStatus, 
    accountStatus, 
    checkAccountStatus, 
    startOnboarding 
  } = useStripeConnect();

  // Check status on mount and after onboarding return
  useEffect(() => {
    const onboardingSuccess = searchParams.get('onboarding');
    const stripeRefresh = searchParams.get('stripe_refresh');

    if (onboardingSuccess === 'success') {
      toast.success('Stripe Onboarding abgeschlossen!');
      // Clear the query param
      setSearchParams({});
    }

    if (stripeRefresh === 'true') {
      toast.info('Bitte starte das Onboarding erneut');
      setSearchParams({});
    }

    checkAccountStatus();
  }, [searchParams, setSearchParams, checkAccountStatus]);

  const getStatusDisplay = () => {
    if (!accountStatus) return null;

    switch (accountStatus.status) {
      case 'verified':
        return {
          icon: CheckCircle2,
          iconColor: 'text-green-500',
          bgColor: 'bg-green-500/10',
          label: 'Auszahlungen aktiv',
          description: 'Du kannst Zahlungen empfangen',
        };
      case 'pending':
        return {
          icon: AlertCircle,
          iconColor: 'text-amber-500',
          bgColor: 'bg-amber-500/10',
          label: 'Onboarding unvollständig',
          description: 'Bitte schließe die Verifizierung ab',
        };
      case 'restricted':
        return {
          icon: AlertCircle,
          iconColor: 'text-amber-500',
          bgColor: 'bg-amber-500/10',
          label: 'Eingeschränkt',
          description: 'Weitere Informationen erforderlich',
        };
      default:
        return null;
    }
  };

  const statusDisplay = getStatusDisplay();

  // Loading state
  if (checkingStatus && !accountStatus) {
    return (
      <div className="p-4 rounded-xl bg-card border border-border/30">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Lade Auszahlungsstatus...</p>
          </div>
        </div>
      </div>
    );
  }

  // No account yet - show activation button
  if (!accountStatus?.hasAccount) {
    return (
      <div className="p-4 rounded-xl bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-gold" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Auszahlungen aktivieren</p>
            <p className="text-xs text-muted-foreground">
              Empfange Geld für deine verkauften Produkte
            </p>
          </div>
          <Button 
            variant="premium" 
            size="sm" 
            onClick={startOnboarding}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Aktivieren
                <ExternalLink className="w-3 h-3 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Has account - show status
  return (
    <div className={cn(
      "p-4 rounded-xl border",
      accountStatus.status === 'verified' 
        ? "bg-green-500/5 border-green-500/20" 
        : "bg-amber-500/5 border-amber-500/20"
    )}>
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          statusDisplay?.bgColor
        )}>
          {statusDisplay?.icon && (
            <statusDisplay.icon className={cn("w-5 h-5", statusDisplay.iconColor)} />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{statusDisplay?.label}</p>
          <p className="text-xs text-muted-foreground">
            {statusDisplay?.description}
          </p>
        </div>
        {accountStatus.status !== 'verified' && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={startOnboarding}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Fortsetzen
                <ExternalLink className="w-3 h-3 ml-1" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
