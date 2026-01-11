import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Comment {
  id: string;
  episodeId: string;
  userId: string;
  content: string;
  parentId: string | null;
  likesCount: number;
  createdAt: string;
  displayName: string | null;
  avatarUrl: string | null;
  isLiked: boolean;
  replies?: Comment[];
}

export function useComments(episodeId: string | undefined) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const fetchComments = useCallback(async () => {
    if (!episodeId) return;
    
    setIsLoading(true);
    try {
      // Fetch comments with user profiles
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select(`
          id,
          episode_id,
          user_id,
          content,
          parent_id,
          likes_count,
          created_at
        `)
        .eq("episode_id", episodeId)
        .order("created_at", { ascending: false });

      if (commentsError) throw commentsError;

      // Get unique user IDs
      const userIds = [...new Set(commentsData?.map(c => c.user_id) || [])];
      
      // Fetch profiles for these users
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const profilesMap = new Map(
        profilesData?.map(p => [p.user_id, p]) || []
      );

      // Fetch user's likes if authenticated
      let userLikes: Set<string> = new Set();
      if (user) {
        const { data: likesData } = await supabase
          .from("comment_likes")
          .select("comment_id")
          .eq("user_id", user.id);
        
        userLikes = new Set(likesData?.map(l => l.comment_id) || []);
      }

      // Transform comments
      const transformedComments: Comment[] = (commentsData || []).map(c => {
        const profile = profilesMap.get(c.user_id);
        return {
          id: c.id,
          episodeId: c.episode_id,
          userId: c.user_id,
          content: c.content,
          parentId: c.parent_id,
          likesCount: c.likes_count,
          createdAt: c.created_at,
          displayName: profile?.display_name || "Anonym",
          avatarUrl: profile?.avatar_url,
          isLiked: userLikes.has(c.id),
        };
      });

      // Organize into parent comments with replies
      const parentComments = transformedComments.filter(c => !c.parentId);
      const replies = transformedComments.filter(c => c.parentId);
      
      parentComments.forEach(parent => {
        parent.replies = replies.filter(r => r.parentId === parent.id);
      });

      setComments(parentComments);
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setIsLoading(false);
    }
  }, [episodeId, user]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (content: string, parentId?: string) => {
    if (!user || !episodeId) {
      toast.error("Bitte melde dich an, um zu kommentieren");
      return false;
    }

    const trimmedContent = content.trim();
    if (!trimmedContent || trimmedContent.length > 500) {
      toast.error("Kommentar muss zwischen 1 und 500 Zeichen sein");
      return false;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("comments")
        .insert({
          episode_id: episodeId,
          user_id: user.id,
          content: trimmedContent,
          parent_id: parentId || null,
        });

      if (error) throw error;
      
      await fetchComments();
      return true;
    } catch (err) {
      console.error("Error adding comment:", err);
      toast.error("Kommentar konnte nicht gesendet werden");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLike = async (commentId: string) => {
    if (!user) {
      toast.error("Bitte melde dich an");
      return;
    }

    const comment = comments.find(c => c.id === commentId) || 
                    comments.flatMap(c => c.replies || []).find(c => c.id === commentId);
    
    if (!comment) return;

    try {
      if (comment.isLiked) {
        await supabase
          .from("comment_likes")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("comment_likes")
          .insert({ comment_id: commentId, user_id: user.id });
      }

      // Optimistic update
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            isLiked: !c.isLiked,
            likesCount: c.isLiked ? c.likesCount - 1 : c.likesCount + 1,
          };
        }
        if (c.replies) {
          c.replies = c.replies.map(r => {
            if (r.id === commentId) {
              return {
                ...r,
                isLiked: !r.isLiked,
                likesCount: r.isLiked ? r.likesCount - 1 : r.likesCount + 1,
              };
            }
            return r;
          });
        }
        return c;
      }));
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user.id);

      if (error) throw error;
      
      await fetchComments();
      toast.success("Kommentar gelöscht");
    } catch (err) {
      console.error("Error deleting comment:", err);
      toast.error("Fehler beim Löschen");
    }
  };

  return {
    comments,
    isLoading,
    isSubmitting,
    addComment,
    toggleLike,
    deleteComment,
    refetch: fetchComments,
    totalCount: comments.length + comments.reduce((acc, c) => acc + (c.replies?.length || 0), 0),
  };
}
