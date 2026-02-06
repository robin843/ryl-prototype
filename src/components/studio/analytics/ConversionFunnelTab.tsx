import { Skeleton } from "@/components/ui/skeleton";
import { Filter, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { ConversionFunnelData, FunnelStep, EpisodeFunnel } from "@/hooks/useConversionFunnel";

interface ConversionFunnelTabProps {
  data: ConversionFunnelData;
}

const FUNNEL_COLORS = [
  "bg-gold",
  "bg-gold/80",
  "bg-gold/60",
  "bg-gold/40",
  "bg-gold/25",
];

function FunnelBar({ steps }: { steps: FunnelStep[] }) {
  if (steps.length === 0) return null;
  const maxCount = steps[0].count || 1;

  return (
    <div className="space-y-2">
      {steps.map((step, i) => {
        const widthPercent = maxCount > 0 ? Math.max((step.count / maxCount) * 100, 4) : 4;
        return (
          <div key={step.label} className="flex items-center gap-3">
            <div className="w-[110px] text-xs text-muted-foreground text-right shrink-0 truncate">
              {step.label}
            </div>
            <div className="flex-1 relative">
              <div
                className={cn("h-7 rounded-md flex items-center px-2 transition-all", FUNNEL_COLORS[i] || "bg-muted")}
                style={{ width: `${widthPercent}%` }}
              >
                <span className="text-xs font-semibold text-primary-foreground whitespace-nowrap">
                  {step.count.toLocaleString('de-DE')}
                </span>
              </div>
            </div>
            <div className="w-14 text-right shrink-0">
              <span className={cn(
                "text-xs font-medium",
                i === 0 ? "text-muted-foreground" : step.rate >= 50 ? "text-gold" : "text-muted-foreground"
              )}>
                {i === 0 ? '—' : `${step.rate.toFixed(1)}%`}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EpisodeAccordion({ episode }: { episode: EpisodeFunnel }) {
  const [open, setOpen] = useState(false);
  const totalDropoff = episode.steps.length >= 2 && episode.steps[0].count > 0
    ? ((1 - (episode.steps[episode.steps.length - 1].count / episode.steps[0].count)) * 100)
    : 0;

  return (
    <div className="border border-border/30 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-card/50 transition-colors"
      >
        <div className="text-left">
          <p className="text-sm font-medium truncate max-w-[200px]">{episode.episodeTitle}</p>
          <p className="text-xs text-muted-foreground">
            {episode.steps[0]?.count || 0} Views • {totalDropoff.toFixed(0)}% Drop-off
          </p>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="px-4 pb-4">
          <FunnelBar steps={episode.steps} />
        </div>
      )}
    </div>
  );
}

export function ConversionFunnelTab({ data }: ConversionFunnelTabProps) {
  if (data.isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (data.overall.length === 0 || data.overall[0].count === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <Filter className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-lg font-medium mb-2">Keine Funnel-Daten</p>
        <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
          Sobald Zuschauer deine Hotspots sehen und klicken, erscheint hier der Conversion-Funnel.
        </p>
      </div>
    );
  }

  const totalConversion = data.overall[0].count > 0 && data.overall.length >= 5
    ? (data.overall[4].count / data.overall[0].count) * 100
    : 0;

  // Find biggest drop-off
  let biggestDrop = { from: '', to: '', drop: 0 };
  for (let i = 1; i < data.overall.length; i++) {
    const drop = 100 - data.overall[i].rate;
    if (drop > biggestDrop.drop) {
      biggestDrop = { from: data.overall[i - 1].label, to: data.overall[i].label, drop };
    }
  }

  return (
    <div className="space-y-0">
      {/* KPI Summary */}
      <div className="px-6 py-6 border-b border-border/30">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gold">{totalConversion.toFixed(2)}%</p>
            <p className="text-xs text-muted-foreground">Gesamt-Conversion</p>
            <p className="text-[10px] text-muted-foreground/60">View → Checkout</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{biggestDrop.drop.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Größter Drop-off</p>
            <p className="text-[10px] text-muted-foreground/60 truncate">
              {biggestDrop.from} → {biggestDrop.to}
            </p>
          </div>
        </div>
      </div>

      {/* Overall Funnel */}
      <div className="px-6 py-6 border-b border-border/30">
        <h2 className="text-sm font-medium text-muted-foreground mb-4">Gesamt-Funnel</h2>
        <FunnelBar steps={data.overall} />
      </div>

      {/* Per-Episode Funnels */}
      {data.episodes.length > 0 && (
        <div className="px-6 py-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Top-Episoden</h2>
          <div className="space-y-3">
            {data.episodes.map(ep => (
              <EpisodeAccordion key={ep.episodeId} episode={ep} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
