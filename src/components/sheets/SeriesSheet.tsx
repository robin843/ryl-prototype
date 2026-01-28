import { Film, Play, X, Eye, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePublicSeriesDetail } from "@/hooks/usePublicSeriesDetail";
import { useCreatorProfile } from "@/hooks/useCreatorProfile";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

interface SeriesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  seriesId: string | null;
  currentEpisodeId?: string | null;
  onSelectEpisode?: (episodeId: string) => void;
  onOpenCreator?: (creatorId: string) => void;
}

export function SeriesSheet({ 
  isOpen, 
  onClose, 
  seriesId,
  currentEpisodeId,
  onSelectEpisode,
  onOpenCreator,
}: SeriesSheetProps) {
  const navigate = useNavigate();
  const { series, episodes, isLoading } = usePublicSeriesDetail(seriesId || undefined);
  const { creator } = useCreatorProfile(series?.creatorId);

  const handleEpisodeClick = (episodeId: string) => {
    if (onSelectEpisode) {
      // We're in the main feed - use callback
      onSelectEpisode(episodeId);
      onClose();
    } else {
      // Navigate to series feed with vertical scroll experience
      onClose();
      navigate(`/series/${seriesId}/watch?episode=${episodeId}`);
    }
  };

  const handleCreatorClick = () => {
    if (series?.creatorId) {
      if (onOpenCreator) {
        onOpenCreator(series.creatorId);
      } else {
        onClose();
        navigate(`/creator/${series.creatorId}`);
      }
    }
  };

  const handleWatchFirst = () => {
    if (episodes.length > 0) {
      onClose();
      navigate(`/series/${seriesId}/watch`);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[85vh] bg-card/98 backdrop-blur-xl border-t border-border/50">
        <DrawerHeader className="relative pb-2">
          <DrawerClose className="absolute right-4 top-4 w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
            <X className="w-4 h-4" />
          </DrawerClose>
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-gold" />
            <DrawerTitle className="text-lg font-semibold">Serie</DrawerTitle>
          </div>
        </DrawerHeader>

        <div className="px-4 pb-6 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex gap-4">
                <Skeleton className="w-24 h-32 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            </div>
          ) : !series ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Serie nicht gefunden</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Series Header */}
              <div className="flex gap-4">
                <div className="w-28 h-40 rounded-xl bg-muted overflow-hidden flex-shrink-0 shadow-lg">
                  {series.coverUrl ? (
                    <img src={series.coverUrl} alt={series.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg">{series.title}</h3>
                  {series.genre && (
                    <span className="inline-block text-xs text-gold bg-gold/10 px-2 py-0.5 rounded-full mt-1">
                      {series.genre}
                    </span>
                  )}
                  {series.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                      {series.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      {series.episodeCount} Episoden
                    </span>
                    {series.totalViews && (
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {series.totalViews.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Creator */}
              {creator && (
                <button
                  onClick={handleCreatorClick}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-card border border-gold/20 flex items-center justify-center overflow-hidden">
                    {creator.avatarUrl ? (
                      <img src={creator.avatarUrl} alt={creator.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{creator.displayName || 'Creator'}</p>
                    <p className="text-xs text-muted-foreground">Creator ansehen</p>
                  </div>
                </button>
              )}

              {/* Watch Button */}
              {episodes.length > 0 && !currentEpisodeId && (
                <Button
                  onClick={handleWatchFirst}
                  className="w-full bg-gradient-to-r from-gold to-amber-500 text-black font-semibold"
                >
                  <Play className="w-4 h-4 mr-2" fill="currentColor" />
                  Episode 1 ansehen
                </Button>
              )}

              {/* Episodes List */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  Alle Episoden ({episodes.length})
                </h4>
                <div className="space-y-2">
                  {episodes.map((episode) => {
                    const isCurrent = episode.id === currentEpisodeId;
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
                        <div className="w-20 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0 relative">
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
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
