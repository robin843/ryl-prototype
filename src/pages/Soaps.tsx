import { useState, useEffect, useMemo } from "react";
import { ChevronRight, Play, Film, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Series {
  id: string;
  title: string;
  description: string | null;
  genre: string | null;
  coverUrl: string | null;
  episodeCount: number;
  totalViews: number;
}

const GENRES = ["Alle", "Drama", "Romance", "Thriller", "Comedy", "Action"];

export default function Soaps() {
  const [series, setSeries] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Alle");

  useEffect(() => {
    async function fetchSeries() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('series')
          .select('id, title, description, genre, cover_url, episode_count, total_views')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setSeries((data || []).map((s: any) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          genre: s.genre,
          coverUrl: s.cover_url,
          episodeCount: s.episode_count || 0,
          totalViews: s.total_views || 0,
        })));
      } catch (err) {
        console.error('Error fetching series:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSeries();
  }, []);

  // Filter series based on search and genre
  const filteredSeries = useMemo(() => {
    return series.filter((s) => {
      const matchesSearch = searchQuery.trim() === "" || 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesGenre = selectedGenre === "Alle" || 
        s.genre?.toLowerCase() === selectedGenre.toLowerCase();
      
      return matchesSearch && matchesGenre;
    });
  }, [series, searchQuery, selectedGenre]);

  const featuredSeries = filteredSeries[0];

  return (
    <AppLayout>
      <div className="min-h-screen safe-area-top pb-24">
        {/* Header */}
        <header className="px-6 pt-4 pb-4">
          <h1 className="text-display text-3xl">
            <span className="text-gold">Serien</span>
          </h1>
          <p className="text-body text-muted-foreground mt-1">
            Premium Micro-Dramas entdecken
          </p>
        </header>

        {/* Search Bar */}
        <div className="px-6 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Serie suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 bg-card/50 border-border/30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Genre Filter */}
        <div className="px-6 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {GENRES.map((genre) => (
              <Button
                key={genre}
                variant={selectedGenre === genre ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGenre(genre)}
                className={`flex-shrink-0 rounded-full ${
                  selectedGenre === genre 
                    ? "bg-gold text-primary-foreground hover:bg-gold/90" 
                    : "bg-card/50 border-border/30 hover:bg-card"
                }`}
              >
                {genre}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="px-6 space-y-4">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        ) : filteredSeries.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Search className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-headline text-lg mb-2">Keine Ergebnisse</h2>
            <p className="text-body text-muted-foreground mb-6">
              Keine Serien gefunden für "{searchQuery || selectedGenre}".
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedGenre("Alle");
              }}
            >
              Filter zurücksetzen
            </Button>
          </div>
        ) : series.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Film className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-headline text-lg mb-2">Noch keine Serien</h2>
            <p className="text-body text-muted-foreground mb-6">
              Die ersten Creator arbeiten gerade an spannenden Inhalten.
            </p>
            <Link
              to="/studio"
              className="inline-block px-6 py-3 rounded-full bg-gold text-primary-foreground font-medium text-sm"
            >
              Werde Creator
            </Link>
          </div>
        ) : (
          <>
            {/* Featured Series */}
            {featuredSeries && (
              <section className="px-6 mb-8">
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden group">
                  {featuredSeries.coverUrl ? (
                    <img
                      src={featuredSeries.coverUrl}
                      alt={featuredSeries.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-muted flex items-center justify-center">
                      <Film className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <span className="text-caption text-gold">{featuredSeries.genre || 'Drama'}</span>
                    <h2 className="text-headline mt-1">{featuredSeries.title}</h2>
                    <p className="text-body text-foreground/70 line-clamp-2 mt-1 mb-3">
                      {featuredSeries.description}
                    </p>
                    <Link
                      to={`/series/${featuredSeries.id}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gold text-primary-foreground font-medium text-sm"
                    >
                      <Play className="w-4 h-4" fill="currentColor" />
                      Jetzt ansehen
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {/* All Series */}
            <section className="px-6 pb-8">
              <h2 className="text-headline text-lg mb-4">Alle Serien</h2>
              <div className="space-y-4">
                {series.map((s, index) => (
                  <Link
                    key={s.id}
                    to={`/series/${s.id}`}
                    className="flex gap-4 p-3 rounded-xl bg-card/50 hover:bg-card transition-all group animate-slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="relative w-20 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                      {s.coverUrl ? (
                        <img
                          src={s.coverUrl}
                          alt={s.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="w-6 h-6 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/40">
                        <Play className="w-6 h-6 text-foreground" fill="currentColor" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <span className="text-caption text-gold">{s.genre || 'Drama'}</span>
                      <h3 className="text-title mt-0.5 mb-1">{s.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {s.description}
                      </p>
                      <span className="text-xs text-muted-foreground mt-2">
                        {s.episodeCount} Episoden
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground self-center group-hover:text-foreground transition-colors" />
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </AppLayout>
  );
}