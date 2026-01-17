import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useSeriesInteractions(seriesId: string | undefined) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch counts and user state
  useEffect(() => {
    if (!seriesId) return;

    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch total counts
        const [likesResult, savedResult] = await Promise.all([
          supabase
            .from("series_likes")
            .select("id", { count: "exact", head: true })
            .eq("series_id", seriesId),
          supabase
            .from("saved_series")
            .select("id", { count: "exact", head: true })
            .eq("series_id", seriesId),
        ]);

        setLikesCount(likesResult.count || 0);
        setSavedCount(savedResult.count || 0);

        // Check if current user has liked/saved
        if (user) {
          const [userLikeResult, userSavedResult] = await Promise.all([
            supabase
              .from("series_likes")
              .select("id")
              .eq("series_id", seriesId)
              .eq("user_id", user.id)
              .maybeSingle(),
            supabase
              .from("saved_series")
              .select("id")
              .eq("series_id", seriesId)
              .eq("user_id", user.id)
              .maybeSingle(),
          ]);

          setIsLiked(!!userLikeResult.data);
          setIsSaved(!!userSavedResult.data);
        }
      } catch (error) {
        console.error("Error fetching series interactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [seriesId, user]);

  const toggleLike = useCallback(async () => {
    if (!seriesId) return;
    
    if (!user) {
      toast.error("Bitte melde dich an, um Serien zu liken");
      return;
    }

    const wasLiked = isLiked;
    
    // Optimistic update
    setIsLiked(!wasLiked);
    setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);

    try {
      if (wasLiked) {
        const { error } = await supabase
          .from("series_likes")
          .delete()
          .eq("series_id", seriesId)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("series_likes")
          .insert({ series_id: seriesId, user_id: user.id });

        if (error) throw error;
      }
    } catch (error) {
      // Revert on error
      setIsLiked(wasLiked);
      setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
      console.error("Error toggling like:", error);
      toast.error("Fehler beim Liken");
    }
  }, [seriesId, user, isLiked]);

  const toggleSave = useCallback(async () => {
    if (!seriesId) return;
    
    if (!user) {
      toast.error("Bitte melde dich an, um Serien zu speichern");
      return;
    }

    const wasSaved = isSaved;
    
    // Optimistic update
    setIsSaved(!wasSaved);
    setSavedCount(prev => wasSaved ? prev - 1 : prev + 1);

    try {
      if (wasSaved) {
        const { error } = await supabase
          .from("saved_series")
          .delete()
          .eq("series_id", seriesId)
          .eq("user_id", user.id);

        if (error) throw error;
        toast.success("Serie entfernt");
      } else {
        const { error } = await supabase
          .from("saved_series")
          .insert({ series_id: seriesId, user_id: user.id });

        if (error) throw error;
        toast.success("Serie gespeichert");
      }
    } catch (error) {
      // Revert on error
      setIsSaved(wasSaved);
      setSavedCount(prev => wasSaved ? prev + 1 : prev - 1);
      console.error("Error toggling save:", error);
      toast.error("Fehler beim Speichern");
    }
  }, [seriesId, user, isSaved]);

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return {
    isLiked,
    isSaved,
    likesCount: formatCount(likesCount),
    savedCount: formatCount(savedCount),
    toggleLike,
    toggleSave,
    isLoading,
  };
}
