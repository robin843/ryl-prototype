import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ChevronRight, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  REVENUE_TIERS,
  getTierByName,
  getProgressToNextTier,
  formatCurrency,
  RevenueTier,
} from "@/lib/revenueTiers";
import { cn } from "@/lib/utils";

export function TierProgressCard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [tierData, setTierData] = useState<{
    currentTier: RevenueTier;
    totalSalesCents: number;
  } | null>(null);

  useEffect(() => {
    async function fetchTierData() {
      if (!user) return;

      setIsLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("revenue_tier, total_sales_cents")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setTierData({
          currentTier: (data.revenue_tier as RevenueTier) || "starter",
          totalSalesCents: data.total_sales_cents || 0,
        });
      }

      setIsLoading(false);
    }

    fetchTierData();
  }, [user]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue Tier
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center text-muted-foreground">
            Lade Tier-Daten...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tierData) {
    return null;
  }

  const { currentTier, totalSalesCents } = tierData;
  const currentTierConfig = getTierByName(currentTier);
  const progress = getProgressToNextTier(totalSalesCents);

  const isMaxTier = progress.nextTier === null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue Tier
          </CardTitle>
          <Badge
            variant="outline"
            className={cn(
              "text-lg px-3 py-1",
              currentTierConfig.color
            )}
          >
            {currentTierConfig.badge} {currentTierConfig.name}
          </Badge>
        </div>
        <CardDescription>
          Je mehr du verkaufst, desto mehr behältst du
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Share Display */}
        <div className="flex items-center justify-center gap-4 p-4 bg-primary/5 rounded-xl">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary">
              {currentTierConfig.creatorSharePercent}%
            </div>
            <div className="text-sm text-muted-foreground">Dein Anteil</div>
          </div>
          <div className="h-12 w-px bg-border" />
          <div className="text-center">
            <div className="text-2xl font-semibold text-muted-foreground">
              {currentTierConfig.platformFeePercent}%
            </div>
            <div className="text-sm text-muted-foreground">Platform</div>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {!isMaxTier && progress.nextTier && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Fortschritt zu {progress.nextTier.badge} {progress.nextTier.name}
              </span>
              <span className="font-medium">
                {progress.progressPercent}%
              </span>
            </div>
            <Progress value={progress.progressPercent} className="h-3" />
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {formatCurrency(totalSalesCents)} Umsatz
              </span>
              <span className="text-muted-foreground">
                Noch {formatCurrency(progress.remainingCents)} bis zum Upgrade
              </span>
            </div>

            {/* Next Tier Benefit */}
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm">
              <ChevronRight className="h-4 w-4 text-primary" />
              <span>
                Im nächsten Tier behältst du{" "}
                <span className="font-bold text-primary">
                  {progress.nextTier.creatorSharePercent}%
                </span>{" "}
                statt {currentTierConfig.creatorSharePercent}%
              </span>
            </div>
          </div>
        )}

        {/* Max Tier Celebration */}
        {isMaxTier && (
          <div className="text-center p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
            <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="font-semibold text-lg">Du bist Elite!</div>
            <div className="text-sm text-muted-foreground">
              Maximaler Umsatzanteil von {currentTierConfig.creatorSharePercent}% erreicht
            </div>
          </div>
        )}

        {/* All Tiers Overview */}
        <div className="pt-4 border-t">
          <div className="text-sm font-medium mb-3">Alle Stufen</div>
          <div className="grid grid-cols-4 gap-2">
            {REVENUE_TIERS.map((tier) => {
              const isCurrentTier = tier.id === currentTier;
              const isUnlocked = totalSalesCents >= tier.minCents;

              return (
                <div
                  key={tier.id}
                  className={cn(
                    "text-center p-2 rounded-lg transition-all",
                    isCurrentTier
                      ? "bg-primary/10 ring-2 ring-primary"
                      : isUnlocked
                      ? "bg-muted"
                      : "bg-muted/30 opacity-50"
                  )}
                >
                  <div className="text-lg">{tier.badge}</div>
                  <div className="text-xs font-medium">{tier.name}</div>
                  <div className={cn("text-sm font-bold", tier.color)}>
                    {tier.creatorSharePercent}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
