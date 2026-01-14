import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Film, Heart, Star, Share2, ChevronDown } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { usePublicSeriesDetail } from "@/hooks/usePublicSeriesDetail";
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

export default function Series() {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const { series, episodes, isLoading, error } = usePublicSeriesDetail(seriesId);
  const [selectedEpisode, setSelectedEpisode] = useState(0);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);

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

  // Generate dummy stats
  const likesCount = "2.3k";
  const favoritesCount = "12.4k";

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Hero Video Section */}
        <div className="relative aspect-video bg-black">
          {/* Back button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 z-10 safe-area-top text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          {/* Cover Image */}
          {series.coverUrl && (
            <img
              src={series.coverUrl}
              alt={series.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Play button */}
          {currentEpisode && (
            <button
              onClick={() => navigate(`/watch/${currentEpisode.id}`)}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <Play className="w-8 h-8 text-white ml-1" fill="white" />
              </div>
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

        {/* Episode Selector */}
        {episodes.length > 0 && (
          <div className="px-4 pb-4">
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
                {episodes.map((episode, index) => (
                  <button
                    key={episode.id}
                    onClick={() => setSelectedEpisode(index)}
                    className={cn(
                      "flex-shrink-0 w-16 h-12 rounded-lg flex items-center justify-center text-sm font-medium transition-all",
                      selectedEpisode === index
                        ? "bg-gold/20 text-gold border border-gold/40"
                        : "bg-secondary text-muted-foreground border border-border hover:bg-secondary/80"
                    )}
                  >
                    {index === 0 ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4].map((i) => (
                            <div 
                              key={i} 
                              className={cn(
                                "w-1 rounded-full",
                                selectedEpisode === 0 ? "bg-gold" : "bg-muted-foreground"
                              )}
                              style={{ height: `${8 + i * 3}px` }}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      episode.episodeNumber
                    )}
                  </button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}

        {/* Social Actions */}
        <div className="flex items-center justify-around py-4 border-y border-border mx-4">
          <button className="flex flex-col items-center gap-1">
            <Heart className="w-6 h-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{likesCount}</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <Star className="w-6 h-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{favoritesCount}</span>
          </button>
          <button 
            onClick={() => setShowShareSheet(true)} 
            className="flex flex-col items-center gap-1"
          >
            <Share2 className="w-6 h-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Teilen</span>
          </button>
        </div>

        {/* Share Sheet */}
        <ShareSheet
          isOpen={showShareSheet}
          onClose={() => setShowShareSheet(false)}
          title={series.title}
          text={series.description || `Schau dir ${series.title} auf Ryl an!`}
          url={window.location.href}
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
              <p className="text-sm text-muted-foreground">
                Noch keine Episoden verfügbar
              </p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
