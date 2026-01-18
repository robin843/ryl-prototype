import { useState, useEffect } from "react";
import { X, Send, Heart, Loader2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRequireAuth } from "@/contexts/AuthModalContext";
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
  const { requireAuth } = useRequireAuth();
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
    // Use AuthModal instead of toast
    if (!requireAuth({ type: 'comment', episodeId })) {
      return; // Modal shown
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
    // Use AuthModal for likes too
    if (!requireAuth({ type: 'like', episodeId })) {
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
          "fixed inset-0 z-40 bg-black/70 backdrop-blur-md transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sheet */}
      <div 
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 bg-gradient-to-b from-card via-card to-card/95 rounded-t-[2rem] transition-transform duration-300 ease-out shadow-2xl",
          "max-h-[80vh] flex flex-col border-t border-gold/20",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Handle */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-12 h-1.5 rounded-full bg-gold/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4 border-b border-gold/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center border border-gold/30">
              <MessageCircle className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-gold">Kommentare</h2>
              <p className="text-xs text-muted-foreground"><span className="text-gold">{commentCount}</span> Beiträge</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gold/10 hover:bg-gold/20 border border-gold/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gold" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-gold" />
              </div>
              <p className="text-sm text-muted-foreground">Lade Kommentare...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold/10 to-gold/5 mx-auto mb-4 flex items-center justify-center border border-gold/10">
                <MessageCircle className="w-8 h-8 text-gold/40" />
              </div>
              <p className="font-medium text-foreground/80">Noch keine Kommentare</p>
              <p className="text-sm text-muted-foreground mt-1">Starte die Diskussion!</p>
            </div>
          ) : (
            comments.map((comment, index) => (
              <div 
                key={comment.id} 
                className={cn(
                  "flex gap-3 p-4 rounded-2xl bg-muted/30 border border-border/50 transition-all hover:border-gold/20 hover:bg-muted/50",
                  index === 0 && "border-gold/20 bg-gold/5"
                )}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 border-2 border-gold/30 flex items-center justify-center flex-shrink-0 shadow-sm">
                  {comment.userAvatar ? (
                    <img src={comment.userAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-gold">
                      {comment.userName?.charAt(0).toUpperCase() || "A"}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{comment.userName}</span>
                      {index === 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-medium bg-gold/20 text-gold rounded-full">
                          Neu
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground font-medium">{formatTime(comment.createdAt)}</span>
                  </div>
                  
                  <p className="text-sm text-foreground/90 mt-1.5 leading-relaxed">{comment.content}</p>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-4 mt-3">
                    <button 
                      onClick={() => handleLike(comment.id)}
                      className={cn(
                        "flex items-center gap-1.5 text-xs font-medium transition-all",
                        userLikes.has(comment.id) 
                          ? "text-gold" 
                          : "text-muted-foreground hover:text-gold"
                      )}
                    >
                      <Heart 
                        className={cn(
                          "w-4 h-4 transition-transform",
                          userLikes.has(comment.id) && "fill-gold scale-110"
                        )} 
                      />
                      <span>{comment.likesCount > 0 ? comment.likesCount : "Gefällt mir"}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="px-4 sm:px-6 py-5 mx-2 mb-3 border border-gold/20 rounded-2xl bg-card/80 backdrop-blur-sm safe-area-bottom">
          <div className="flex gap-3 items-end">
            {/* User Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-gold">
                {user?.email?.charAt(0).toUpperCase() || "?"}
              </span>
            </div>
            
            <div className="flex-1 relative">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={user ? "Schreibe einen Kommentar..." : "Melde dich an, um zu kommentieren"}
                disabled={!user || isSubmitting}
                className="min-h-[56px] max-h-[140px] resize-none bg-muted/50 border-gold/20 focus:border-gold/50 focus:ring-1 focus:ring-gold/30 rounded-2xl pr-14 text-sm py-4"
                rows={2}
              />
              <Button
                onClick={handleSubmit}
                disabled={!user || !newComment.trim() || isSubmitting}
                size="icon"
                className="absolute right-2 bottom-2 h-8 w-8 bg-gold hover:bg-gold/90 text-black rounded-full shadow-lg disabled:opacity-40"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
