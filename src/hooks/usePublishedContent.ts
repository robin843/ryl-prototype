import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Episode {
  id: string;
  title: string;
  description: string | null;
  episodeNumber: number;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  seriesCoverUrl: string | null;
  seriesId: string;
  seriesTitle: string;
  creatorId: string;
}

export function usePublishedContent() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContent() {
      setIsLoading(true);
      try {
        const { data, error: err } = await supabase
          .from('episodes')
          .select(`
            id,
            title,
            description,
            episode_number,
            thumbnail_url,
            video_url,
            series_id,
            creator_id,
            series (
              id,
              title,
              status,
              cover_url
            )
          `)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(50);

        if (err) throw err;

        const mappedEpisodes: Episode[] = (data || []).map((ep: any) => ({
          id: ep.id,
          title: ep.title,
          description: ep.description,
          episodeNumber: ep.episode_number,
          thumbnailUrl: ep.thumbnail_url,
          videoUrl: ep.video_url,
          seriesCoverUrl: ep.series?.cover_url,
          seriesId: ep.series_id,
          seriesTitle: ep.series?.title || 'Unbekannte Serie',
          creatorId: ep.creator_id,
        }));

        setEpisodes(mappedEpisodes);
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Fehler beim Laden');
      } finally {
        setIsLoading(false);
      }
    }

    fetchContent();
  }, []);

  return { episodes, isLoading, error };
}