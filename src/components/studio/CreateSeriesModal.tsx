import { useState, useEffect } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface CreateSeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string, genre: string) => Promise<void>;
  isLoading?: boolean;
}

const GENRES = [
  "Drama",
  "Comedy",
  "Romance",
  "Thriller",
  "Mystery",
  "Fashion",
  "Lifestyle",
  "Documentary",
  "Action",
  "Sci-Fi",
];

export function CreateSeriesModal({ isOpen, onClose, onSubmit, isLoading }: CreateSeriesModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalOverscrollBehavior = document.body.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overscrollBehavior = originalOverscrollBehavior;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onSubmit(title, description, genre);
    setTitle("");
    setDescription("");
    setGenre("");
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
        "fixed inset-x-3 z-50 mx-auto sm:inset-x-4",
        "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        "w-[calc(100%-1.5rem)] max-w-lg max-h-[calc(100dvh-2rem)]",
        "bg-card rounded-2xl border border-border",
        "shadow-2xl animate-scale-in overflow-hidden flex flex-col"
      )}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-headline">Neue Serie erstellen</h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
          <div className="p-6 space-y-4 overflow-y-auto overscroll-contain touch-pan-y flex-1 min-h-0">
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Titel *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z.B. The Last Light"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Beschreibung
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Worum geht es in deiner Serie?"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Genre
              </label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGenre(g)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm transition-colors",
                      genre === g
                        ? "bg-gold text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 pt-4 flex gap-3 border-t border-border bg-card">
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
