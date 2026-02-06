import { useState } from "react";
import { Play, Target, TrendingUp, Clock, MousePointer2, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { EpisodePerformanceData } from "@/hooks/useEpisodePerformance";
import { useScenePerformance } from "@/hooks/useScenePerformance";
import { SceneTimeline } from "./SceneTimeline";

interface EpisodesTabProps {
  data: EpisodePerformanceData;
  creatorId?: string;
  timeRange?: '7d' | '30d' | 'all';
}

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('de-DE', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function EpisodesTab({ data, creatorId, timeRange = 'all' }: EpisodesTabProps) {
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null);
  const sceneData = useScenePerformance(selectedEpisodeId, creatorId, timeRange);
  const selectedEpisode = data.episodes.find(e => e.id === selectedEpisodeId);
  if (data.isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (data.publishedEpisodes === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <Play className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-lg font-medium mb-2">Keine veröffentlichten Episoden</p>
        <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
          Erstelle und veröffentliche deine erste Episode, um Performance-Daten zu sehen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Summary Stats */}
      <div className="px-6 py-6 border-b border-border/30">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{data.publishedEpisodes}</p>
            <p className="text-xs text-muted-foreground">Episoden</p>
          </div>
          <div className="border-x border-border/30">
            <p className="text-2xl font-bold">{formatCurrency(data.comparison.avgRevenueCents)}</p>
            <p className="text-xs text-muted-foreground">Ø Umsatz</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{data.comparison.avgConversion.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Ø Conversion</p>
          </div>
        </div>
      </div>

      {/* Best vs Worst Performer */}
      {data.comparison.bestPerformer && data.comparison.worstPerformer && (
        <div className="px-6 py-6 border-b border-border/30">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Vergleich</h2>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Best */}
            <div className="p-4 rounded-xl bg-gold/5 border border-gold/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-gold" />
                <span className="text-xs font-medium text-gold">Top Performer</span>
              </div>
              <p className="text-sm font-medium truncate mb-1">
                {data.comparison.bestPerformer.title}
              </p>
              <p className="text-lg font-bold text-gold">
                {formatCurrency(data.comparison.bestPerformer.revenueCents)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {data.comparison.bestPerformer.conversionRate.toFixed(1)}% Conversion
              </p>
            </div>

            {/* Worst */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Potenzial</span>
              </div>
              <p className="text-sm font-medium truncate mb-1">
                {data.comparison.worstPerformer.title}
              </p>
              <p className="text-lg font-bold">
                {formatCurrency(data.comparison.worstPerformer.revenueCents)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {data.comparison.worstPerformer.conversionRate.toFixed(1)}% Conversion
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hotspot Timing Insight */}
      {(data.hotspotTiming.earlyPerformance > 0 || data.hotspotTiming.midPerformance > 0 || data.hotspotTiming.latePerformance > 0) && (
        <div className="px-6 py-6 border-b border-border/30">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Hotspot-Timing</h2>
          
          <div className="space-y-3">
            <TimingBar 
              label="0–30 Sek"
              value={data.hotspotTiming.earlyPerformance}
              isHighlighted={data.hotspotTiming.earlyPerformance > data.hotspotTiming.midPerformance && 
                           data.hotspotTiming.earlyPerformance > data.hotspotTiming.latePerformance}
            />
            <TimingBar 
              label="30–60 Sek"
              value={data.hotspotTiming.midPerformance}
              isHighlighted={data.hotspotTiming.midPerformance > data.hotspotTiming.earlyPerformance && 
                           data.hotspotTiming.midPerformance > data.hotspotTiming.latePerformance}
            />
            <TimingBar 
              label="60+ Sek"
              value={data.hotspotTiming.latePerformance}
              isHighlighted={data.hotspotTiming.latePerformance > data.hotspotTiming.earlyPerformance && 
                           data.hotspotTiming.latePerformance > data.hotspotTiming.midPerformance}
            />
          </div>
          
          <p className="text-xs text-muted-foreground text-center mt-3">
            Conversion Rate nach Hotspot-Position im Video
          </p>
        </div>
      )}

      {/* Episode List */}
      <div className="px-6 py-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-4">Alle Episoden</h2>
        
        <div className="space-y-3">
         {data.episodes.map((episode) => (
            <button
              key={episode.id}
              onClick={() => setSelectedEpisodeId(episode.id)}
              className="flex items-center gap-3 p-3 rounded-xl bg-card/30 w-full text-left hover:bg-card/50 transition-colors"
            >
              <div className="w-16 h-10 rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                {episode.thumbnailUrl ? (
                  <img 
                    src={episode.thumbnailUrl} 
                    alt={episode.title} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <Play className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{episode.title}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span>{episode.views} Views</span>
                  <span>•</span>
                  <span>{episode.hotspotClicks} Klicks</span>
                  <span>•</span>
                  <span>{episode.hotspotsCount} Hotspots</span>
                </div>
              </div>
              
              <div className="text-right flex-shrink-0 flex items-center gap-2">
                <div>
                  <p className={cn(
                    "text-sm font-medium",
                    episode.revenueCents > 0 ? "text-gold" : "text-muted-foreground"
                  )}>
                    {formatCurrency(episode.revenueCents)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {episode.conversionRate.toFixed(1)}%
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Scene-to-Sales Drilldown Modal */}
      <Dialog open={!!selectedEpisodeId} onOpenChange={(open) => !open && setSelectedEpisodeId(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">
              {selectedEpisode?.title || 'Episode'}
            </DialogTitle>
            <p className="text-xs text-muted-foreground">Scene-to-Sales – Welcher Moment verkauft?</p>
          </DialogHeader>

          {sceneData.isLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Laden…</div>
          ) : (
            <SceneTimeline hotspots={sceneData.hotspots} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TimingBar({ label, value, isHighlighted }: { label: string; value: number; isHighlighted: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-16">{label}</span>
      <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full transition-all",
            isHighlighted ? "bg-gold" : "bg-muted-foreground/40"
          )}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className={cn(
        "text-xs font-medium w-12 text-right",
        isHighlighted ? "text-gold" : "text-muted-foreground"
      )}>
        {value.toFixed(1)}%
      </span>
    </div>
  );
}
