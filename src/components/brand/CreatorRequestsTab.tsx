import { useState } from 'react';
import { Check, Clock, Loader2, Percent, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useBrandCreatorRequests } from '@/hooks/useCreatorPartnerships';

interface CreatorRequestsTabProps {
  brandId: string | undefined;
}

export function CreatorRequestsTab({ brandId }: CreatorRequestsTabProps) {
  const {
    pendingRequests,
    activePartnerships,
    isLoading,
    acceptRequest,
    rejectRequest,
  } = useBrandCreatorRequests(brandId);

  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [commissionRate, setCommissionRate] = useState('10');

  const handleAccept = () => {
    if (!acceptingId) return;
    acceptRequest.mutate(
      {
        partnershipId: acceptingId,
        commissionRate: Number(commissionRate),
      },
      {
        onSettled: () => setAcceptingId(null),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      <Card className="border-gold/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-gold" />
            Offene Anfragen
            {pendingRequests.length > 0 && (
              <Badge className="ml-2 bg-gold/20 text-gold border-gold/30">
                {pendingRequests.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Keine offenen Anfragen
            </p>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={request.creator_profile?.avatar_url ?? undefined} />
                    <AvatarFallback>
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {request.creator_profile?.display_name ||
                        request.creator_profile?.username ||
                        'Creator'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(request.created_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => rejectRequest.mutate(request.id)}
                      disabled={rejectRequest.isPending}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="premium"
                      size="sm"
                      className="h-8"
                      onClick={() => setAcceptingId(request.id)}
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Annehmen
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Partnerships */}
      <Card className="border-gold/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Check className="w-4 h-4 text-gold" />
            Aktive Partnerschaften
            <Badge className="ml-2 bg-gold/20 text-gold border-gold/30">
              {activePartnerships.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activePartnerships.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Noch keine aktiven Partnerschaften
            </p>
          ) : (
            <div className="space-y-3">
              {activePartnerships.map((partnership) => (
                <div
                  key={partnership.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gold/5 border border-gold/20"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={partnership.creator_profile?.avatar_url ?? undefined} />
                    <AvatarFallback>
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {partnership.creator_profile?.display_name ||
                        partnership.creator_profile?.username ||
                        'Creator'}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{partnership.total_clicks ?? 0} Klicks</span>
                      <span>{partnership.total_conversions ?? 0} Sales</span>
                      <span>
                        €{((partnership.total_revenue_cents ?? 0) / 100).toFixed(0)} Umsatz
                      </span>
                    </div>
                  </div>

                  <Badge variant="outline" className="border-gold/30 text-gold">
                    <Percent className="w-3 h-3 mr-1" />
                    {partnership.commission_rate_percent ?? 10}%
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accept Dialog */}
      <Dialog open={!!acceptingId} onOpenChange={(open) => !open && setAcceptingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Partnerschaft aktivieren</DialogTitle>
            <DialogDescription>
              Lege die Provisionsrate für diesen Creator fest. Diese kann später angepasst werden.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label className="text-sm font-medium text-muted-foreground block mb-2">
              Provisionsrate (%)
            </label>
            <div className="relative">
              <Input
                type="number"
                min="0"
                max="50"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                className="pr-8"
              />
              <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Der Creator erhält {commissionRate}% Provision auf alle Sales über deine Produkte.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAcceptingId(null)}>
              Abbrechen
            </Button>
            <Button
              variant="premium"
              onClick={handleAccept}
              disabled={acceptRequest.isPending}
            >
              {acceptRequest.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Partnerschaft aktivieren'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
