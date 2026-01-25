import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useCreatorReferrals } from '@/hooks/useCreatorReferrals';
import { Copy, Check, Users, Euro, Gift, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

export function ReferralCard() {
  const { referralCode, referrals, stats, loading, getReferralLink } = useCreatorReferrals();
  const [copied, setCopied] = useState(false);
  const [showReferrals, setShowReferrals] = useState(false);

  const referralLink = getReferralLink();

  const handleCopyLink = async () => {
    if (!referralLink) return;

    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Link kopiert!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Kopieren fehlgeschlagen');
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!referralCode) {
    return (
      <Card className="border-dashed border-border/50 bg-card/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
              <Gift className="w-5 h-5 text-gold" />
            </div>
            Creator Referral Programm
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            Dein Referral-Code wird nach der Freischaltung als Producer automatisch generiert.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
            <Gift className="w-5 h-5 text-gold" />
          </div>
          Creator Referral Programm
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          Lade andere Creator ein und verdiene 5% ihrer Umsätze – 12 Monate lang.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Referral Link */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Dein Einladungslink</label>
          <div className="flex gap-2">
            <div className="flex-1 bg-muted/50 rounded-lg px-4 py-2.5 text-sm font-mono truncate border border-border/50">
              {referralLink}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyLink}
              className="shrink-0 h-10 w-10"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Code: <span className="font-mono font-semibold text-foreground">{referralCode.code}</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-4 bg-muted/30 rounded-xl border border-border/30">
            <div className="text-2xl font-bold text-foreground">
              {stats.totalReferrals}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Eingeladen</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-xl border border-border/30">
            <div className="text-2xl font-bold text-gold">
              {stats.activeReferrals}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Aktiv</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-xl border border-border/30">
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(stats.totalCommissionCents)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Verdient</p>
          </div>
        </div>

        {/* Commission Breakdown */}
        {stats.totalCommissionCents > 0 && (
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-warning" />
              <span className="text-muted-foreground">
                Ausstehend: {formatCurrency(stats.pendingCommissionCents)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-muted-foreground">
                Ausgezahlt: {formatCurrency(stats.paidCommissionCents)}
              </span>
            </div>
          </div>
        )}

        {/* Referral List */}
        {referrals.length > 0 && (
          <div className="space-y-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between"
              onClick={() => setShowReferrals(!showReferrals)}
            >
              <span>Eingeladene Creator ({referrals.length})</span>
              {showReferrals ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>

            {showReferrals && (
              <div className="space-y-2">
                {referrals.map((referral) => {
                  const name = referral.referred_profile?.display_name || 
                               referral.referred_profile?.username || 
                               'Creator';
                  const initial = name.charAt(0).toUpperCase();
                  const isExpired = new Date(referral.expires_at) < new Date();

                  return (
                    <div
                      key={referral.id}
                      className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={referral.referred_profile?.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">{initial}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{name}</p>
                          <p className="text-xs text-muted-foreground">
                            Seit {new Date(referral.created_at).toLocaleDateString('de-DE')}
                          </p>
                        </div>
                      </div>
                      <Badge variant={isExpired ? 'secondary' : 'default'}>
                        {isExpired ? 'Abgelaufen' : 'Aktiv'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {referrals.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <div className="w-12 h-12 rounded-xl bg-muted/50 mx-auto mb-3 flex items-center justify-center">
              <Users className="w-6 h-6 opacity-50" />
            </div>
            <p className="font-medium">Noch keine Creator eingeladen</p>
            <p className="text-sm mt-1">Teile deinen Link und verdiene mit!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
