import { Bell, TrendingDown, TrendingUp } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { calculatePriceChange, usePriceAlert } from "@/hooks/usePriceAlert";

interface PriceAlertBadgeProps {
  productId: string;
  currentPriceCents: number;
  savedPriceCents?: number | null;
  priceAlertEnabled?: boolean;
  showToggle?: boolean;
}

export function PriceAlertBadge({
  productId,
  currentPriceCents,
  savedPriceCents,
  priceAlertEnabled = true,
  showToggle = false,
}: PriceAlertBadgeProps) {
  const { togglePriceAlert, isUpdating } = usePriceAlert();
  const priceChange = calculatePriceChange(currentPriceCents, savedPriceCents);

  if (!priceChange.hasChanged && !showToggle) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {priceChange.hasChanged && (
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
            priceChange.direction === "down"
              ? "bg-green-500/20 text-green-500"
              : "bg-red-500/20 text-red-500"
          }`}
        >
          {priceChange.direction === "down" ? (
            <TrendingDown className="w-3 h-3" />
          ) : (
            <TrendingUp className="w-3 h-3" />
          )}
          {priceChange.percentChange}%
        </div>
      )}

      {showToggle && (
        <div className="flex items-center gap-1.5">
          <Bell className={`w-3.5 h-3.5 ${priceAlertEnabled ? "text-gold" : "text-muted-foreground"}`} />
          <Switch
            checked={priceAlertEnabled}
            onCheckedChange={(checked) => togglePriceAlert(productId, checked)}
            disabled={isUpdating}
            className="scale-75"
          />
        </div>
      )}
    </div>
  );
}
