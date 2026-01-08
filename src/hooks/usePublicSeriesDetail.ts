import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Episode {
  id: string;
  title: string;
  description: string | null;
  episodeNumber: number;
  duration: string | null;
  thumbnailUrl: string | null;
  videoUrl: string | null;
}

interface Series {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  genre: string | null;
  creatorId: string;
  episodeCount: number;
}

export function usePublicSeriesDetail(seriesId: string | undefined) {
  const [series, setSeries] = useState<Series | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!seriesId) {
      setIsLoading(false);
      return;
    }

    const fetchSeriesDetail = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch series
        const { data: seriesData, error: seriesError } = await supabase
          .from("series")
          .select("*")
          .eq("id", seriesId)
          .eq("status", "published")
          .maybeSingle();

        if (seriesError) {
          throw seriesError;
        }

        if (!seriesData) {
          setError("Serie nicht gefunden");
          return;
        }

        setSeries({
          id: seriesData.id,
          title: seriesData.title,
          description: seriesData.description,
          coverUrl: seriesData.cover_url,
          genre: seriesData.genre,
          creatorId: seriesData.creator_id,
          episodeCount: seriesData.episode_count || 0,
        });

        // Fetch published episodes
        const { data: episodesData, error: episodesError } = await supabase
          .from("episodes")
          .select("*")
          .eq("series_id", seriesId)
          .eq("status", "published")
          .order("episode_number", { ascending: true });

        if (episodesError) throw episodesError;

        setEpisodes(
          episodesData.map((ep) => ({
            id: ep.id,
            title: ep.title,
            description: ep.description,
            episodeNumber: ep.episode_number,
            duration: ep.duration,
            thumbnailUrl: ep.thumbnail_url,
            videoUrl: ep.video_url,
          }))
        );
      } catch (err) {
        console.error("Error fetching series:", err);
        setError("Fehler beim Laden der Serie");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeriesDetail();
  }, [seriesId]);

  return { series, episodes, isLoading, error };
}
