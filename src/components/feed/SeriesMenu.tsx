import { useState } from "react";
import { X, ChevronRight, Play, Home, User, Briefcase, CreditCard, LogIn, LogOut, FileText, Shield, Scale, Film } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { mockSeries, Series, Episode } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { useProducerApplication } from "@/hooks/useProducerApplication";

const baseNavItems = [
  { icon: Home, label: "Feed", path: "/" },
  { icon: Film, label: "Serien", path: "/soaps" },
  { icon: User, label: "Profil", path: "/profile" },
  
];

const legalItems = [
  { icon: FileText, label: "Impressum", path: "/impressum" },
  { icon: Shield, label: "Datenschutz", path: "/datenschutz" },
  { icon: Scale, label: "AGB", path: "/agb" },
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
  const { user, signOut } = useAuth();
  const { isProducer } = useProducerApplication();

  // Build nav items dynamically based on producer status
  const navItems = [
    ...baseNavItems,
    ...(isProducer ? [{ icon: Briefcase, label: "Studio", path: "/studio" }] : []),
  ];

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
            // Main menu with navigation
            <div className="p-4">
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

                {/* Auth Link */}
                {user ? (
                  <button
                    onClick={() => {
                      signOut();
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  >
                    <LogOut className="w-5 h-5" strokeWidth={1.5} />
                    <span className="text-sm font-medium">Abmelden</span>
                  </button>
                ) : (
                  <Link
                    to="/auth"
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                      location.pathname === "/auth"
                        ? "bg-gold/20 text-gold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <LogIn className="w-5 h-5" strokeWidth={location.pathname === "/auth" ? 2 : 1.5} />
                    <span className="text-sm font-medium">Anmelden</span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Legal Links - Fixed at bottom */}
        {!selectedSeries && (
          <div className="border-t border-border/30 p-4">
            <div className="space-y-3">
              {legalItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
