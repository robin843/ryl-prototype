import { useState } from "react";
import { Copy, Check, Users, Gift, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserReferral } from "@/hooks/useUserReferral";
import { toast } from "sonner";

export function UserReferralCard() {
  const { referralCode, stats, credits, loading, getReferralLink } = useUserReferral();
  const [copied, setCopied] = useState(false);

  const referralLink = getReferralLink();

  const handleCopyLink = async () => {
    if (!referralLink) return;
    
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Link kopiert!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Kopieren fehlgeschlagen");
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(cents / 100);
  };

  if (loading) {
    return (
      <Card className="bg-card/50">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!referralCode) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-gold/10 to-transparent border-gold/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Gift className="w-4 h-4 text-gold" />
          Freunde einladen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Referral Link */}
        <div className="flex gap-2">
          <div className="flex-1 bg-muted/50 rounded-lg px-3 py-2 text-sm font-mono truncate">
            {referralLink}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopyLink}
            className="flex-shrink-0 border-gold/30 hover:bg-gold/10"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Reward Info */}
        <p className="text-xs text-muted-foreground">
          Du und dein Freund erhalten jeweils <span className="text-gold font-medium">€5 Guthaben</span> nach dem ersten Kauf.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <Users className="w-4 h-4 text-gold mx-auto mb-1" />
            <p className="text-lg font-semibold">{stats.totalReferrals}</p>
            <p className="text-[10px] text-muted-foreground">Eingeladen</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <TrendingUp className="w-4 h-4 text-gold mx-auto mb-1" />
            <p className="text-lg font-semibold">{stats.rewardedReferrals}</p>
            <p className="text-[10px] text-muted-foreground">Aktiv</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <Gift className="w-4 h-4 text-gold mx-auto mb-1" />
            <p className="text-lg font-semibold">{formatCurrency(stats.totalEarnedCents)}</p>
            <p className="text-[10px] text-muted-foreground">Verdient</p>
          </div>
        </div>

        {/* Current Credits */}
        {credits > 0 && (
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Dein Guthaben</span>
              <span className="text-lg font-semibold text-gold">{formatCurrency(credits)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
