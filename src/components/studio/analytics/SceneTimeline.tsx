import { MousePointer2, ShoppingBag, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HotspotPerformance {
  hotspotId: string;
  productId: string;
  productName: string;
  productImage: string | null;
  startTime: number;
  endTime: number;
  positionX: number;
  positionY: number;
  impressions: number;
  clicks: number;
  purchases: number;
  revenueCents: number;
  ctr: number;          // clicks / impressions
  conversionRate: number; // purchases / clicks
}

interface SceneTimelineProps {
  hotspots: HotspotPerformance[];
  videoDurationSec?: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function SceneTimeline({ hotspots, videoDurationSec }: SceneTimelineProps) {
  if (hotspots.length === 0) {
    return (
      <div className="py-6 text-center">
        <MousePointer2 className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Keine Hotspots in dieser Episode</p>
      </div>
    );
  }

  const maxEnd = videoDurationSec || Math.max(...hotspots.map(h => h.endTime), 60);
  const bestHotspot = hotspots.reduce((best, h) =>
    h.revenueCents > best.revenueCents ? h : best, hotspots[0]);

  return (
    <div className="space-y-4">
      {/* Visual Timeline Bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span>0:00</span>
          <span>{formatTime(maxEnd)}</span>
        </div>
        <div className="relative h-8 bg-muted/30 rounded-full overflow-hidden">
          {hotspots.map((h) => {
            const left = (h.startTime / maxEnd) * 100;
            const width = Math.max(((h.endTime - h.startTime) / maxEnd) * 100, 2);
            const isBest = h.hotspotId === bestHotspot.hotspotId && h.revenueCents > 0;
            return (
              <div
                key={h.hotspotId}
                className={cn(
                  "absolute top-1 bottom-1 rounded-full transition-opacity",
                  isBest ? "bg-gold/60" : "bg-primary/40",
                  h.clicks === 0 && "bg-muted-foreground/20"
                )}
                style={{ left: `${left}%`, width: `${width}%` }}
                title={`${h.productName} (${formatTime(h.startTime)} – ${formatTime(h.endTime)})`}
              />
            );
          })}
        </div>
      </div>

      {/* Per-Hotspot Cards */}
      <div className="space-y-2">
        {hotspots
          .sort((a, b) => a.startTime - b.startTime)
          .map((h) => {
            const isBest = h.hotspotId === bestHotspot.hotspotId && h.revenueCents > 0;
            return (
              <div
                key={h.hotspotId}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl",
                  isBest ? "bg-gold/5 border border-gold/20" : "bg-card/30 border border-transparent"
                )}
              >
                {/* Product thumb */}
                <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {h.productImage ? (
                    <img src={h.productImage} alt={h.productName} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium truncate">{h.productName}</p>
                    {isBest && (
                      <TrendingUp className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(h.startTime)} – {formatTime(h.endTime)}</span>
                    <span>•</span>
                    <span>{h.clicks} Klicks</span>
                    <span>•</span>
                    <span>{h.conversionRate.toFixed(1)}% Conv.</span>
                  </div>
                </div>

                {/* Revenue */}
                <div className="text-right flex-shrink-0">
                  <p className={cn(
                    "text-sm font-medium",
                    h.revenueCents > 0 ? "text-gold" : "text-muted-foreground"
                  )}>
                    {formatCurrency(h.revenueCents)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {h.purchases}× verkauft
                  </p>
                </div>
              </div>
            );
          })}
      </div>

      {/* Insight */}
      {bestHotspot.revenueCents > 0 && (
        <div className="p-3 rounded-xl bg-gold/5 border border-gold/20">
          <p className="text-xs text-gold font-medium">
            💡 Bester Moment: <strong>{bestHotspot.productName}</strong> bei {formatTime(bestHotspot.startTime)} – {formatTime(bestHotspot.endTime)} ({bestHotspot.conversionRate.toFixed(1)}% Conversion, {formatCurrency(bestHotspot.revenueCents)})
          </p>
        </div>
      )}
    </div>
  );
}
