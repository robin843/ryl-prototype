import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Film, Heart, Star, Share2, ChevronDown, CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { usePublicSeriesDetail } from "@/hooks/usePublicSeriesDetail";
import { useSeriesInteractions } from "@/hooks/useSeriesInteractions";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ShareSheet } from "@/components/sheets/ShareSheet";
import { useWatchHistory } from "@/hooks/useWatchHistory";
export default function Series() {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const { series, episodes, isLoading, error } = usePublicSeriesDetail(seriesId);
  const { isLiked, isSaved, likesCount, savedCount, toggleLike, toggleSave } = useSeriesInteractions(seriesId);
  const { history } = useWatchHistory();
  const [selectedEpisode, setSelectedEpisode] = useState(0);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);

  // Build a map of episodeId -> watch history item
  const watchedMap = useMemo(() => {
    const map = new Map<string, { completed: boolean; progressSeconds: number }>();
    for (const item of history) {
      if (item.episode?.series?.id === seriesId) {
        map.set(item.episode_id, { completed: item.completed, progressSeconds: item.progress_seconds });
      }
    }
    return map;
  }, [history, seriesId]);

  // Find the "continue watching" episode
  const continueEpisodeIndex = useMemo(() => {
    if (episodes.length === 0) return 0;
    // Find first unwatched or incomplete episode
    for (let i = 0; i < episodes.length; i++) {
      const watched = watchedMap.get(episodes[i].id);
      if (!watched || !watched.completed) return i;
    }
    return 0; // All watched, start from beginning
  }, [episodes, watchedMap]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background">
          {/* Hero Skeleton */}
          <div className="relative aspect-video bg-secondary">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="absolute top-4 left-4 z-10 safe-area-top text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="w-16 h-16 rounded-full" />
            </div>
          </div>
          {/* Content Skeleton */}
          <div className="p-4 space-y-4">
            <Skeleton className="h-7 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-16" />
              <Skeleton className="h-10 w-16" />
            </div>
            <div className="flex justify-around py-4">
              <Skeleton className="h-12 w-16" />
              <Skeleton className="h-12 w-16" />
              <Skeleton className="h-12 w-16" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !series) {
    return (
      <AppLayout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
          <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-2">
            <Film className="w-8 h-8 text-gold" />
          </div>
          <p className="text-muted-foreground">{error || "Serie nicht gefunden"}</p>
          <Button variant="gold" onClick={() => navigate("/soaps")}>
            Zurück zu Serien
          </Button>
        </div>
      </AppLayout>
    );
  }

  const currentEpisode = episodes[selectedEpisode];
  const tags = series.genre ? series.genre.split(",").map(t => t.trim()) : [];

  return (
    <AppLayout>
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain pb-20">
          {/* Hero Video Section */}
          <div className="relative aspect-video bg-black flex-shrink-0">
            {/* Back button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="absolute top-4 left-4 z-10 safe-area-top text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            {/* Cover Image with blurred background */}
            {series.coverUrl && (
              <>
                <img
                  src={series.coverUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 brightness-50"
                />
                <img
                  src={series.coverUrl}
                  alt={series.title}
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </>
            )}

            {/* Play button */}
            {currentEpisode && (
              <button
                onClick={() => {
                  const watched = watchedMap.get(currentEpisode.id);
                  const timeParam = watched && !watched.completed && watched.progressSeconds > 0
                    ? `&t=${watched.progressSeconds}`
                    : '';
                  navigate(`/series/${seriesId}/watch?episode=${currentEpisode.id}${timeParam}`);
                }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-2"
              >
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                  <Play className="w-8 h-8 text-white ml-1" fill="white" />
                </div>
                {(() => {
                  const watched = watchedMap.get(currentEpisode.id);
                  if (watched && !watched.completed && watched.progressSeconds > 0) {
                    return (
                      <span className="text-white text-xs font-medium bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
                        Weiterschauen Ep. {currentEpisode.episodeNumber}
                      </span>
                    );
                  }
                  return null;
                })()}
              </button>
            )}
          </div>

          {/* Title Section */}
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold text-foreground">
              {currentEpisode 
                ? `Episode ${currentEpisode.episodeNumber} - ${series.title}`
                : series.title
              }
            </h1>
          </div>

        {/* Social Actions */}
        <div className="flex items-center justify-around py-4 mx-4">
          <button 
            onClick={toggleLike}
            className="flex flex-col items-center gap-1"
          >
            <Heart className={cn(
              "w-6 h-6 transition-colors",
              isLiked ? "text-red-500 fill-red-500" : "text-muted-foreground"
            )} />
            <span className="text-xs text-muted-foreground">{likesCount}</span>
          </button>
          <button 
            onClick={toggleSave}
            className="flex flex-col items-center gap-1"
          >
            <Star className={cn(
              "w-6 h-6 transition-colors",
              isSaved ? "text-gold fill-gold" : "text-muted-foreground"
            )} />
            <span className="text-xs text-muted-foreground">{savedCount}</span>
          </button>
          <button 
            onClick={() => setShowShareSheet(true)} 
            className="flex flex-col items-center gap-1"
          >
            <Share2 className="w-6 h-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Teilen</span>
          </button>
        </div>

        {/* Episode Selector */}
        {episodes.length > 0 && (
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-foreground font-medium">1-{episodes.length}</span>
              </div>
              <button className="text-sm text-muted-foreground flex items-center gap-1">
                Alle Episoden
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-2">
                {episodes.map((episode, index) => {
                  const watched = watchedMap.get(episode.id);
                  const isCompleted = watched?.completed;
                  return (
                    <button
                      key={episode.id}
                      onClick={() => setSelectedEpisode(index)}
                      className={cn(
                        "flex-shrink-0 w-16 h-12 rounded-lg flex items-center justify-center text-sm font-medium transition-all relative",
                        selectedEpisode === index
                          ? "bg-gold/20 text-gold border border-gold/40"
                          : "bg-secondary text-muted-foreground border border-border hover:bg-secondary/80"
                      )}
                    >
                      {selectedEpisode === index ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4].map((i) => (
                              <div 
                                key={i} 
                                className="w-1 rounded-full bg-gold"
                                style={{ height: `${8 + i * 3}px` }}
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        episode.episodeNumber
                      )}
                      {isCompleted && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 absolute -top-1 -right-1" />
                      )}
                    </button>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}

          {/* Share Sheet */}
          <ShareSheet
            isOpen={showShareSheet}
            onClose={() => setShowShareSheet(false)}
            title={series.title}
            text={series.description || `Schau dir ${series.title} auf Ryl an!`}
            path={`/series/${seriesId}`}
          />

          {/* Description with expand */}
          {series.description && (
            <div className="px-4 py-4">
              <h3 className="font-medium text-foreground mb-2">
                {currentEpisode ? `Plot von Episode ${currentEpisode.episodeNumber}` : "Handlung"}
              </h3>
              <p className={cn(
                "text-sm text-muted-foreground",
                !descriptionExpanded && "line-clamp-3"
              )}>
                {series.description}
                {!descriptionExpanded && series.description.length > 150 && (
                  <button 
                    onClick={() => setDescriptionExpanded(true)}
                    className="text-gold ml-1 font-medium"
                  >
                    Mehr
                  </button>
                )}
              </p>
              {descriptionExpanded && (
                <button 
                  onClick={() => setDescriptionExpanded(false)}
                  className="text-gold text-sm font-medium mt-1"
                >
                  Weniger
                </button>
              )}
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="px-4 pb-4">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1.5 rounded-full border border-border text-sm text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Accordion Sections */}
          <div className="px-4 pb-8">
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="about" className="border-border">
                <AccordionTrigger className="text-foreground font-medium hover:no-underline">
                  ÜBER
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  <p className="mb-2">
                    <strong>Serie:</strong> {series.title}
                  </p>
                  <p className="mb-2">
                    <strong>Episoden:</strong> {series.episodeCount || episodes.length}
                  </p>
                  {series.genre && (
                    <p>
                      <strong>Genre:</strong> {series.genre}
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="support" className="border-border">
                <AccordionTrigger className="text-foreground font-medium hover:no-underline">
                  SUPPORT
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  <p>Bei Fragen oder Problemen kontaktiere uns unter support@ryl.app</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Empty state */}
          {episodes.length === 0 && (
            <div className="px-4 pb-8">
              <div className="p-6 rounded-xl border border-dashed border-gold/30 text-center bg-gold/5">
                <Film className="w-8 h-8 text-gold mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-4">
                  Noch keine Episoden verfügbar
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/soaps')}
                  >
                    Andere Serien entdecken
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
