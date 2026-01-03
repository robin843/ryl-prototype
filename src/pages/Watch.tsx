import { useParams, useNavigate } from "react-router-dom";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { getEpisodeById, getAllEpisodes } from "@/data/mockData";
import { AppLayout } from "@/components/layout/AppLayout";
import { EpisodeCard } from "@/components/episodes/EpisodeCard";
import PaywallOverlay from "@/components/paywall/PaywallOverlay";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function Watch() {
  const { episodeId } = useParams();
  const navigate = useNavigate();
  const { user, subscription } = useAuth();
  
  // If we have an episode ID, check access and show player or paywall
  if (episodeId) {
    const episode = getEpisodeById(episodeId);
    if (episode) {
      // First episode of each series is free, rest requires subscription
      const isPremiumEpisode = episode.episodeNumber > 1;
      const hasAccess = !isPremiumEpisode || subscription.subscribed;
      
      if (!hasAccess) {
        const handleSubscribe = async () => {
          if (!user) {
            navigate("/auth");
            return;
          }
          
          const { data, error } = await supabase.functions.invoke("create-checkout", {
            body: { priceId: "price_1SlYqPLHz2QNjBxKNTKe0tSb" },
          });
          
          if (data?.url) {
            window.open(data.url, "_blank");
          }
        };

        return (
          <PaywallOverlay
            episodeTitle={episode.title}
            seriesTitle={episode.seriesTitle}
            thumbnailUrl={episode.thumbnailUrl}
            onSubscribe={handleSubscribe}
            onLogin={() => navigate("/auth")}
            isLoggedIn={!!user}
          />
        );
      }
      
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
