import { CheckCircle2, AlertCircle, XCircle, Loader2, ExternalLink, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStripeConnect } from '@/hooks/useStripeConnect';
import { cn } from '@/lib/utils';

type StripeStatus = 'not_connected' | 'pending' | 'active';

function getStatusFromAccountStatus(accountStatus: ReturnType<typeof useStripeConnect>['accountStatus']): StripeStatus {
  if (!accountStatus?.hasAccount) return 'not_connected';
  if (accountStatus.status === 'verified' && accountStatus.payoutsEnabled && accountStatus.chargesEnabled) {
    return 'active';
  }
  return 'pending';
}

interface StripeStatusCardProps {
  accountStatus: ReturnType<typeof useStripeConnect>['accountStatus'];
  checkingStatus: boolean;
  loading: boolean;
  onStartOnboarding: () => void;
}

export function StripeStatusCard({ 
  accountStatus, 
  checkingStatus, 
  loading, 
  onStartOnboarding 
}: StripeStatusCardProps) {
  const status = getStatusFromAccountStatus(accountStatus);

  // Loading state
  if (checkingStatus && !accountStatus) {
    return (
      <div className="p-4 rounded-xl bg-card border border-border/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Lade Stripe-Status...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'not_connected') {
    return (
      <div className="p-5 rounded-xl bg-gradient-to-r from-destructive/10 to-destructive/5 border border-destructive/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
            <XCircle className="w-6 h-6 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-medium text-destructive">Stripe nicht verbunden</p>
            <p className="text-sm text-muted-foreground mt-1">
              Verbinde dein Stripe-Konto, um Produkte verkaufen und Auszahlungen erhalten zu können.
            </p>
            <Button 
              variant="premium" 
              size="sm" 
              className="mt-3"
              onClick={onStartOnboarding}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Stripe verbinden
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    const missingItems = [];
    if (!accountStatus?.chargesEnabled) missingItems.push('Zahlungen');
    if (!accountStatus?.payoutsEnabled) missingItems.push('Auszahlungen');

    return (
      <div className="p-5 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-medium text-amber-500">Onboarding unvollständig</p>
            <p className="text-sm text-muted-foreground mt-1">
              {missingItems.length > 0 
                ? `Noch nicht aktiviert: ${missingItems.join(', ')}. Bitte vervollständige dein Stripe-Profil.`
                : 'Dein Stripe-Konto wird noch von Stripe geprüft. Dies kann einige Minuten dauern.'}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-amber-500/30 hover:bg-amber-500/10"
                onClick={onStartOnboarding}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Onboarding fortsetzen
                    <ExternalLink className="w-3 h-3 ml-2" />
                  </>
                )}
              </Button>
              <a 
                href="https://dashboard.stripe.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-amber-500 hover:text-amber-400 px-3 py-2 rounded-md border border-amber-500/20 hover:bg-amber-500/5 transition-colors"
              >
                Stripe Dashboard
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Probleme? <a href="mailto:support@ryl.app" className="text-amber-500 hover:underline">Support kontaktieren</a>
            </p>
          </div>
        </div>
      </div>
    );
  }
  // Active status
  return (
    <div className="p-5 rounded-xl bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/20">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-6 h-6 text-green-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-medium text-green-500">Auszahlungen aktiv</p>
          <p className="text-sm text-muted-foreground mt-1">
            Du kannst Produkte verkaufen. Stripe überweist dir deine Einnahmen automatisch.
          </p>
          <a 
            href="https://dashboard.stripe.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-green-500 hover:text-green-400 mt-2 transition-colors"
          >
            Stripe Dashboard öffnen
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

// Export the status helper for use in other components
export { getStatusFromAccountStatus };
export type { StripeStatus };
