import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface WatchHistoryItem {
  id: string;
  episode_id: string;
  watched_at: string;
  progress_seconds: number;
  completed: boolean;
  episode: {
    id: string;
    title: string;
    thumbnail_url: string | null;
    episode_number: number;
    series: {
      id: string;
      title: string;
    } | null;
  } | null;
}

export function useWatchHistory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: history = [], isLoading, error } = useQuery({
    queryKey: ["watch-history", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // First get watch history
      const { data: historyData, error: historyError } = await supabase
        .from("watch_history")
        .select("id, episode_id, watched_at, progress_seconds, completed")
        .eq("user_id", user.id)
        .order("watched_at", { ascending: false })
        .limit(50);

      if (historyError) throw historyError;
      if (!historyData || historyData.length === 0) return [];

      // Get episode IDs
      const episodeIds = historyData.map((h) => h.episode_id);

      // Fetch episodes with series info
      const { data: episodesData, error: episodesError } = await supabase
        .from("episodes")
        .select(`
          id,
          title,
          thumbnail_url,
          episode_number,
          series:series_id (
            id,
            title
          )
        `)
        .in("id", episodeIds);

      if (episodesError) throw episodesError;

      // Create a map for quick lookup
      const episodesMap = new Map(
        (episodesData || []).map((e: any) => [e.id, e])
      );

      // Combine data
      return historyData.map((item) => ({
        id: item.id,
        episode_id: item.episode_id,
        watched_at: item.watched_at,
        progress_seconds: item.progress_seconds,
        completed: item.completed,
        episode: episodesMap.get(item.episode_id) || null,
      })) as WatchHistoryItem[];
    },
    enabled: !!user,
  });

  const trackWatch = useMutation({
    mutationFn: async ({ 
      episodeId, 
      progressSeconds = 0, 
      completed = false 
    }: { 
      episodeId: string; 
      progressSeconds?: number; 
      completed?: boolean;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("watch_history")
        .upsert({
          user_id: user.id,
          episode_id: episodeId,
          watched_at: new Date().toISOString(),
          progress_seconds: progressSeconds,
          completed,
        }, {
          onConflict: "user_id,episode_id",
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watch-history", user?.id] });
    },
  });

  const clearHistory = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("watch_history")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watch-history", user?.id] });
    },
  });

  const removeFromHistory = useMutation({
    mutationFn: async (historyId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("watch_history")
        .delete()
        .eq("id", historyId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watch-history", user?.id] });
    },
  });

  // Group history by date
  const groupedHistory = history.reduce((acc, item) => {
    const date = new Date(item.watched_at).toLocaleDateString("de-DE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {} as Record<string, WatchHistoryItem[]>);

  return {
    history,
    groupedHistory,
    isLoading,
    error,
    trackWatch,
    clearHistory,
    removeFromHistory,
  };
}
