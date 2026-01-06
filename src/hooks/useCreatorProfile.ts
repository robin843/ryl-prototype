import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Creator {
  userId: string;
  displayName: string | null;
  companyName: string | null;
  avatarUrl: string | null;
  bio: string | null;
}

interface Series {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  genre: string | null;
  episodeCount: number;
  totalViews: number | null;
}

interface Stats {
  totalViews: number;
  totalEpisodes: number;
  totalProducts: number;
}

export function useCreatorProfile(creatorId: string | undefined) {
  const [creator, setCreator] = useState<Creator | null>(null);
  const [series, setSeries] = useState<Series[]>([]);
  const [stats, setStats] = useState<Stats>({ totalViews: 0, totalEpisodes: 0, totalProducts: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!creatorId) {
      setIsLoading(false);
      return;
    }

    async function fetchCreator() {
      setIsLoading(true);
      try {
        // Fetch profile
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('user_id, display_name, company_name, avatar_url, bio')
          .eq('user_id', creatorId)
          .single();

        if (profileErr) throw profileErr;

        setCreator({
          userId: profile.user_id,
          displayName: profile.display_name,
          companyName: profile.company_name,
          avatarUrl: profile.avatar_url,
          bio: profile.bio,
        });

        // Fetch published series
        const { data: seriesData, error: seriesErr } = await supabase
          .from('series')
          .select('id, title, description, cover_url, genre, episode_count, total_views')
          .eq('creator_id', creatorId)
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (seriesErr) throw seriesErr;

        const mappedSeries: Series[] = (seriesData || []).map((s: any) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          coverUrl: s.cover_url,
          genre: s.genre,
          episodeCount: s.episode_count || 0,
          totalViews: s.total_views || 0,
        }));

        setSeries(mappedSeries);

        // Fetch products count
        const { count: productCount } = await supabase
          .from('shopable_products')
          .select('id', { count: 'exact', head: true })
          .eq('creator_id', creatorId);

        // Calculate stats
        const totalViews = mappedSeries.reduce((sum, s) => sum + (s.totalViews || 0), 0);
        const totalEpisodes = mappedSeries.reduce((sum, s) => sum + s.episodeCount, 0);

        setStats({
          totalViews,
          totalEpisodes,
          totalProducts: productCount || 0,
        });

      } catch (err) {
        console.error('Error fetching creator:', err);
        setError('Creator nicht gefunden');
      } finally {
        setIsLoading(false);
      }
    }

    fetchCreator();
  }, [creatorId]);

  return { creator, series, stats, isLoading, error };
}