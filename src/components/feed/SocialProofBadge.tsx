import { ShoppingBag, TrendingUp, Flame } from "lucide-react";

interface SocialProofBadgeProps {
  purchasesToday?: number;
  savesCount?: number;
  isTrending?: boolean;
}

export function SocialProofBadge({
  purchasesToday = 0,
  savesCount = 0,
  isTrending = false,
}: SocialProofBadgeProps) {
  // Show badge if there are significant interactions
  if (purchasesToday < 5 && savesCount < 10 && !isTrending) {
    return null;
  }

  // Priority: Trending > Purchases > Saves
  if (isTrending) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-500 text-xs font-medium">
        <Flame className="w-3.5 h-3.5" />
        <span>Trending</span>
      </div>
    );
  }

  if (purchasesToday >= 5) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/20 text-green-500 text-xs font-medium">
        <ShoppingBag className="w-3.5 h-3.5" />
        <span>{purchasesToday}+ Käufe heute</span>
      </div>
    );
  }

  if (savesCount >= 10) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold/20 text-gold text-xs font-medium">
        <TrendingUp className="w-3.5 h-3.5" />
        <span>{savesCount}+ gespeichert</span>
      </div>
    );
  }

  return null;
}
