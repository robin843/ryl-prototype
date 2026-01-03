import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Episode, getEpisodeById } from "@/data/mockData";

interface EpisodeAccessResult {
  hasAccess: boolean;
  episode: Episode | null;
  isPremium: boolean;
  isLoading: boolean;
  error: string | null;
  reason?: string;
}

export function useEpisodeAccess(episodeId: string | undefined): EpisodeAccessResult {
  const [result, setResult] = useState<EpisodeAccessResult>({
    hasAccess: false,
    episode: null,
    isPremium: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!episodeId) {
      setResult({
        hasAccess: false,
        episode: null,
        isPremium: false,
        isLoading: false,
        error: "No episode ID provided",
      });
      return;
    }

    const checkAccess = async () => {
      setResult((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const { data, error } = await supabase.functions.invoke("check-episode-access", {
          body: { episodeId },
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data.error && !data.episode) {
          throw new Error(data.error);
        }

        // Get full episode data from local mock (includes thumbnailUrl)
        const localEpisode = getEpisodeById(episodeId);
        const episode = localEpisode || data.episode;

        setResult({
          hasAccess: data.hasAccess,
          episode,
          isPremium: data.isPremium ?? false,
          isLoading: false,
          error: null,
          reason: data.reason,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to check access";
        setResult({
          hasAccess: false,
          episode: null,
          isPremium: false,
          isLoading: false,
          error: errorMessage,
        });
      }
    };

    checkAccess();
  }, [episodeId]);

  return result;
}
