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
  followerCount: number;
}

export function useCreatorProfile(creatorId: string | undefined) {
  const [creator, setCreator] = useState<Creator | null>(null);
  const [series, setSeries] = useState<Series[]>([]);
  const [stats, setStats] = useState<Stats>({ totalViews: 0, totalEpisodes: 0, followerCount: 0 });
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
        // IMPORTANT: Use public_profiles (not profiles) so other creators can be viewed under RLS.
        // Fetch profile - try by id first (some places use profiles.id), fallback to user_id (auth uid)
        let profile = null;
        
        // Try fetching by profile id first (used in feed's creator_id)
        const { data: profileById } = await supabase
          .from('public_profiles')
          .select('id, user_id, display_name, company_name, avatar_url, bio')
          .eq('id', creatorId)
          .maybeSingle();
        
        if (profileById) {
          profile = profileById;
        } else {
          // Fallback: try by user_id
          const { data: profileByUserId, error: profileErr } = await supabase
            .from('public_profiles')
            .select('id, user_id, display_name, company_name, avatar_url, bio')
            .eq('user_id', creatorId)
            .maybeSingle();
          
          if (profileErr) throw profileErr;
          profile = profileByUserId;
        }

        if (!profile) throw new Error('Profile not found');

        setCreator({
          userId: profile.user_id,
          displayName: profile.display_name,
          companyName: profile.company_name,
          avatarUrl: profile.avatar_url,
          bio: profile.bio,
        });

        // Fetch published series
        // NOTE: In this project, series.creator_id may store either profiles.user_id (auth uid) or profiles.id.
        const { data: seriesData, error: seriesErr } = await supabase
          .from('series')
          .select('id, title, description, cover_url, genre, episode_count, total_views')
          .or(`creator_id.eq.${profile.user_id},creator_id.eq.${profile.id}`)
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

        // Calculate stats
        const totalViews = mappedSeries.reduce((sum, s) => sum + (s.totalViews || 0), 0);
        const totalEpisodes = mappedSeries.reduce((sum, s) => sum + s.episodeCount, 0);
        
        // Follower count - placeholder for now (can be implemented with a followers table later)
        const followerCount = Math.floor(totalViews / 10); // Simulated based on views

        setStats({
          totalViews,
          totalEpisodes,
          followerCount,
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