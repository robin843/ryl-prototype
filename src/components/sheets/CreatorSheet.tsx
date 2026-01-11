import { Play, Eye, Users, User, X, Film } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCreatorProfile } from "@/hooks/useCreatorProfile";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";

interface CreatorSheetProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId: string | null;
  onOpenSeries?: (seriesId: string) => void;
}

export function CreatorSheet({ isOpen, onClose, creatorId, onOpenSeries }: CreatorSheetProps) {
  const navigate = useNavigate();
  const { creator, series, stats, isLoading, error } = useCreatorProfile(creatorId || undefined);

  const handleSeriesClick = (seriesId: string) => {
    if (onOpenSeries) {
      onOpenSeries(seriesId);
    } else {
      onClose();
      navigate(`/series/${seriesId}`);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[80vh] bg-card/98 backdrop-blur-xl border-t border-border/50">
        <DrawerHeader className="relative pb-2">
          <DrawerClose className="absolute right-4 top-4 w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
            <X className="w-4 h-4" />
          </DrawerClose>
          <DrawerTitle className="text-lg font-semibold">Creator</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-6 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            </div>
          ) : error || !creator ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Creator nicht gefunden</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Creator Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-card border-2 border-gold/20 flex items-center justify-center overflow-hidden">
                  {creator.avatarUrl ? (
                    <img src={creator.avatarUrl} alt={creator.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-7 h-7 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{creator.displayName || 'Creator'}</h3>
                  {creator.companyName && (
                    <p className="text-sm text-muted-foreground">{creator.companyName}</p>
                  )}
                </div>
              </div>

              {/* Bio */}
              {creator.bio && (
                <p className="text-sm text-foreground/80">{creator.bio}</p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-muted/30 text-center">
                  <Users className="w-4 h-4 text-gold mx-auto mb-1" />
                  <p className="text-sm font-medium">{stats.followerCount?.toLocaleString() || 0}</p>
                  <p className="text-xs text-muted-foreground">Follower</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 text-center">
                  <Eye className="w-4 h-4 text-gold mx-auto mb-1" />
                  <p className="text-sm font-medium">{stats.totalViews.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Views</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 text-center">
                  <Play className="w-4 h-4 text-gold mx-auto mb-1" />
                  <p className="text-sm font-medium">{stats.totalEpisodes}</p>
                  <p className="text-xs text-muted-foreground">Episoden</p>
                </div>
              </div>

              {/* Series */}
              {series.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Film className="w-4 h-4 text-gold" />
                    <span className="text-sm font-medium">Serien</span>
                  </div>
                  <div className="space-y-2">
                    {series.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleSeriesClick(s.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                      >
                        <div className="w-14 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          {s.coverUrl ? (
                            <img src={s.coverUrl} alt={s.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Play className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">{s.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {s.episodeCount} Episoden
                          </p>
                          {s.genre && (
                            <span className="inline-block text-[10px] text-gold bg-gold/10 px-2 py-0.5 rounded-full mt-1">
                              {s.genre}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
