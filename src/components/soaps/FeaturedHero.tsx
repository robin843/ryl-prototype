import { Link } from "react-router-dom";
import { Play, Info, Film } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Series {
  id: string;
  title: string;
  description: string | null;
  genre: string | null;
  coverUrl: string | null;
  episodeCount: number;
}

interface FeaturedHeroProps {
  series: Series;
}

export function FeaturedHero({ series }: FeaturedHeroProps) {
  return (
    <section className="relative h-[45vh] min-h-[300px] max-h-[380px] mb-8">
      {/* Background Image - clickable */}
      <Link to={`/series/${series.id}`} className="absolute inset-0 block">
        {series.coverUrl ? (
          <img
            src={series.coverUrl}
            alt={series.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Film className="w-24 h-24 text-muted-foreground/20" />
          </div>
        )}
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
      </Link>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pb-10 pointer-events-none">
        <span className="text-caption text-gold mb-2 block">{series.genre || "Drama"}</span>
        <h1 className="text-display text-3xl sm:text-4xl md:text-5xl mb-3 max-w-lg">
          {series.title}
        </h1>
        <p className="text-body text-foreground/80 line-clamp-3 max-w-md mb-5">
          {series.description}
        </p>
        
        <div className="flex gap-3 pointer-events-auto">
          <Button asChild size="lg" className="bg-white text-black hover:bg-white/90 gap-2">
            <Link to={`/series/${series.id}`}>
              <Play className="w-5 h-5" fill="currentColor" />
              Abspielen
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 gap-2">
            <Link to={`/series/${series.id}`}>
              <Info className="w-5 h-5" />
              Mehr Infos
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
