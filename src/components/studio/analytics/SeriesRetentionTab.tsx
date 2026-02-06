import { Zap, Timer, TrendingUp, Eye, Play, ChevronDown, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { SeriesRetentionResult, SeriesRetentionData, SeriesRetentionEpisode } from "@/hooks/useSeriesRetention";
import { useState } from "react";

interface SeriesRetentionTabProps {
  data: SeriesRetentionResult;
}

function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  subtitle, 
  accent = false 
}: { 
  icon: React.ElementType;
  label: string;
  value: string;
  subtitle?: string;
  accent?: boolean;
}) {
  return (
    <div className={cn(
      "p-4 rounded-xl border",
      accent ? "bg-gold/5 border-gold/20" : "bg-card/30 border-border/30"
    )}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("w-4 h-4", accent ? "text-gold" : "text-muted-foreground")} />
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <p className={cn("text-2xl font-bold", accent && "text-gold")}>{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
  );
}

function EpisodeRetentionRow({ episode, isFirst }: { episode: SeriesRetentionEpisode; isFirst: boolean }) {
  const hookColor = episode.hookRate >= 70 ? "text-green-400" : episode.hookRate >= 40 ? "text-gold" : "text-destructive";
  const cliffColor = episode.cliffhangerScore >= 70 ? "text-green-400" : episode.cliffhangerScore >= 40 ? "text-gold" : "text-destructive";
  
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/20 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-muted-foreground">E{episode.episodeNumber}</span>
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{episode.title}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
          <span>{episode.totalViews} Views</span>
          <span>•</span>
          <span>{episode.completions} Abschlüsse</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4 flex-shrink-0 text-right">
        <div>
          <p className={cn("text-sm font-bold", hookColor)}>{episode.hookRate}%</p>
          <p className="text-[10px] text-muted-foreground">Hook</p>
        </div>
        <div>
          <p className={cn("text-sm font-bold", cliffColor)}>{episode.cliffhangerScore}%</p>
          <p className="text-[10px] text-muted-foreground">Cliff.</p>
        </div>
        {!isFirst && episode.bingeVelocityMin > 0 && (
          <div>
            <p className="text-sm font-bold">{episode.bingeVelocityMin}m</p>
            <p className="text-[10px] text-muted-foreground">Binge</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SeriesCard({ series }: { series: SeriesRetentionData }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border/30 rounded-xl overflow-hidden">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-4 flex items-center justify-between hover:bg-muted/10 transition-colors"
      >
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium truncate">{series.seriesTitle}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            <span>{series.episodes.length} Episoden</span>
            <span>•</span>
            <span className="text-gold font-medium">Hook {series.avgHookRate.toFixed(0)}%</span>
            <span>•</span>
            <span>Cliff. {series.avgCliffhangerScore.toFixed(0)}%</span>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border/20">
          {series.episodes.map((ep, i) => (
            <EpisodeRetentionRow 
              key={ep.episodeId} 
              episode={ep} 
              isFirst={i === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function SeriesRetentionTab({ data }: SeriesRetentionTabProps) {
  if (data.isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (data.series.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <Play className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-lg font-medium mb-2">Keine Seriendaten verfügbar</p>
        <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
          Veröffentliche Episoden, um Retention-Metriken wie Hook-Rate, Cliffhanger-Score und Binge-Velocity zu sehen.
        </p>
      </div>
    );
  }

  // Aggregate across all series
  const allSeries = data.series;
  const avgHook = allSeries.reduce((s, sr) => s + sr.avgHookRate, 0) / allSeries.length;
  const avgCliff = allSeries.reduce((s, sr) => s + sr.avgCliffhangerScore, 0) / allSeries.length;
  const seriesWithBinge = allSeries.filter(s => s.avgBingeVelocityMin > 0);
  const avgBinge = seriesWithBinge.length > 0
    ? seriesWithBinge.reduce((s, sr) => s + sr.avgBingeVelocityMin, 0) / seriesWithBinge.length
    : 0;
  const avgCompletion = allSeries.reduce((s, sr) => s + sr.overallCompletionRate, 0) / allSeries.length;

  return (
    <div className="space-y-0">
      {/* Hero KPIs */}
      <div className="px-6 py-6 border-b border-border/30">
        <h2 className="text-sm font-medium text-muted-foreground mb-4">Series Retention</h2>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            icon={Zap}
            label="Hook-Rate"
            value={`${avgHook.toFixed(0)}%`}
            subtitle="Viewer > 3 Sek."
            accent
          />
          <MetricCard
            icon={TrendingUp}
            label="Cliffhanger"
            value={`${avgCliff.toFixed(0)}%`}
            subtitle="Bleiben bis zum Ende"
          />
          <MetricCard
            icon={Timer}
            label="Binge-Velocity"
            value={avgBinge > 0 ? `${avgBinge.toFixed(1)} min` : '–'}
            subtitle="Ø zur nächsten Episode"
          />
          <MetricCard
            icon={Eye}
            label="Completion"
            value={`${avgCompletion.toFixed(0)}%`}
            subtitle="Ø Abschlussrate"
          />
        </div>
      </div>

      {/* Per-Series Breakdown */}
      <div className="px-6 py-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-4">Serien-Breakdown</h2>
        <div className="space-y-3">
          {allSeries.map(series => (
            <SeriesCard key={series.seriesId} series={series} />
          ))}
        </div>
      </div>
    </div>
  );
}
