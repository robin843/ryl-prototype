import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Film } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { EpisodeCard } from "@/components/episodes/EpisodeCard";
import { usePublicSeriesDetail } from "@/hooks/usePublicSeriesDetail";
import { Skeleton } from "@/components/ui/skeleton";

export default function Series() {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const { series, episodes, isLoading, error } = usePublicSeriesDetail(seriesId);

  // Auto-navigate to first episode when data loads
  React.useEffect(() => {
    if (!isLoading && episodes.length > 0 && series) {
      // Immediately start playing first episode
      navigate(`/watch/${episodes[0].id}`, { replace: true });
    }
  }, [isLoading, episodes, series, navigate]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen">
          {/* Hero Skeleton */}
          <div className="relative h-96 bg-gradient-to-b from-secondary to-background">
            <Button
              variant="player"
              size="icon"
              onClick={() => navigate(-1)}
              className="absolute top-4 left-4 z-10 safe-area-top"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="absolute inset-x-0 bottom-0 p-6 space-y-3">
              <Skeleton className="h-4 w-20 bg-gold/20" />
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full max-w-md" />
              <Skeleton className="h-10 w-40 mt-4 bg-gold/20" />
            </div>
          </div>
          {/* Episodes Skeleton */}
          <section className="px-6 py-6 space-y-3">
            <Skeleton className="h-6 w-32 mb-4" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </section>
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

  const firstEpisode = episodes[0];

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative h-96 bg-gradient-to-b from-secondary to-background overflow-hidden">
          {/* Cover Image */}
          {series.coverUrl && (
            <img
              src={series.coverUrl}
              alt={series.title}
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
          )}
          
          {/* Back button */}
          <Button
            variant="player"
            size="icon"
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 z-10 safe-area-top"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />

          {/* Series info */}
          <div className="absolute inset-x-0 bottom-0 p-6">
            {series.genre && (
              <span className="text-caption text-gold font-semibold">{series.genre}</span>
            )}
            <h1 className="text-display mt-2 mb-3">{series.title}</h1>
            {series.description && (
              <p className="text-body text-muted-foreground line-clamp-2 mb-4">
                {series.description}
              </p>
            )}
            <div className="flex items-center gap-3">
              {firstEpisode && (
                <Button
                  variant="gold"
                  onClick={() => navigate(`/watch/${firstEpisode.id}`)}
                  className="flex-1"
                >
                  <Play className="w-4 h-4 mr-2" fill="currentColor" />
                  Episode 1 ansehen
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Episodes List */}
        <section className="px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-headline text-lg">
              <span className="text-gold">{episodes.length}</span>{" "}
              {episodes.length === 1 ? "Episode" : "Episoden"}
            </h2>
          </div>
          {episodes.length > 0 ? (
            <div className="space-y-3">
              {episodes.map((episode, index) => (
                <EpisodeCard
                  key={episode.id}
                  episode={{
                    id: episode.id,
                    title: episode.title,
                    description: episode.description || "",
                    episodeNumber: episode.episodeNumber,
                    duration: episode.duration || "",
                    thumbnailUrl: episode.thumbnailUrl || "",
                    seriesTitle: series.title,
                    seriesId: series.id,
                  }}
                  variant="horizontal"
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` } as React.CSSProperties}
                />
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-dashed border-gold/30 text-center bg-gold/5">
              <Film className="w-8 h-8 text-gold mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Noch keine Episoden verfügbar
              </p>
            </div>
          )}
        </section>

        {/* Placeholder for more episodes */}
        {series.episodeCount > episodes.length && episodes.length > 0 && (
          <div className="px-6 pb-8">
            <div className="p-4 rounded-xl border border-dashed border-gold/30 text-center bg-gold/5">
              <p className="text-sm text-gold">
                {series.episodeCount - episodes.length} weitere Episoden bald verfügbar
              </p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
