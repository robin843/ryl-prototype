import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Episode, ProductHotspot, mockHotspots } from "@/data/mockData";
import { ProductPanel } from "./ProductPanel";
import { RylHotspot } from "./RylHotspot";
import { useRylSound } from "@/hooks/useRylSound";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  episode: Episode;
}

export function VideoPlayer({ episode }: VideoPlayerProps) {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState<ProductHotspot | null>(null);
  const [visibleHotspots, setVisibleHotspots] = useState<ProductHotspot[]>([]);
  const [newHotspotIds, setNewHotspotIds] = useState<Set<string>>(new Set());
  const prevVisibleIds = useRef<Set<string>>(new Set());
  
  const { playPing, resetPlayed } = useRylSound();

  // Simulate video progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 0.5;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Show/hide hotspots based on progress + play Ryl-Ping for new hotspots
  useEffect(() => {
    const currentTime = (progress / 100) * 180; // Assuming 3 min video
    const visible = mockHotspots.filter(
      (h) => Math.abs(h.timestamp - currentTime) < 20
    );
    
    // Check for newly visible hotspots
    const currentIds = new Set(visible.map(h => h.id));
    const newIds = new Set<string>();
    
    visible.forEach(h => {
      if (!prevVisibleIds.current.has(h.id)) {
        newIds.add(h.id);
        // Play the Ryl-Ping sound for new hotspots (only if not muted)
        if (!isMuted) {
          playPing(h.id);
        }
      }
    });
    
    if (newIds.size > 0) {
      setNewHotspotIds(prev => new Set([...prev, ...newIds]));
    }
    
    prevVisibleIds.current = currentIds;
    setVisibleHotspots(visible);
  }, [progress, isMuted, playPing]);

  // Reset played sounds when video restarts
  useEffect(() => {
    if (progress === 0) {
      resetPlayed();
      setNewHotspotIds(new Set());
      prevVisibleIds.current = new Set();
    }
  }, [progress, resetPlayed]);

  // Auto-hide controls
  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => setShowControls(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, showControls]);

  const handleTap = () => {
    setShowControls(true);
  };

  const handleHotspotClick = (hotspot: ProductHotspot) => {
    setSelectedHotspot(hotspot);
    setIsPlaying(false);
  };

  return (
    <div
      className={cn(
        "fixed inset-0 bg-background z-50 flex items-center justify-center",
        selectedHotspot && "ryl-freeze-frame"
      )}
      onClick={handleTap}
    >
      {/* Video placeholder with episode thumbnail */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal via-background to-charcoal">
        <img
          src={episode.thumbnailUrl}
          alt={episode.title}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-all duration-500",
            imageLoaded ? "opacity-60" : "opacity-0",
            selectedHotspot && "scale-[1.02] blur-[2px]"
          )}
          onLoad={() => setImageLoaded(true)}
        />
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/60",
          "transition-opacity duration-500",
          selectedHotspot && "opacity-50"
        )} />
      </div>

      {/* Shopable Hotspots - Glaserner Ripple-Effekt */}
      {visibleHotspots.map((hotspot) => (
        <RylHotspot
          key={hotspot.id}
          position={hotspot.position}
          onClick={() => handleHotspotClick(hotspot)}
          isNew={newHotspotIds.has(hotspot.id)}
        />
      ))}

      {/* Top overlay */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 p-4 pt-safe-area-top",
          "bg-gradient-to-b from-background/80 to-transparent",
          "transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="flex items-center gap-4">
          <Button
            variant="player"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              navigate(-1);
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-caption text-gold truncate">
              {episode.seriesTitle}
            </p>
            <h1 className="text-title truncate">
              Episode {episode.episodeNumber}: {episode.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Bottom overlay */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 p-4 pb-8",
          "bg-gradient-to-t from-background/80 to-transparent",
          "transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-1 bg-foreground/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground">
              {Math.floor((progress / 100) * 180 / 60)}:{String(Math.floor((progress / 100) * 180 % 60)).padStart(2, "0")}
            </span>
            <span className="text-xs text-muted-foreground">
              {episode.duration}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          <Button
            variant="player"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted(!isMuted);
            }}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>

          <Button
            variant="gold"
            size="icon-lg"
            onClick={(e) => {
              e.stopPropagation();
              setIsPlaying(!isPlaying);
            }}
            className="shadow-lg"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" fill="currentColor" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
            )}
          </Button>

          <div className="w-10" /> {/* Spacer for symmetry */}
        </div>
      </div>

      {/* Product Panel */}
      <ProductPanel
        hotspot={selectedHotspot}
        episodeId={episode.id}
        onClose={() => {
          setSelectedHotspot(null);
        }}
      />
    </div>
  );
}
