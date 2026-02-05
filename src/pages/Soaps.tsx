import { useState, useEffect, useMemo } from "react";
import { Search, X, Film } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { SeriesRow } from "@/components/soaps/SeriesRow";
import { GenreFilter } from "@/components/soaps/GenreFilter";

interface Series {
  id: string;
  title: string;
  description: string | null;
  genre: string | null;
  coverUrl: string | null;
  episodeCount: number;
  totalViews: number;
  categoryId: string | null;
}

interface Category {
  id: string;
  name: string;
  nameDe: string;
}

// Category display names (clean, no emojis)
const CATEGORY_LABELS: Record<string, string> = {
  "Drama": "Drama",
  "Comedy": "Comedy",
  "Reality": "Reality Shows",
  "Fashion": "Fashion & Style",
  "Beauty": "Beauty",
  "Lifestyle": "Lifestyle",
  "Kochen": "Kochen & Rezepte",
  "Fitness": "Fitness & Wellness",
  "Tech": "Tech & Gaming",
  "Musik": "Musik & Entertainment",
};

const GENRE_FILTERS = ["Alle", "Drama", "Comedy", "Reality", "Fashion", "Beauty", "Lifestyle", "Kochen", "Fitness", "Tech", "Musik"];

export default function Soaps() {
  const [series, setSeries] = useState<Series[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Alle");

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [categoriesRes, seriesRes] = await Promise.all([
          supabase
            .from('interest_categories')
            .select('id, name, name_de')
            .order('sort_order', { ascending: true }),
          supabase
            .from('series')
            .select('id, title, description, genre, cover_url, episode_count, total_views, category_id')
            .eq('status', 'published')
            .order('created_at', { ascending: false })
        ]);

        if (categoriesRes.error) throw categoriesRes.error;
        if (seriesRes.error) throw seriesRes.error;

        setCategories((categoriesRes.data || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          nameDe: c.name_de,
        })));

        setSeries((seriesRes.data || []).map((s: any) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          genre: s.genre,
          coverUrl: s.cover_url,
          episodeCount: s.episode_count || 0,
          totalViews: s.total_views || 0,
          categoryId: s.category_id,
        })));
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter series based on search and genre
  const filteredSeries = useMemo(() => {
    let result = series;
    
    // Genre filter
    if (selectedGenre !== "Alle") {
      result = result.filter((s) => {
        const matchesGenre = s.genre?.toLowerCase() === selectedGenre.toLowerCase();
        const matchesCategory = categories.find(c => c.id === s.categoryId)?.name.toLowerCase() === selectedGenre.toLowerCase();
        return matchesGenre || matchesCategory;
      });
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((s) =>
        s.title.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [series, searchQuery, selectedGenre, categories]);

  // Group series by category
  const seriesByCategory = useMemo(() => {
    const grouped: Record<string, Series[]> = {};
    
    categories.forEach(cat => {
      grouped[cat.id] = filteredSeries.filter(s => s.categoryId === cat.id);
    });

    return grouped;
  }, [filteredSeries, categories]);

  // Trending series
  const trendingSeries = useMemo(() => {
    return [...filteredSeries].sort((a, b) => b.totalViews - a.totalViews).slice(0, 15);
  }, [filteredSeries]);

  // New releases
  const newReleases = useMemo(() => {
    return filteredSeries.slice(0, 15);
  }, [filteredSeries]);

  const isSearching = searchQuery.trim().length > 0;
  const isFiltering = selectedGenre !== "Alle";

  return (
    <AppLayout>
      <div className="min-h-screen pb-24">
        {/* Header */}
        <header className="pt-4 pb-2 px-4 sm:px-6">
          <h1 className="text-display text-2xl sm:text-3xl">
            <span className="text-gold">Serien</span>
          </h1>
          <p className="text-body text-muted-foreground text-sm mt-0.5">
            Premium Micro-Dramas entdecken
          </p>
        </header>

        {/* Search Bar */}
        <div className="px-4 sm:px-6 py-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Serien suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 bg-card/60 border-border/40 rounded-lg h-10"
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
        <GenreFilter
          genres={GENRE_FILTERS}
          selectedGenre={selectedGenre}
          onSelect={setSelectedGenre}
        />

        {isLoading ? (
          <div className="px-4 sm:px-6 space-y-6 mt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2.5">
                <Skeleton className="h-5 w-28" />
                <div className="flex gap-2 sm:gap-3">
                  {[1, 2, 3, 4].map(j => (
                    <Skeleton key={j} className="w-[140px] sm:w-[180px] aspect-[16/9] rounded-md flex-shrink-0" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : filteredSeries.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Film className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-headline text-lg mb-2">
              {isSearching || isFiltering ? "Keine Ergebnisse" : "Noch keine Serien"}
            </h2>
            <p className="text-body text-muted-foreground text-sm">
              {isSearching 
                ? `Keine Serien gefunden für "${searchQuery}".`
                : isFiltering
                ? `Keine Serien in der Kategorie "${selectedGenre}".`
                : "Die ersten Creator arbeiten gerade an spannenden Inhalten."
              }
            </p>
          </div>
        ) : (
          <div className="mt-2 space-y-1">
            {/* Show category rows when not filtering by genre */}
            {!isFiltering && !isSearching && (
              <>
                {/* Trending Now */}
                {trendingSeries.length > 0 && (
                  <SeriesRow title="Trending" series={trendingSeries} />
                )}

                {/* New Releases */}
                {newReleases.length > 0 && (
                  <SeriesRow title="Neu auf Ryl" series={newReleases} />
                )}

                {/* Category Rows */}
                {categories.map(category => {
                  const categorySeries = seriesByCategory[category.id] || [];
                  if (categorySeries.length === 0) return null;
                  
                  return (
                    <SeriesRow
                      key={category.id}
                      title={CATEGORY_LABELS[category.name] || category.nameDe}
                      series={categorySeries}
                    />
                  );
                })}
              </>
            )}

            {/* Filtered/Search Results */}
            {(isFiltering || isSearching) && filteredSeries.length > 0 && (
              <SeriesRow 
                title={isSearching ? `Ergebnisse für "${searchQuery}"` : selectedGenre} 
                series={filteredSeries} 
              />
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
