import { useParams, useNavigate } from "react-router-dom";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { getAllEpisodes } from "@/data/mockData";
import { AppLayout } from "@/components/layout/AppLayout";
import { EpisodeCard } from "@/components/episodes/EpisodeCard";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface EpisodeData {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  seriesId?: string;
  seriesTitle?: string;
  episodeNumber?: number;
  duration?: string;
}

function EpisodePlayer({ episodeId }: { episodeId: string }) {
  const navigate = useNavigate();
  const [episode, setEpisode] = useState<EpisodeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEpisode = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch from Supabase
        const { data: supabaseEpisode, error: supabaseError } = await supabase
          .from('episodes')
          .select(`
            id,
            title,
            description,
            video_url,
            thumbnail_url,
            series_id,
            episode_number,
            duration,
            series:series_id (
              title
            )
          `)
          .eq('id', episodeId)
          .eq('status', 'published')
          .single();

        if (supabaseEpisode && !supabaseError) {
          const seriesData = supabaseEpisode.series as { title: string } | null;
          setEpisode({
            id: supabaseEpisode.id,
            title: supabaseEpisode.title,
            description: supabaseEpisode.description || undefined,
            videoUrl: supabaseEpisode.video_url || undefined,
            thumbnailUrl: supabaseEpisode.thumbnail_url || undefined,
            seriesId: supabaseEpisode.series_id,
            seriesTitle: seriesData?.title,
            episodeNumber: supabaseEpisode.episode_number,
            duration: supabaseEpisode.duration || "3:00",
          });
        } else {
          // Try mock data as fallback
          const allEpisodes = getAllEpisodes();
          const mockEpisode = allEpisodes.find(ep => ep.id === episodeId);
          if (mockEpisode) {
            setEpisode({
              id: mockEpisode.id,
              title: mockEpisode.title,
              description: mockEpisode.description,
              videoUrl: mockEpisode.videoUrl,
              thumbnailUrl: mockEpisode.thumbnailUrl,
              seriesId: mockEpisode.seriesId,
              episodeNumber: mockEpisode.episodeNumber,
              duration: mockEpisode.duration,
              seriesTitle: mockEpisode.seriesTitle,
            });
          } else {
            setError("Episode nicht gefunden");
          }
        }
      } catch (err) {
        console.error("Error fetching episode:", err);
        setError("Fehler beim Laden der Episode");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEpisode();
  }, [episodeId]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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

  // FREEMIUM: Alle User haben Zugang zu allen Episoden
  return <VideoPlayer episode={episode as any} />;
}

export default function Watch() {
  const { episodeId } = useParams();

  if (episodeId) {
    return <EpisodePlayer episodeId={episodeId} />;
  }

  const allEpisodes = getAllEpisodes();

  return (
    <AppLayout>
      <div className="min-h-screen safe-area-top">
        <header className="px-6 pt-4 pb-6">
          <h1 className="text-headline">Watch</h1>
          <p className="text-body text-muted-foreground mt-1">
            Alle Episoden, gratis verfügbar
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
            <p className="text-muted-foreground">Noch keine Episoden verfügbar.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
