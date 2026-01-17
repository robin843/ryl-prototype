import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface SavedSeries {
  id: string;
  seriesId: string;
  title: string;
  coverUrl: string | null;
  episodeCount: number;
  createdAt: string;
}

export function useSavedSeries() {
  const { user } = useAuth();
  const [savedSeries, setSavedSeries] = useState<SavedSeries[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const fetchSavedSeries = useCallback(async () => {
    if (!user) {
      setSavedSeries([]);
      setSavedIds(new Set());
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('saved_series')
        .select(`
          id,
          series_id,
          created_at,
          series!inner (
            id,
            title,
            cover_url,
            episode_count
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformed: SavedSeries[] = (data || []).map((item: any) => ({
        id: item.id,
        seriesId: item.series_id,
        title: item.series.title,
        coverUrl: item.series.cover_url,
        episodeCount: item.series.episode_count || 0,
        createdAt: item.created_at,
      }));

      setSavedSeries(transformed);
      setSavedIds(new Set(transformed.map(s => s.seriesId)));
    } catch (error) {
      console.error('Error fetching saved series:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSavedSeries();
  }, [fetchSavedSeries]);

  const saveSeries = async (seriesId: string) => {
    if (!user) {
      toast.error('Bitte melde dich an');
      return;
    }

    try {
      const { error } = await supabase
        .from('saved_series')
        .insert({ user_id: user.id, series_id: seriesId });

      if (error) throw error;
      
      toast.success('Serie gespeichert');
      await fetchSavedSeries();
    } catch (error) {
      console.error('Error saving series:', error);
      toast.error('Fehler beim Speichern');
    }
  };

  const unsaveSeries = async (seriesId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saved_series')
        .delete()
        .eq('user_id', user.id)
        .eq('series_id', seriesId);

      if (error) throw error;
      
      toast.success('Serie entfernt');
      await fetchSavedSeries();
    } catch (error) {
      console.error('Error unsaving series:', error);
      toast.error('Fehler beim Entfernen');
    }
  };

  const isSeriesSaved = (seriesId: string): boolean => {
    return savedIds.has(seriesId);
  };

  return {
    savedSeries,
    isLoading,
    saveSeries,
    unsaveSeries,
    isSeriesSaved,
    refetch: fetchSavedSeries,
  };
}
