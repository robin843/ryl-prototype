import { AppLayout } from "@/components/layout/AppLayout";
import { EpisodeCard } from "@/components/episodes/EpisodeCard";
import { getAllEpisodes, mockSeries } from "@/data/mockData";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const Index = () => {
  const allEpisodes = getAllEpisodes();
  const featuredEpisode = allEpisodes[0];
  const continueWatching = allEpisodes.slice(1, 3);

  return (
    <AppLayout>
      <div className="min-h-screen safe-area-top">
        {/* Header */}
        <header className="px-6 pt-4 pb-6">
          <h1 className="text-display text-3xl">
            <span className="text-gold">Ryl</span>
          </h1>
          <p className="text-body text-muted-foreground mt-1">
            Premium stories, beautifully told
          </p>
        </header>

        {/* Featured Episode */}
        <section className="px-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-headline text-lg">Featured</h2>
          </div>
          <EpisodeCard episode={featuredEpisode} />
        </section>

        {/* Continue Watching */}
        {continueWatching.length > 0 && (
          <section className="px-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-headline text-lg">Continue Watching</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {continueWatching.map((episode) => (
                <EpisodeCard
                  key={episode.id}
                  episode={episode}
                  className="aspect-auto"
                />
              ))}
            </div>
          </section>
        )}

        {/* Series List */}
        <section className="px-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-headline text-lg">All Series</h2>
          </div>
          <div className="space-y-3">
            {mockSeries.map((series) => (
              <Link
                key={series.id}
                to={`/series/${series.id}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-card/50 hover:bg-card transition-colors group"
              >
                <div className="w-16 h-20 rounded-lg bg-secondary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-caption text-muted-foreground">
                    {series.genre}
                  </span>
                  <h3 className="text-title mt-0.5 mb-1">{series.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {series.episodeCount} episodes
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
            ))}
          </div>
        </section>

        {/* Empty State Message */}
        <section className="px-6 py-8 text-center">
          <p className="text-body text-muted-foreground">
            Premium stories are coming soon.
          </p>
        </section>
      </div>
    </AppLayout>
  );
};

export default Index;
