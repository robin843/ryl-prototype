import { useState } from "react";
import { X, ChevronRight, Play, Home, Film, User, Briefcase, CreditCard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { mockSeries, Series, Episode } from "@/data/mockData";

const navItems = [
  { icon: Home, label: "Feed", path: "/" },
  { icon: Film, label: "Serien", path: "/soaps" },
  { icon: CreditCard, label: "Preise", path: "/pricing" },
  { icon: User, label: "Profil", path: "/profile" },
  { icon: Briefcase, label: "Studio", path: "/studio" },
];

interface SeriesMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEpisode: (episodeIndex: number) => void;
  currentEpisodeId?: string;
}

export function SeriesMenu({ isOpen, onClose, onSelectEpisode, currentEpisodeId }: SeriesMenuProps) {
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const location = useLocation();

  // Find which series the current episode belongs to
  const currentSeries = mockSeries.find(s => 
    s.episodes.some(ep => ep.id === currentEpisodeId)
  );

  // Get all episodes for finding index
  const allEpisodes = mockSeries.flatMap(s => s.episodes);

  const handleSeriesClick = (series: Series) => {
    setSelectedSeries(series);
  };

  const handleEpisodeClick = (episode: Episode) => {
    const index = allEpisodes.findIndex(ep => ep.id === episode.id);
    if (index !== -1) {
      onSelectEpisode(index);
      onClose();
      setSelectedSeries(null);
    }
  };

  const handleBack = () => {
    setSelectedSeries(null);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/60 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw]",
          "bg-card/95 backdrop-blur-xl border-l border-border/50",
          "transition-transform duration-300 ease-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/30">
          {selectedSeries ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Zurück
            </button>
          ) : (
            <span className="text-sm font-medium">Menü</span>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {selectedSeries ? (
            // Episodes list
            <div className="p-4 space-y-2">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">{selectedSeries.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{selectedSeries.genre}</p>
              </div>
              
              {selectedSeries.episodes.map((episode) => {
                const isCurrentEpisode = episode.id === currentEpisodeId;
                
                return (
                  <button
                    key={episode.id}
                    onClick={() => handleEpisodeClick(episode)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left group",
                      isCurrentEpisode 
                        ? "bg-gold/20 border border-gold/30" 
                        : "bg-muted/30 hover:bg-muted/50"
                    )}
                  >
                    {/* Episode thumbnail */}
                    <div className="relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={episode.thumbnailUrl} 
                        alt={episode.title}
                        className="w-full h-full object-cover"
                      />
                      {isCurrentEpisode && (
                        <div className="absolute inset-0 bg-gold/30 flex items-center justify-center">
                          <Play className="w-4 h-4 text-white fill-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* Episode info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Episode {episode.episodeNumber}</p>
                      <p className={cn(
                        "text-sm font-medium truncate",
                        isCurrentEpisode && "text-gold"
                      )}>
                        {episode.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{episode.duration}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            // Main menu with navigation and series
            <div className="p-4 space-y-6">
              {/* Navigation Links */}
              <div className="space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                        isActive
                          ? "bg-gold/20 text-gold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <item.icon
                        className="w-5 h-5"
                        strokeWidth={isActive ? 2 : 1.5}
                      />
                      <span className="text-sm font-medium">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="border-t border-border/30" />

              {/* Series Section */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 px-1">Serien</p>
                <div className="space-y-2">
                  {mockSeries.map((series) => {
                    const isCurrentSeries = series.id === currentSeries?.id;
                    
                    return (
                      <button
                        key={series.id}
                        onClick={() => handleSeriesClick(series)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left group",
                          isCurrentSeries 
                            ? "bg-gold/10 border border-gold/20" 
                            : "bg-muted/30 hover:bg-muted/50"
                        )}
                      >
                        {/* Series cover */}
                        <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={series.coverUrl} 
                            alt={series.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Series info */}
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm font-medium truncate",
                            isCurrentSeries && "text-gold"
                          )}>
                            {series.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{series.genre}</p>
                          <p className="text-xs text-muted-foreground">{series.episodeCount} Episoden</p>
                        </div>
                        
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 group-hover:text-foreground transition-colors" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
