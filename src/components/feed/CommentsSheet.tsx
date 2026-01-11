import { useState, useEffect } from "react";
import { X, Send, Heart, Loader2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  likesCount: number;
  userName?: string;
  userAvatar?: string;
  isLiked?: boolean;
}

interface CommentsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  episodeId: string;
  commentCount: number;
}

export function CommentsSheet({ isOpen, onClose, episodeId, commentCount }: CommentsSheetProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());

  // Fetch comments when sheet opens
  useEffect(() => {
    if (isOpen && episodeId) {
      fetchComments();
      if (user) {
        fetchUserLikes();
      }
    }
  }, [isOpen, episodeId, user]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("id, content, created_at, user_id, likes_count")
        .eq("episode_id", episodeId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user profiles for comments
      const userIds = [...new Set(data?.map(c => c.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      setComments((data || []).map(c => {
        const profile = profileMap.get(c.user_id);
        return {
          id: c.id,
          content: c.content,
          createdAt: c.created_at,
          userId: c.user_id,
          likesCount: c.likes_count,
          userName: profile?.display_name || "Anonym",
          userAvatar: profile?.avatar_url,
        };
      }));
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserLikes = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("comment_likes")
        .select("comment_id")
        .eq("user_id", user.id);
      
      setUserLikes(new Set(data?.map(l => l.comment_id) || []));
    } catch (err) {
      console.error("Error fetching likes:", err);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Bitte melde dich an, um zu kommentieren");
      return;
    }
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("comments")
        .insert({
          episode_id: episodeId,
          user_id: user.id,
          content: newComment.trim(),
        });

      if (error) throw error;

      setNewComment("");
      fetchComments();
      toast.success("Kommentar gepostet!");
    } catch (err) {
      console.error("Error posting comment:", err);
      toast.error("Fehler beim Posten");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!user) {
      toast.error("Bitte melde dich an");
      return;
    }

    const isLiked = userLikes.has(commentId);
    
    try {
      if (isLiked) {
        await supabase
          .from("comment_likes")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", user.id);
        
        setUserLikes(prev => {
          const next = new Set(prev);
          next.delete(commentId);
          return next;
        });
        
        setComments(prev => prev.map(c => 
          c.id === commentId ? { ...c, likesCount: c.likesCount - 1 } : c
        ));
      } else {
        await supabase
          .from("comment_likes")
          .insert({ comment_id: commentId, user_id: user.id });
        
        setUserLikes(prev => new Set([...prev, commentId]));
        
        setComments(prev => prev.map(c => 
          c.id === commentId ? { ...c, likesCount: c.likesCount + 1 } : c
        ));
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Jetzt";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString("de-DE", { day: "numeric", month: "short" });
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sheet */}
      <div 
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 bg-card rounded-t-3xl transition-transform duration-300 ease-out",
          "max-h-[75vh] flex flex-col",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-gold/10">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-gold" />
            <h2 className="text-lg font-semibold">{commentCount} Kommentare</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gold" />
            </div>
          ) : comments.length === 0 ? (
            <div className="py-12 text-center">
              <MessageCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Noch keine Kommentare</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Sei der Erste!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center flex-shrink-0">
                  {comment.userAvatar ? (
                    <img src={comment.userAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-xs font-medium text-gold">
                      {comment.userName?.charAt(0).toUpperCase() || "A"}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{comment.userName}</span>
                    <span className="text-xs text-muted-foreground">{formatTime(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-foreground/90 mt-0.5">{comment.content}</p>
                  <button 
                    onClick={() => handleLike(comment.id)}
                    className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground hover:text-gold transition-colors"
                  >
                    <Heart 
                      className={cn(
                        "w-3.5 h-3.5",
                        userLikes.has(comment.id) && "fill-gold text-gold"
                      )} 
                    />
                    {comment.likesCount > 0 && <span>{comment.likesCount}</span>}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="px-5 py-4 border-t border-gold/10 bg-card safe-area-bottom">
          <div className="flex gap-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={user ? "Schreibe einen Kommentar..." : "Melde dich an, um zu kommentieren"}
              disabled={!user || isSubmitting}
              className="flex-1 min-h-[44px] max-h-[120px] resize-none bg-muted/50 border-gold/10 focus:border-gold/30"
              rows={1}
            />
            <Button
              onClick={handleSubmit}
              disabled={!user || !newComment.trim() || isSubmitting}
              size="icon"
              className="flex-shrink-0 bg-gold hover:bg-gold/90 text-primary-foreground"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
