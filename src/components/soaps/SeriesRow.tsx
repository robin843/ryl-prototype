import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play, Film } from "lucide-react";
import { cn } from "@/lib/utils";

interface Series {
  id: string;
  title: string;
  description: string | null;
  genre: string | null;
  coverUrl: string | null;
  episodeCount: number;
  totalViews: number;
}

interface SeriesRowProps {
  title: string;
  series: Series[];
}

export function SeriesRow({ title, series }: SeriesRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (series.length === 0) return null;

  return (
    <section className="mb-8">
      {/* Category Title */}
      <h2 className="text-headline text-lg px-4 mb-3">{title}</h2>

      {/* Scrollable Row */}
      <div className="relative group">
        {/* Left Arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-full bg-gradient-to-r from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>

        {/* Series Cards */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-4 scroll-smooth snap-x snap-mandatory"
        >
          {series.map((s, index) => (
            <Link
              key={s.id}
              to={`/series/${s.id}`}
              className="flex-shrink-0 snap-start group/card animate-fade-in"
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <div className="relative w-32 sm:w-36 md:w-40 aspect-[2/3] rounded-lg overflow-hidden bg-muted">
                {s.coverUrl ? (
                  <img
                    src={s.coverUrl}
                    alt={s.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Film className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/90 mb-2 mx-auto">
                    <Play className="w-4 h-4 text-black ml-0.5" fill="currentColor" />
                  </div>
                  <p className="text-[10px] text-white/80 text-center line-clamp-2">
                    {s.description || "Jetzt ansehen"}
                  </p>
                </div>

                {/* Episode Count Badge */}
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm">
                  <span className="text-[10px] text-white font-medium">
                    {s.episodeCount} Ep.
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-body text-sm mt-2 line-clamp-1 w-32 sm:w-36 md:w-40">
                {s.title}
              </h3>
            </Link>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-full bg-gradient-to-l from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        >
          <ChevronRight className="w-6 h-6 text-foreground" />
        </button>
      </div>
    </section>
  );
}
