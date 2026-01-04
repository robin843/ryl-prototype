import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface CreateEpisodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, episodeNumber: number, description: string) => Promise<void>;
  nextEpisodeNumber: number;
  isLoading?: boolean;
}

export function CreateEpisodeModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  nextEpisodeNumber,
  isLoading 
}: CreateEpisodeModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [episodeNumber, setEpisodeNumber] = useState(nextEpisodeNumber);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onSubmit(title, episodeNumber, description);
    setTitle("");
    setDescription("");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={cn(
        "fixed inset-x-4 top-1/2 -translate-y-1/2 z-50",
        "max-w-lg mx-auto",
        "bg-card rounded-2xl border border-border",
        "shadow-2xl animate-scale-in"
      )}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-headline">Neue Episode</h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Episode #
              </label>
              <Input
                type="number"
                min={1}
                value={episodeNumber}
                onChange={(e) => setEpisodeNumber(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Titel *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z.B. The First Frame"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">
              Beschreibung
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Worum geht es in dieser Episode?"
              rows={3}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Video und Thumbnail kannst du nach dem Erstellen hochladen.
          </p>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Abbrechen
            </Button>
            <Button type="submit" variant="premium" className="flex-1" disabled={isLoading || !title.trim()}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Erstellen"
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
