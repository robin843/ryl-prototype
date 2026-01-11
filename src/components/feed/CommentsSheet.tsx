import { useState } from "react";
import { Heart, Send, X, Trash2, MessageCircle } from "lucide-react";
import { useComments, Comment } from "@/hooks/useComments";
import { useAuth } from "@/contexts/AuthContext";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface CommentsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  episodeId: string;
}

function CommentItem({ 
  comment, 
  onLike, 
  onDelete, 
  onReply,
  currentUserId,
  isReply = false,
}: { 
  comment: Comment; 
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
  onReply: (id: string) => void;
  currentUserId?: string;
  isReply?: boolean;
}) {
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { 
    addSuffix: true,
    locale: de,
  });

  return (
    <div className={cn("flex gap-3", isReply && "ml-10")}>
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0 overflow-hidden">
        {comment.avatarUrl ? (
          <img src={comment.avatarUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs font-medium text-muted-foreground">
            {comment.displayName?.[0]?.toUpperCase() || "A"}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{comment.displayName}</span>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
        
        <p className="text-sm text-foreground/90 mt-0.5 break-words">{comment.content}</p>
        
        <div className="flex items-center gap-4 mt-2">
          {/* Like */}
          <button 
            onClick={() => onLike(comment.id)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Heart 
              className={cn("w-3.5 h-3.5", comment.isLiked && "fill-red-500 text-red-500")} 
            />
            {comment.likesCount > 0 && <span>{comment.likesCount}</span>}
          </button>
          
          {/* Reply (only for parent comments) */}
          {!isReply && (
            <button 
              onClick={() => onReply(comment.id)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Antworten</span>
            </button>
          )}

          {/* Delete (own comments only) */}
          {currentUserId === comment.userId && (
            <button 
              onClick={() => onDelete(comment.id)}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onLike={onLike}
                onDelete={onDelete}
                onReply={onReply}
                currentUserId={currentUserId}
                isReply
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function CommentsSheet({ isOpen, onClose, episodeId }: CommentsSheetProps) {
  const { comments, isLoading, isSubmitting, addComment, toggleLike, deleteComment, totalCount } = useComments(episodeId);
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const success = await addComment(newComment, replyingTo || undefined);
    if (success) {
      setNewComment("");
      setReplyingTo(null);
    }
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
    // Focus input would go here
  };

  const replyingToComment = replyingTo 
    ? comments.find(c => c.id === replyingTo) 
    : null;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[80vh] bg-card/98 backdrop-blur-xl border-t border-border/50">
        <DrawerHeader className="relative pb-2 border-b border-border/30">
          <DrawerClose className="absolute right-4 top-4 w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
            <X className="w-4 h-4" />
          </DrawerClose>
          <DrawerTitle className="text-lg font-semibold">
            {totalCount > 0 ? `${totalCount} Kommentare` : "Kommentare"}
          </DrawerTitle>
        </DrawerHeader>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ maxHeight: "calc(80vh - 140px)" }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Noch keine Kommentare</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Sei der Erste!</p>
            </div>
          ) : (
            comments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onLike={toggleLike}
                onDelete={deleteComment}
                onReply={handleReply}
                currentUserId={user?.id}
              />
            ))
          )}
        </div>

        {/* Reply indicator */}
        {replyingToComment && (
          <div className="px-4 py-2 bg-muted/30 border-t border-border/30 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Antwort an <span className="font-medium text-foreground">{replyingToComment.displayName}</span>
            </span>
            <button 
              onClick={() => setReplyingTo(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input */}
        <form 
          onSubmit={handleSubmit}
          className="px-4 py-3 border-t border-border/30 bg-card/50"
        >
          {user ? (
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={replyingTo ? "Antwort schreiben..." : "Kommentar schreiben..."}
                maxLength={500}
                className="flex-1 bg-muted/50 border border-border/50 rounded-full px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-gold/50"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                  newComment.trim() 
                    ? "bg-gold text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-2">
              <a href="/auth" className="text-gold hover:underline">Anmelden</a> um zu kommentieren
            </p>
          )}
        </form>
      </DrawerContent>
    </Drawer>
  );
}
