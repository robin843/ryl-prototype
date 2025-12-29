import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { EpisodeCard } from "@/components/episodes/EpisodeCard";
import { getSeriesById } from "@/data/mockData";

export default function Series() {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const series = getSeriesById(seriesId || "");

  if (!series) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Series not found</p>
        </div>
      </AppLayout>
    );
  }

  const firstEpisode = series.episodes[0];

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative h-96 bg-gradient-to-b from-secondary to-background overflow-hidden">
          {/* Cover Image */}
          <img
            src={series.coverUrl}
            alt={series.title}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          
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
            <span className="text-caption text-gold">{series.genre}</span>
            <h1 className="text-display mt-2 mb-3">{series.title}</h1>
            <p className="text-body text-muted-foreground line-clamp-2 mb-4">
              {series.description}
            </p>
            <div className="flex items-center gap-3">
              {firstEpisode && (
                <Button
                  variant="gold"
                  onClick={() => navigate(`/watch/${firstEpisode.id}`)}
                  className="flex-1"
                >
                  <Play className="w-4 h-4 mr-2" fill="currentColor" />
                  Watch Episode 1
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Episodes List */}
        <section className="px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-headline text-lg">
              {series.episodeCount} Episodes
            </h2>
          </div>
          <div className="space-y-3">
            {series.episodes.map((episode, index) => (
              <EpisodeCard
                key={episode.id}
                episode={episode}
                variant="horizontal"
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` } as React.CSSProperties}
              />
            ))}
          </div>
        </section>

        {/* Placeholder for more episodes */}
        {series.episodeCount > series.episodes.length && (
          <div className="px-6 pb-8">
            <div className="p-4 rounded-xl border border-dashed border-border text-center">
              <p className="text-sm text-muted-foreground">
                {series.episodeCount - series.episodes.length} more episodes coming soon
              </p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
