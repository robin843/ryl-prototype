import { Film, Play, X } from "lucide-react";
import { usePublicSeriesDetail } from "@/hooks/usePublicSeriesDetail";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

interface SeriesPreviewSheetProps {
  isOpen: boolean;
  onClose: () => void;
  seriesId: string;
  currentEpisodeNumber: number;
  onSelectEpisode: (episodeId: string) => void;
}

export function SeriesPreviewSheet({
  isOpen,
  onClose,
  seriesId,
  currentEpisodeNumber,
  onSelectEpisode,
}: SeriesPreviewSheetProps) {
  const { series, episodes, isLoading } = usePublicSeriesDetail(seriesId);

  const handleEpisodeClick = (episodeId: string) => {
    onSelectEpisode(episodeId);
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[70vh] bg-card/98 backdrop-blur-xl border-t border-border/50">
        <DrawerHeader className="relative pb-2">
          <DrawerClose className="absolute right-4 top-4 w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
            <X className="w-4 h-4" />
          </DrawerClose>
          <div className="flex items-center gap-3">
            <Film className="w-5 h-5 text-gold" />
            <DrawerTitle className="text-lg font-semibold">Serie anschauen</DrawerTitle>
          </div>
        </DrawerHeader>

        <div className="px-4 pb-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          ) : series ? (
            <div className="space-y-4">
              {/* Series Header */}
              <div className="flex gap-4">
                {series.coverUrl && (
                  <div className="w-24 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                    <img
                      src={series.coverUrl}
                      alt={series.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1">{series.title}</h3>
                  {series.genre && (
                    <span className="text-xs text-gold bg-gold/10 px-2 py-0.5 rounded-full">
                      {series.genre}
                    </span>
                  )}
                  {series.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                      {series.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {series.episodeCount} Episoden
                  </p>
                </div>
              </div>

              {/* Episode List */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Alle Episoden</h4>
                <div className="space-y-2">
                  {episodes.map((episode) => {
                    const isCurrent = episode.episodeNumber === currentEpisodeNumber;
                    return (
                      <button
                        key={episode.id}
                        onClick={() => handleEpisodeClick(episode.id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left",
                          isCurrent
                            ? "bg-gold/10 border border-gold/30"
                            : "bg-muted/30 hover:bg-muted/50"
                        )}
                      >
                        <div className="w-16 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0 relative">
                          <img
                            src={episode.thumbnailUrl || series.coverUrl || "/placeholder.svg"}
                            alt={episode.title}
                            className="w-full h-full object-cover"
                          />
                          {isCurrent && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Play className="w-4 h-4 text-gold" fill="currentColor" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm font-medium truncate",
                            isCurrent && "text-gold"
                          )}>
                            Ep. {episode.episodeNumber}: {episode.title}
                          </p>
                          {episode.duration && (
                            <p className="text-xs text-muted-foreground">{episode.duration}</p>
                          )}
                        </div>
                        {isCurrent && (
                          <span className="text-[10px] text-gold bg-gold/10 px-2 py-0.5 rounded-full flex-shrink-0">
                            Aktuell
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Serie nicht gefunden
            </p>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
