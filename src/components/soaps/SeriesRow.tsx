import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play, Film } from "lucide-react";

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
    const scrollAmount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (series.length === 0) return null;

  return (
    <section className="mb-8">
      {/* Category Title */}
      <h2 className="text-headline text-base sm:text-lg font-medium px-5 sm:px-8 mb-3">{title}</h2>

      {/* Scrollable Row */}
      <div className="relative group">
        {/* Left Arrow - Desktop only */}
        <button
          onClick={() => scroll("left")}
          className="hidden sm:flex absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-background/95 to-transparent opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>

        {/* Series Cards */}
        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pl-5 sm:pl-8 pr-5 scroll-smooth snap-x snap-mandatory"
        >
          {series.map((s, index) => (
            <Link
              key={s.id}
              to={`/series/${s.id}`}
              className="flex-shrink-0 snap-start group/card"
              style={{ animationDelay: `${index * 0.02}s` }}
            >
              {/* Landscape Card - Netflix style */}
              <div className="relative w-[140px] sm:w-[180px] md:w-[220px] aspect-[16/9] rounded-md overflow-hidden bg-muted">
                {s.coverUrl ? (
                  <img
                    src={s.coverUrl}
                    alt={s.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <Film className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                )}
                
                {/* Bottom gradient with title */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                
                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <h3 className="text-white text-xs sm:text-sm font-medium line-clamp-1 drop-shadow-lg">
                    {s.title}
                  </h3>
                </div>

                {/* Hover Play Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity bg-black/20">
                  <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="w-5 h-5 text-black ml-0.5" fill="currentColor" />
                  </div>
                </div>

                {/* Episode Count Badge */}
                <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-sm bg-black/70 backdrop-blur-sm">
                  <span className="text-[9px] sm:text-[10px] text-white/90 font-medium">
                    {s.episodeCount} Ep.
                  </span>
                </div>
              </div>
            </Link>
          ))}
          {/* End spacer */}
          <div className="w-2 flex-shrink-0" />
        </div>

        {/* Right Arrow - Desktop only */}
        <button
          onClick={() => scroll("right")}
          className="hidden sm:flex absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-background/95 to-transparent opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center"
        >
          <ChevronRight className="w-6 h-6 text-foreground" />
        </button>
      </div>
    </section>
  );
}
