import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Play, Trash2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWatchHistory, WatchHistoryItem } from "@/hooks/useWatchHistory";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function WatchHistorySection() {
  const navigate = useNavigate();
  const { groupedHistory, isLoading, clearHistory, removeFromHistory } = useWatchHistory();
  const [clearLoading, setClearLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleClearHistory = async () => {
    setClearLoading(true);
    try {
      await clearHistory.mutateAsync();
      toast.success("Verlauf gelöscht");
    } catch (error) {
      toast.error("Fehler beim Löschen des Verlaufs");
    } finally {
      setClearLoading(false);
    }
  };

  const handleRemoveItem = async (id: string) => {
    setRemovingId(id);
    try {
      await removeFromHistory.mutateAsync(id);
    } catch (error) {
      toast.error("Fehler beim Entfernen");
    } finally {
      setRemovingId(null);
    }
  };

  const handlePlayEpisode = (episodeId: string) => {
    navigate(`/watch/${episodeId}`);
  };

  const historyDates = Object.keys(groupedHistory);
  const hasHistory = historyDates.length > 0;

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-gold" />
          <h2 className="text-headline text-lg">Verlauf</h2>
        </div>
        <div className="p-8 rounded-2xl bg-card border border-border flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gold" />
          <h2 className="text-headline text-lg">Verlauf</h2>
        </div>
        
        {hasHistory && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Trash2 className="w-4 h-4 mr-1" />
                Löschen
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle>Verlauf löschen?</AlertDialogTitle>
                <AlertDialogDescription>
                  Dein gesamter Wiedergabeverlauf wird gelöscht. 
                  Diese Aktion kann nicht rückgängig gemacht werden.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearHistory}
                  disabled={clearLoading}
                  className="bg-red-500 hover:bg-red-600"
                >
                  {clearLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Verlauf löschen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        {!hasHistory ? (
          <div className="p-8 text-center">
            <Clock className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              Noch keine Videos angesehen
            </p>
            <p className="text-muted-foreground/60 text-xs mt-1">
              Deine geschauten Videos erscheinen hier
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {historyDates.map((date) => (
              <div key={date}>
                <div className="px-4 py-2 bg-muted/30">
                  <p className="text-xs text-muted-foreground font-medium">{date}</p>
                </div>
                <div className="divide-y divide-border/50">
                  {groupedHistory[date].map((item) => (
                    <WatchHistoryItemRow
                      key={item.id}
                      item={item}
                      onPlay={() => handlePlayEpisode(item.episode_id)}
                      onRemove={() => handleRemoveItem(item.id)}
                      isRemoving={removingId === item.id}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function WatchHistoryItemRow({
  item,
  onPlay,
  onRemove,
  isRemoving,
}: {
  item: WatchHistoryItem;
  onPlay: () => void;
  onRemove: () => void;
  isRemoving: boolean;
}) {
  const watchTime = new Date(item.watched_at).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex items-center gap-3 p-3 hover:bg-muted/20 transition-colors group">
      {/* Thumbnail */}
      <button
        onClick={onPlay}
        className="relative w-20 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 group/thumb"
      >
        {item.episode?.thumbnail_url ? (
          <img
            src={item.episode.thumbnail_url}
            alt={item.episode.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
            <Play className="w-4 h-4 text-gold" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
          <Play className="w-5 h-5 text-white fill-white" />
        </div>
        {item.completed && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gold" />
        )}
      </button>

      {/* Info */}
      <button onClick={onPlay} className="flex-1 text-left min-w-0">
        <p className="text-sm font-medium truncate">
          {item.episode?.title || "Episode"}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {item.episode?.series?.title}
          {item.episode?.episode_number && ` • Folge ${item.episode.episode_number}`}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-0.5">
          {watchTime}
        </p>
      </button>

      {/* Remove button */}
      <button
        onClick={onRemove}
        disabled={isRemoving}
        className="p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
        aria-label="Aus Verlauf entfernen"
      >
        {isRemoving ? (
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        ) : (
          <X className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
    </div>
  );
}
