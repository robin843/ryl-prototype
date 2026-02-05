import { Button } from "@/components/ui/button";

interface GenreFilterProps {
  genres: string[];
  selectedGenre: string;
  onSelect: (genre: string) => void;
}

export function GenreFilter({ genres, selectedGenre, onSelect }: GenreFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 sm:px-6 pb-3">
      {genres.map((genre) => (
        <Button
          key={genre}
          variant={selectedGenre === genre ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect(genre)}
          className={`flex-shrink-0 rounded-full text-xs h-8 px-4 ${
            selectedGenre === genre 
              ? "bg-gold text-primary-foreground hover:bg-gold/90" 
              : "bg-card/60 border-border/40 hover:bg-card text-foreground/80"
          }`}
        >
          {genre}
        </Button>
      ))}
    </div>
  );
}
