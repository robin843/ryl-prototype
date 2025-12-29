import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, ShoppingBag, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { getAllEpisodes, Episode, mockHotspots } from "@/data/mockData";
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
      const timer = setTimeout(() => setShowHotspot(true), 2000);
      return () => clearTimeout(timer);
    } else {
      setIsPlaying(false);
      setShowHotspot(false);
    }
  }, [isActive]);

  const hotspot = mockHotspots[0];

  return (
    <div className="relative h-full w-full snap-start snap-always flex-shrink-0">
      {/* Background Image */}
      <img
        src={episode.thumbnailUrl}
        alt={episode.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/80" />

      {/* Shopable Hotspot */}
      {showHotspot && (
        <button
          className={cn(
            "absolute z-20 hotspot-pulse",
            "w-12 h-12 rounded-full",
            "bg-gold/20 backdrop-blur-sm border border-gold/40",
            "flex items-center justify-center",
            "transition-all duration-500 hover:scale-110 hover:bg-gold/30",
            "animate-fade-in"
          )}
          style={{ left: "60%", top: "35%" }}
        >
          <ShoppingBag className="w-5 h-5 text-gold" />
        </button>
      )}

      {/* Right side actions */}
      <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="w-10 h-10 rounded-full bg-background/30 backdrop-blur-sm flex items-center justify-center"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-10 h-10 rounded-full bg-background/30 backdrop-blur-sm flex items-center justify-center"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>
      </div>

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-0 p-4 pb-24">
        <Link to={`/series/${episode.seriesId}`} className="block">
          <span className="text-caption text-gold">{episode.seriesTitle}</span>
          <h2 className="text-title text-lg mt-1">
            Episode {episode.episodeNumber}: {episode.title}
          </h2>
          <p className="text-body text-foreground/70 line-clamp-2 mt-1 max-w-[80%]">
            {episode.description}
          </p>
        </Link>

        {/* Progress indicator */}
        <div className="mt-4 h-0.5 bg-foreground/20 rounded-full overflow-hidden max-w-[70%]">
          <div
            className={cn(
              "h-full bg-gold rounded-full transition-all duration-1000",
              isPlaying && "animate-pulse"
            )}
            style={{ width: isActive ? "35%" : "0%" }}
          />
        </div>
      </div>

      {/* Swipe hint */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-foreground/30 animate-pulse">
        <ChevronUp className="w-5 h-5" />
        <span className="text-[10px] uppercase tracking-widest">Swipe</span>
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
        style={{ scrollSnapType: "y mandatory" }}
      >
        {episodes.map((episode, index) => (
          <div key={episode.id} className="h-screen w-full">
            <FeedItem episode={episode} isActive={index === activeIndex} />
          </div>
        ))}

        {/* Empty state for end of feed */}
        <div className="h-screen w-full flex items-center justify-center bg-background snap-start">
          <div className="text-center px-8 pb-20">
            <p className="text-headline text-lg mb-2">Premium Stories kommen bald.</p>
            <p className="text-body text-muted-foreground">
              Entdecke unsere Serien-Kollektion.
            </p>
            <Link
              to="/soaps"
              className="inline-block mt-6 px-6 py-3 rounded-lg bg-gold text-primary-foreground font-medium"
            >
              Serien entdecken
            </Link>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
};

export default Index;
