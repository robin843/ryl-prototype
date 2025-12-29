import { useParams } from "react-router-dom";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { getEpisodeById, getAllEpisodes } from "@/data/mockData";
import { AppLayout } from "@/components/layout/AppLayout";
import { EpisodeCard } from "@/components/episodes/EpisodeCard";

export default function Watch() {
  const { episodeId } = useParams();
  
  // If we have an episode ID, show the full player
  if (episodeId) {
    const episode = getEpisodeById(episodeId);
    if (episode) {
      return <VideoPlayer episode={episode} />;
    }
  }

  // Otherwise show the watch page with all episodes
  const allEpisodes = getAllEpisodes();

  return (
    <AppLayout>
      <div className="min-h-screen safe-area-top">
        <header className="px-6 pt-4 pb-6">
          <h1 className="text-headline">Watch</h1>
          <p className="text-body text-muted-foreground mt-1">
            All episodes, ready to play
          </p>
        </header>

        <section className="px-6">
          <div className="space-y-4">
            {allEpisodes.map((episode, index) => (
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

        {allEpisodes.length === 0 && (
          <div className="px-6 py-16 text-center">
            <p className="text-muted-foreground">No episodes available yet.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
