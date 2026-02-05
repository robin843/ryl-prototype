import { useState, useEffect, useMemo } from "react";
import { Search, X, Film } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { SeriesRow } from "@/components/soaps/SeriesRow";
import { FeaturedHero } from "@/components/soaps/FeaturedHero";

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

// Category display names with emojis for Netflix feel
const CATEGORY_LABELS: Record<string, string> = {
  "Drama": "🎭 Drama",
  "Comedy": "😂 Comedy",
  "Reality": "📺 Reality",
  "Fashion": "👗 Fashion & Style",
  "Beauty": "💄 Beauty",
  "Lifestyle": "✨ Lifestyle",
  "Kochen": "🍳 Kochen & Rezepte",
  "Fitness": "💪 Fitness & Wellness",
  "Tech": "🎮 Tech & Gaming",
  "Musik": "🎵 Musik & Entertainment",
};

export default function Soaps() {
  const [series, setSeries] = useState<Series[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch categories and series in parallel
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

  // Filter series based on search
  const filteredSeries = useMemo(() => {
    if (!searchQuery.trim()) return series;
    const query = searchQuery.toLowerCase();
    return series.filter((s) =>
      s.title.toLowerCase().includes(query) ||
      s.description?.toLowerCase().includes(query)
    );
  }, [series, searchQuery]);

  // Group series by category
  const seriesByCategory = useMemo(() => {
    const grouped: Record<string, Series[]> = {};
    
    categories.forEach(cat => {
      grouped[cat.id] = filteredSeries.filter(s => s.categoryId === cat.id);
    });

    // Also group by genre for series without category
    const genres = [...new Set(filteredSeries.map(s => s.genre).filter(Boolean))];
    genres.forEach(genre => {
      if (genre && !grouped[genre]) {
        grouped[genre] = filteredSeries.filter(s => s.genre === genre && !s.categoryId);
      }
    });

    return grouped;
  }, [filteredSeries, categories]);

  // Get featured series (most views)
  const featuredSeries = useMemo(() => {
    return filteredSeries.sort((a, b) => b.totalViews - a.totalViews)[0];
  }, [filteredSeries]);

  // Trending series (random selection for demo)
  const trendingSeries = useMemo(() => {
    return [...filteredSeries].sort(() => Math.random() - 0.5).slice(0, 15);
  }, [filteredSeries]);

  // New releases
  const newReleases = useMemo(() => {
    return filteredSeries.slice(0, 15);
  }, [filteredSeries]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <AppLayout>
      <div className="min-h-screen pb-24">
        {/* Search Bar - Floating */}
        <div className="sticky top-0 z-20 px-4 pt-4 pb-2 bg-gradient-to-b from-background via-background to-transparent">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Serien, Genres, Creator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 bg-card/80 backdrop-blur-sm border-border/30 rounded-full"
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

        {isLoading ? (
          <div className="px-4 space-y-8 mt-4">
            <Skeleton className="h-[400px] rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="flex gap-3">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="w-32 h-48 rounded-lg flex-shrink-0" />
                ))}
              </div>
            </div>
          </div>
        ) : filteredSeries.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Film className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-headline text-lg mb-2">
              {isSearching ? "Keine Ergebnisse" : "Noch keine Serien"}
            </h2>
            <p className="text-body text-muted-foreground">
              {isSearching 
                ? `Keine Serien gefunden für "${searchQuery}".`
                : "Die ersten Creator arbeiten gerade an spannenden Inhalten."
              }
            </p>
          </div>
        ) : (
          <>
            {/* Featured Hero - Hide when searching */}
            {!isSearching && featuredSeries && (
              <FeaturedHero series={featuredSeries} />
            )}

            {/* Search Results */}
            {isSearching && (
              <div className="px-4 mb-4 mt-4">
                <p className="text-muted-foreground text-sm">
                  {filteredSeries.length} Ergebnisse für "{searchQuery}"
                </p>
              </div>
            )}

            {/* Content Rows */}
            <div className="space-y-2">
              {/* Trending Now */}
              {!isSearching && trendingSeries.length > 0 && (
                <SeriesRow title="🔥 Trending" series={trendingSeries} />
              )}

              {/* New Releases */}
              {!isSearching && newReleases.length > 0 && (
                <SeriesRow title="🆕 Neu auf Ryl" series={newReleases} />
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

              {/* Search Results Row */}
              {isSearching && filteredSeries.length > 0 && (
                <SeriesRow title="Suchergebnisse" series={filteredSeries} />
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
