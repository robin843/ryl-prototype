import { useParams, useNavigate } from "react-router-dom";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { getAllEpisodes } from "@/data/mockData";
import { AppLayout } from "@/components/layout/AppLayout";
import { EpisodeCard } from "@/components/episodes/EpisodeCard";
import PaywallOverlay from "@/components/paywall/PaywallOverlay";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEpisodeAccess } from "@/hooks/useEpisodeAccess";
import { Loader2 } from "lucide-react";

function EpisodePlayer({ episodeId }: { episodeId: string }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasAccess, episode, isPremium, isLoading, error } = useEpisodeAccess(episodeId);

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error or episode not found
  if (error || !episode) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">{error || "Episode nicht gefunden"}</p>
          <button
            onClick={() => navigate("/watch")}
            className="mt-4 text-primary underline"
          >
            Zurück zur Übersicht
          </button>
        </div>
      </div>
    );
  }

  // Premium content without access - show paywall
  if (isPremium && !hasAccess) {
    const handleSubscribe = async () => {
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data } = await supabase.functions.invoke("create-checkout", {
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

  // Access granted - show video player
  return <VideoPlayer episode={episode} />;
}

export default function Watch() {
  const { episodeId } = useParams();

  // If we have an episode ID, use the server-validated player
  if (episodeId) {
    return <EpisodePlayer episodeId={episodeId} />;
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
