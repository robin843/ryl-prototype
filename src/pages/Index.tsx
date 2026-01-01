import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { getAllEpisodes, Episode } from "@/data/mockData";
import { BottomNav } from "@/components/layout/BottomNav";
import { cn } from "@/lib/utils";

interface FeedItemProps {
  episode: Episode;
  isActive: boolean;
}

function FeedItem({ episode, isActive }: FeedItemProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showHotspot, setShowHotspot] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsPlaying(true);
      const timer = setTimeout(() => setShowHotspot(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setIsPlaying(false);
      setShowHotspot(false);
    }
  }, [isActive]);

  return (
    <div className="relative h-full w-full">
      {/* Background Image */}
      <img
        src={episode.thumbnailUrl}
        alt={episode.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/90" />

      {/* Subtle Shopable Hotspot */}
      {showHotspot && (
        <button
          className={cn(
            "absolute z-20 hotspot-pulse",
            "w-11 h-11 rounded-full",
            "bg-foreground/10 backdrop-blur-sm border border-foreground/20",
            "flex items-center justify-center",
            "transition-all duration-500 hover:scale-110 hover:bg-foreground/20",
            "animate-fade-in"
          )}
          style={{ left: "62%", top: "38%" }}
        >
          <ShoppingBag className="w-4 h-4 text-foreground/80" />
        </button>
      )}

      {/* Right side controls */}
      <div className="absolute right-4 bottom-36 flex flex-col items-center gap-5">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="w-11 h-11 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center transition-colors hover:bg-background/30"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-foreground/80" />
          ) : (
            <Volume2 className="w-5 h-5 text-foreground/80" />
          )}
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-11 h-11 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center transition-colors hover:bg-background/30"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-foreground/80" />
          ) : (
            <Play className="w-5 h-5 text-foreground/80 ml-0.5" />
          )}
        </button>
      </div>

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-0 p-5 pb-28">
        <Link to={`/series/${episode.seriesId}`} className="block">
          <span className="text-caption text-gold">{episode.seriesTitle}</span>
          <h2 className="text-title text-lg mt-1.5">
            Episode {episode.episodeNumber}: {episode.title}
          </h2>
          <p className="text-body text-foreground/60 line-clamp-2 mt-2 max-w-[75%]">
            {episode.description}
          </p>
        </Link>

        {/* Progress bar */}
        <div className="mt-5 h-[3px] bg-foreground/15 rounded-full overflow-hidden max-w-[65%]">
          <div
            className={cn(
              "h-full bg-gold rounded-full transition-all duration-[3000ms] ease-linear",
              isPlaying && isActive ? "w-full" : "w-0"
            )}
          />
        </div>
      </div>
    </div>
  );
}

const Index = () => {
  const episodes = getAllEpisodes();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const itemHeight = container.clientHeight;
      const newIndex = Math.round(scrollTop / itemHeight);
      setActiveIndex(newIndex);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      >
        {episodes.map((episode, index) => (
          <div key={episode.id} className="h-screen w-full snap-start snap-always">
            <FeedItem episode={episode} isActive={index === activeIndex} />
          </div>
        ))}

        {/* End of feed */}
        <div className="h-screen w-full flex items-center justify-center bg-background snap-start snap-always">
          <div className="text-center px-8 pb-24">
            <p className="text-headline text-lg mb-3">Premium Stories kommen bald.</p>
            <p className="text-body text-muted-foreground mb-8">
              Entdecke unsere Serien-Kollektion.
            </p>
            <Link
              to="/soaps"
              className="inline-block px-6 py-3 rounded-full bg-gold text-primary-foreground font-medium text-sm"
            >
              Alle Serien entdecken
            </Link>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
};

export default Index;
